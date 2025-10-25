export enum ToolName {
  SQLMAP = 'sqlmap',
  NMAP = 'Nmap',
  NIKTO = 'Nikto',
  THE_HARVESTER = 'theHarvester',
}

export enum ToolStatus {
  NOT_FOUND = 'Non trouvé',
  DOWNLOADING = 'Téléchargement...',
  READY = 'Prêt',
  RUNNING = 'En cours...',
  COMPLETED = 'Terminé',
  ERROR = 'Erreur',
  AWAITING_CONFIRMATION = 'En attente',
}

export interface Tool {
  id: ToolName;
  name: string;
  description: string;
  status: ToolStatus;
}

export interface AuditLogEntry {
  source: 'AGENT' | 'USER' | 'TOOL' | 'SYSTEM';
  message: string;
  data?: any;
  timestamp: string;
}

export enum AuditState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface Recommendation {
    title: string;
    description: string;
    severity: 'Critique' | 'Élevé' | 'Moyen';
}

export interface AuditSummary {
    riskLevel: 'Faible' | 'Moyen' | 'Élevé' | 'Critique';
    summary: string;
    recommendations: Recommendation[];
}

export interface AgentCallbacks {
  onLog: (entry: Omit<AuditLogEntry, 'timestamp'>) => void;
  onToolStatusUpdate: (toolId: ToolName, status: ToolStatus) => void;
  onAuditStateChange: (state: AuditState) => void;
  onResultsUpdate: (results: Record<string, any>) => void;
  onSummaryUpdate: (summary: AuditSummary | null) => void;
  onRequestConfirmation: (toolId: ToolName) => Promise<boolean>;
}
