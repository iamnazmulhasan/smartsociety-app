"use client"; 

import Navbar from "@/components/Navbar"; 
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
      <Navbar userProfile={userProfile} loading={loading} />

      {/* This main section is now centered with a max-width */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="lg:col-span-1 md:block hidden">
          <ProfileSidebar userProfile={userProfile} loading={loading} />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          {children}
        </div>

        <div className="lg:col-span-1 md:block hidden">
          {/* Right sidebar content can go here */}
        </div>
      </main>
    </div>
  );
}