
import React from 'react';
import { CpuChipIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="flex items-center space-x-3 mb-6">
      <CpuChipIcon className="w-8 h-8 text-cyan-400" />
      <div>
        <h1 className="text-2xl font-bold text-white">Agent d'Audit de Sécurité IA</h1>
        <p className="text-sm text-gray-400">Orchestration d'outils de sécurité avec une IA</p>
      </div>
    </header>
  );
};

export default Header;
