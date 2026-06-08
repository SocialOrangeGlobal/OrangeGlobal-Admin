import React from "react";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { SearchableDropdown } from "../SearchableDropdown";
import { DefaultUserIcon } from "../UserViewModal";
import {
  countries,
  nationalities,
  genders,
  opportunityTypes,
  highestQualifications,
  englishTests,
  relocationFamilyStatuses,
  yesNoOptions,
  countryStateCity
} from "../constants";
import { uploadFile, validateFileConstraints } from "../../../lib/storage";

interface TalentEditFormProps {
  editProfile: any;
  setEditProfile: React.Dispatch<React.SetStateAction<any>>;
  activeEditTab: string;
  setActiveEditTab: (tab: string) => void;
  talentEditTabs: Array<{ id: string; label: string }>;
  uploading: Record<string, boolean>;
  setUploading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadErrors: Record<string, string>;
  setUploadErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  uploadedInSession: Record<string, boolean>;
  setUploadedInSession: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  brokenImages: Record<string, boolean>;
  setBrokenImages: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  skillInput: string;
  setSkillInput: (val: string) => void;
  handleAddSkill: () => void;
  handleRemoveSkill: (skill: string) => void;
  onViewDoc: (url: string, title: string) => void;
  showToast: (msg: string, type: "success" | "error") => void;
  selectedUser: any;
}

const labelBase = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const fieldBase =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs " +
  "focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 " +
  "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const toDateInput = (raw: string): string => {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.includes("T")) return s.split("T")[0];
  const slashDMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (slashDMY) return `${slashDMY[3]}-${slashDMY[2].padStart(2, "0")}-${slashDMY[1].padStart(2, "0")}`;
  const dashDMY = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s);
  if (dashDMY) return `${dashDMY[3]}-${dashDMY[2].padStart(2, "0")}-${dashDMY[1].padStart(2, "0")}`;
  return "";
};

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

export const TalentEditForm: React.FC<TalentEditFormProps> = ({
  editProfile,
  setEditProfile,
  activeEditTab,
  setActiveEditTab,
  talentEditTabs,
  uploading,
  setUploading,
  uploadErrors,
  setUploadErrors,
  uploadedInSession,
  setUploadedInSession,
  brokenImages,
  setBrokenImages,
  skillInput,
  setSkillInput,
  handleAddSkill,
  handleRemoveSkill,
  onViewDoc,
  showToast,
  selectedUser,
}) => {
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
            <span className="text-[10px] text-gray-400 mt-1 block">Max Size: 1MB | Format: JPG, PNG, GIF, WEBP</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <input
              id={inputId}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const error = validateFileConstraints(file, bucket, ".jpg,.jpeg,.png,.gif,.webp");
                  if (error) {
                    setUploadErrors(prev => ({ ...prev, [fieldName]: error }));
                    e.target.value = '';
                    return;
                  }
                  setUploadErrors(prev => ({ ...prev, [fieldName]: "" }));
                  await handleFileUpload(fieldName, file, bucket);
                }
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
          {uploadErrors[fieldName] && (
            <span className="text-xs text-red-500 block text-right">{uploadErrors[fieldName]}</span>
          )}
        </div>
      </div>
    );
  };

  const renderDocUploadCard = (label: string, fieldName: string, bucket: string, required = false) => {
    const url = editProfile[fieldName] || "";
    const isUploading = uploading[fieldName];
    const wasUploadedNow = uploadedInSession[fieldName];
    const inputId = `doc-upload-${fieldName}`;

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
            <span className={`text-[10px] mt-1 block ${uploadErrors[fieldName] ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
              {uploadErrors[fieldName] || "Max Size: 5MB | Format: PDF, DOC, DOCX, JPG, PNG"}
            </span>
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
              setUploadErrors((prev: any) => ({ ...prev, [fieldName]: '' }));
              if (file) {
                const error = validateFileConstraints(file, bucket, ".pdf,.doc,.docx,.jpg,.jpeg,.png");
                if (error) {
                  setUploadErrors((prev: any) => ({ ...prev, [fieldName]: error }));
                  e.target.value = '';
                  return;
                }
                await handleFileUpload(fieldName, file, bucket);
              }
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

  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <div className="col-span-2">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 pb-1 dark:border-gray-800">
        {children}
      </h4>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[55vh]">
      {/* Tab sidebar */}
      <div className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pr-0 md:pr-4">
        {talentEditTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveEditTab(tab.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
              activeEditTab === tab.id
                ? "bg-brand-500 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="md:col-span-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {/* Personal Details */}
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

            {renderDateField("Date of Birth", "dob", true)}

            <div>
              <label className={labelBase}>Age</label>
              <Input type="number" value={editProfile.age || ""} onChange={(e) => setEditProfile({ ...editProfile, age: e.target.value })} />
            </div>

            {renderSelectField("Gender", "gender", genders)}

            <div>
              <label className={labelBase}>Nationality <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={nationalities}
                value={editProfile.nationality || ""}
                onChange={(val) => setEditProfile((prev: any) => ({ ...prev, nationality: val }))}
                placeholder="Search nationality..."
              />
            </div>

            <div>
              <label className={labelBase}>Country of Residence <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={countries}
                value={editProfile.countryOfResidence || ""}
                onChange={(val) => setEditProfile((prev: any) => ({ ...prev, countryOfResidence: val, state: "", city: "" }))}
                placeholder="Search country..."
              />
            </div>

            {renderStateField("countryOfResidence")}
            {renderCityField("countryOfResidence")}

            <div className="col-span-2">
              <label className={labelBase}>LinkedIn Profile URL</label>
              <Input type="text" value={editProfile.linkedin || ""} onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })} />
            </div>

            {renderImageUpload("Profile Picture", "avatarUrl", "profile-pictures")}
          </div>
        )}

        {/* Job Preferences */}
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
            {renderDateField("Available From (Start Date)", "startDate")}
          </div>
        )}

        {/* Work Experience */}
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

        {/* Education & Licenses */}
        {activeEditTab === "education" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionHeading>Education & Licenses</SectionHeading>
            {renderSelectField("Highest Qualification", "highestQualification", highestQualifications, true)}
            <div>
              <label className={labelBase}>Field of Study <span className="text-red-500">*</span></label>
              <Input type="text" value={editProfile.fieldOfStudy || ""} onChange={(e) => setEditProfile({ ...editProfile, fieldOfStudy: e.target.value })} required />
            </div>
            <div>
              <label className={labelBase}>Institution Name</label>
              <Input type="text" value={editProfile.institutionName || ""} onChange={(e) => setEditProfile({ ...editProfile, institutionName: e.target.value })} />
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

        {/* English Test */}
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
                {renderDateField("Test Date", "testDate")}
              </>
            )}
          </div>
        )}

        {/* Visa & Passport */}
        {activeEditTab === "visa" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SectionHeading>Visa & Passport Status</SectionHeading>
            <div>
              <label className={labelBase}>Visa Status <span className="text-red-500">*</span></label>
              <Input type="text" value={editProfile.visaStatus || ""} onChange={(e) => setEditProfile({ ...editProfile, visaStatus: e.target.value })} required />
            </div>
            <div>
              <label className={labelBase}>Legal Work Rights</label>
              <Input type="text" value={editProfile.legalWorkRights || ""} onChange={(e) => setEditProfile({ ...editProfile, legalWorkRights: e.target.value })} />
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
            {renderSelectField("Valid Passport?", "validPassport", yesNoOptions)}
            {editProfile.validPassport === "Yes" && renderDateField("Passport Expiry Date", "passportExpiry")}
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

        {/* Documents & Declarations */}
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
  );
};
