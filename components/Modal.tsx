import React from 'react';
import { ExclamationTriangleIcon } from './Icons';
import { ToolName } from '../types';

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  toolName: ToolName | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onConfirm, onClose, toolName }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="bg-gray-800 border border-amber-400/50 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-start space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-400/10 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
                <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                    Confirmation Requise
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-400">
                        L'outil <code className="bg-gray-700 p-1 rounded font-bold">{toolName}</code> est sur le point d'être exécuté. C'est une action potentiellement intrusive qui interagira activement avec la cible.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Assurez-vous d'avoir l'autorisation explicite avant de continuer.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-500 text-base font-medium text-gray-900 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Confirmer et Lancer
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
