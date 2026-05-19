import React from "react";
import { FaExclamationTriangle, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info" | "success";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "info",
}) => {
  if (!isOpen) return null;

  // Variant styling configuration
  let icon = <FaQuestionCircle className="text-3xl text-primary" />;
  let confirmBtnClass = "btn btn-primary";
  let borderTopClass = "border-t-4 border-primary";

  if (variant === "danger") {
    icon = <FaExclamationTriangle className="text-3xl text-error" />;
    confirmBtnClass = "btn btn-error text-white";
    borderTopClass = "border-t-4 border-error";
  } else if (variant === "warning") {
    icon = <FaExclamationTriangle className="text-3xl text-warning" />;
    confirmBtnClass = "btn btn-warning text-white";
    borderTopClass = "border-t-4 border-warning";
  } else if (variant === "success") {
    icon = <FaInfoCircle className="text-3xl text-success" />;
    confirmBtnClass = "btn btn-success text-white";
    borderTopClass = "border-t-4 border-success";
  }

  return (
    <div className="modal modal-open z-100 backdrop-blur-xs flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="modal-backdrop bg-black/50 fixed inset-0 cursor-pointer" 
        onClick={onCancel}
      ></div>
      
      {/* Modal card */}
      <div 
        className={`modal-box relative bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transition-all transform scale-100 ${borderTopClass}`}
      >
        <div className="flex gap-4 items-start">
          <div className="shrink-0 p-3 rounded-full bg-base-200">
            {icon}
          </div>
          <div className="grow">
            <h3 className="font-bold text-lg text-base-content tracking-tight">
              {title}
            </h3>
            <div className="py-2 text-sm text-base-content/75 leading-relaxed">
              {message}
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="modal-action flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            className="btn btn-ghost rounded-xl px-5" 
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className={`${confirmBtnClass} rounded-xl px-5 shadow-sm hover:shadow transition-all duration-200`} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
