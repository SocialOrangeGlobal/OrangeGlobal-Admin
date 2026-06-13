import { X, Download, FileText, ExternalLink } from "lucide-react";
import { useEffect } from "react";

interface DocPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  docUrl: string | null;
  docTitle: string;
}

export default function DocPreviewModal({
  isOpen,
  onClose,
  docUrl,
  docTitle
}: DocPreviewModalProps) {
  const getSafeDocUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const publicIndex = pathname.indexOf('/public/');
      if (publicIndex !== -1) {
        const publicPath = pathname.substring(publicIndex + 8);
        const slashIndex = publicPath.indexOf('/');
        if (slashIndex !== -1) {
          const bucket = publicPath.substring(0, slashIndex);
          const key = publicPath.substring(slashIndex + 1);
          if (key.includes('%')) {
            const doubleEncodedKey = key.replace(/%([0-9A-Fa-f]{2})/g, '%25$1');
            parsed.pathname = pathname.substring(0, publicIndex + 8) + bucket + '/' + doubleEncodedKey;
            return parsed.toString();
          }
        }
      }
    } catch (e) {
      console.error("Error formatting safe doc URL:", e);
    }
    return url;
  };

  const safeDocUrl = getSafeDocUrl(docUrl);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !docUrl) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Viewer header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{docTitle}</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Document Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={safeDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <a
              href={safeDocUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800/40 p-4 sm:p-6 min-h-[50vh]">
          {/\.(jpeg|jpg|gif|png)(\?|$)/i.test(docUrl) ? (
            <img
              src={safeDocUrl}
              alt={docTitle}
              className="max-w-full rounded-2xl shadow-sm mx-auto block"
            />
          ) : /\.pdf(\?|$)/i.test(docUrl) ? (
            <iframe
              src={safeDocUrl}
              title={docTitle}
              className="w-full h-[55vh] sm:h-[65vh] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            />
          ) : /\.(doc|docx)(\?|$)/i.test(docUrl) ? (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(safeDocUrl)}&embedded=true`}
              title={docTitle}
              className="w-full h-[55vh] sm:h-[65vh] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
              <FileText className="w-16 h-16 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Preview not available for this file type.</p>
              <a
                href={safeDocUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-600 transition-all"
              >
                <Download className="w-4 h-4" /> Download to View
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
