"use client"; 

import Navbar from "@/components/Navbar"; 
import AdminNavbar from "@/components/AdminNavbar";
import ProfileSidebar from "@/components/ProfileSidebar"; 
import { useAuth } from "@/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useAuth();

  return (
    <div className="w-full min-h-screen bg-black">
      {userProfile?.role === 'Administrator' ? (
        <AdminNavbar />
      ) : (
        <Navbar userProfile={userProfile} loading={loading} />
      )}

      {/* This new 12-column grid provides a more stable and wider layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Sidebar now takes up 3 of 12 columns, making it wider */}
        <div className="col-span-12 lg:col-span-3 md:block hidden">
          <ProfileSidebar userProfile={userProfile} loading={loading} />
        </div>

        {/* Main content takes up 6 of 12 columns */}
        <div className="col-span-12 lg:col-span-6">
          {children}
        </div>

        {/* Right sidebar takes up the final 3 of 12 columns */}
        <div className="col-span-12 lg:col-span-3 md:block hidden">
          {/* Right sidebar content can go here */}
        </div>
      </main>
    </div>
  );
}