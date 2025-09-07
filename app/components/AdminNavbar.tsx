"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, MessageSquare, Briefcase, User, LogOut, Receipt } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
             <Image 
               src="https://bloomapp.club/AppIcon.png"
               alt="SmartSociety Logo"
               width={28}
               height={28}
             />
             <h1 className="text-2xl font-bold text-gray-100">SmartSociety</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 hover:text-white">
            <Briefcase size={24} />
            <span>All Tickets</span>
          </Link>
          <Link href="/recharge" className="flex flex-col items-center gap-1 hover:text-white">
            <Receipt size={24} />
            <span>Recharge</span>
          </Link>
          <Link href="/me" className="flex flex-col items-center gap-1 hover:text-white">
            <User size={24} />
            <span>Me</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 hover:text-white">
             <LogOut size={24} />
             <span>Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
}