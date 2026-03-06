import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Vertically center the modal on desktop screens */}
        <div
          className="hidden sm:inline-block h-screen align-middle"
          aria-hidden="true"
        >
          &#8203;
        </div>

        <div
          className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              {isDangerous && (
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              )}

              {/* Text */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  className="text-lg font-semibold leading-6 text-gray-900"
                  id="modal-title"
                >
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                  Loading...
                </span>
              ) : (
                confirmText
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
