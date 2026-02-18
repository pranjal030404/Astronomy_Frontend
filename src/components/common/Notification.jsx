import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ 
  id,
  type = 'info', // 'success', 'error', 'warning', 'info'
  message, 
  duration = 3000,
  onClose 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const config = {
    success: {
      icon: <CheckCircle size={20} />,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
    },
    error: {
      icon: <AlertCircle size={20} />,
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-400',
    },
    warning: {
      icon: <AlertTriangle size={20} />,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
    },
    info: {
      icon: <Info size={20} />,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
    },
  };

  const { icon, bgColor, borderColor, textColor } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg backdrop-blur-xl p-4 flex items-start gap-3 min-w-[300px] max-w-md transition-all duration-300 ${
        isExiting ? 'animate-slide-out-right opacity-0' : 'animate-slide-in-right'
      }`}
    >
      <div className={textColor}>{icon}</div>
      <p className="flex-1 text-white text-sm">{message}</p>
      <button
        onClick={handleClose}
        className={`${textColor} hover:opacity-70 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
