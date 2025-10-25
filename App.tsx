import React, { useState, useEffect, useCallback } from 'react';
import { Tool, ToolName, ToolStatus, AuditLogEntry, AuditState, AuditSummary } from './types';
import Header from './components/Header';
import ToolCard from './components/ToolCard';
import AuditControl from './components/AuditControl';
import ResultsDisplay from './components/ResultsDisplay';
import Modal from './components/Modal';
import { socketService } from './services/socketService';

const INITIAL_TOOLS: Tool[] = [
  { id: ToolName.THE_HARVESTER, name: 'theHarvester', description: 'Reconnaissance OSINT (emails, sous-domaines).', status: ToolStatus.NOT_FOUND },
  { id: ToolName.NMAP, name: 'Nmap', description: 'Scan réseau (ports, services, OS).', status: ToolStatus.NOT_FOUND },
  { id: ToolName.NIKTO, name: 'Nikto', description: 'Scan de vulnérabilités web.', status: ToolStatus.NOT_FOUND },
  { id: ToolName.SQLMAP, name: 'sqlmap', description: 'Détection et exploitation d\'injections SQL.', status: ToolStatus.NOT_FOUND },
];

const App: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [target, setTarget] = useState<string>('scanme.nmap.org');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [auditState, setAuditState] = useState<AuditState>(AuditState.IDLE);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toolAwaitingConfirmation, setToolAwaitingConfirmation] = useState<ToolName | null>(null);

  const addLog = useCallback((entry: AuditLogEntry) => {
    setAuditLog(prev => [...prev, entry]);
  }, []);

  const updateToolStatus = useCallback((toolId: ToolName, status: ToolStatus) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, status } : t));
  }, []);

  useEffect(() => {
    // Setup listeners
    socketService.onInitialToolStatus((statuses) => {
        setTools(prev => prev.map(t => ({ ...t, status: statuses[t.id] })));
        addLog({ source: 'SYSTEM', message: "Vérification de l'état initial des outils terminée.", timestamp: new Date().toLocaleTimeString() });
    });
    
    socketService.onLog(addLog);
    
    socketService.onToolStatusUpdate(({ toolId, status }) => updateToolStatus(toolId, status));
    
    socketService.onAuditStateChange(setAuditState);
    
    socketService.onSummaryUpdate(setAuditSummary);

    socketService.onRequestConfirmation(({ toolId }) => {
        setToolAwaitingConfirmation(toolId);
        setIsModalOpen(true);
    });
    
    // Initial check
    addLog({ source: 'SYSTEM', message: "Vérification de l'état initial des outils...", timestamp: new Date().toLocaleTimeString() });
    socketService.getInitialToolStatus();
    
    // Cleanup
    return () => {
      socketService.disconnect();
    };
  }, [addLog, updateToolStatus]);


  const handleStartAudit = () => {
    setAuditLog([]);
    setAuditSummary(null);
    socketService.startAudit(target);
  };
  
  const handleConfirm = () => {
    socketService.sendConfirmation(true);
    setIsModalOpen(false);
    setToolAwaitingConfirmation(null);
  }

  const handleCancel = () => {
    socketService.sendConfirmation(false);
    setIsModalOpen(false);
    setToolAwaitingConfirmation(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col">
            <Header />
            <AuditControl 
                target={target}
                setTarget={setTarget}
                onStartAudit={handleStartAudit}
                auditState={auditState}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>

          <div className="lg:col-span-2 min-h-[600px] lg:min-h-0">
            <ResultsDisplay log={auditLog} summary={auditSummary} />
          </div>
        </div>
      </main>
      <Modal 
        isOpen={isModalOpen} 
        onConfirm={handleConfirm}
        onClose={handleCancel}
        toolName={toolAwaitingConfirmation}
      />
    </div>
  );
};

export default App;
