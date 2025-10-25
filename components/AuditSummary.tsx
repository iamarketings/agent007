import React from 'react';
import { AuditSummary, Recommendation } from '../types';
import { ExclamationTriangleIcon, CheckCircleIcon } from './Icons';

interface AuditSummaryProps {
  summary: AuditSummary;
}

const riskStyles: Record<AuditSummary['riskLevel'], { color: string, bgColor: string }> = {
    'Critique': { color: 'text-red-400', bgColor: 'bg-red-400/10' },
    'Élevé': { color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    'Moyen': { color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
    'Faible': { color: 'text-green-400', bgColor: 'bg-green-400/10' },
};

const severityIcons: Record<Recommendation['severity'], React.ReactNode> = {
    'Critique': <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />,
    'Élevé': <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />,
    'Moyen': <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />,
};

const AuditSummaryCard: React.FC<AuditSummaryProps> = ({ summary }) => {
  const styles = riskStyles[summary.riskLevel];

  return (
    <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-5 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Rapport d'Audit Final</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${styles.color} ${styles.bgColor}`}>
          Risque: {summary.riskLevel}
        </span>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">{summary.summary}</p>
      
      <div>
        <h4 className="font-semibold text-white mb-3">Recommandations</h4>
        <div className="space-y-4">
          {summary.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 pt-1">
                {severityIcons[rec.severity]}
              </div>
              <div>
                <p className="font-semibold text-gray-200">{rec.title}</p>
                <p className="text-sm text-gray-400">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditSummaryCard;
