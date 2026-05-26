import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import { useState, useEffect } from "react";

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  onSave: (appId: string, status: string, interviewData?: any) => Promise<void>;
  saving: boolean;
}

const statusOptions = [
  { value: "APPLIED", label: "Applied" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
  { value: "OFFER_SENT", label: "Offer Sent" },
  { value: "OFFER_ACCEPTED", label: "Offer Accepted (Hired)" },
  { value: "OFFER_REJECTED", label: "Offer Rejected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export default function ApplicationStatusModal({
  isOpen,
  onClose,
  application,
  onSave,
  saving,
}: ApplicationStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("Video Call");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (application) {
      setSelectedStatus(application.status);
      if (application.interviewDate) {
        // Format for datetime-local input
        const d = new Date(application.interviewDate);
        setInterviewDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      } else {
        setInterviewDate("");
      }
      setInterviewType(application.interviewType || "Video Call");
      setInterviewLink(application.interviewLink || "");
      setInterviewNotes(application.interviewNotes || "");
      setOfferDetails(application.offerDetails || "");
      setAdminNotes(application.adminNotes || "");
    }
  }, [application, isOpen]);

  const handleSave = () => {
    if (application && selectedStatus) {
      const payload: any = {};
      if (selectedStatus === "INTERVIEW_SCHEDULED") {
        payload.interviewDate = interviewDate ? new Date(interviewDate).toISOString() : undefined;
        payload.interviewType = interviewType;
        payload.interviewLink = interviewLink;
        payload.interviewNotes = interviewNotes;
      }
      if (selectedStatus === "OFFER_SENT") {
        payload.offerDetails = offerDetails;
      }
      if (adminNotes) {
        payload.adminNotes = adminNotes;
      }
      onSave(application.id, selectedStatus, payload);
    }
  };

  if (!application) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] w-full p-6 sm:p-8">
      <div className="flex flex-col h-full min-h-[50vh] max-h-[85vh]">
        <div className="mb-6 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Change Application Status
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the hiring status for <span className="font-semibold text-gray-800 dark:text-gray-200">{application.talent?.fullName}</span>.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 -mr-2 custom-scrollbar">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              className="w-full"
            />
          </div>

          {selectedStatus === "INTERVIEW_SCHEDULED" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Type
                </label>
                <Select
                  options={[
                    { value: "Video Call", label: "Video Call" },
                    { value: "Phone Screen", label: "Phone Screen" },
                    { value: "In-Person", label: "In-Person" },
                    { value: "Technical Assessment", label: "Technical Assessment" },
                  ]}
                  value={interviewType}
                  onChange={(val) => setInterviewType(val)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Link or Location
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Zoom link or Office Address"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interview Notes / Instructions
                </label>
                <textarea
                  className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white resize-none"
                  placeholder="e.g. Please bring your portfolio..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedStatus === "OFFER_SENT" && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 pb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offer Details (Visible to Talent)
                </label>
                <textarea
                  className="h-28 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white resize-none"
                  placeholder="e.g. Base Salary: $120,000&#10;Start Date: 1st Nov&#10;Additional benefits..."
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message / Feedback to Talent (Optional)
            </label>
            <textarea
              className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:bg-gray-900 dark:border-gray-700 dark:text-white resize-none"
              placeholder="e.g. Feedback on why they were rejected, or next steps..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || (!interviewDate && selectedStatus === "INTERVIEW_SCHEDULED")} className="bg-brand-500 text-white">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
