
import React from 'react';
import { Tool, ToolStatus } from '../types';
import { CheckCircleIcon, ArrowDownTrayIcon, ExclamationCircleIcon, HourglassIcon } from './Icons';

interface ToolCardProps {
  tool: Tool;
}

const statusStyles: Record<ToolStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  [ToolStatus.NOT_FOUND]: {
    icon: <ArrowDownTrayIcon className="w-5 h-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  [ToolStatus.DOWNLOADING]: {
    icon: <div className="w-5 h-5 animate-spin border-2 border-cyan-400 border-t-transparent rounded-full" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  [ToolStatus.READY]: {
    icon: <CheckCircleIcon className="w-5 h-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  [ToolStatus.RUNNING]: {
    icon: <div className="w-5 h-5 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  [ToolStatus.COMPLETED]: {
    icon: <CheckCircleIcon className="w-5 h-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  [ToolStatus.ERROR]: {
    icon: <ExclamationCircleIcon className="w-5 h-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  [ToolStatus.AWAITING_CONFIRMATION]: {
    icon: <HourglassIcon className="w-5 h-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
  }
};

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const styles = statusStyles[tool.status];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500">
      <div>
        <h3 className="font-bold text-white">{tool.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{tool.description}</p>
      </div>
      <div className={`mt-4 inline-flex items-center space-x-2 text-xs font-medium px-2.5 py-1 rounded-full ${styles.color} ${styles.bgColor}`}>
        {styles.icon}
        <span>{tool.status}</span>
      </div>
    </div>
  );
};

export default ToolCard;