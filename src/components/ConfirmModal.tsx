"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Да, удалить",
  cancelText = "Отмена",
  type = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-500/20",
          iconColor: "text-red-500",
          confirmBg: "bg-red-500 hover:bg-red-600",
          confirmBorder: "border-red-500/20"
        };
      case "warning":
        return {
          iconBg: "bg-yellow-500/20",
          iconColor: "text-yellow-500",
          confirmBg: "bg-yellow-500 hover:bg-yellow-600",
          confirmBorder: "border-yellow-500/20"
        };
      case "info":
        return {
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-500",
          confirmBg: "bg-blue-500 hover:bg-blue-600",
          confirmBorder: "border-blue-500/20"
        };
      default:
        return {
          iconBg: "bg-red-500/20",
          iconColor: "text-red-500",
          confirmBg: "bg-red-500 hover:bg-red-600",
          confirmBorder: "border-red-500/20"
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-gradient-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
              <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-zinc-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-3 ${styles.confirmBg} text-white rounded-xl font-medium transition-colors border ${styles.confirmBorder} text-sm sm:text-base`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
