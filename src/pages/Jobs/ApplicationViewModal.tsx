import { Modal } from "../../components/ui/modal";
import Badge from "../../components/ui/badge/Badge";
import {
  User, FileText, Calendar, ShieldCheck, Mail, Target, Briefcase,
  GraduationCap, Building, Globe, Clock, Award,
  BookOpen, Download, ExternalLink
} from "lucide-react";

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

  const talent = application.talent || {};

  // Safely parse Json educations and experiences lists
  const parsedEducations = Array.isArray(talent.educations)
    ? talent.educations
    : typeof talent.educations === "string"
      ? (() => { try { return JSON.parse(talent.educations); } catch { return []; } })()
      : [];

  const parsedExperiences = Array.isArray(talent.experiences)
    ? talent.experiences
    : typeof talent.experiences === "string"
      ? (() => { try { return JSON.parse(talent.experiences); } catch { return []; } })()
      : [];

  // Documents list
  const documents = [
    { name: "Resume / CV Document", url: application.resume?.fileUrl || talent.resumeUrl, type: "Resume" },
    { name: "Passport Scan", url: talent.passportUrl, type: "Passport" },
    { name: "Visa Copy", url: talent.visaUrl, type: "Visa" },
    { name: "Educational Certificate", url: talent.eduCertUrl, type: "Education Certificate" },
    { name: "Employment Certificate", url: talent.empCertUrl, type: "Work Certificate" },
    { name: "English Test Result", url: talent.englishTestUrl, type: "English Result" },
    { name: "Licences / Other Credentials", url: talent.licenceUrl, type: "Credentials License" },
  ].filter(doc => !!doc.url);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] w-full p-6 sm:p-8">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white flex items-center justify-center shadow-md overflow-hidden">
              {application.job?.companyLogo ? (
                <img
                  src={application.job.companyLogo}
                  alt={`${application.job?.company || "Company"} Logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-gray-400 font-bold text-lg uppercase">
                  {(application.job?.company || "CO").substring(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Candidate Dossier Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                For <span className="font-semibold text-gray-850 dark:text-gray-200">{application.job?.title || "Job"}</span> at {application.job?.company || "Company"}
              </p>
            </div>
            <Badge size="md" color={getStatusColor(application.status)}>
              {application.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {/* Content stream container */}
        <div className="overflow-y-auto max-h-[72vh] pr-2 custom-scrollbar flex-1 mb-2 space-y-8">

          {/* Top Level Metric Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-550 dark:text-gray-450 uppercase tracking-wider font-bold mb-0.5">ATS Score</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {application.atsScore ? `${application.atsScore}% Match` : "Pending"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-550 dark:text-gray-450 uppercase tracking-wider font-bold mb-0.5">Applied Date</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Date(application.appliedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ff5900]/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#ff5900]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-550 dark:text-gray-450 uppercase tracking-wider font-bold mb-0.5">Experience</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {talent.totalExp ? `${talent.totalExp} Years Total` : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Candidate Personal & Contact Information */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <User className="w-4 h-4 text-brand-500" />
              Personal & Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Full Name</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.fullName || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${talent.workEmail || talent.user?.email}`} className="text-brand-500 hover:underline">
                    {talent.workEmail || talent.user?.email || "N/A"}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Phone</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">WhatsApp Number</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.whatsapp || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Location / Residence</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">
                  {talent.location ? (typeof talent.location === 'string' ? talent.location : [talent.location.city, talent.location.country].filter(Boolean).join(', ')) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Gender</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold uppercase">{talent.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Date of Birth</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.dob || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Age</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.age ? `${talent.age} Yrs` : "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Nationality</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.nationality || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Country of Residence</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.countryOfResidence || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">LinkedIn</p>
                {talent.linkedin ? (
                  <a href={talent.linkedin} target="_blank" rel="noreferrer" className="text-sm text-brand-500 font-semibold hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> View Profile
                  </a>
                ) : <p className="text-sm text-gray-800 dark:text-white font-semibold">N/A</p>}
              </div>
            </div>
          </div>

          {/* 2. Professional Summary */}
          {talent.summary && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Professional Statement / summary
              </h3>
              <div className="bg-gray-50/50 dark:bg-gray-900/40 p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-sans whitespace-pre-wrap">
                {talent.summary}
              </div>
            </div>
          )}

          {/* 3. Career & Experience Profile */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <Briefcase className="w-4 h-4 text-brand-500" />
              Career & Experience Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Current Job Title</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.jobTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Current Employer</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.employerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Employer Location</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.employmentCountry || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Opportunity Type</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.opportunityType || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Preferred Role</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.preferredRole || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Preferred Industry</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.preferredIndustry || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Preferred Salary expectations</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.preferredSalary || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Start Availability Date</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.startDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Currently Employed?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.isEmployed === "true" || talent.isEmployed === "Yes" ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Worked Overseas?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.workedOverseas || "N/A"}</p>
              </div>
              {talent.overseasCountries && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Overseas Experience Details</p>
                  <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.overseasCountries}</p>
                </div>
              )}
            </div>

            {/* List of Experiences from profile */}
            {parsedExperiences.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-800/50">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Work History Timeline</h4>
                <div className="space-y-4">
                  {parsedExperiences.map((exp: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start relative pl-4 border-l border-brand-200 dark:border-brand-900">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-sm font-bold text-gray-850 dark:text-white">{exp.role || exp.title}</h5>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono shrink-0">{exp.startDate} - {exp.endDate || 'Present'}</span>
                        </div>
                        <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{exp.company || exp.employer}</p>
                        {exp.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-450 mt-1 line-clamp-3">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Education & Academic Background */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <GraduationCap className="w-4 h-4 text-brand-500" />
              Education & Academic Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Highest Qualification</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.highestQualification || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Field of Study</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.fieldOfStudy || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Institution Name</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.institutionName || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Graduation Year</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.graduationYear || "N/A"}</p>
              </div>
            </div>

            {/* List of Education Details */}
            {parsedEducations.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-gray-800/50">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Academic Milestones</h4>
                <div className="space-y-4">
                  {parsedEducations.map((edu: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start relative pl-4 border-l border-emerald-200 dark:border-emerald-950">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-sm font-bold text-gray-850 dark:text-white">{edu.degree || edu.qualification}</h5>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono shrink-0">{edu.year || edu.duration}</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 mt-0.5">{edu.school || edu.institution}</p>
                        {edu.field && <p className="text-xs text-gray-550 mt-0.5">Specialization: {edu.field}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Visa, Relocation & Working Rights */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <Globe className="w-4 h-4 text-brand-500" />
              Visa, Relocation & Working Rights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Visa Status</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.visaStatus || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Legal Working Rights?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.legalWorkRights || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Open to Relocation?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.openToRelocation || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Applied for Australian Visa?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.appliedAusVisa || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Visa Type Applied</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.visaTypeApplied || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Visa Refusal History?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.visaRefusal || "No"}</p>
              </div>
              {talent.visaRefusalDetails && (
                <div className="col-span-1 sm:col-span-2 md:col-span-3">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Visa Refusal Details</p>
                  <p className="text-sm text-gray-850 dark:text-white font-semibold">{talent.visaRefusalDetails}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Relocating Alone/With Family?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.relocateAloneOrFamily || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* 6. English Proficiency & Certifications */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <Award className="w-4 h-4 text-brand-500" />
              English Proficiency & Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">English Test Type</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.englishTest || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Overall Score</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.overallScore || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Test date</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.testDate || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Holds Licences / Accreditations?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.hasLicences || "No"}</p>
              </div>
              {talent.licencesList && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Licences List</p>
                  <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.licencesList}</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. Passports & Background Verifications */}
          <div className="bg-gray-50/50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/80">
            <h3 className="text-xs font-bold text-gray-800 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2 border-b border-gray-200/50 dark:border-gray-800/50 pb-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              Passport & Background Checks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Holds Valid Passport?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.validPassport || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Passport Expiry Date</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.passportExpiry || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Medical Clearance Background?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.medicalBackgroundCheck || "N/A"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Criminal Convictions?</p>
                <p className="text-sm text-gray-800 dark:text-white font-semibold">{talent.criminalConvictions || "No"}</p>
              </div>
              {talent.criminalDetails && (
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Criminal Conviction Details</p>
                  <p className="text-sm text-gray-850 dark:text-white font-semibold">{talent.criminalDetails}</p>
                </div>
              )}
            </div>
          </div>

          {/* 8. Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                Key Professional Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {talent.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="inline-block rounded-md bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 border border-brand-100/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 9. Uploaded Credentials & Support Documents */}
          <div>
            <h3 className="text-xs font-bold text-gray-950 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-500" />
              Uploaded Supporting Credentials & Documents ({documents.length})
            </h3>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-brand-50/40 dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-brand-500 group-hover:scale-105 transition-transform shrink-0">
                        <FileText className="w-5 h-5 text-brand-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-250 truncate group-hover:underline">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/50 text-center text-xs text-gray-400 italic">
                No supporting certificates or document uploads exist for this candidate profile.
              </div>
            )}
          </div>

          {/* 10. Job Details Reference Panel */}
          {application.job && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800/80 p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-brand-500" />
                  Applied Job Reference Details
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-semibold">Job Title</p>
                  <p className="text-sm text-gray-800 dark:text-white font-bold">{application.job.title}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Category</p>
                    <p className="text-sm text-gray-850 dark:text-white font-semibold">{application.job.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Type</p>
                    <p className="text-sm text-gray-850 dark:text-white font-semibold">{application.job.type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Mode</p>
                    <p className="text-sm text-gray-850 dark:text-white font-semibold">{application.job.mode}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-bold uppercase tracking-wider">Location</p>
                    <p className="text-sm text-gray-850 dark:text-white font-semibold">{application.job.location}</p>
                  </div>
                </div>

                {jobReqs.length > 0 && jobReqs[0] !== "" && (
                  <div className="pt-2">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 font-bold uppercase tracking-wider">Requirements</p>
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
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2 mt-2 font-bold uppercase tracking-wider">Perks & Benefits</p>
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

          {/* 11. Cover Letter */}
          {application.coverLetter && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Submitted Cover Letter
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed border border-gray-200 dark:border-gray-800">
                {application.coverLetter}
              </div>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
}
