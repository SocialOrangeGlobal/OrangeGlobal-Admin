import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  job: any | null;
  saving: boolean;
}

type Step = "basics" | "details" | "perks";

const fieldBase =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs " +
  "focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 " +
  "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const labelBase = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

const categories = [
  "Technology",
  "Finance & Accounting",
  "Legal",
  "Marketing & Creative",
  "Administrative",
  "Executive Search",
  "Healthcare & Nursing",
  "Engineering",
  "Other"
];

const workModes = ["Remote", "Hybrid", "On-site"];
const positionTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"];

export default function JobFormModal({
  isOpen,
  onClose,
  onSave,
  job,
  saving
}: JobFormModalProps) {
  const [step, setStep] = useState<Step>("basics");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    category: "Technology",
    location: "",
    mode: "On-site",
    type: "Full-time",
    salary: "",
    vacancies: 1,
    description: "",
    requirements: [""] as string[],
    benefits: [""] as string[],
    isPublished: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        company: job.company || "",
        category: job.category || "Technology",
        location: job.location || "",
        mode: job.mode || "On-site",
        type: job.type || "Full-time",
        salary: job.salary || "",
        vacancies: job.vacancies || 1,
        description: job.description || "",
        requirements: Array.isArray(job.requirements)
          ? job.requirements
          : typeof job.requirements === "string"
          ? JSON.parse(job.requirements)
          : [""],
        benefits: Array.isArray(job.benefits)
          ? job.benefits
          : typeof job.benefits === "string"
          ? JSON.parse(job.benefits)
          : [""],
        isPublished: job.isPublished !== false,
      });
    } else {
      setFormData({
        title: "",
        company: "",
        category: "Technology",
        location: "",
        mode: "On-site",
        type: "Full-time",
        salary: "",
        vacancies: 1,
        description: "",
        requirements: [""],
        benefits: [""],
        isPublished: true,
      });
    }
    setStep("basics");
    setErrors({});
  }, [job, isOpen]);

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === "basics") {
      if (!formData.title.trim()) newErrors.title = "Job title is required";
      if (!formData.company.trim()) newErrors.company = "Company name is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
    } else if (step === "details") {
      if (!formData.mode) newErrors.mode = "Work mode is required";
      if (!formData.type) newErrors.type = "Position type is required";
      if (formData.vacancies < 1) newErrors.vacancies = "Must be at least 1 vacancy";
      if (!formData.description.trim()) newErrors.description = "Job description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === "basics") setStep("details");
      else if (step === "details") setStep("perks");
    }
  };

  const handleBack = () => {
    if (step === "perks") setStep("details");
    else if (step === "details") setStep("basics");
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleListChange = (
    field: "requirements" | "benefits",
    index: number,
    value: string
  ) => {
    const list = [...formData[field]];
    list[index] = value;
    setFormData((prev) => ({ ...prev, [field]: list }));
  };

  const addListField = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListField = (field: "requirements" | "benefits", index: number) => {
    setFormData((prev) => {
      const list = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: list.length === 0 ? [""] : list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    // Filter empty items
    const requirements = formData.requirements.map(r => r.trim()).filter(Boolean);
    const benefits = formData.benefits.map(b => b.trim()).filter(Boolean);

    await onSave({
      ...formData,
      requirements,
      benefits
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[720px] w-full p-6 sm:p-8"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {job ? "Edit Job Posting" : "Post a New Job"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Complete the steps below to {job ? "update the job details" : "publish a new job vacancy"}.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-3 sm:gap-4 mt-6">
            {(["basics", "details", "perks"] as Step[]).map((s, i) => {
              const isActive = step === s;
              const isPast =
                (["basics", "details", "perks"] as Step[]).indexOf(step) > i;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                      isActive
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                        : isPast
                        ? "bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`ml-2 text-xs font-medium hidden sm:inline capitalize ${
                      isActive ? "text-brand-500 font-bold" : "text-gray-500"
                    }`}
                  >
                    {s === "perks" ? "Requirements & Perks" : s}
                  </span>
                  {i < 2 && (
                    <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-800 ml-4 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto max-h-[480px] pr-1 scrollbar-thin flex-1 mb-6">
            {step === "basics" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className={`${fieldBase} ${errors.title ? "border-red-500 focus:ring-red-500/10" : ""}`}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelBase}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateFormData("company", e.target.value)}
                      placeholder="e.g. Orange Global"
                      className={`${fieldBase} ${errors.company ? "border-red-500 focus:ring-red-500/10" : ""}`}
                    />
                    {errors.company && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.company}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>
                      Job Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData("category", e.target.value)}
                      className={fieldBase}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBase}>
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      placeholder="e.g. Sydney, NSW, Australia"
                      className={`${fieldBase} ${errors.location ? "border-red-500 focus:ring-red-500/10" : ""}`}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.location}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelBase}>Work Mode</label>
                    <select
                      value={formData.mode}
                      onChange={(e) => updateFormData("mode", e.target.value)}
                      className={fieldBase}
                    >
                      {workModes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBase}>Position Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => updateFormData("type", e.target.value)}
                      className={fieldBase}
                    >
                      {positionTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelBase}>Vacancies</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.vacancies}
                      onChange={(e) => updateFormData("vacancies", parseInt(e.target.value) || 1)}
                      className={fieldBase}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Salary Range (Optional)</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => updateFormData("salary", e.target.value)}
                    placeholder="e.g. $120,000 - $140,000"
                    className={fieldBase}
                  />
                </div>

                <div>
                  <label className={labelBase}>
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Provide a detailed job description..."
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 resize-y"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>
                  )}
                </div>
              </div>
            )}

            {step === "perks" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Requirements */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-800 dark:text-white">
                      Key Requirements
                    </label>
                    <button
                      type="button"
                      onClick={() => addListField("requirements")}
                      className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1"
                    >
                      + Add Requirement
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => handleListChange("requirements", idx, e.target.value)}
                          placeholder={`e.g. ${idx === 0 ? "5+ years of experience in React/Node" : "Strong communication skills"}`}
                          className={fieldBase}
                        />
                        <button
                          type="button"
                          onClick={() => removeListField("requirements", idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/20 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-800 dark:text-white">
                      Benefits & Perks
                    </label>
                    <button
                      type="button"
                      onClick={() => addListField("benefits")}
                      className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1"
                    >
                      + Add Benefit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.benefits.map((ben, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={ben}
                          onChange={(e) => handleListChange("benefits", idx, e.target.value)}
                          placeholder={`e.g. ${idx === 0 ? "Health insurance" : "Flexible remote hours"}`}
                          className={fieldBase}
                        />
                        <button
                          type="button"
                          onClick={() => removeListField("benefits", idx)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/20 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Publish Vacancy
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Toggle whether this vacancy is immediately listed on the website.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => updateFormData("isPublished", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              {step !== "basics" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-lg border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>

              {step === "perks" ? (
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : job ? (
                    "Save Changes"
                  ) : (
                    "Post Job"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold flex items-center justify-center gap-1"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
