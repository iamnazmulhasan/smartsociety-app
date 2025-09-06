"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion, writeBatch, serverTimestamp, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Bargain {
  amount: number;
  remarks: string;
  by: 'resident' | 'staff';
  timestamp: Timestamp;
}

interface Offer {
  id: string;
  staffName: string;
  staffId: string;
  staffPhone: string;
  initialPrice: number;
  bargains: Bargain[];
}

const OfferItem = ({ offer, ticketId, currentUser, residentName }: { offer: Offer; ticketId: string; currentUser: UserProfile, residentName: string }) => {
  const [isBargaining, setIsBargaining] = useState(false);
  const [bargainAmount, setBargainAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  const isResident = currentUser.role === 'Resident';
  const isStaffOwner = currentUser.uid === offer.staffId;

  // This logic now determines the "live" price to display at the top
  const lastBargain = offer.bargains?.[offer.bargains.length - 1];
  const lastPrice = lastBargain ? lastBargain.amount : offer.initialPrice;

  const isMyTurn = 
    (isResident && (!lastBargain || lastBargain.by === 'staff')) ||
    (isStaffOwner && lastBargain?.by === 'resident');

  // This function now correctly uses 'lastPrice' as the final amount
  const handleAccept = async () => {
    if (!confirm(`Are you sure you want to accept the final price of ${lastPrice} Taka from ${offer.staffName}?`)) return;
    
    const batch = writeBatch(firestore);
    const ticketRef = doc(firestore, 'tickets', ticketId);
    batch.update(ticketRef, {
        status: 'Assigned',
        assignedToId: offer.staffId,
        assignedToName: offer.staffName,
        assignedToPhone: offer.staffPhone,
        finalPrice: lastPrice, // Capture the last proposed price
    });

    const offerRef = doc(firestore, 'tickets', ticketId, 'offers', offer.id);
    batch.update(offerRef, { status: 'Accepted' });

    await batch.commit();
  };

  const handleSendBargain = async () => {
     if (!bargainAmount || !remarks) {
        alert("Please enter a price and remarks.");
        return;
     }
     const offerRef = doc(firestore, 'tickets', ticketId, 'offers', offer.id);
     await updateDoc(offerRef, {
        bargains: arrayUnion({
            amount: Number(bargainAmount),
            remarks: remarks,
            by: isResident ? 'resident' : 'staff',
            timestamp: new Date()
        })
     });
     setIsBargaining(false);
     setBargainAmount("");
     setRemarks("");
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
      {/* --- NEW: Dynamic Price Header --- */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-white">{offer.staffName}</p>
        <p className="font-bold text-lg text-green-400">{lastPrice} Taka</p>
      </div>
      
      {isMyTurn && !isBargaining && (
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="secondary" onClick={() => setIsBargaining(true)}>Bargain</Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleAccept}>Accept Offer</Button>
          </div>
      )}

      {isBargaining && (
          <div className="bg-zinc-900 p-3 rounded-md border border-zinc-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                  <p className="text-xs text-gray-400">Last Price</p>
                  <p className="font-bold">{lastPrice} Taka</p>
              </div>
              <Input type="number" placeholder="Your Counter Offer" value={bargainAmount} onChange={(e) => setBargainAmount(e.target.value)} className="bg-zinc-800" />
              <Input type="text" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="bg-zinc-800" />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsBargaining(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSendBargain}>Send Offer</Button>
            </div>
          </div>
      )}

      {/* --- NEW: Redesigned Bargain History Log --- */}
      <div className="border-t border-zinc-700 pt-3 mt-3 space-y-2">
        {/* Render the initial offer as the first item in the log */}
        <div className="text-sm text-gray-300">
            <p><span className="font-bold text-white">{isStaffOwner ? 'You' : offer.staffName}:</span> Offered <span className="font-bold text-amber-400">{offer.initialPrice} Taka</span></p>
        </div>

        {/* Render the rest of the bargain history */}
        {offer.bargains.map((bargain, index) => {
            let authorName = '';
            if (bargain.by === 'resident') {
              authorName = isResident ? 'You' : residentName;
            } else {
              authorName = isStaffOwner ? 'You' : offer.staffName;
            }
            return (
              <div key={index} className="text-sm text-gray-300">
                  <p><span className="font-bold text-white">{authorName}:</span> proposed <span className="font-bold text-amber-400">{bargain.amount} Taka</span></p>
                  <p className="text-xs text-gray-400 pl-2 italic">"{bargain.remarks}"</p>
              </div>
            )
        })}
      </div>
    </div>
  )
};

export default function OfferList({ ticketId, residentName }: { ticketId: string, residentName: string }) {
  const { userProfile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, 'tickets', ticketId, 'offers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      setOffers(fetchedOffers);
    });
    return () => unsubscribe();
  }, [ticketId]);

  if (!userProfile) return null;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Price Negotiations</CardTitle>
      </CardHeader>
      <CardContent>
        {offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map(offer => <OfferItem key={offer.id} offer={offer} ticketId={ticketId} currentUser={userProfile} residentName={residentName}/>)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No price offers have been made for this ticket yet.</p>
        )}
      </CardContent>
    </Card>
  );
}