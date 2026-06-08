import { Modal } from "../../components/ui/modal";


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

  const handleDownload = async () => {
    if (!docUrl) return;
    try {
      const response = await fetch(safeDocUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const ext = docUrl.split('?')[0].split('.').pop() || 'pdf';
      link.download = `${docTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}.${ext}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
      window.open(safeDocUrl, '_blank');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] w-full m-4 p-6 sm:p-8"
    >
      <div>
        <div className="mb-4 flex items-center justify-start gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Document Preview: {docTitle}
          </h3>
          {docUrl && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Document
              </button>
              <a
                href={safeDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline mr-8"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
            </div>
          )}
        </div>

        <div className="h-[65vh] w-full bg-gray-100 dark:bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
          {docUrl ? (
            docUrl.toLowerCase().endsWith(".png") ||
              docUrl.toLowerCase().endsWith(".jpg") ||
              docUrl.toLowerCase().endsWith(".jpeg") ||
              docUrl.toLowerCase().endsWith(".gif") ||
              docUrl.toLowerCase().endsWith(".webp") ||
              docUrl.toLowerCase().endsWith(".svg") ||
              docUrl.includes("image") ? (
              <div className="h-full w-full overflow-auto flex items-center justify-center p-4">
                <img
                  src={safeDocUrl}
                  alt={docTitle}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : docUrl.toLowerCase().endsWith(".doc") || docUrl.toLowerCase().endsWith(".docx") ? (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(safeDocUrl)}&embedded=true`}
                title={docTitle}
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <iframe
                src={safeDocUrl}
                title={docTitle}
                className="h-full w-full border-0 bg-white"
              />
            )
          ) : (
            <span className="text-gray-400">No document URL loaded</span>
          )}
        </div>

      </div>
    </Modal>
  );
}
