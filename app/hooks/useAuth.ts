"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber: string;
  imageUrl?: string;
  address?: {
    houseNo: string;
    postOffice: string;
    upazila: string;
    district: string;
  };
  // Add these new optional fields for Maintenance Staff
  serviceCategory?: string;
  location?: {
    district: string;
    upazila: string;
  };
  experience?: number;
  nid?: string;
  // Properties for Maintenance Staff rating
  ratingCount?: number;
  totalStars?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  return { user, userProfile, loading };
}