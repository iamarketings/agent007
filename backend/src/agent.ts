import { Socket } from 'socket.io';
import { exec, ChildProcess } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ToolName, ToolStatus, AuditState, AuditSummary, AuditLogEntry } from '../../types';

const TOOLS_DIR = join(process.cwd(), 'tools');
if (!existsSync(TOOLS_DIR)) {
  mkdirSync(TOOLS_DIR);
}

interface ToolConfig {
    id: ToolName;
    name: string;
    repo: string;
    path: string;
    checkCommand: string;
    runCommand: (target: string) => string;
    needsConfirmation?: boolean;
}

const TOOL_CONFIGS: Record<ToolName, ToolConfig> = {
    [ToolName.SQLMAP]: {
        id: ToolName.SQLMAP,
        name: 'sqlmap',
        repo: 'https://github.com/sqlmapproject/sqlmap.git',
        path: join(TOOLS_DIR, 'sqlmap'),
        checkCommand: `test -f ${join(TOOLS_DIR, 'sqlmap', 'sqlmap.py')}`,
        runCommand: (target) => `python3 ${join(TOOLS_DIR, 'sqlmap', 'sqlmap.py')} -u "http://${target}/test.php?id=1" --batch --level=1 --risk=1`,
        needsConfirmation: true,
    },
    [ToolName.NMAP]: {
        id: ToolName.NMAP,
        name: 'Nmap',
        repo: '', // Nmap is expected to be installed system-wide
        path: '',
        checkCommand: 'command -v nmap',
        runCommand: (target) => `nmap -sV -T4 ${target}`,
    },
    [ToolName.NIKTO]: {
        id: ToolName.NIKTO,
        name: 'Nikto',
        repo: 'https://github.com/sullo/nikto.git',
        path: join(TOOLS_DIR, 'nikto'),
        checkCommand: `test -f ${join(TOOLS_DIR, 'nikto', 'program', 'nikto.pl')}`,
        runCommand: (target) => `perl ${join(TOOLS_DIR, 'nikto', 'program', 'nikto.pl')} -h ${target}`,
    },
    [ToolName.THE_HARVESTER]: {
        id: ToolName.THE_HARVESTER,
        name: 'theHarvester',
        repo: 'https://github.com/laramies/theHarvester.git',
        path: join(TOOLS_DIR, 'theHarvester'),
        checkCommand: `test -f ${join(TOOLS_DIR, 'theHarvester', 'theHarvester.py')}`,
        runCommand: (target) => `python3 ${join(TOOLS_DIR, 'theHarvester', 'theHarvester.py')} -d ${target} -b google`,
    },
};


class AgentInstance {
    private socket: Socket;
    private toolStatuses: Record<ToolName, ToolStatus> = {
        [ToolName.SQLMAP]: ToolStatus.NOT_FOUND,
        [ToolName.NMAP]: ToolStatus.NOT_FOUND,
        [ToolName.NIKTO]: ToolStatus.NOT_FOUND,
        [ToolName.THE_HARVESTER]: ToolStatus.NOT_FOUND,
    };
    private isRunning = false;
    private userConfirmationResolver: ((confirmed: boolean) => void) | null = null;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    private log(source: AuditLogEntry['source'], message: string, data?: any) {
        const entry: AuditLogEntry = {
            source,
            message,
            timestamp: new Date().toLocaleTimeString(),
            data
        };
        this.socket.emit('agent:log', entry);
    }

    private updateToolStatus(toolId: ToolName, status: ToolStatus) {
        this.toolStatuses[toolId] = status;
        this.socket.emit('agent:tool-status-update', { toolId, status });
    }

    private setState(state: AuditState) {
        this.socket.emit('agent:state-change', state);
    }
    
    private runCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.log('SYSTEM', `Executing command: ${command}`);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    this.log('SYSTEM', `Command error for: ${command}`, { error: error.message, stderr });
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });
    }

    public async checkInitialStatus() {
        for (const tool of Object.values(TOOL_CONFIGS)) {
            try {
                await this.runCommand(tool.checkCommand);
                this.toolStatuses[tool.id] = ToolStatus.READY;
            } catch (error) {
                this.toolStatuses[tool.id] = ToolStatus.NOT_FOUND;
            }
        }
        this.socket.emit('agent:initial-status', this.toolStatuses);
    }
    
    public async startAudit(target: string) {
        if(this.isRunning) {
            this.log('SYSTEM', 'Un audit est déjà en cours.');
            return;
        }
        this.isRunning = true;
        this.setState(AuditState.RUNNING);

        // --- PARALLEL TOOL PREPARATION ---
        const toolsToDownload = Object.values(TOOL_CONFIGS).filter(t => this.toolStatuses[t.id] === ToolStatus.NOT_FOUND && t.repo);
        
        if (toolsToDownload.length > 0) {
            this.log('AGENT', `Téléchargement de ${toolsToDownload.length} outil(s) en parallèle...`);
            const downloadPromises = toolsToDownload.map(async (tool) => {
                this.updateToolStatus(tool.id, ToolStatus.DOWNLOADING);
                try {
                    await this.runCommand(`git clone ${tool.repo} ${tool.path}`);
                    this.updateToolStatus(tool.id, ToolStatus.READY);
                    this.log('AGENT', `Outil ${tool.name} téléchargé.`);
                } catch(e) {
                    this.updateToolStatus(tool.id, ToolStatus.ERROR);
                    this.log('SYSTEM', `Échec du téléchargement de ${tool.name}.`);
                    throw new Error(`Échec du téléchargement pour ${tool.name}`);
                }
            });

            try {
                await Promise.all(downloadPromises);
            } catch (error) {
                this.log('SYSTEM', 'Un ou plusieurs téléchargements ont échoué. Audit arrêté.');
                this.setState(AuditState.ERROR);
                this.isRunning = false;
                return;
            }
        }
        
        // --- SEQUENTIAL TOOL EXECUTION ---
        const toolSequence = [ToolName.THE_HARVESTER, ToolName.NMAP, ToolName.NIKTO, ToolName.SQLMAP];
        
        for (const toolId of toolSequence) {
            const tool = TOOL_CONFIGS[toolId];
            if(this.toolStatuses[toolId] !== ToolStatus.READY) {
                this.log('SYSTEM', `L'outil ${tool.name} n'est pas prêt. Audit interrompu.`);
                this.setState(AuditState.ERROR);
                this.isRunning = false;
                return;
            }

            if(tool.needsConfirmation) {
                this.updateToolStatus(toolId, ToolStatus.AWAITING_CONFIRMATION);
                this.socket.emit('agent:request-confirmation', { toolId });
                
                const confirmed = await new Promise<boolean>((resolve) => {
                    this.userConfirmationResolver = resolve;
                });

                if(!confirmed) {
                    this.log('USER', `L'exécution de ${tool.name} a été annulée.`);
                    this.updateToolStatus(toolId, ToolStatus.READY);
                    this.setState(AuditState.IDLE);
                    this.isRunning = false;
                    return;
                }
            }
            
            this.log('AGENT', `Exécution de ${tool.name} sur ${target}...`);
            this.updateToolStatus(toolId, ToolStatus.RUNNING);

            try {
                const result = await this.runCommand(tool.runCommand(target));
                this.log('TOOL', `Résultats de ${tool.name}:`, { output: result });
                this.updateToolStatus(toolId, ToolStatus.COMPLETED);
            } catch (error) {
                this.log('SYSTEM', `Erreur lors de l'exécution de ${tool.name}.`, { error });
                this.updateToolStatus(toolId, ToolStatus.ERROR);
                this.setState(AuditState.ERROR);
                this.isRunning = false;
                return;
            }
        }

        this.log('AGENT', "Analyse des résultats pour générer le rapport...");
        // This is where a call to a GenAI model would happen to summarize results.
        // For now, we'll create a mock summary.
        const summary: AuditSummary = {
            riskLevel: 'Élevé',
            summary: 'Plusieurs vulnérabilités ont été détectées, notamment des ports ouverts et des faiblesses potentielles de configuration web. Une investigation manuelle est requise.',
            recommendations: [
                { title: 'Réviser la configuration du pare-feu', description: 'Restreindre l\'accès aux ports non essentiels.', severity: 'Élevé' },
                { title: 'Mettre à jour le serveur web', description: 'Appliquer les derniers correctifs de sécurité pour Nginx/Apache.', severity: 'Moyen' }
            ]
        };
        this.socket.emit('agent:summary-update', summary);

        this.log('AGENT', "Audit terminé.");
        this.setState(AuditState.COMPLETED);
        this.isRunning = false;
    }

    public handleUserConfirmation(confirmed: boolean) {
        if (this.userConfirmationResolver) {
            this.userConfirmationResolver(confirmed);
            this.userConfirmationResolver = null;
        }
    }
}


export function initializeAgent(socket: Socket) {
    const agent = new AgentInstance(socket);

    socket.on('agent:get-initial-status', () => {
        agent.checkInitialStatus();
    });

    socket.on('agent:start-audit', ({ target }) => {
        agent.startAudit(target);
    });

    socket.on('agent:user-confirmation', ({ confirmed }) => {
        agent.handleUserConfirmation(confirmed);
    });
}
