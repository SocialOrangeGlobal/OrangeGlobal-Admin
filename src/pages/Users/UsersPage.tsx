import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";

import UserViewModal, { DefaultUserIcon } from "./UserViewModal";
import UserEditModal from "./UserEditModal";
import UserDeleteModal from "./UserDeleteModal";
import DocPreviewModal from "./DocPreviewModal";
import PageLoader from "../../components/ui/PageLoader";

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "employers" ? "employers" : "talents";

  const { authFetch, showToast } = useAuth();

  // Data States
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Document Preview Modal states
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
  const [activeDocTitle, setActiveDocTitle] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const handleImageError = (url: string) => {
    if (!url) return;
    setBrokenImages((prev) => ({ ...prev, [url]: true }));
  };

  const openDocumentPreview = (url: string, title: string) => {
    if (!url) return;
    setActiveDocUrl(url);
    setActiveDocTitle(title);
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "talents" ? "talents" : "employers";
      const response = await authFetch(
        `${API_URL}/users/${endpoint}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      if (response.ok) {
        const result = await response.json();
        const data = result?.data || {};
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        showToast(`Failed to fetch ${activeTab}`, "error");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit, search, authFetch, showToast, API_URL]);

  // Trigger search with reset page
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab switching handler
  const handleTabChange = (tab: "talents" | "employers") => {
    setSearchParams({ tab });
  };

  // Open view modal
  const handleView = (item: any) => {
    setSelectedUser(item);
    setViewOpen(true);
  };

  // Open edit modal
  const handleEdit = (item: any) => {
    setSelectedUser(item);
    setEditOpen(true);
  };

  // Handle Edit Submit from Child Modal
  const handleEditSubmit = async (payload: { email: string; isActive: boolean; profileData: any }) => {
    setSaving(true);
    try {
      const isTalent = activeTab === "talents";
      const userId = selectedUser?.user?.id;
      if (!userId) {
        showToast("User ID is missing", "error");
        return;
      }

      const finalPayload: any = {
        email: payload.email,
        isActive: payload.isActive,
        profileData: {
          ...payload.profileData,
        },
      };

      if (isTalent && typeof payload.profileData.skills === "string") {
        finalPayload.profileData.skills = payload.profileData.skills
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      const response = await authFetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (response.ok) {
        showToast("User updated successfully", "success");
        setEditOpen(false);
        fetchData();
      } else {
        const errorResult = await response.json();
        const msg = Array.isArray(errorResult.message)
          ? errorResult.message[0]
          : errorResult.message || "Failed to update user";
        showToast(msg, "error");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      showToast("Error updating user details", "error");
    } finally {
      setSaving(false);
    }
  };

  // Open delete modal
  const handleDelete = (item: any) => {
    setSelectedUser(item);
    setDeleteOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      const userId = selectedUser?.user?.id;
      if (!userId) {
        showToast("User ID is missing", "error");
        return;
      }
      const response = await authFetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("User deleted successfully", "success");
        setDeleteOpen(false);
        fetchData();
      } else {
        showToast("Failed to delete user", "error");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast("Error deleting user account", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${activeTab === "talents" ? "Talents" : "Employers"} List | Orange Global`}
        description={`Manage ${activeTab} accounts on the Orange Global Recruitment Portal`}
      />
      <PageBreadcrumb pageTitle={activeTab === "talents" ? "Talent List" : "Employer List"} />

      {/* Tabs Switcher & Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Nav Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800 self-start">
          <button
            onClick={() => handleTabChange("talents")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === "talents"
              ? "bg-white text-brand-500 shadow-sm dark:bg-gray-900"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            Talent
          </button>
          <button
            onClick={() => handleTabChange("employers")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === "employers"
              ? "bg-white text-brand-500 shadow-sm dark:bg-gray-900"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            Employer
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:max-w-xs">
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <PageLoader fullScreen={false} message="Loading Users..." subMessage="Fetching user database" />
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>No {activeTab} found.</span>
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-transparent">
                <tr>
                  {activeTab === "talents" ? (
                    <>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Talent Info</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Work Info</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Visa / Relocation</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Employer / Logo</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Contact Details</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Company Size / Job</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Status</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {items.map((item) => {
                  const userRecord = item.user || {};
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                      {activeTab === "talents" ? (
                        <>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                                {item.avatarUrl && !brokenImages[item.avatarUrl] ? (
                                  <img
                                    src={item.avatarUrl}
                                    alt={item.fullName}
                                    className="h-full w-full object-cover"
                                    onError={() => handleImageError(item.avatarUrl)}
                                  />
                                ) : (
                                  <DefaultUserIcon />
                                )}
                              </div>
                              <div>
                                <span className="block font-semibold text-gray-800 dark:text-white/90">{item.fullName}</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">{userRecord.email}</span>
                                <span className="block text-[10px] text-gray-400 dark:text-gray-500">Registered: {new Date(userRecord.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                            <div className="space-y-0.5">
                              {item.phone && <div className="text-xs">📞 {item.phone}</div>}
                              {item.location && (
                                <div className="text-xs">
                                  📍 {typeof item.location === "string"
                                    ? item.location
                                    : [item.location.city, item.location.country].filter(Boolean).join(", ")}
                                </div>
                              )}
                              {item.highestQualification && <div className="text-[11px] text-gray-500">🎓 {item.highestQualification}</div>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                            <div className="space-y-0.5 text-xs">
                              <div>Visa: <span className="font-semibold text-gray-600 dark:text-gray-300">{item.visaStatus || "N/A"}</span></div>
                              {item.totalExp && <div>Exp: <span className="font-semibold">{item.totalExp} years</span></div>}
                              {item.preferredRole && <div>Role: <span className="italic">{item.preferredRole}</span></div>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge size="sm" color={userRecord.isActive !== false ? "success" : "error"}>
                              {userRecord.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                                {item.companyLogo && !brokenImages[item.companyLogo] ? (
                                  <img
                                    src={item.companyLogo}
                                    alt={item.companyName}
                                    className="h-full w-full object-contain p-0.5"
                                    onError={() => handleImageError(item.companyLogo)}
                                  />
                                ) : (
                                  <DefaultUserIcon />
                                )}
                              </div>
                              <div>
                                <span className="block font-semibold text-gray-800 dark:text-white/90">{item.companyName}</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Admin Email: {userRecord.email}</span>
                                <span className="block text-[10px] text-gray-400 dark:text-gray-500">Registered: {new Date(userRecord.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                            <div className="space-y-0.5">
                              <span className="block font-medium">{[item.firstName, item.lastName].filter(Boolean).join(" ")}</span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">📧 {item.businessEmail || userRecord.email}</span>
                              {item.businessPhone && <span className="block text-xs text-gray-500 dark:text-gray-400">📞 {item.businessPhone}</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-theme-sm text-gray-700 dark:text-gray-300">
                            <div className="space-y-0.5 text-xs">
                              <div>Title: <span className="font-medium">{item.jobTitle || "N/A"}</span></div>
                              {item.jobTitleToHire && <div>Hiring for: <span className="italic">{item.jobTitleToHire}</span></div>}
                              {item.positionType && <div>Type: <span className="font-semibold text-brand-500">{item.positionType}</span></div>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge size="sm" color={userRecord.isActive !== false ? "success" : "error"}>
                              {userRecord.isActive !== false ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </>
                      )}
                      {/* Action Cell */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            title="View Profile Details"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="rounded-md p-1.5 text-brand-500 hover:bg-brand-50/50 hover:text-brand-600 dark:text-brand-400 dark:hover:bg-brand-950/20"
                            title="Edit User"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="rounded-md p-1.5 text-error-500 hover:bg-error-50 hover:text-error-600 dark:text-error-400 dark:hover:bg-error-950/20"
                            title="Delete User"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Previous
              </button>

              {/* Page Numbers */}
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
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition ${page === p
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
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      <UserViewModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        selectedUser={selectedUser}
        activeTab={activeTab}
        brokenImages={brokenImages}
        onImageError={handleImageError}
        onViewDoc={openDocumentPreview}
      />

      {/* EDIT USER DETAILS MODAL */}
      <UserEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        selectedUser={selectedUser}
        activeTab={activeTab}
        onSave={handleEditSubmit}
        saving={saving}
        showToast={showToast}
        onViewDoc={openDocumentPreview}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <UserDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        userName={selectedUser ? (activeTab === "talents" ? selectedUser.fullName : selectedUser.companyName) : ""}
        onConfirm={handleConfirmDelete}
        saving={saving}
      />

      {/* DOCUMENT PREVIEW MODAL */}
      <DocPreviewModal
        isOpen={activeDocUrl !== null}
        onClose={() => setActiveDocUrl(null)}
        docUrl={activeDocUrl}
        docTitle={activeDocTitle}
      />
    </>
  );
}