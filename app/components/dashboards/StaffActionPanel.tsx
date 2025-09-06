"use client";

import { useState } from 'react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StaffActionPanelProps {
  ticketId: string;
  staffProfile: UserProfile;
}

export default function StaffActionPanel({ ticketId, staffProfile }: StaffActionPanelProps) {
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProposePrice = async () => {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert('Please enter a valid positive price.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 1. Create a new "offer" document
      const offersRef = collection(firestore, 'tickets', ticketId, 'offers');
      await addDoc(offersRef, {
        staffId: staffProfile.uid,
        staffName: staffProfile.fullName,
        staffPhone: staffProfile.phoneNumber,
        initialPrice: Number(price),
        status: 'Proposed',
        createdAt: serverTimestamp(),
        bargains: [],
      });

      // 2. Update the main ticket's status to 'Awaiting Resident'
      const ticketRef = doc(firestore, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: 'Awaiting Resident', // <<< THIS IS THE CORRECT, CONSISTENT STATUS
      });

      setPrice('');
    } catch (error) {
      console.error("Error proposing price:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
        <Label htmlFor="price" className="font-semibold">Propose Your Price (in Taka)</Label>
        <div className="flex gap-2">
            <Input 
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 500"
                className="bg-zinc-800 border-zinc-600"
            />
            <Button onClick={handleProposePrice} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? 'Submitting...' : 'Submit Price'}
            </Button>
        </div>
    </div>
  );
}