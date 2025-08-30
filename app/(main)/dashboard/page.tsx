// /app/(main)/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase'; // Corrected Path
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Corrected Path

interface UserProfile {
  fullName: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, now fetch their profile from Firestore
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          // This case shouldn't happen if registration is correct
          console.log("No such document!");
          router.push('/login');
        }
      } else {
        // User is signed out
        router.push('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        {userProfile ? (
          <div>
            <p className="text-xl">Welcome, <span className="font-semibold">{userProfile.fullName}</span>!</p>
            <p className="text-gray-600">You are logged in as a <span className="font-semibold">{userProfile.role}</span>.</p>
            <p className="text-gray-500 text-sm mt-2">{userProfile.email}</p>
          </div>
        ) : (
          <p>Could not load user profile.</p>
        )}
        <Button onClick={handleLogout} variant="destructive" className="mt-6">
          Logout
        </Button>
      </div>
    </div>
  );
}