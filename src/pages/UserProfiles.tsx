import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";

export default function UserProfiles() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { authFetch } = useAuth();

  const fetchProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
      const response = await authFetch(`${API_URL}/users/me`);
      if (response.ok) {
        const result = await response.json();
        setProfile(result?.data?.profile || {});
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return <PageLoader fullScreen={false} message="Loading Profile..." subMessage="Fetching admin details" />;
  }

  return (
    <>
      <PageMeta
        title="Admin Profile | Orange Global"
        description="View and update your administrator profile"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard profile={profile} onRefresh={fetchProfile} />
          <UserInfoCard profile={profile} onRefresh={fetchProfile} />
          <UserAddressCard profile={profile} onRefresh={fetchProfile} />
        </div>
      </div>
    </>
  );
}
