import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  activeTab: "talents" | "employers";
  onSave: (payload: { email: string; isActive: boolean; profileData: any }) => Promise<void>;
  saving: boolean;
  showToast: (msg: string, type: "success" | "error") => void;
  onViewDoc: (url: string, title: string) => void;
}

const labelBase = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";



function SimpleDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Select
      options={options.map(opt => ({ value: opt, label: opt }))}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="!shadow-theme-xs !h-11"
    />
  );
}

import { TalentEditForm } from "./components/TalentEditForm";
import { EmployerEditForm } from "./components/EmployerEditForm";

export default function UserEditModal({
  isOpen,
  onClose,
  selectedUser,
  activeTab,
  onSave,
  saving,
  showToast,
  onViewDoc
}: UserEditModalProps) {
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editProfile, setEditProfile] = useState<any>({});
  const [activeEditTab, setActiveEditTab] = useState<string>("personal");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [uploadedInSession, setUploadedInSession] = useState<Record<string, boolean>>({});
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [skillInput, setSkillInput] = useState("");

  const isUploadingAny = Object.values(uploading).some(Boolean);

  const talentEditTabs = [
    { id: "personal", label: "Personal Details" },
    { id: "job", label: "Job Preferences" },
    { id: "work", label: "Work Experience" },
    { id: "education", label: "Education & Licenses" },
    { id: "english", label: "English Test" },
    { id: "visa", label: "Visa & Passport" },
    { id: "documents", label: "Documents & Declarations" }
  ];

  /* ── Reset state on open ───────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen && selectedUser) {
      const userRecord = selectedUser.user || {};
      setEditEmail(userRecord.email || "");
      setEditIsActive(userRecord.isActive !== false);
      setActiveEditTab("personal");
      setBrokenImages({});
      setUploadedInSession({});
      setUploading({});
      setSkillInput("");

      if (activeTab === "talents") {
        setEditProfile({
          fullName: selectedUser.fullName || "",
          workEmail: selectedUser.workEmail || "",
          phone: selectedUser.phone || "",
          location: selectedUser.location
            ? typeof selectedUser.location === "string"
              ? selectedUser.location
              : [selectedUser.location.city, selectedUser.location.country].filter(Boolean).join(", ")
            : "",
          state: selectedUser.state || (selectedUser.location && typeof selectedUser.location === "object" ? selectedUser.location.state || "" : ""),
          city: selectedUser.city || (selectedUser.location && typeof selectedUser.location === "object" ? selectedUser.location.city || "" : ""),
          skills: Array.isArray(selectedUser.skills)
            ? selectedUser.skills
            : typeof selectedUser.skills === "string"
              ? selectedUser.skills.split(",").map((s: any) => s.trim()).filter(Boolean)
              : [],
          dob: selectedUser.dob || "",
          age: selectedUser.age || "",
          gender: selectedUser.gender || "",
          nationality: selectedUser.nationality || "",
          countryOfResidence: selectedUser.countryOfResidence || "",
          whatsapp: selectedUser.whatsapp || "",
          linkedin: selectedUser.linkedin || "",
          opportunityType: selectedUser.opportunityType || "",
          preferredIndustry: selectedUser.preferredIndustry || "",
          preferredRole: selectedUser.preferredRole || "",
          preferredSalary: selectedUser.preferredSalary || "",
          startDate: selectedUser.startDate || "",
          jobTitle: selectedUser.jobTitle || "",
          employerName: selectedUser.employerName || "",
          employmentCountry: selectedUser.employmentCountry || "",
          totalExp: selectedUser.totalExp || "",
          relevantExp: selectedUser.relevantExp || "",
          summary: selectedUser.summary || "",
          isEmployed: selectedUser.isEmployed || "",
          workedOverseas: selectedUser.workedOverseas || "",
          overseasCountries: selectedUser.overseasCountries || "",
          highestQualification: selectedUser.highestQualification || "",
          fieldOfStudy: selectedUser.fieldOfStudy || "",
          institutionName: selectedUser.institutionName || "",
          graduationYear: selectedUser.graduationYear || "",
          hasLicences: selectedUser.hasLicences || "",
          licencesList: selectedUser.licencesList || "",
          englishTest: selectedUser.englishTest || "",
          overallScore: selectedUser.overallScore || "",
          testDate: selectedUser.testDate || "",
          visaStatus: selectedUser.visaStatus || "",
          legalWorkRights: selectedUser.legalWorkRights || "",
          openToRelocation: selectedUser.openToRelocation || "",
          appliedAusVisa: selectedUser.appliedAusVisa || "",
          visaTypeApplied: selectedUser.visaTypeApplied || "",
          visaRefusal: selectedUser.visaRefusal || "",
          visaRefusalDetails: selectedUser.visaRefusalDetails || "",
          relocateAloneOrFamily: selectedUser.relocateAloneOrFamily || "",
          validPassport: selectedUser.validPassport || "",
          passportExpiry: selectedUser.passportExpiry || "",
          medicalBackgroundCheck: selectedUser.medicalBackgroundCheck || "",
          criminalConvictions: selectedUser.criminalConvictions || "",
          criminalDetails: selectedUser.criminalDetails || "",
          passportUrl: selectedUser.passportUrl || "",
          visaUrl: selectedUser.visaUrl || "",
          eduCertUrl: selectedUser.eduCertUrl || "",
          empCertUrl: selectedUser.empCertUrl || "",
          englishTestUrl: selectedUser.englishTestUrl || "",
          licenceUrl: selectedUser.licenceUrl || "",
          resumeUrl: selectedUser.resumeUrl || "",
          avatarUrl: selectedUser.avatarUrl || "",
          declarationTrue: selectedUser.declarationTrue || "",
          declarationConsent: selectedUser.declarationConsent || "",
        });
      } else {
        setEditProfile({
          firstName: selectedUser.firstName || "",
          lastName: selectedUser.lastName || "",
          businessPhone: selectedUser.businessPhone || "",
          businessEmail: selectedUser.businessEmail || "",
          companyName: selectedUser.companyName || "",
          jobTitle: selectedUser.jobTitle || "",
          jobTitleToHire: selectedUser.jobTitleToHire || "",
          zipCode: selectedUser.zipCode || "",
          positionType: selectedUser.positionType || "",
          companyLogo: selectedUser.companyLogo || "",
        });
      }
    }
  }, [isOpen, selectedUser, activeTab]);



  const handleAddSkill = () => {
    const newSkill = skillInput.trim();
    if (!newSkill) return;
    const currentSkills = Array.isArray(editProfile.skills) ? editProfile.skills : [];
    if (currentSkills.length >= 25) {
      showToast("You can add a maximum of 25 skills.", "error");
      return;
    }
    if (currentSkills.includes(newSkill)) {
      showToast("This skill is already added.", "error");
      return;
    }
    setEditProfile((prev: any) => ({
      ...prev,
      skills: [...currentSkills, newSkill]
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = Array.isArray(editProfile.skills) ? editProfile.skills : [];
    setEditProfile((prev: any) => ({
      ...prev,
      skills: currentSkills.filter((s: string) => s !== skillToRemove)
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Account email validation (applies to both Talent & Employer)
    if (!editEmail?.trim()) {
      showToast("Account Email is required.", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Validations
    if (activeTab === "talents") {
      if (!editProfile.fullName?.trim()) {
        showToast("Full Name is required.", "error");
        return;
      }
      if (!editProfile.phone?.trim()) {
        showToast("Phone is required.", "error");
        return;
      }
      if (editProfile.phone.replace(/[^\d]/g, "").length < 5) {
        showToast("Phone must have at least 5 digits.", "error");
        return;
      }
      if (!editProfile.whatsapp?.trim()) {
        showToast("WhatsApp is required.", "error");
        return;
      }
      if (editProfile.whatsapp.replace(/[^\d]/g, "").length < 5) {
        showToast("WhatsApp must have at least 5 digits.", "error");
        return;
      }
      if (!editProfile.dob?.trim()) {
        showToast("Date of Birth is required.", "error");
        return;
      }
      if (!editProfile.nationality?.trim()) {
        showToast("Nationality is required.", "error");
        return;
      }
      if (!editProfile.countryOfResidence?.trim()) {
        showToast("Country of Residence is required.", "error");
        return;
      }
      if (editProfile.linkedin?.trim()) {
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;
        if (!linkedinRegex.test(editProfile.linkedin.trim())) {
          showToast("Please enter a valid LinkedIn URL.", "error");
          return;
        }
      }
      if (!editProfile.opportunityType?.trim()) {
        showToast("Please select an opportunity type.", "error");
        return;
      }
      if (!editProfile.preferredIndustry?.trim()) {
        showToast("Preferred Industry is required.", "error");
        return;
      }
      if (!editProfile.preferredRole?.trim()) {
        showToast("Preferred Role is required.", "error");
        return;
      }
      if (!editProfile.isEmployed?.trim()) {
        showToast("Please indicate if you are currently employed.", "error");
        return;
      }
      if (editProfile.isEmployed === "Yes") {
        if (!editProfile.jobTitle?.trim()) {
          showToast("Current Job Title is required.", "error");
          return;
        }
        if (!editProfile.employerName?.trim()) {
          showToast("Current Employer Name is required.", "error");
          return;
        }
        if (!editProfile.totalExp?.trim()) {
          showToast("Total Years of Experience is required.", "error");
          return;
        }
      }
      if (!editProfile.highestQualification?.trim()) {
        showToast("Please select your highest qualification.", "error");
        return;
      }
      if (!editProfile.fieldOfStudy?.trim()) {
        showToast("Field of Study is required.", "error");
        return;
      }
      if (!editProfile.englishTest?.trim()) {
        showToast("Please select your English test status.", "error");
        return;
      }
      if (!editProfile.visaStatus?.trim()) {
        showToast("Current Visa / Residency Status is required.", "error");
        return;
      }
      if (!editProfile.openToRelocation?.trim()) {
        showToast("Please indicate if you are open to relocation.", "error");
        return;
      }
      if (!editProfile.passportUrl?.trim()) {
        showToast("Passport document is required.", "error");
        return;
      }
      if (!editProfile.visaUrl?.trim()) {
        showToast("Visa / Residency permit document is required.", "error");
        return;
      }
      if (!editProfile.resumeUrl?.trim()) {
        showToast("Resume / CV document is required.", "error");
        return;
      }
    } else {
      if (!editProfile.firstName?.trim()) {
        showToast("First Name is required.", "error");
        return;
      }
      if (!editProfile.lastName?.trim()) {
        showToast("Last Name is required.", "error");
        return;
      }
      if (!editProfile.businessEmail?.trim()) {
        showToast("Business Email is required.", "error");
        return;
      }
      if (!editProfile.businessPhone?.trim()) {
        showToast("Business Phone is required.", "error");
        return;
      }
      if (editProfile.businessPhone.replace(/[^\d]/g, "").length < 5) {
        showToast("Business Phone must have at least 5 digits.", "error");
        return;
      }
      if (!editProfile.companyName?.trim()) {
        showToast("Company Name is required.", "error");
        return;
      }
      if (!editProfile.jobTitle?.trim()) {
        showToast("Your job title is required.", "error");
        return;
      }
      if (!editProfile.jobTitleToHire?.trim()) {
        showToast("Job title to hire is required.", "error");
        return;
      }
      if (!editProfile.zipCode?.trim()) {
        showToast("Zip code is required.", "error");
        return;
      }
      if (!editProfile.positionType?.trim()) {
        showToast("Please select a position type.", "error");
        return;
      }
    }

    const finalProfile = { ...editProfile };
    if (Array.isArray(finalProfile.skills)) {
      finalProfile.skills = finalProfile.skills.join(", ");
    }
    onSave({
      email: editEmail,
      isActive: editIsActive,
      profileData: finalProfile
    });
  };

  /* Field renderers and SectionHeading removed (delegated to components) */

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[850px] w-full m-4 p-6 sm:p-8">
      {selectedUser && (
        <form onSubmit={handleFormSubmit}>
          <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {activeTab === "talents" ? "Edit Talent Account & Profile" : "Edit Employer Account & Profile"}
          </h3>

          {/* ── Account Level ────────────────────────────────────────────── */}
          <div className="mb-4 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Account Email <span className="text-red-500">*</span></label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
            </div>
            <div>
              <label className={labelBase}>Account Status</label>
              <SimpleDropdown
                options={["Active", "Inactive"]}
                value={editIsActive ? "Active" : "Inactive"}
                onChange={(val) => setEditIsActive(val === "Active")}
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              TALENT FORM (7 tabs)
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "talents" ? (
            <TalentEditForm
              editProfile={editProfile}
              setEditProfile={setEditProfile}
              activeEditTab={activeEditTab}
              setActiveEditTab={setActiveEditTab}
              talentEditTabs={talentEditTabs}
              uploading={uploading}
              setUploading={setUploading}
              uploadErrors={uploadErrors}
              setUploadErrors={setUploadErrors}
              uploadedInSession={uploadedInSession}
              setUploadedInSession={setUploadedInSession}
              brokenImages={brokenImages}
              setBrokenImages={setBrokenImages}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              handleAddSkill={handleAddSkill}
              handleRemoveSkill={handleRemoveSkill}
              onViewDoc={onViewDoc}
              showToast={showToast}
              selectedUser={selectedUser}
            />
          ) : (
            <EmployerEditForm
              editProfile={editProfile}
              setEditProfile={setEditProfile}
              uploading={uploading}
              setUploading={setUploading}
              uploadErrors={uploadErrors}
              setUploadErrors={setUploadErrors}
              brokenImages={brokenImages}
              setBrokenImages={setBrokenImages}
              showToast={showToast}
              selectedUser={selectedUser}
            />
          )}

          {/* ── Modal Actions ─────────────────────────────────────────────── */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={saving || isUploadingAny}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={saving || isUploadingAny}>
              {saving ? "Saving..." : isUploadingAny ? "Uploading..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
