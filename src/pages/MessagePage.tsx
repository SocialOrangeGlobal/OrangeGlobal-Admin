import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/button/Button";
import PageLoader from "../components/ui/PageLoader";
import { Modal } from "../components/ui/modal";
import Select from "../components/form/Select";

export default function MessagePage() {
  const { authFetch, showToast } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const enquiryIdParam = searchParams.get("id");

  const typeOptions = [
    { value: "ALL", label: "All Types" },
    { value: "GENERAL_QUERY", label: "General Query" },
    { value: "CONSULTATION", label: "Consultation" },
    { value: "NEWSLETTER", label: "Newsletter" },
  ];

  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  const adminStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  // Messages / Enquiries States
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit / Reply States
  const [adminStatus, setAdminStatus] = useState("PENDING");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isTypingFocused, setIsTypingFocused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

  // Fetch Enquiries
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      let queryParams = `page=${page}&limit=${limit}`;
      if (typeFilter !== "ALL") queryParams += `&type=${typeFilter}`;
      if (statusFilter !== "ALL") queryParams += `&status=${statusFilter}`;
      if (searchTerm.trim()) queryParams += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await authFetch(`${API_URL}/contact?${queryParams}`);
      if (res.ok) {
        const result = await res.json();
        setItems(result?.data?.items || []);
        setTotal(result?.data?.total || 0);
        setPages(result?.data?.pages || 1);
      } else {
        showToast("Failed to fetch enquiries", "error");
      }
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      showToast("Error occurred while fetching enquiries", "error");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, searchTerm, authFetch, API_URL, showToast]);

  useEffect(() => {
    // Reset page to 1 when filters change
    setPage(1);
  }, [typeFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const handleNewChatReply = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { enquiryId, reply } = customEvent.detail;

      // Update active selected message if it belongs to this thread
      setSelectedMsg((prev: any) => {
        if (prev && prev.id === enquiryId) {
          if (prev.replies?.some((r: any) => r.id === reply.id)) return prev;
          return {
            ...prev,
            replies: [...(prev.replies || []), reply]
          };
        }
        return prev;
      });

      // Update item replies in the table list
      setItems((prevItems: any[]) =>
        prevItems.map((item: any) => {
          if (item.id === enquiryId) {
            if (item.replies?.some((r: any) => r.id === reply.id)) return item;
            return {
              ...item,
              replies: [...(item.replies || []), reply]
            };
          }
          return item;
        })
      );
    };

    window.addEventListener('ws_new_chat_reply', handleNewChatReply);
    return () => {
      window.removeEventListener('ws_new_chat_reply', handleNewChatReply);
    };
  }, []);

  // Open details and sync states
  const handleOpenDetails = (msg: any) => {
    setSelectedMsg(msg);
    setAdminStatus(msg.status || "PENDING");
    setAdminNotes(msg.notes || "");
    setAdminReply("");
  };

  // Auto-open specific enquiry if ID is provided in query params (e.g. from notification)
  useEffect(() => {
    if (enquiryIdParam) {
      const fetchSingleEnquiry = async () => {
        try {
          const res = await authFetch(`${API_URL}/contact/${enquiryIdParam}`);
          if (res.ok) {
            const result = await res.json();
            if (result?.data) {
              handleOpenDetails(result.data);
            }
          }
        } catch (err) {
          console.error("Error fetching single enquiry for notification:", err);
        }
      };
      fetchSingleEnquiry();
      
      // Clean up search param so the modal doesn't keep opening on subsequent route refreshes
      setSearchParams({}, { replace: true });
    }
  }, [enquiryIdParam, authFetch, API_URL, setSearchParams]);

  // Update Status & Internal Notes
  const handleUpdateMeta = async () => {
    if (!selectedMsg) return;
    setIsUpdatingMeta(true);
    try {
      const res = await authFetch(`${API_URL}/contact/${selectedMsg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: adminStatus, notes: adminNotes }),
      });
      if (res.ok) {
        await res.json();
        showToast("Enquiry updated successfully!", "success");
        // Update item in lists
        setItems((prev: any[]) => prev.map((item: any) => item.id === selectedMsg.id ? { ...item, status: adminStatus, notes: adminNotes } : item));
        setSelectedMsg((prev: any) => prev ? { ...prev, status: adminStatus, notes: adminNotes } : null);
      } else {
        showToast("Failed to update enquiry status", "error");
      }
    } catch (err) {
      console.error("Error updating meta:", err);
      showToast("An error occurred while updating the status", "error");
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  // Submit Admin Reply to Live Thread
  const handleSendAdminReply = async () => {
    if (!selectedMsg || !adminReply.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await authFetch(`${API_URL}/contact/${selectedMsg.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: adminReply.trim() }),
      });
      if (res.ok) {
        const newReply = await res.json();
        showToast("Reply sent successfully!", "success");
        setAdminReply("");
        // Inject reply into active detail view and item in list
        setSelectedMsg((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            replies: [...(prev.replies || []), newReply]
          };
        });
        setItems((prev: any[]) => prev.map((item: any) => {
          if (item.id === selectedMsg.id) {
            return {
              ...item,
              replies: [...(item.replies || []), newReply]
            };
          }
          return item;
        }));
      } else {
        showToast("Failed to send reply", "error");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      showToast("An error occurred while sending reply", "error");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Enquiries & Consultations | Orange Global"
        description="View and manage all customer enquiries and premium migration consultation threads."
      />
      <PageBreadcrumb pageTitle="Enquiries Hub" />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 dark:border-white/[0.05] dark:bg-white/[0.03] flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center dark:bg-brand-950/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Total Enquiries</span>
            <span className="block text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{total}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Header */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] rounded-xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search name, email, msg..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 min-w-[150px]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type:</span>
              <Select
                options={typeOptions}
                value={typeFilter}
                onChange={setTypeFilter}
                className="!h-9 !py-1"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                className="!h-9 !py-1"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={fetchMessages}
            className="flex items-center gap-2 cursor-pointer"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <PageLoader fullScreen={false} message="Loading Enquiries..." subMessage="Fetching customer inquiries" />
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="mb-3 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>No enquiries messages found.</span>
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-transparent">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Sender</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Type</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Subject</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Status</th>
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
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${msg.type === "CONSULTATION"
                        ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                        : msg.type === "NEWSLETTER"
                          ? "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400"
                          : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                        }`}>
                        {msg.type === "CONSULTATION" ? "Consultation" : msg.type === "NEWSLETTER" ? "Newsletter" : "General Query"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {msg.subject}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${msg.status === "RESOLVED"
                        ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                        : msg.status === "IN_PROGRESS"
                          ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
                          : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                        }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetails(msg)}
                        className="h-8 py-1 px-3 text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Review
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
        className="max-w-[1000px] w-full p-6 sm:p-8"
      >
        {selectedMsg && (
          <div>
            <div className="mb-4 flex items-center justify-start gap-5 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enquiry Review & Chat Interface
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedMsg.type === "CONSULTATION"
                ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                : selectedMsg.type === "NEWSLETTER"
                  ? "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400"
                  : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                }`}>
                {selectedMsg.type === "CONSULTATION" ? "Premium Consultation" : selectedMsg.type === "NEWSLETTER" ? "Newsletter Subscriber" : "General Query"}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh] overflow-hidden">
              {/* Left Column - Enquiry Metadata & Actions */}
              <div className="lg:col-span-5 h-full overflow-y-auto pr-2 custom-scrollbar space-y-5 pb-6">
                
                {/* Sender Info Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Contact Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center font-bold shrink-0">
                        {selectedMsg.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sender Name</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedMsg.fullName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                        <a href={`mailto:${selectedMsg.email}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline break-all">{selectedMsg.email}</a>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{selectedMsg.phone || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received Date</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {new Date(selectedMsg.createdAt).toLocaleString(undefined, {
                          weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Original Message Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">Original Message</h4>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</span>
                    <div className="text-sm font-bold text-gray-800 dark:text-white/90 mb-4">
                      {selectedMsg.subject}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message Content</span>
                    <div className="p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-medium">
                      {selectedMsg.message}
                    </div>
                  </div>
                </div>

                {/* Review Actions Card */}
                <div className="bg-brand-50/50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30 p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest border-b border-brand-100 dark:border-brand-900/30 pb-3">Review & Actions</h4>
                  
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Update Status</label>
                    <Select
                      options={adminStatusOptions}
                      value={adminStatus}
                      onChange={setAdminStatus}
                      className="!h-10 !py-2 bg-white dark:bg-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Internal Notes (Private)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add private internal reviews or follow-up notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-brand-200 dark:border-brand-800/50 rounded-xl text-sm bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none font-medium custom-scrollbar"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      disabled={isUpdatingMeta}
                      onClick={handleUpdateMeta}
                      className="cursor-pointer shadow-sm w-full sm:w-auto"
                    >
                      {isUpdatingMeta ? "Saving Changes..." : "Save Actions"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Chat Interface */}
              <div className="lg:col-span-7 h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-widest">Live Threaded Conversation</h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Replies are sent to {selectedMsg.fullName}'s email</p>
                    </div>
                  </div>
                </div>

                {/* Replies List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/30 dark:bg-gray-900/50 custom-scrollbar">
                  {/* The original message as the first chat bubble */}
                  <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {selectedMsg.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{selectedMsg.fullName}</span>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(selectedMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="px-4 py-3 text-[13px] leading-relaxed shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-[20px] rounded-tl-[4px]">
                        <p className="whitespace-pre-wrap font-medium">{selectedMsg.message}</p>
                      </div>
                    </div>
                  </div>

                  {!selectedMsg.replies || selectedMsg.replies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center space-y-3 opacity-50 py-10">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-500">No replies yet. Start the conversation below!</p>
                    </div>
                  ) : (
                    selectedMsg.replies.map((reply: any) => {
                      const isSelf = reply.senderRole === "ADMIN";
                      const senderName = isSelf
                        ? `${reply.sender?.adminProfile?.firstName || "Orange"} ${reply.sender?.adminProfile?.lastName || "Global"}`
                        : (reply.sender?.talentProfile?.fullName || "Talent User");

                      return (
                        <div
                          key={reply.id}
                          className={`flex gap-3 max-w-[85%] ${isSelf ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${isSelf
                            ? "bg-brand-100 text-brand-700 border border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800"
                            : "bg-gray-200 text-gray-600 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                            }`}>
                            {senderName.charAt(0)}
                          </div>
                          <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{isSelf ? "You" : senderName}</span>
                              <span className="text-[9px] text-gray-400 font-medium">
                                {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-3 text-[13px] leading-relaxed shadow-sm ${isSelf
                              ? "bg-brand-500 text-white rounded-[20px] rounded-tr-[4px]"
                              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-[20px] rounded-tl-[4px]"
                              }`}>
                              <p className="whitespace-pre-wrap font-medium">{reply.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Reply form */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                  <div className={`flex items-end gap-2 relative transition-all duration-300 ease-in-out ${isTypingFocused || adminReply.trim() ? "min-h-[100px]" : "min-h-[48px]"}`}>
                    <textarea
                      value={adminReply}
                      onFocus={() => setIsTypingFocused(true)}
                      onBlur={() => setIsTypingFocused(false)}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="Type your response here... Pressing 'Send' will email the user directly."
                      className="absolute inset-0 w-full h-full pl-4 pr-14 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl text-[13px] bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none font-medium custom-scrollbar transition-all duration-300"
                    />
                    <button
                      disabled={isSendingReply || !adminReply.trim()}
                      onClick={handleSendAdminReply}
                      className="absolute right-2 bottom-2 h-[36px] w-[36px] rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 transition-all cursor-pointer shadow-sm disabled:shadow-none"
                    >
                      {isSendingReply ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-3 border-t border-gray-100 dark:border-gray-850">
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

