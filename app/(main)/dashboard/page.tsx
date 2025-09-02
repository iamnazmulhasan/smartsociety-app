// /app/(main)/dashboard/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import MaintenanceDashboard from "@/components/dashboards/MaintenanceDashboard";
import ResidentDashboard from "@/components/dashboards/ResidentDashboard";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const renderDashboard = () => {
    // We need to ensure userProfile is not null before rendering
    if (!userProfile) {
      return <div>Could not load user profile.</div>;
    }

    switch (userProfile.role) {
      case "Administrator":
        return <AdminDashboard />;
      case "Maintenance Staff":
        // Pass the userProfile to the component
        return <MaintenanceDashboard profile={userProfile} />;
      case "Resident":
        return <ResidentDashboard />;
      default:
        return <div>No dashboard available for your role.</div>;
    }
  };

  return <div>{renderDashboard()}</div>;
}