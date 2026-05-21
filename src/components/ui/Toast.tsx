import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyle =
    type === "success"
      ? "bg-emerald-600 border-emerald-700"
      : type === "error"
      ? "bg-red-550 border-red-600"
      : type === "warning"
      ? "bg-brand-500 border-brand-650"
      : "bg-blue-600 border-blue-700";

  return (
    <div className="fixed z-99999 bottom-5 right-5 animate-fade-in-up">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-lg border shadow-lg text-white ${bgStyle}`}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 font-bold text-white/80 hover:text-white transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
