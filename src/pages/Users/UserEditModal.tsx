import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { uploadFile } from "../../lib/storage";
import { SearchableDropdown } from "./SearchableDropdown";
import { DefaultUserIcon } from "./UserViewModal";
import {
  countries,
  nationalities,
  genders,
  opportunityTypes,
  highestQualifications,
  englishTests,
  relocationFamilyStatuses,
  yesNoOptions,
  positionTypes,
  countryStateCity
} from "./constants";

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

/* ─── shared CSS tokens ───────────────────────────────────────────────────── */
const fieldBase =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs " +
  "focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 " +
  "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const labelBase = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

/**
 * Convert any stored date string to the YYYY-MM-DD format required by
 * <input type="date">. Handles:
 *   - "02/02/1990"           (DD/MM/YYYY  — most common AU/PH format)
 *   - "2024-01-15T00:00:00Z" (ISO timestamp)
 *   - "2024-01-15"           (already correct — passthrough)
 *   - "02-02-1990"           (DD-MM-YYYY)
 */
const toDateInput = (raw: string): string => {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (!s) return "";
  // Already correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO timestamp — keep only the date part
  if (s.includes("T")) return s.split("T")[0];
  // DD/MM/YYYY  (e.g. "02/02/1990")
  const slashDMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (slashDMY) return `${slashDMY[3]}-${slashDMY[2].padStart(2, "0")}-${slashDMY[1].padStart(2, "0")}`;
  // DD-MM-YYYY  (e.g. "02-02-1990")
  const dashDMY = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s);
  if (dashDMY) return `${dashDMY[3]}-${dashDMY[2].padStart(2, "0")}-${dashDMY[1].padStart(2, "0")}`;
  return "";
};
import Select from "../../components/form/Select";

/**
 * SimpleDropdown — wrapper around standard Select component for backwards compatibility.
 */
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

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  const handleImageError = (url: string) => {
    if (!url) return;
    setBrokenImages((prev) => ({ ...prev, [url]: true }));
  };

  const handleFileUpload = async (fieldName: string, file: File, bucket: string) => {
    try {
      setUploading((prev) => ({ ...prev, [fieldName]: true }));
      const userId = selectedUser?.user?.id || "unknown";
      const path = `${userId}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const url = await uploadFile(file, bucket, path);
      setEditProfile((prev: any) => ({ ...prev, [fieldName]: url }));
      setUploadedInSession((prev) => ({ ...prev, [fieldName]: true }));
      showToast("File uploaded successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

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
      if (!editProfile.institutionName?.trim()) {
        showToast("Institution Name is required.", "error");
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
      if (!editProfile.legalWorkRights?.trim()) {
        showToast("Legal Work Rights information is required.", "error");
        return;
      }
      if (!editProfile.openToRelocation?.trim()) {
        showToast("Please indicate if you are open to relocation.", "error");
        return;
      }
      if (!editProfile.validPassport?.trim()) {
        showToast("Please indicate if you hold a valid passport.", "error");
        return;
      }
      if (editProfile.validPassport === "Yes" && !editProfile.passportExpiry?.trim()) {
        showToast("Passport Expiry Date is required.", "error");
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

  /* ── Field renderers ───────────────────────────────────────────────────── */

  /** Custom dropdown — same visual as SearchableDropdown, no search bar */
  const renderSelectField = (label: string, fieldName: string, options: string[], required = false) => (
    <div>
      <label className={labelBase}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <SimpleDropdown
        options={options}
        value={editProfile[fieldName] || ""}
        onChange={(val) => setEditProfile((prev: any) => ({ ...prev, [fieldName]: val }))}
        placeholder="Select..."
        required={required}
      />
    </div>
  );

  /**
   * Date picker — uses toDateInput() to convert any stored format to YYYY-MM-DD.
   * Explicit bg-white/dark:bg-gray-800 prevents Chrome from breaking on bg-transparent.
   * [color-scheme] classes theme the native calendar widget correctly.
   */
  const renderDateField = (label: string, fieldName: string, required = false) => {
    const dateVal = toDateInput(editProfile[fieldName] || "");

    return (
      <div>
        <label className={labelBase}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="date"
            value={dateVal}
            onChange={(e) => {
              const val = e.target.value;
              setEditProfile((prev: any) => {
                const updated = { ...prev, [fieldName]: val };
                if (fieldName === "dob") {
                  if (val) {
                    const birthDate = new Date(val);
                    if (!isNaN(birthDate.getTime())) {
                      const today = new Date();
                      let computedAge = today.getFullYear() - birthDate.getFullYear();
                      const m = today.getMonth() - birthDate.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        computedAge--;
                      }
                      updated.age = computedAge >= 0 ? computedAge.toString() : "";
                    }
                  } else {
                    updated.age = "";
                  }
                }
                return updated;
              });
            }}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch (err) {
                console.warn("showPicker is not supported in this browser", err);
              }
            }}
            onFocus={(e) => {
              try {
                e.currentTarget.showPicker();
              } catch (err) {
                console.warn("showPicker is not supported in this browser", err);
              }
            }}
            required={required}
            className={
              "h-11 w-full rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm shadow-theme-xs cursor-pointer " +
              "focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 " +
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 " +
              "[color-scheme:light] dark:[color-scheme:dark]"
            }
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </div>
      </div>
    );
  };
  /** State cascade — reset city when state changes */
  const renderStateField = (countryField: string) => {
    const statesMap = countryStateCity[editProfile[countryField] || ""] || {};
    const stateOptions = Object.keys(statesMap);
    return (
      <div>
        <label className={labelBase}>State / Region</label>
        {stateOptions.length > 0 ? (
          <SearchableDropdown
            options={stateOptions}
            value={editProfile.state || ""}
            onChange={(val) => setEditProfile((prev: any) => ({ ...prev, state: val, city: "" }))}
            placeholder="Select state / region..."
          />
        ) : (
          <Input
            type="text"
            value={editProfile.state || ""}
            onChange={(e) => setEditProfile((prev: any) => ({ ...prev, state: e.target.value }))}
            placeholder="Enter state / region"
          />
        )}
      </div>
    );
  };

  /** City cascade — filtered by selected state */
  const renderCityField = (countryField: string) => {
    const statesMap = countryStateCity[editProfile[countryField] || ""] || {};
    const cityOptions = statesMap[editProfile.state || ""] || [];
    return (
      <div>
        <label className={labelBase}>City</label>
        {cityOptions.length > 0 ? (
          <SearchableDropdown
            options={cityOptions}
            value={editProfile.city || ""}
            onChange={(val) => setEditProfile((prev: any) => ({ ...prev, city: val }))}
            placeholder="Select city..."
          />
        ) : (
          <Input
            type="text"
            value={editProfile.city || ""}
            onChange={(e) => setEditProfile((prev: any) => ({ ...prev, city: e.target.value }))}
            placeholder="Enter city"
          />
        )}
      </div>
    );
  };

  /** Image upload card */
  const renderImageUpload = (label: string, fieldName: string, bucket: string) => {
    const url = editProfile[fieldName] || "";
    const isUploading = uploading[fieldName];
    const inputId = `image-upload-${fieldName}`;
    return (
      <div className="col-span-2 bg-gray-50 dark:bg-white/[0.02] rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            {url && !brokenImages[url] ? (
              <img src={url} alt={label} className="h-full w-full object-cover" onError={() => handleImageError(url)} />
            ) : (
              <DefaultUserIcon />
            )}
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-800 dark:text-white">{label}</span>
            <span className="block text-xs text-gray-400">Click to upload or change image</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleFileUpload(fieldName, file, bucket);
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById(inputId)?.click()} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
          {url && (
            <Button type="button" size="sm" variant="outline" onClick={() => setEditProfile((prev: any) => ({ ...prev, [fieldName]: "" }))}>
              Clear
            </Button>
          )}
        </div>
      </div>
    );
  };

  /** Document upload card — only shows success badge after upload in this session */
  const renderDocUploadCard = (label: string, fieldName: string, bucket: string, required = false) => {
    const url = editProfile[fieldName] || "";
    const isUploading = uploading[fieldName];
    const wasUploadedNow = uploadedInSession[fieldName];
    const inputId = `doc-upload-${fieldName}`;

    /* Status badge */
    let statusElement: React.ReactNode = null;
    if (wasUploadedNow) {
      statusElement = (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Uploaded successfully
        </span>
      );
    } else if (url) {
      statusElement = (
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Document on file
        </span>
      );
    } else {
      statusElement = <span className="text-xs text-gray-400 italic">No document uploaded yet</span>;
    }

    return (
      <div className="rounded-xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all border-gray-200 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">
              {label} {required && <span className="text-red-500">*</span>}
            </h4>
            {statusElement}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await handleFileUpload(fieldName, file, bucket);
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById(inputId)?.click()} disabled={isUploading}>
            {isUploading ? "Uploading..." : url ? "Update File" : "Upload File"}
          </Button>
          {url && (
            <>
              <button
                type="button"
                onClick={() => onViewDoc(url, label)}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                View
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditProfile((prev: any) => ({ ...prev, [fieldName]: "" }));
                  setUploadedInSession((prev) => { const n = { ...prev }; delete n[fieldName]; return n; });
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-error-600 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ── Section heading ───────────────────────────────────────────────────── */
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-2">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-1 dark:border-gray-800">
        {children}
      </h4>
    </div>
  );

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[55vh]">
              {/* Tab sidebar */}
              <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pr-0 md:pr-4">
                {talentEditTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditTab(tab.id)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${activeEditTab === tab.id
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Tab content ─────────────────────────────────────────── */}
              <div className="md:col-span-3 overflow-y-auto pr-2 pb-2">

                {/* ─── Personal Details ──────────────────────────────────── */}
                {activeEditTab === "personal" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>Personal Info</SectionHeading>

                    <div>
                      <label className={labelBase}>Full Name <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.fullName || ""} onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Work Email</label>
                      <Input type="email" value={editProfile.workEmail || ""} onChange={(e) => setEditProfile({ ...editProfile, workEmail: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelBase}>Phone <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.phone || ""} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value.replace(/[^\d+\s\-]/g, "") })} required />
                    </div>
                    <div>
                      <label className={labelBase}>WhatsApp <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.whatsapp || ""} onChange={(e) => setEditProfile({ ...editProfile, whatsapp: e.target.value.replace(/[^\d+\s\-]/g, "") })} required />
                    </div>

                    {/* Date of Birth — date picker */}
                    {renderDateField("Date of Birth", "dob", true)}

                    <div>
                      <label className={labelBase}>Age</label>
                      <Input type="number" value={editProfile.age || ""} onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })} />
                    </div>

                    {renderSelectField("Gender", "gender", genders)}

                    {/* Nationality */}
                    <div>
                      <label className={labelBase}>Nationality <span className="text-red-500">*</span></label>
                      <SearchableDropdown
                        options={nationalities}
                        value={editProfile.nationality || ""}
                        onChange={(val) => setEditProfile((prev: any) => ({ ...prev, nationality: val }))}
                        placeholder="Search nationality..."
                      />
                    </div>

                    {/* Country of Residence → resets state + city */}
                    <div>
                      <label className={labelBase}>Country of Residence <span className="text-red-500">*</span></label>
                      <SearchableDropdown
                        options={countries}
                        value={editProfile.countryOfResidence || ""}
                        onChange={(val) => setEditProfile((prev: any) => ({ ...prev, countryOfResidence: val, state: "", city: "" }))}
                        placeholder="Search country..."
                      />
                    </div>

                    {/* State cascade */}
                    {renderStateField("countryOfResidence")}

                    {/* City cascade */}
                    {renderCityField("countryOfResidence")}

                    <div className="col-span-2">
                      <label className={labelBase}>LinkedIn Profile URL</label>
                      <Input type="text" value={editProfile.linkedin || ""} onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })} />
                    </div>

                    {renderImageUpload("Profile Picture", "avatarUrl", "profile-pictures")}
                  </div>
                )}

                {/* ─── Job Preferences ───────────────────────────────────── */}
                {activeEditTab === "job" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>Job Preferences</SectionHeading>
                    {renderSelectField("Opportunity Type", "opportunityType", opportunityTypes, true)}
                    <div>
                      <label className={labelBase}>Preferred Industry <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.preferredIndustry || ""} onChange={(e) => setEditProfile({ ...editProfile, preferredIndustry: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Preferred Role <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.preferredRole || ""} onChange={(e) => setEditProfile({ ...editProfile, preferredRole: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Preferred Salary</label>
                      <Input type="text" value={editProfile.preferredSalary || ""} onChange={(e) => setEditProfile({ ...editProfile, preferredSalary: e.target.value })} />
                    </div>
                    {/* Start date — date picker */}
                    {renderDateField("Available From (Start Date)", "startDate")}
                  </div>
                )}

                {/* ─── Work Experience ───────────────────────────────────── */}
                {activeEditTab === "work" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>Work Experience</SectionHeading>
                    {renderSelectField("Currently Employed?", "isEmployed", yesNoOptions, true)}
                    {editProfile.isEmployed === "Yes" && (
                      <>
                        <div>
                          <label className={labelBase}>Job Title <span className="text-red-500">*</span></label>
                          <Input type="text" value={editProfile.jobTitle || ""} onChange={(e) => setEditProfile({ ...editProfile, jobTitle: e.target.value })} required />
                        </div>
                        <div>
                          <label className={labelBase}>Employer Name <span className="text-red-500">*</span></label>
                          <Input type="text" value={editProfile.employerName || ""} onChange={(e) => setEditProfile({ ...editProfile, employerName: e.target.value })} required />
                        </div>
                        <div>
                          <label className={labelBase}>Employment Country</label>
                          <SearchableDropdown
                            options={countries}
                            value={editProfile.employmentCountry || ""}
                            onChange={(val) => setEditProfile((prev: any) => ({ ...prev, employmentCountry: val }))}
                            placeholder="Search country..."
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className={labelBase}>Total Experience (Years) {editProfile.isEmployed === "Yes" && <span className="text-red-500">*</span>}</label>
                      <Input type="number" value={editProfile.totalExp || ""} onChange={(e) => setEditProfile({ ...editProfile, totalExp: e.target.value })} required={editProfile.isEmployed === "Yes"} />
                    </div>
                    <div>
                      <label className={labelBase}>Relevant Experience (Years)</label>
                      <Input type="number" value={editProfile.relevantExp || ""} onChange={(e) => setEditProfile({ ...editProfile, relevantExp: e.target.value })} />
                    </div>
                    {renderSelectField("Worked Overseas?", "workedOverseas", yesNoOptions)}
                    {editProfile.workedOverseas === "Yes" && (
                      <div className="col-span-2">
                        <label className={labelBase}>Overseas Countries Worked In</label>
                        <Input type="text" value={editProfile.overseasCountries || ""} onChange={(e) => setEditProfile({ ...editProfile, overseasCountries: e.target.value })} placeholder="e.g. UK, Canada, UAE" />
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className={labelBase}>Key Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                          placeholder="Add a skill (e.g. React, Node.js)"
                          className={fieldBase}
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          variant="outline"
                          className="h-11 px-6 font-semibold"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Tag list */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(Array.isArray(editProfile.skills) ? editProfile.skills : []).map((s: string) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s)}
                              className="text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-200 focus:outline-none"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                        {(Array.isArray(editProfile.skills) ? editProfile.skills : []).length === 0 && (
                          <span className="text-xs text-gray-400 italic">No skills added yet.</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={labelBase}>Profile Summary</label>
                      <textarea
                        value={editProfile.summary || ""}
                        onChange={(e) => setEditProfile({ ...editProfile, summary: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                      />
                    </div>
                  </div>
                )}

                {/* ─── Education & Licenses ──────────────────────────────── */}
                {activeEditTab === "education" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>Education & Licenses</SectionHeading>
                    {renderSelectField("Highest Qualification", "highestQualification", highestQualifications, true)}
                    <div>
                      <label className={labelBase}>Field of Study <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.fieldOfStudy || ""} onChange={(e) => setEditProfile({ ...editProfile, fieldOfStudy: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Institution Name <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.institutionName || ""} onChange={(e) => setEditProfile({ ...editProfile, institutionName: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Graduation Year</label>
                      <Input type="number" value={editProfile.graduationYear || ""} onChange={(e) => setEditProfile({ ...editProfile, graduationYear: e.target.value })} placeholder="e.g. 2020" />
                    </div>
                    {renderSelectField("Has Licenses?", "hasLicences", yesNoOptions)}
                    {editProfile.hasLicences === "Yes" && (
                      <div className="col-span-2">
                        <label className={labelBase}>Licenses List</label>
                        <textarea
                          value={editProfile.licencesList || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, licencesList: e.target.value })}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ─── English Test ──────────────────────────────────────── */}
                {activeEditTab === "english" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>English Language Test</SectionHeading>
                    {renderSelectField("English Test Type", "englishTest", englishTests, true)}
                    {editProfile.englishTest && editProfile.englishTest !== "None / English is Native Language" && (
                      <>
                        <div>
                          <label className={labelBase}>Overall Score</label>
                          <Input type="text" value={editProfile.overallScore || ""} onChange={(e) => setEditProfile({ ...editProfile, overallScore: e.target.value })} />
                        </div>
                        {/* Test Date — date picker */}
                        {renderDateField("Test Date", "testDate")}
                      </>
                    )}
                  </div>
                )}

                {/* ─── Visa & Passport ───────────────────────────────────── */}
                {activeEditTab === "visa" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SectionHeading>Visa & Passport Status</SectionHeading>
                    <div>
                      <label className={labelBase}>Visa Status <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.visaStatus || ""} onChange={(e) => setEditProfile({ ...editProfile, visaStatus: e.target.value })} required />
                    </div>
                    <div>
                      <label className={labelBase}>Legal Work Rights <span className="text-red-500">*</span></label>
                      <Input type="text" value={editProfile.legalWorkRights || ""} onChange={(e) => setEditProfile({ ...editProfile, legalWorkRights: e.target.value })} required />
                    </div>
                    {renderSelectField("Open to Relocation?", "openToRelocation", yesNoOptions, true)}
                    {renderSelectField("Applied Aus/NZ Visa?", "appliedAusVisa", yesNoOptions)}
                    {editProfile.appliedAusVisa === "Yes" && (
                      <div>
                        <label className={labelBase}>Visa Type Applied</label>
                        <Input type="text" value={editProfile.visaTypeApplied || ""} onChange={(e) => setEditProfile({ ...editProfile, visaTypeApplied: e.target.value })} />
                      </div>
                    )}
                    {renderSelectField("Visa Refusal?", "visaRefusal", yesNoOptions)}
                    {editProfile.visaRefusal === "Yes" && (
                      <div className="col-span-2">
                        <label className={labelBase}>Visa Refusal Details</label>
                        <textarea
                          value={editProfile.visaRefusalDetails || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, visaRefusalDetails: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                      </div>
                    )}
                    {renderSelectField("Relocate Status (Alone / Family)", "relocateAloneOrFamily", relocationFamilyStatuses)}
                    {renderSelectField("Valid Passport?", "validPassport", yesNoOptions, true)}
                    {editProfile.validPassport === "Yes" && (
                      /* Passport expiry — date picker */
                      renderDateField("Passport Expiry Date", "passportExpiry", true)
                    )}
                    {renderSelectField("Medical Background Check OK?", "medicalBackgroundCheck", yesNoOptions)}
                    {renderSelectField("Criminal Convictions?", "criminalConvictions", yesNoOptions)}
                    {editProfile.criminalConvictions === "Yes" && (
                      <div className="col-span-2">
                        <label className={labelBase}>Criminal Details</label>
                        <textarea
                          value={editProfile.criminalDetails || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, criminalDetails: e.target.value })}
                          rows={2}
                          className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Documents & Declarations ──────────────────────────── */}
                {activeEditTab === "documents" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-1 dark:border-gray-800">
                        Document Uploads &amp; Declarations
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {renderDocUploadCard("Passport Copy (Bio-Data Page)", "passportUrl", "talent-documents", true)}
                      {renderDocUploadCard("Current Visa / Residency Permit / Work Permit", "visaUrl", "talent-documents", true)}
                      {renderDocUploadCard("Educational Certificates", "eduCertUrl", "talent-documents")}
                      {renderDocUploadCard("Employment Certificates / Experience Letters", "empCertUrl", "talent-documents")}
                      {renderDocUploadCard("English Test Results", "englishTestUrl", "talent-documents")}
                      {renderDocUploadCard("Professional Licences / Certifications", "licenceUrl", "talent-documents")}
                      {renderDocUploadCard("Resume / CV Document", "resumeUrl", "resumes", true)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {renderSelectField("Declaration True?", "declarationTrue", yesNoOptions)}
                      {renderSelectField("Declaration Consent?", "declarationConsent", yesNoOptions)}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
               EMPLOYER FORM
            ═══════════════════════════════════════════════════════════════════ */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[55vh] overflow-y-auto pr-2 pb-2">
              <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Profile Details</h4>
              </div>

              <div>
                <label className={labelBase}>First Name <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.firstName || ""} onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })} required />
              </div>
              <div>
                <label className={labelBase}>Last Name <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.lastName || ""} onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })} required />
              </div>
              <div>
                <label className={labelBase}>Business Email <span className="text-red-500">*</span></label>
                <Input type="email" value={editProfile.businessEmail || ""} onChange={(e) => setEditProfile({ ...editProfile, businessEmail: e.target.value })} required />
              </div>
              <div>
                <label className={labelBase}>Business Phone <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.businessPhone || ""} onChange={(e) => setEditProfile({ ...editProfile, businessPhone: e.target.value.replace(/[^\d+\s\-]/g, "") })} required />
              </div>
              <div>
                <label className={labelBase}>Company Name <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.companyName || ""} onChange={(e) => setEditProfile({ ...editProfile, companyName: e.target.value })} required />
              </div>
              <div>
                <label className={labelBase}>Zip Code <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.zipCode || ""} onChange={(e) => setEditProfile({ ...editProfile, zipCode: e.target.value })} required />
              </div>
              <div>
                <label className={labelBase}>Your Job Title <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.jobTitle || ""} onChange={(e) => setEditProfile({ ...editProfile, jobTitle: e.target.value })} required />
              </div>

              {/* Position Type — styled select */}
              <div>
                <label className={labelBase}>Position Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={editProfile.positionType || ""}
                    onChange={(e) => setEditProfile((prev: any) => ({ ...prev, positionType: e.target.value }))}
                    className={`${fieldBase} appearance-none pr-10 cursor-pointer`}
                    required
                  >
                    <option value="" className="dark:bg-gray-900">Select...</option>
                    {positionTypes.map((opt) => (
                      <option key={opt.value} value={opt.value} className="dark:bg-gray-900">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <label className={labelBase}>Position to Hire For <span className="text-red-500">*</span></label>
                <Input type="text" value={editProfile.jobTitleToHire || ""} onChange={(e) => setEditProfile({ ...editProfile, jobTitleToHire: e.target.value })} placeholder="e.g. Senior Software Engineer" required />
              </div>

              {renderImageUpload("Company Logo", "companyLogo", "company-logo")}
            </div>
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
