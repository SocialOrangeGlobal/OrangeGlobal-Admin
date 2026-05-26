import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  message,
  subMessage,
  fullScreen = true
}: PageLoaderProps) {
  return (
    <div className={`${fullScreen ? 'min-h-screen bg-[#F8F9FA]' : 'h-64 rounded-xl bg-white'} flex flex-col items-center justify-center`}>
      <Loader2 className="w-12 h-12 text-[#fb6514] animate-spin" />
      {message && <h2 className="mt-4 text-lg font-semibold text-gray-800">{message}</h2>}
      {subMessage && <p className="text-sm text-gray-500 mt-1">{subMessage}</p>}
    </div>
  );
}
