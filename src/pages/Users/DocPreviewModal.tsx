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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] w-full m-4 p-6 sm:p-8"
    >
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Document Preview: {docTitle}
          </h3>
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline mr-8"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>
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
                  src={docUrl}
                  alt={docTitle}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <iframe
                src={docUrl}
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
