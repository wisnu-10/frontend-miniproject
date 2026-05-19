import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = "Kembali", 
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`btn btn-ghost btn-sm gap-2 rounded-full pl-3 pr-4 transition-all duration-300 hover:bg-base-200 hover:-translate-x-1 border border-base-300/50 hover:border-base-300 ${className}`}
    >
      <FaArrowLeft className="text-sm text-primary transition-transform" />
      <span className="font-semibold text-xs uppercase tracking-wider text-base-content/80">
        {label}
      </span>
    </button>
  );
};

export default BackButton;
