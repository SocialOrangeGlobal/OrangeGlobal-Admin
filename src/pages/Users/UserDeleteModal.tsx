import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
  userName: string;
}

export default function UserDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  saving,
  userName
}: UserDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] m-4 p-6">
      <div className="text-center">
        {/* Danger Warning Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-500 dark:bg-error-950/20">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">Delete User Account</h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete the account for{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {userName}
          </span>
          ? This action cannot be undone and will delete all user profiles, CVs, and associated data permanently.
        </p>

        <div className="flex justify-center gap-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-error-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Deleting..." : "Yes, Delete User"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
