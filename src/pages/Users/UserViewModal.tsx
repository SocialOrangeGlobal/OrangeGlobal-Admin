import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";

export const DefaultUserIcon = () => (
  <svg
    className="h-full w-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  activeTab: "talents" | "employers";
  brokenImages: Record<string, boolean>;
  onImageError: (url: string) => void;
  onViewDoc: (url: string, title: string) => void;
}

export default function UserViewModal({
  isOpen,
  onClose,
  selectedUser,
  activeTab,
  brokenImages,
  onImageError,
  onViewDoc
}: UserViewModalProps) {
  
  const renderDocumentLink = (url: string | null | undefined, title: string) => {
    if (!url) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 border border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-800">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Not Uploaded
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onViewDoc(url, title)}
        className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 border border-brand-100 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30 dark:hover:bg-brand-900/20 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Document
      </button>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[850px] w-full m-4 p-6 sm:p-8">
      {selectedUser && (
        <div>
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {activeTab === "talents" ? "Talent Full Profile Details" : "Employer Profile Details"}
          </h3>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Profile Card Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/[0.05]">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-brand-500 bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                {activeTab === "talents" ? (
                  selectedUser.avatarUrl && !brokenImages[selectedUser.avatarUrl] ? (
                    <img 
                      src={selectedUser.avatarUrl} 
                      alt="Avatar" 
                      className="h-full w-full object-cover" 
                      onError={() => onImageError(selectedUser.avatarUrl)}
                    />
                  ) : (
                    <DefaultUserIcon />
                  )
                ) : (
                  selectedUser.companyLogo && !brokenImages[selectedUser.companyLogo] ? (
                    <img 
                      src={selectedUser.companyLogo} 
                      alt="Logo" 
                      className="h-full w-full object-contain p-1" 
                      onError={() => onImageError(selectedUser.companyLogo)}
                    />
                  ) : (
                    <DefaultUserIcon />
                  )
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                  {activeTab === "talents" ? selectedUser.fullName : selectedUser.companyName}
                </h4>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Account: {selectedUser.user?.email || selectedUser.email}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <Badge size="sm" color={selectedUser.user?.isActive !== false ? "success" : "error"}>
                    {selectedUser.user?.isActive !== false ? "Active Account" : "Inactive Account"}
                  </Badge>
                </div>
              </div>
            </div>

            {activeTab === "talents" ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Personal Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Full Name:</span> {selectedUser.fullName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Work Email:</span> {selectedUser.workEmail || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Phone:</span> {selectedUser.phone || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">WhatsApp:</span> {selectedUser.whatsapp || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Date of Birth:</span> {selectedUser.dob || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Age:</span> {selectedUser.age || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Gender:</span> {selectedUser.gender || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Nationality:</span> {selectedUser.nationality || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Country of Residence:</span> {selectedUser.countryOfResidence || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Location (City, Country):</span> {selectedUser.location ? (typeof selectedUser.location === "string" ? selectedUser.location : `${selectedUser.location.city || ""}, ${selectedUser.location.country || ""}`) : "N/A"}</div>
                    <div className="md:col-span-2"><span className="font-medium text-gray-800 dark:text-white">LinkedIn Profile:</span> {selectedUser.linkedin ? <a href={selectedUser.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">{selectedUser.linkedin}</a> : "N/A"}</div>
                  </div>
                </div>

                {/* Job Preferences */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Job Preferences
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Opportunity Type:</span> {selectedUser.opportunityType || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Preferred Industry:</span> {selectedUser.preferredIndustry || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Preferred Role:</span> {selectedUser.preferredRole || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Preferred Salary:</span> {selectedUser.preferredSalary || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Start Date:</span> {selectedUser.startDate || "N/A"}</div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Work Experience
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Job Title:</span> {selectedUser.jobTitle || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Employer Name:</span> {selectedUser.employerName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Employment Country:</span> {selectedUser.employmentCountry || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Total Experience:</span> {selectedUser.totalExp ? `${selectedUser.totalExp} Years` : "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Relevant Experience:</span> {selectedUser.relevantExp ? `${selectedUser.relevantExp} Years` : "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Is Employed:</span> {selectedUser.isEmployed || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Worked Overseas:</span> {selectedUser.workedOverseas || "N/A"}</div>
                    <div className="md:col-span-2"><span className="font-medium text-gray-800 dark:text-white">Overseas Countries:</span> {selectedUser.overseasCountries || "N/A"}</div>
                    
                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-800 dark:text-white block mb-1">Key Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedUser.skills && selectedUser.skills.length > 0 ? (
                          selectedUser.skills.map((skill: string, index: number) => (
                            <span key={index} className="inline-block rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No skills listed</span>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <span className="font-medium text-gray-800 dark:text-white block mb-1">Profile Summary:</span>
                      <p className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl text-xs leading-relaxed italic text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                        {selectedUser.summary || "No summary provided."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Education & Licenses */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H9m3 0h3M3 9l9 5 9-5" />
                    </svg>
                    Education & Licenses
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Highest Qualification:</span> {selectedUser.highestQualification || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Field of Study:</span> {selectedUser.fieldOfStudy || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Institution Name:</span> {selectedUser.institutionName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Graduation Year:</span> {selectedUser.graduationYear || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Has Licenses:</span> {selectedUser.hasLicences || "N/A"}</div>
                    <div className="md:col-span-3"><span className="font-medium text-gray-800 dark:text-white block mb-1">Licenses List:</span>
                      <p className="bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                        {selectedUser.licencesList || "None listed"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* English Test */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.584a.5.5 0 01-.048-.084c.5-1 1-2 1-3h-1.5c-1 0-1.5.5-1.5 1s.5 1 1 1h1.048zm.952-4.084V9H7m11 11l-3-3m3 3l3-3m-3 3h-9" />
                    </svg>
                    English Proficiency
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">English Test Type:</span> {selectedUser.englishTest || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Overall Score:</span> {selectedUser.overallScore || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Test Date:</span> {selectedUser.testDate || "N/A"}</div>
                  </div>
                </div>

                {/* Visa & Security */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Visa & Security Declarations
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Visa Status:</span> {selectedUser.visaStatus || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Legal Work Rights:</span> {selectedUser.legalWorkRights || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Open to Relocation:</span> {selectedUser.openToRelocation || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Applied Aus Visa:</span> {selectedUser.appliedAusVisa || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Visa Type Applied:</span> {selectedUser.visaTypeApplied || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Visa Refusal:</span> {selectedUser.visaRefusal || "N/A"}</div>
                    <div className="md:col-span-3"><span className="font-medium text-gray-800 dark:text-white block mb-1">Visa Refusal Details:</span>
                      <p className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                        {selectedUser.visaRefusalDetails || "None"}
                      </p>
                    </div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Relocate Status:</span> {selectedUser.relocateAloneOrFamily || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Valid Passport:</span> {selectedUser.validPassport || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Passport Expiry:</span> {selectedUser.passportExpiry || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Medical Background Check:</span> {selectedUser.medicalBackgroundCheck || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Criminal Convictions:</span> {selectedUser.criminalConvictions || "N/A"}</div>
                    <div className="md:col-span-3"><span className="font-medium text-gray-800 dark:text-white block mb-1">Criminal Details:</span>
                      <p className="bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                        {selectedUser.criminalDetails || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents Attached */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Document Attachments (Click to Preview)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resume / CV</span>
                      {renderDocumentLink(selectedUser.resumeUrl, `${selectedUser.fullName} - Resume`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Passport Copy</span>
                      {renderDocumentLink(selectedUser.passportUrl, `${selectedUser.fullName} - Passport`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visa Copy</span>
                      {renderDocumentLink(selectedUser.visaUrl, `${selectedUser.fullName} - Visa`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education Certificate</span>
                      {renderDocumentLink(selectedUser.eduCertUrl, `${selectedUser.fullName} - Education Certificate`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employment Certificate</span>
                      {renderDocumentLink(selectedUser.empCertUrl, `${selectedUser.fullName} - Employment Certificate`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">English Test Result</span>
                      {renderDocumentLink(selectedUser.englishTestUrl, `${selectedUser.fullName} - English Test`)}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.01] rounded-xl border border-gray-100 dark:border-white/[0.03]">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Licence Document</span>
                      {renderDocumentLink(selectedUser.licenceUrl, `${selectedUser.fullName} - Licence`)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Declaration True:</span> {selectedUser.declarationTrue || "N/A"}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Consent Declaration:</span> {selectedUser.declarationConsent || "N/A"}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Employer Details */
              <div className="space-y-6">
                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company & Contact details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Company Name:</span> {selectedUser.companyName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Zip Code:</span> {selectedUser.zipCode || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Contact First Name:</span> {selectedUser.firstName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Contact Last Name:</span> {selectedUser.lastName || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Contact Job Title:</span> {selectedUser.jobTitle || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Business Email:</span> {selectedUser.businessEmail || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Business Phone:</span> {selectedUser.businessPhone || "N/A"}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-brand-500 border-b border-gray-100 pb-1.5 dark:border-gray-800 flex items-center gap-1.5">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Hiring Preferences
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-white">Position to Hire For:</span> {selectedUser.jobTitleToHire || "N/A"}</div>
                    <div><span className="font-medium text-gray-800 dark:text-white">Position Type:</span> {selectedUser.positionType || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}
    </Modal>
  );
}
