import { Modal } from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge";
import { User, FileText, Calendar, ShieldCheck, Mail, Target, Briefcase, GraduationCap, Building } from "lucide-react";

interface ApplicationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
}

export default function ApplicationViewModal({
  isOpen,
  onClose,
  application,
}: ApplicationViewModalProps) {
  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REJECTED":
      case "OFFER_REJECTED":
      case "WITHDRAWN": return "error";
      case "OFFER_ACCEPTED": return "success";
      case "APPLIED": default: return "warning";
    }
  };

  const jobReqs = Array.isArray(application.job?.requirements)
    ? application.job.requirements
    : typeof application.job?.requirements === "string"
      ? JSON.parse(application.job.requirements)
      : [];

  const jobBenefits = Array.isArray(application.job?.benefits)
    ? application.job.benefits
    : typeof application.job?.benefits === "string"
      ? JSON.parse(application.job.benefits)
      : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] w-full p-6 sm:p-8">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6 flex justify-start gap-4 items-start">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Application Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              For <span className="font-semibold text-gray-800 dark:text-gray-200">{application.job?.title || "Job"}</span> at {application.job?.company || "Company"}
            </p>
          </div>
          <Badge size="md" color={getStatusColor(application.status)}>
            {application.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar flex-1 mb-2 space-y-6">
          
          {/* Application Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-0.5">ATS Match Score</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {application.atsScore ? `${application.atsScore}%` : "Pending"}
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-0.5">Applied Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(application.appliedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Profile Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-500" />
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Full Name</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Email</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${application.talent?.user?.email}`} className="text-brand-500 hover:underline">
                    {application.talent?.user?.email || "N/A"}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Phone</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Location</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.location ? (typeof application.talent.location === 'string' ? application.talent.location : `${application.talent.location?.city || ''}, ${application.talent.location?.country || ''}`) : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">LinkedIn</p>
                {application.talent?.linkedin ? (
                  <a href={application.talent.linkedin} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline">View Profile</a>
                ) : <p className="text-sm text-gray-800 dark:text-white font-medium">N/A</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Nationality</p>
                <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.nationality || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-500" />
                Experience
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Current/Last Role</p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.jobTitle || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Employer</p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.employerName || "N/A"}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Total Exp</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.totalExp ? `${application.talent.totalExp} Yrs` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Relevant Exp</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.relevantExp ? `${application.talent.relevantExp} Yrs` : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-500" />
                Education
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Highest Qualification</p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.highestQualification || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Field of Study</p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.fieldOfStudy || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Institution</p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">{application.talent?.institutionName || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {application.talent?.skills && application.talent.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {application.talent.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Details */}
          {application.job && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-500" />
                  Job Details & Requirements
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Job Title</p>
                  <p className="text-sm text-gray-800 dark:text-white font-bold">{application.job.title}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Category</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.job.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Type</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.job.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Mode</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.job.mode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Location</p>
                    <p className="text-sm text-gray-800 dark:text-white font-medium">{application.job.location}</p>
                  </div>
                </div>

                {jobReqs.length > 0 && jobReqs[0] !== "" && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase">Requirements</p>
                    <ul className="space-y-1.5">
                      {jobReqs.map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-brand-500 flex-shrink-0" />
                          <span className="leading-snug">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {jobBenefits.length > 0 && jobBenefits[0] !== "" && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-2 font-semibold uppercase">Perks & Benefits</p>
                    <ul className="space-y-1.5">
                      {jobBenefits.map((ben: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="leading-snug">{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cover Letter (if any) */}
          {application.coverLetter && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Cover Letter
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-100 dark:border-gray-800">
                {application.coverLetter}
              </div>
            </div>
          )}

          {/* Attached Resume */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Submitted Document
            </h3>
            {application.resume?.fileUrl ? (
              <a
                href={application.resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-800/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 group-hover:underline">
                      {application.resume.fileName || "Candidate Resume"}
                    </p>
                    <p className="text-xs text-brand-500 dark:text-brand-500/70">
                      Click to view full document
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <p className="text-sm text-gray-500 italic">No resume attached to this application.</p>
            )}
          </div>

        </div>
      </div>
    </Modal>
  );
}
