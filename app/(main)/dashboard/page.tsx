"use client";

import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import MaintenanceDashboard from "@/components/dashboards/MaintenanceDashboard";
import ResidentDashboard from "@/components/dashboards/ResidentDashboard";

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-6 bg-zinc-900 rounded-lg">Loading...</div>;
  }

  if (!userProfile) {
    return <div className="text-center p-6 bg-zinc-900 rounded-lg">Could not load user profile.</div>;
  }

  switch (userProfile.role) {
    case "Administrator":
      return <AdminDashboard />;
    case "Maintenance Staff":
      return <MaintenanceDashboard profile={userProfile} />;
    case "Resident":
      // This will now appear in the center column of our new layout
      return <ResidentDashboard />;
    default:
      return <div className="text-center p-6 bg-zinc-900 rounded-lg">No dashboard available.</div>;
  }
}