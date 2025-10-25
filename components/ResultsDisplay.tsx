import React from 'react';
import { AuditLogEntry, AuditSummary } from '../types';
import AuditSummaryCard from './AuditSummary';

interface ResultsDisplayProps {
  log: AuditLogEntry[];
  summary: AuditSummary | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ log, summary }) => {
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log, summary]);

    const renderStructuredData = (data: any) => {
        if (typeof data !== 'object' || data === null) return null;
        return (
             <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md font-mono text-xs overflow-x-auto">
                <ul>
                    {Object.entries(data).map(([key, value]) => (
                        <li key={key} className="mb-2 last:mb-0">
                            <span className="text-cyan-400">{key}:</span>
                            {Array.isArray(value) ? (
                                <ul className="pl-4">
                                    {value.map((item, i) => (
                                        <li key={i} className="mt-1">
                                            {typeof item === 'object' ? 
                                                <pre className="text-gray-300">{JSON.stringify(item, null, 2)}</pre> 
                                                : <span className="text-gray-300">{item}</span>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                               <span className="text-gray-300 ml-2">{String(value)}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )
    };
    
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 lg:p-6 h-full flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Journal d'Audit et Résultats</h2>
      <div 
        ref={logContainerRef}
        className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {summary && <AuditSummaryCard summary={summary} />}
        {log.map((entry, index) => (
          <div key={index} className="font-mono text-sm">
            <div className="flex items-baseline">
                <span className="text-gray-500 mr-2">{entry.timestamp}</span>
                <span className={`font-bold mr-2 ${entry.source === 'AGENT' ? 'text-cyan-400' : entry.source === 'TOOL' ? 'text-amber-400' : 'text-gray-400'}`}>[{entry.source}]</span>
                <p className="text-gray-300 flex-1">{entry.message}</p>
            </div>
            {entry.data && renderStructuredData(entry.data)}
          </div>
        ))}
         {log.length === 0 && !summary && <p className="text-gray-500 text-center mt-8">L'audit n'a pas encore commencé. Entrez une cible et démarrez l'audit.</p>}
      </div>
    </div>
  );
};

export default ResultsDisplay;