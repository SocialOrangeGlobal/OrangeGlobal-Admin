import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import PageLoader from "../components/ui/PageLoader";
import { Modal } from "../components/ui/modal";

export default function MessagePage() {
  const { authFetch, showToast } = useAuth();

  // Messages States
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

  // Fetch Contact Messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/contact?page=${page}&limit=${limit}`);
      if (res.ok) {
        const result = await res.json();
        setItems(result?.data?.items || []);
        setTotal(result?.data?.total || 0);
        setPages(result?.data?.pages || 1);
      } else {
        showToast("Failed to fetch contact messages", "error");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      showToast("Error occurred while fetching contact messages", "error");
    } finally {
      setLoading(false);
    }
  }, [page, authFetch, API_URL, showToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <>
      <PageMeta
        title="Contact Form Messages | Orange Global"
        description="View and manage all inquiries received from the frontend Contact Us form."
      />
      <PageBreadcrumb pageTitle="Contact Messages" />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Total Inquiries</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{total}</span>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <PageLoader fullScreen={false} message="Loading Messages..." subMessage="Fetching customer inquiries" />
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>No contact messages found.</span>
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-transparent">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Sender</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Phone</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Subject</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Message Preview</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Date Received</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {items.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-800 dark:text-white/90">{msg.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{msg.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {msg.phone || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {msg.subject}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {msg.message}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMsg(msg)}
                        className="h-8 py-1 px-3 text-xs cursor-pointer"
                      >
                        View Details
                      </Button>
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
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer ${page === p
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

      <Modal
        isOpen={!!selectedMsg}
        onClose={() => setSelectedMsg(null)}
        className="max-w-[640px] w-full p-6 sm:p-8"
      >
        {selectedMsg && (
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Inquiry Details
              </h3>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sender Name</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedMsg.fullName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedMsg.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedMsg.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received Date</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</span>
                <div className="p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-800 dark:text-white/90">
                  {selectedMsg.subject}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message Content</span>
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800 text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setSelectedMsg(null)}
                className="px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/10 cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
