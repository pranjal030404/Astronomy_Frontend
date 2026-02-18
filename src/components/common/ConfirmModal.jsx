import React from 'react';
import { X, AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info', 'success'
}) => {
  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 size={48} className="text-red-400" />,
    warning: <AlertTriangle size={48} className="text-yellow-400" />,
    info: <Info size={48} className="text-blue-400" />,
    success: <CheckCircle size={48} className="text-green-400" />,
  };

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-space-800/80 backdrop-blur-xl rounded-xl max-w-md w-full mx-4 shadow-2xl border border-space-600/30">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {icons[type]}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-space-700/50 hover:bg-space-600/60 rounded-lg transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 ${buttonColors[type]} rounded-lg transition-colors font-medium text-white`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
