import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Select from "../../components/form/Select";
import PageLoader from "../../components/ui/PageLoader";
import ApplicationStatusModal from "./ApplicationStatusModal";
import ApplicationViewModal from "./ApplicationViewModal";

export default function ApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, showToast } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState<any | null>(null);
  const [selectedAppForView, setSelectedAppForView] = useState<any | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/jobs/${id}/applications`);
      if (res.ok) {
        const result = await res.json();
        console.log("Results: ", result);
        setApplications(result.data || []);
        if (result.data?.length > 0) {
          setJobTitle(result.data[0].job?.title || "");
        }
      } else {
        showToast("Failed to fetch applications", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error fetching applications", "error");
    } finally {
      setLoading(false);
    }
  }, [id, authFetch, API_URL, showToast]);

  useEffect(() => {
    if (id) fetchApplications();
  }, [id, fetchApplications]);

  const updateStatus = async (appId: string, status: string, interviewData?: any) => {
    setUpdatingStatus(true);
    try {
      const payload: any = { status };
      if (interviewData) {
        Object.assign(payload, interviewData);
      }
      const res = await authFetch(`${API_URL}/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Status updated", "success");
        setSelectedAppForStatus(null);
        fetchApplications();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Error updating status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`Applications | Orange Global`}
        description="View applications for job."
      />
      <div className="mb-4">
        <Button onClick={() => navigate("/jobs")} variant="outline">
          &larr; Back to Jobs
        </Button>
      </div>
      <PageBreadcrumb pageTitle={`Applications ${jobTitle ? `for ${jobTitle}` : ""}`} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <PageLoader fullScreen={false} message="Loading Applications..." subMessage="Fetching candidate list" />
          ) : applications.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <span>No applications found for this job.</span>
            </div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-transparent">
                <tr>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Applicant</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">ATS Score</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Applied Date</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Status</th>
                  <th className="px-5 py-3 font-semibold text-gray-500 text-theme-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-800 dark:text-white/90">{app.talent?.fullName || "Unknown"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{app.talent?.user?.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-brand-500">{app.atsScore ? `${app.atsScore}%` : "N/A"}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <Badge 
                        size="sm" 
                        color={
                          ["REJECTED", "OFFER_REJECTED", "WITHDRAWN"].includes(app.status) ? "error" 
                          : app.status === "OFFER_ACCEPTED" ? "success" 
                          : "warning"
                        }
                      >
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedAppForView(app)}
                          className="h-8 py-1 px-3 text-xs"
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedAppForStatus(app)}
                          className="h-8 py-1 px-3 text-xs bg-brand-500 text-white border border-brand-500"
                        >
                          Change Status
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ApplicationStatusModal
        isOpen={!!selectedAppForStatus}
        onClose={() => setSelectedAppForStatus(null)}
        application={selectedAppForStatus}
        onSave={updateStatus}
        saving={updatingStatus}
      />

      <ApplicationViewModal
        isOpen={!!selectedAppForView}
        onClose={() => setSelectedAppForView(null)}
        application={selectedAppForView}
      />
    </>
  );
}
