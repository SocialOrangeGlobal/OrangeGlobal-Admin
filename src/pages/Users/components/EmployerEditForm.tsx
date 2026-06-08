import React from "react";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { DefaultUserIcon } from "../UserViewModal";
import { positionTypes } from "../constants";
import { uploadFile, validateFileConstraints } from "../../../lib/storage";

interface EmployerEditFormProps {
  editProfile: any;
  setEditProfile: React.Dispatch<React.SetStateAction<any>>;
  uploading: Record<string, boolean>;
  setUploading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadErrors: Record<string, string>;
  setUploadErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  brokenImages: Record<string, boolean>;
  setBrokenImages: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  showToast: (msg: string, type: "success" | "error") => void;
  selectedUser: any;
}

const labelBase = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
const fieldBase =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs " +
  "focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 " +
  "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export const EmployerEditForm: React.FC<EmployerEditFormProps> = ({
  editProfile,
  setEditProfile,
  uploading,
  setUploading,
  uploadErrors,
  setUploadErrors,
  brokenImages,
  setBrokenImages,
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
      showToast("File uploaded successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[55vh] overflow-y-auto custom-scrollbar pr-2 pb-2">
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
  );
};
