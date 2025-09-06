"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto py-4 px-6 mb-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-100">
        SmartSociety
      </h1>
      <Button onClick={handleLogout} variant="ghost">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}