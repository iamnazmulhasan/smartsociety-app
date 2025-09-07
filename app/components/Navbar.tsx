"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserProfile, useAuth } from "@/hooks/useAuth";
import { Home, MessageSquare, ArrowDownToLine, ArrowUpFromLine, User, LogOut, Bell } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const useUnreadNotifications = (userId?: string) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!userId) return;
        const notifRef = collection(firestore, 'notifications');
        const q = query(notifRef, where('userId', '==', userId), where('isRead', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => setCount(snapshot.size));
        return () => unsubscribe();
    }, [userId]);
    return count;
};

interface NavbarProps {
  userProfile: UserProfile | null;
  loading: boolean;
}

export default function Navbar({ userProfile, loading }: NavbarProps) {
  const router = useRouter();
  const unreadCount = useUnreadNotifications(userProfile?.uid);
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
             <Image src="https://bloomapp.club/AppIcon.png" alt="SmartSociety Logo" width={28} height={28} />
             <h1 className="text-2xl font-bold text-gray-100">SmartSociety</h1>
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 hover:text-white"><Home size={24} /><span>Home</span></Link>
          <Link href="/messaging" className="flex flex-col items-center gap-1 hover:text-white"><MessageSquare size={24} /><span>Messaging</span></Link>
          <Link href="/cash-in" className="flex flex-col items-center gap-1 hover:text-white"><ArrowDownToLine size={24} /><span>Cash In</span></Link>
          <Link href="/cash-out" className="flex flex-col items-center gap-1 hover:text-white"><ArrowUpFromLine size={24} /><span>Cash Out</span></Link>
          <Link href="/notifications" className="relative flex flex-col items-center gap-1 hover:text-white">
            <Bell size={24} />
            {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-zinc-900" />}
            <span>Notifications</span>
          </Link>
          <Link href="/me" className="flex flex-col items-center gap-1 hover:text-white"><User size={24} /><span>Me</span></Link>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 hover:text-white"><LogOut size={24} /><span>Logout</span></button>
        </div>
      </nav>
    </header>
  );
}