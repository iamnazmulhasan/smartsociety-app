"use client";

import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/hooks/useAuth";
import { Home, MessageSquare, ArrowDownToLine, ArrowUpFromLine, User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface NavbarProps {
  userProfile: UserProfile | null;
  loading: boolean;
}

export default function Navbar({ userProfile, loading }: NavbarProps) {
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      {/* This nav is now centered with a max-width */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
             {/* Added the Image component for the logo */}
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
            <Home size={24} />
            <span>Home</span>
          </Link>
          <Link href="/messaging" className="flex flex-col items-center gap-1 hover:text-white">
            <MessageSquare size={24} />
            <span>Messaging</span>
          </Link>
          <Link href="/cash-in" className="flex flex-col items-center gap-1 hover:text-white">
            <ArrowDownToLine size={24} />
            <span>Cash In</span>
          </Link>
           <Link href="/cash-out" className="flex flex-col items-center gap-1 hover:text-white">
            <ArrowUpFromLine size={24} />
            <span>Cash Out</span>
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