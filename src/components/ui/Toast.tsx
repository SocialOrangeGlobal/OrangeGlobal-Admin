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
      ? "bg-success-500 border-success-600 text-white"
      : type === "error"
      ? "bg-error-500 border-error-600 text-white"
      : type === "warning"
      ? "bg-warning-500 border-warning-600 text-white"
      : "bg-blue-light-500 border-blue-light-600 text-white";

  return (
    <div className="fixed z-[999999] bottom-5 right-5 animate-fade-in-up">
      <div
        className={`flex items-center gap-4 px-6 py-4 rounded-xl border shadow-theme-xl ${bgStyle}`}
      >
        <span className="text-base font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-xl font-bold opacity-80 hover:opacity-100 transition-opacity"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
