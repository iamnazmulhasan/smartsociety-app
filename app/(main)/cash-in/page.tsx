"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminProfile = Pick<UserProfile, 'uid' | 'fullName' | 'phoneNumber' | 'paymentMethods'>;

export default function CashInPage() {
  const { userProfile } = useAuth();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfile | null>(null);
  
  const [amount, setAmount] = useState("");
  const [cashInNumber, setCashInNumber] = useState(""); // New state for the user's number
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      const q = query(collection(firestore, "users"), where("role", "==", "Administrator"));
      const querySnapshot = await getDocs(q);
      const adminList = querySnapshot.docs.map(doc => doc.data() as AdminProfile);
      setAdmins(adminList);
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    const admin = admins.find(a => a.uid === selectedAdminId) || null;
    setSelectedAdmin(admin);
    setPaymentMethod("");
  }, [selectedAdminId, admins]);
  
  // Pre-fill the user's phone number when their profile loads
  useEffect(() => {
      if (userProfile?.phoneNumber) {
          setCashInNumber(userProfile.phoneNumber);
      }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedAdmin || !amount || !paymentMethod || !transactionId || !cashInNumber) {
        setMessage({ type: 'error', text: "Please fill out all fields." });
        return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
        await addDoc(collection(firestore, "transactions"), {
            userId: userProfile.uid,
            userName: userProfile.fullName,
            adminId: selectedAdmin.uid,
            adminName: selectedAdmin.fullName,
            type: 'cash-in',
            amount: Number(amount),
            cashInNumber, // Save the number used for the transaction
            paymentMethod,
            transactionId,
            status: 'Pending',
            createdAt: serverTimestamp(),
        });
        setMessage({ type: 'success', text: "Cash In request submitted successfully!" });
        setSelectedAdminId("");
        setAmount("");
        setPaymentMethod("");
        setTransactionId("");
    } catch (err) {
        setMessage({ type: 'error', text: "Failed to submit request. Please try again." });
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Cash In Request</h2>
        <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="admin-select">Send Request To Administrator</Label>
                        <select
                            id="admin-select"
                            value={selectedAdminId}
                            onChange={(e) => setSelectedAdminId(e.target.value)}
                            className="custom-select flex h-10 w-full items-center justify-between rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm"
                        >
                            <option value="" disabled>Select an Administrator</option>
                            {admins.map(admin => <option key={admin.uid} value={admin.uid}>{admin.fullName}</option>)}
                        </select>
                    </div>

                    {selectedAdmin && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="admin-number">Admin's Payment Number</Label>
                                <Input id="admin-number" value={selectedAdmin.phoneNumber} readOnly className="bg-zinc-800 border-zinc-700"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment-method">Payment Method Used</Label>
                                <select 
                                    id="payment-method"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="custom-select flex h-10 w-full items-center justify-between rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm"
                                >
                                    <option value="" disabled>Select method</option>
                                    {Object.entries(selectedAdmin.paymentMethods || {}).map(([method, isAvailable]) =>
                                        isAvailable && <option key={method} value={method}>{method}</option>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (Taka)</Label>
                                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1000" className="bg-zinc-800 border-zinc-600" />
                            </div>
                            {/* --- NEW FIELD --- */}
                            <div className="space-y-2">
                                <Label htmlFor="cash-in-number">Your Number (From which you sent money)</Label>
                                <Input id="cash-in-number" type="tel" value={cashInNumber} onChange={(e) => setCashInNumber(e.target.value)} className="bg-zinc-800 border-zinc-600"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="trx-id">Transaction ID</Label>
                                <Input id="trx-id" type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter the TrxID from your payment app" className="bg-zinc-800 border-zinc-600"/>
                            </div>
                        </>
                    )}

                    <Button type="submit" disabled={isLoading || !selectedAdmin} className="w-full bg-sky-700 hover:bg-sky-800 font-bold py-3 text-base">
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                    
                    {message && <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
                </form>
            </CardContent>
        </Card>
    </div>
  );
}