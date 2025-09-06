// /app/(main)/dashboard/page.tsx
"use client";

import { useAuth, UserProfile } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import MaintenanceDashboard from "@/components/dashboards/MaintenanceDashboard";
import ResidentDashboard from "@/components/dashboards/ResidentDashboard";
// The Header import below is no longer needed and has been removed.
// import Header from "@/components/Header";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  const renderDashboard = () => {
    if (!userProfile) {
      return <div>Could not load user profile. Please try logging in again.</div>;
    }
    
    const maintenanceProfile = userProfile as UserProfile & { ratingCount?: number; totalStars?: number };

    switch (userProfile.role) {
      case "Administrator":
        return <AdminDashboard />;
      case "Maintenance Staff":
        return <MaintenanceDashboard profile={maintenanceProfile} />;
      case "Resident":
        return <ResidentDashboard />;
      default:
        return <div>No dashboard available for your role.</div>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* The extra <Header /> component was here and has been removed */}
      {renderDashboard()}
    </div>
  );
}