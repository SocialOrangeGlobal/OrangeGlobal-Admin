import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import DashboardMetrics from "../../components/dashboard/DashboardMetrics";
import ApplicationTrendsChart from "../../components/dashboard/ApplicationTrendsChart";
import JobStatusOverview from "../../components/dashboard/JobStatusOverview";
import RecentApplications from "../../components/dashboard/RecentApplications";
import PageLoader from "../../components/ui/PageLoader";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.message || "Failed to load dashboard statistics");
        }
      } catch (err) {
        setError("Network error while loading dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <PageLoader message="Loading Admin Dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Orange Global"
        description="Overview of Orange Global recruitment metrics and applications."
      />
      
      <div className="mb-6">
        <h3 className="text-gray-800 dark:text-white text-2xl font-bold">Dashboard Overview</h3>
        <p className="text-gray-500 text-sm mt-1">Platform metrics and recent recruitment activities.</p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        
        {/* Top Metrics Row */}
        <div className="col-span-12">
          <DashboardMetrics metrics={stats.metrics} />
        </div>

        {/* Charts Row */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <ApplicationTrendsChart statusDistribution={stats.applicationStatusDistribution} />
          
          <RecentApplications applications={stats.recentApplications} />
        </div>

        {/* Side Overview Row */}
        <div className="col-span-12 xl:col-span-5">
          <JobStatusOverview activeJobs={stats.metrics.activeJobs} totalJobs={stats.metrics.totalJobs} />
        </div>

      </div>
    </>
  );
}
