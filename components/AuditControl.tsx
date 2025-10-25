import React from 'react';
import { AuditState } from '../types';
import { PlayCircleIcon } from './Icons';

interface AuditControlProps {
  target: string;
  setTarget: (target: string) => void;
  onStartAudit: () => void;
  auditState: AuditState;
}

const AuditControl: React.FC<AuditControlProps> = ({ target, setTarget, onStartAudit, auditState }) => {
  const isIdle = auditState === AuditState.IDLE || auditState === AuditState.COMPLETED || auditState === AuditState.ERROR;
  const isInteractive = auditState === AuditState.IDLE || auditState === AuditState.COMPLETED || auditState === AuditState.ERROR;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-6">
      <label htmlFor="target" className="block text-sm font-medium text-gray-400">Cible de l'audit</label>
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          id="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="ex: example.com"
          className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
          disabled={!isInteractive}
        />
        {isIdle && (
          <button
            onClick={onStartAudit}
            disabled={!target}
            className="flex items-center justify-center gap-2 bg-cyan-500 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <PlayCircleIcon className="w-5 h-5"/>
            Démarrer l'Audit
          </button>
        )}
      </div>
       {auditState === AuditState.RUNNING ? <p className="text-sm text-cyan-400 mt-2 animate-pulse">Audit en cours...</p> : null}
       {auditState === AuditState.AWAITING_CONFIRMATION ? <p className="text-sm text-amber-400 mt-2">Confirmation requise...</p> : null}
    </div>
  );
};

export default AuditControl;