import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import JobFormModal from "./JobFormModal";

export default function JobsPage() {
  const { authFetch, showToast } = useAuth();

  // Data States
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "published" | "drafts">("all");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    unpublished: 0,
    totalVacancies: 0,
  });

  // Modal States
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pubParam =
        statusTab === "published"
          ? "true"
          : statusTab === "drafts"
          ? "false"
          : "all";

      const res = await authFetch(
        `${API_URL}/jobs?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&category=${encodeURIComponent(category)}&mode=${encodeURIComponent(
          mode
        )}&published=${pubParam}`
      );

      if (res.ok) {
        const result = await res.json();
        const data = result.data || {};
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        showToast("Failed to fetch jobs list", "error");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, category, mode, statusTab, authFetch, showToast, API_URL]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/jobs/stats`);
      if (res.ok) {
        const result = await res.json();
        setStats(result.data || { total: 0, published: 0, unpublished: 0, totalVacancies: 0 });
      }
    } catch (err) {
      console.error("Error fetching job stats:", err);
    }
  }, [authFetch, API_URL]);

  useEffect(() => {
    setPage(1);
  }, [search, category, mode, statusTab]);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // Open creation modal
  const handleCreate = () => {
    setSelectedJob(null);
    setFormOpen(true);
  };

  // Open edit modal
  const handleEdit = (item: any) => {
    setSelectedJob(item);
    setFormOpen(true);
  };

  // Open delete modal
  const handleDelete = (item: any) => {
    setSelectedJob(item);
    setDeleteOpen(true);
  };

  // Form submit handler
  const handleFormSubmit = async (payload: any) => {
    setSaving(true);
    try {
      const isEdit = !!selectedJob;
      const url = isEdit ? `${API_URL}/jobs/${selectedJob.id}` : `${API_URL}/jobs`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          isEdit ? "Job updated successfully" : "Job created successfully",
          "success"
        );
        setFormOpen(false);
        fetchData();
        fetchStats();
      } else {
        const errorResult = await res.json();
        showToast(errorResult.message || "Failed to save job details", "error");
      }
    } catch (err) {
      console.error("Error saving job:", err);
      showToast("Error occurred while saving job details", "error");
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/jobs/${selectedJob.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Job vacancy deleted successfully", "success");
        setDeleteOpen(false);
        fetchData();
        fetchStats();
      } else {
        showToast("Failed to delete job vacancy", "error");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      showToast("Error occurred while deleting job vacancy", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Publish Status Directly
  const handleTogglePublish = async (item: any) => {
    try {
      const res = await authFetch(`${API_URL}/jobs/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });

      if (res.ok) {
        showToast(
          item.isPublished ? "Job moved to drafts" : "Job published successfully",
          "success"
        );
        fetchData();
        fetchStats();
      } else {
        showToast("Failed to update job status", "error");
      }
    } catch (err) {
      console.error("Error toggling publish:", err);
      showToast("Error updating job publish status", "error");
    }
  };

  return (
    <>
      <PageMeta
        title="Jobs Board Management | Orange Global"
        description="Manage active vacancy postings, create and edit job openings."
      />
      <PageBreadcrumb pageTitle="Jobs Management" />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Total Positions</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center dark:bg-green-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Active Listings</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.published}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center dark:bg-orange-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Drafts / Inactive</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.unpublished}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center dark:bg-blue-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Total Vacancies</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.totalVacancies}</span>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800 self-start">
          {(["all", "published", "drafts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition capitalize ${
                statusTab === tab
                  ? "bg-white text-brand-500 shadow-sm dark:bg-gray-900"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:max-w-xs flex-1">
            <Input
              type="text"
              placeholder="Search jobs, company, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreate}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post Job
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#fb6514] border-t-transparent"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>No job openings found.</span>
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-transparent">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs dark:text-gray-400">Job Details</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs dark:text-gray-400">Location & Type</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs dark:text-gray-400">Compensation & Vacancies</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                    <td className="px-5 py-4">
                      <div>
                        <span className="block font-bold text-gray-800 dark:text-white/90 text-sm sm:text-base">{item.title}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.company}</span>
                        <span className="inline-block text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full dark:bg-brand-950/20 dark:text-brand-400 mt-1 font-medium">{item.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold">📍 {item.location}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-medium">{item.mode}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-medium">{item.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1 text-xs">
                        <div>Salary: <span className="font-semibold text-gray-600 dark:text-gray-300">{item.salary || "N/A"}</span></div>
                        <div>Vacancies: <span className="font-bold text-brand-500">{item.vacancies} open</span></div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className="focus:outline-none cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        <Badge size="sm" color={item.isPublished ? "success" : "warning"}>
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-md p-1.5 text-brand-500 hover:bg-brand-50/50 hover:text-brand-600 dark:text-brand-400 dark:hover:bg-brand-950/20 cursor-pointer"
                          title="Edit Job details"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-md p-1.5 text-error-500 hover:bg-error-50 hover:text-error-600 dark:text-error-400 dark:hover:bg-error-950/20 cursor-pointer"
                          title="Delete vacancy"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && items.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:flex-row">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-800 dark:text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-semibold text-gray-800 dark:text-white">{total}</span> entries
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <div key={p} className="flex items-center">
                      {prev && p - prev > 1 && (
                        <span className="px-1 text-gray-400 dark:text-gray-600">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer ${
                          page === p
                            ? "bg-brand-500 text-white"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      <JobFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleFormSubmit}
        job={selectedJob}
        saving={saving}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
          <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" onClick={() => setDeleteOpen(false)}></div>
          <div className="relative w-full max-w-[420px] rounded-3xl bg-white p-6 dark:bg-gray-900 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Delete Job Posting</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the job posting for <strong className="font-semibold text-gray-800 dark:text-white">{selectedJob?.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold shadow-md shadow-red-600/10 cursor-pointer"
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
