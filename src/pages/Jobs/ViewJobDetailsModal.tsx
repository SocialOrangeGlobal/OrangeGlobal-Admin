import { Modal } from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge";

interface ViewJobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any | null;
}

export default function ViewJobDetailsModal({
  isOpen,
  onClose,
  job
}: ViewJobDetailsModalProps) {
  if (!job) return null;

  const requirements = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === "string"
      ? JSON.parse(job.requirements)
      : [];

  const benefits = Array.isArray(job.benefits)
    ? job.benefits
    : typeof job.benefits === "string"
      ? JSON.parse(job.benefits)
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[720px] w-full p-6 sm:p-8"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6 flex justify-start items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {job.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {job.company} • {job.category}
            </p>
          </div>
          <Badge size="sm" color={job.isPublished ? "success" : "warning"}>
            {job.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1 mb-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{job.location}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Mode</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{job.mode}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Type</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{job.type}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Salary</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{job.salary || "N/A"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Vacancies</span>
              </div>
              <p className="text-sm font-bold text-brand-500">{job.vacancies} open</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Job Description</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {requirements.length > 0 && requirements[0] !== "" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Requirements
              </h3>
              <ul className="space-y-2">
                {requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && benefits[0] !== "" && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                Perks & Benefits
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <div className="mt-0.5 flex-shrink-0 rounded-full p-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
