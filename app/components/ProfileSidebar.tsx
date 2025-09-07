"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useAuth";
import Image from "next/image";
import { UserCircle2 } from "lucide-react";

const useAdminAnalytics = (adminId: string | undefined) => {
    const [totals, setTotals] = useState({ totalCashIn: 0, totalCashOut: 0 });
    useEffect(() => {
        if (!adminId) return;
        const transRef = collection(firestore, "transactions");
        const q = query(transRef, where("adminId", "==", adminId), where("status", "==", "Resolved"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let cashIn = 0; let cashOut = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.type === 'cash-in') cashIn += data.amount;
                else if (data.type === 'cash-out') cashOut += data.amount;
            });
            setTotals({ totalCashIn: cashIn, totalCashOut: cashOut });
        });
        return () => unsubscribe();
    }, [adminId]);
    return totals;
};

interface ProfileSidebarProps {
  userProfile: UserProfile | null;
  loading: boolean;
}

export default function ProfileSidebar({ userProfile, loading }: ProfileSidebarProps) {
  const { totalCashIn, totalCashOut } = useAdminAnalytics(userProfile?.uid);

  if (loading) {
    return <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">Loading profile...</CardContent></Card>;
  }
  if (!userProfile) {
    return null;
  }
  
  const residentAddress = userProfile.role === 'Resident' && userProfile.address ? `${userProfile.address.houseNo}, ${userProfile.address.postOffice}, ${userProfile.address.upazila}, ${userProfile.address.district}` : null;
  const staffLocation = userProfile.role === 'Maintenance Staff' && userProfile.location ? `Service Location: ${userProfile.location.upazila}, ${userProfile.location.district}` : null;
  const isAdmin = userProfile.role === 'Administrator';

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-center">
      <CardContent className="p-6">
        <div className="relative w-20 h-20 mx-auto mb-4">
          {userProfile.imageUrl ? (
            <Image src={userProfile.imageUrl} alt="Profile Picture" layout="fill" className="rounded-full object-cover" />
          ) : (
            <UserCircle2 className="w-20 h-20 text-gray-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-white">{userProfile.fullName}</h3>
        <p className="text-sm text-muted-foreground mb-2">{userProfile.role}</p>
        {residentAddress && <p className="text-xs text-gray-400">{residentAddress}</p>}
        {staffLocation && <p className="text-xs text-gray-400">{staffLocation}</p>}
        
        <div className="text-left mt-4 pt-4 border-t border-zinc-700 space-y-2">
          {isAdmin && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Cash In:</span>
                <span className="font-semibold text-white">{totalCashIn} Taka</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Cash Out:</span>
                <span className="font-semibold text-white">{totalCashOut} Taka</span>
              </div>
            </>
          )}
          {/* THIS IS THE FIX: The balance display is now shown for ALL roles */}
          <div className="flex justify-between text-lg">
            <span className="text-gray-400">Balance:</span>
            <span className="font-bold text-green-400">{userProfile.balance} Taka</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}