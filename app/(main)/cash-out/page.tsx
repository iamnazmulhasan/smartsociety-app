"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminProfile = Pick<UserProfile, 'uid' | 'fullName'>;

export default function CashOutPage() {
    const { userProfile } = useAuth();
    
    const [admins, setAdmins] = useState<AdminProfile[]>([]);
    const [selectedAdminId, setSelectedAdminId] = useState("");
    const [amount, setAmount] = useState("");
    const [cashoutNumber, setCashoutNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bKash");

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
        if (userProfile?.phoneNumber) {
            setCashoutNumber(userProfile.phoneNumber);
        }
    }, [userProfile]);
    
    const selectedAdmin = admins.find(a => a.uid === selectedAdminId);

    // THIS IS THE FIX for the TypeScript error. It now always results in a boolean.
    const isBalanceInsufficient = userProfile != null && Number(amount) > 0 && Number(amount) > userProfile.balance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!userProfile || !amount || !paymentMethod || !cashoutNumber || !selectedAdmin) {
            setMessage({ type: 'error', text: "Please fill out all fields and select an admin." });
            return;
        }
        if (isBalanceInsufficient) {
            setMessage({ type: 'error', text: "Insufficient balance for this cash out request." });
            return;
        }

        setIsLoading(true);

        try {
            await addDoc(collection(firestore, "transactions"), {
                userId: userProfile.uid,
                userName: userProfile.fullName,
                adminId: selectedAdmin.uid,
                adminName: selectedAdmin.fullName,
                type: 'cash-out',
                amount: Number(amount),
                cashoutNumber,
                paymentMethod,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });
            setMessage({ type: 'success', text: "Cash Out request submitted successfully!" });
            setAmount("");
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to submit request. Please try again." });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Cash Out Request</h2>
            <p className="text-lg text-muted-foreground mb-6">
                Your current balance: <span className="font-bold text-green-400">{userProfile?.balance ?? 0} Taka</span>
            </p>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-select">Send Request To Administrator</Label>
                            <select id="admin-select" value={selectedAdminId} onChange={(e) => setSelectedAdminId(e.target.value)}
                                className="custom-select flex h-10 w-full items-center justify-between rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm">
                                <option value="" disabled>Select an Administrator</option>
                                {admins.map(admin => <option key={admin.uid} value={admin.uid}>{admin.fullName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount to Withdraw (Taka)</Label>
                            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 500" className="bg-zinc-800 border-zinc-600" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cashout-number">Your Payment Number</Label>
                            <Input id="cashout-number" type="tel" value={cashoutNumber} onChange={(e) => setCashoutNumber(e.target.value)} placeholder="Your Nagad or bKash number" className="bg-zinc-800 border-zinc-600"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-method">Payment Method</Label>
                            <select id="payment-method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                className="custom-select flex h-10 w-full items-center justify-between rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm">
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                            </select>
                        </div>

                        <Button type="submit" disabled={isLoading || !selectedAdmin || isBalanceInsufficient} className="w-full bg-sky-700 hover:bg-sky-800 font-bold py-3 text-base">
                            {isLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>

                        {message && <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>}
                        {isBalanceInsufficient && <p className="text-sm text-center text-red-400">Amount exceeds your current balance.</p>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}