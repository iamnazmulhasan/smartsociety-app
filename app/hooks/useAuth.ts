// /app/hooks/useAuth.ts
"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'; // <<< 1. Import Timestamp
import { auth, firestore } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber: string;
  balance: number;
  createdAt: Timestamp; // <<< 2. Add the createdAt property
  imageUrl?: string;
  address?: {
    houseNo: string;
    postOffice: string;
    upazila: string;
    district: string;
  };
  serviceCategory?: string;
  location?: {
    district: string;
    upazila: string;
  };
  experience?: number;
  nid?: string;
  paymentMethods?: {
    [key: string]: boolean;
  };
  ratingCount?: number;
  totalStars?: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This listener handles user login/logout
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If user logs out, clear profile and stop loading
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      // This listener subscribes to real-time changes on the user's document
      const docRef = doc(firestore, "users", user.uid);
      const unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribeProfile(); // Cleanup the profile listener on unmount
    }
  }, [user]); // This effect runs whenever the user object changes

  return { user, userProfile, loading };
}