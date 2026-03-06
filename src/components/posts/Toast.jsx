import React, { useEffect } from "react";
import { Check, AlertCircle, X, Info } from "lucide-react";

const Toast = ({ type = "success", message, onClose, autoClose = 4000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const baseStyles =
    "fixed bottom-6 right-6 max-w-md rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slideIn z-40";

  const typeStyles = {
    success: "bg-green-50 border border-green-200 text-green-800",
    error: "bg-red-50 border border-red-200 text-red-800",
    warning: "bg-yellow-50 border border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border border-blue-200 text-blue-800",
  };

  const iconColor = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const Icon = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  }[type];

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColor[type]}`} />
      <div className="flex-grow">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
