"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, runTransaction, Timestamp, DocumentData, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface Transaction extends DocumentData {
  id: string; type: 'cash-in' | 'cash-out'; status: 'Pending' | 'Resolved'; amount: number; userId: string; userName: string; paymentMethod: string;
  cashInNumber?: string; transactionId?: string; cashoutNumber?: string;
}

const CashOutRequestRow = ({ req, onResolve }: { req: Transaction, onResolve: (id: string, trxId: string) => Promise<void> }) => {
    const [trxId, setTrxId] = useState('');
    return (
        <tr>
            <td>{req.userName}</td><td>{req.paymentMethod}</td><td>{req.amount}</td><td>{req.cashoutNumber}</td>
            <td><Input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="Enter TrxID" className="bg-zinc-700 border-zinc-600 h-8"/></td>
            <td><Button size="sm" onClick={() => onResolve(req.id, trxId)} disabled={!trxId} className="bg-green-600 hover:bg-green-700">Resolve</Button></td>
        </tr>
    );
};

export default function RechargePage() {
  const { userProfile } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [resolvedRequests, setResolvedRequests] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>('Pending');

  useEffect(() => {
    if (!userProfile || userProfile.role !== 'Administrator') return;
    const transRef = collection(firestore, "transactions");
    const q = query(transRef, where("adminId", "==", userProfile.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending: Transaction[] = []; const resolved: Transaction[] = [];
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() } as Transaction;
        if (data.status === 'Pending') pending.push(data); else resolved.push(data);
      });
      setPendingRequests(pending); setResolvedRequests(resolved); setLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile]);
  
  const handleResolve = async (req: Transaction, cashOutTrxId?: string) => {
      try {
          await runTransaction(firestore, async (transaction) => {
              const userRef = doc(firestore, 'users', req.userId);
              const adminRef = doc(firestore, 'users', userProfile!.uid);
              const transactionRef = doc(firestore, 'transactions', req.id);
              const userDoc = await transaction.get(userRef);
              const adminDoc = await transaction.get(adminRef);
              if (!userDoc.exists() || !adminDoc.exists()) throw "User or Admin not found!";
              
              const currentUserBalance = userDoc.data().balance || 0;
              const currentAdminBalance = adminDoc.data().balance || 0;
              
              let userNewBalance, adminNewBalance;
              if (req.type === 'cash-in') {
                  userNewBalance = currentUserBalance + req.amount;
                  adminNewBalance = currentAdminBalance + req.amount;
              } else { 
                  if (currentUserBalance < req.amount) throw new Error("User has insufficient funds.");
                  userNewBalance = currentUserBalance - req.amount;
                  adminNewBalance = currentAdminBalance - req.amount;
              }
              
              transaction.update(userRef, { balance: userNewBalance });
              transaction.update(adminRef, { balance: adminNewBalance });
              
              const updateData: any = { status: 'Resolved', resolvedAt: serverTimestamp() };
              if (req.type === 'cash-out' && cashOutTrxId) updateData.transactionId = cashOutTrxId;
              transaction.update(transactionRef, updateData);

              const notifRef = doc(collection(firestore, "notifications"));
              const notifBody = req.type === 'cash-in' 
                ? `Amount: ${req.amount}\nYour Number: ${req.cashInNumber}\nTransaction ID: ${req.transactionId}`
                : `Amount: ${req.amount}\nYour Number: ${req.cashoutNumber}\nAdmin's Number: ${userProfile!.phoneNumber}\nTransaction ID: ${cashOutTrxId}`;
              
              transaction.set(notifRef, {
                  userId: req.userId, title: `${req.type === 'cash-in' ? 'Cash In' : 'Cash Out'}: Resolved`,
                  body: notifBody, details: { previousBalance: currentUserBalance, currentBalance: userNewBalance, issuedBy: userProfile!.fullName },
                  isRead: false, createdAt: serverTimestamp(),
              });
          });
      } catch (e: any) {
          console.error("Transaction failed: ", e);
          alert(`Transaction failed: ${e.message}`);
      }
  };
  
  const handleUnresolve = async (req: Transaction) => {
       try {
          await runTransaction(firestore, async (transaction) => {
               const userRef = doc(firestore, 'users', req.userId);
               const adminRef = doc(firestore, 'users', userProfile!.uid);
               const transactionRef = doc(firestore, 'transactions', req.id);
               const userDoc = await transaction.get(userRef);
               const adminDoc = await transaction.get(adminRef);
               if (!userDoc.exists() || !adminDoc.exists()) throw "User or Admin not found!";
               const currentUserBalance = userDoc.data().balance || 0;
               const currentAdminBalance = adminDoc.data().balance || 0;
               let userNewBalance, adminNewBalance;
               if (req.type === 'cash-in') {
                   userNewBalance = currentUserBalance - req.amount;
                   adminNewBalance = currentAdminBalance - req.amount;
               } else { 
                   userNewBalance = currentUserBalance + req.amount;
                   adminNewBalance = currentAdminBalance + req.amount;
               }
               transaction.update(userRef, { balance: userNewBalance });
               transaction.update(adminRef, { balance: adminNewBalance });
               transaction.update(transactionRef, { status: 'Pending' });

               const notifRef = doc(collection(firestore, "notifications"));
               const notifBody = `Amount: ${req.amount}\nYour Number: ${req.cashInNumber || req.cashoutNumber}\nTransaction ID: ${req.transactionId}`;
               transaction.set(notifRef, {
                  userId: req.userId, title: `${req.type === 'cash-in' ? 'Cash In' : 'Cash Out'}: Unresolved`,
                  body: notifBody, details: { previousBalance: currentUserBalance, currentBalance: userNewBalance, issuedBy: userProfile!.fullName, },
                  isRead: false, createdAt: serverTimestamp(),
              });
          });
      } catch (e) {
          console.error("Transaction failed: ", e);
          alert("Transaction failed to reverse.");
      }
  };

  if (loading) return <div>Loading requests...</div>;

  const renderTable = (requests: Transaction[], isPending: boolean) => {
    const cashIn = requests.filter(r => r.type === 'cash-in');
    const cashOut = requests.filter(r => r.type === 'cash-out');
    return (
        <div className="p-4 space-y-6">
            <h4 className="text-xl font-semibold text-white">Cash In Requests ({cashIn.length})</h4>
            <div className="overflow-x-auto">
                <table className="custom-table">
                    <thead><tr><th>Name</th><th>Payment Method</th><th>Amount</th><th>User's Number</th><th>Transaction ID</th><th>Action</th></tr></thead>
                    <tbody>
                        {cashIn.length > 0 ? cashIn.map(req => (<tr key={req.id}><td>{req.userName}</td><td>{req.paymentMethod}</td><td>{req.amount}</td><td>{req.cashInNumber}</td><td>{req.transactionId}</td><td>{isPending ? <Button size="sm" onClick={() => handleResolve(req)} className="bg-green-600 hover:bg-green-700">Resolve</Button> : <Button size="sm" onClick={() => handleUnresolve(req)} className="bg-zinc-600 hover:bg-zinc-700 text-white">Unresolve</Button>}</td></tr>)) : <tr><td colSpan={6}>No cash-in requests.</td></tr>}
                    </tbody>
                </table>
            </div>
            <h4 className="text-xl font-semibold text-white">Cash Out Requests ({cashOut.length})</h4>
            <div className="overflow-x-auto">
                 <table className="custom-table">
                    <thead><tr><th>Name</th><th>Payment Method</th><th>Amount</th><th>User's Number</th><th>Transaction ID</th><th>Action</th></tr></thead>
                    <tbody>
                        {cashOut.length > 0 ? cashOut.map(req => (isPending ? <CashOutRequestRow key={req.id} req={req} onResolve={(id, trxId) => handleResolve(req, trxId)} /> : <tr key={req.id}><td>{req.userName}</td><td>{req.paymentMethod}</td><td>{req.amount}</td><td>{req.cashoutNumber}</td><td>{req.transactionId}</td><td><Button size="sm" onClick={() => handleUnresolve(req)} className="bg-zinc-600 hover:bg-zinc-700 text-white">Unresolve</Button></td></tr>)) : <tr><td colSpan={6}>No cash-out requests.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };
  
  return (
    <>
      <div className="w-full">
        <h2 className="text-3xl font-bold mb-6">Recharge Requests</h2>
        <div className="accordion-item bg-zinc-900 rounded-lg mb-4">
          <button onClick={() => setOpenAccordion(openAccordion === 'Pending' ? null : 'Pending')} className="accordion-button">
            <span className="font-semibold text-white">Pending Requests ({pendingRequests.length})</span>
            <ChevronDown className={`chevron ${openAccordion === 'Pending' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`accordion-content ${openAccordion === 'Pending' ? 'open' : ''}`}>
            {renderTable(pendingRequests, true)}
          </div>
        </div>
        <div className="accordion-item bg-zinc-900 rounded-lg">
          <button onClick={() => setOpenAccordion(openAccordion === 'Resolved' ? null : 'Resolved')} className="accordion-button">
            <span className="font-semibold text-white">Resolved Requests ({resolvedRequests.length})</span>
            <ChevronDown className={`chevron ${openAccordion === 'Resolved' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`accordion-content ${openAccordion === 'Resolved' ? 'open' : ''}`}>
            {renderTable(resolvedRequests, false)}
          </div>
        </div>
      </div>
      <style jsx global>{`
        .accordion-button { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 1rem; text-align: left; background-color: #27272a; border: none; cursor: pointer; border-radius: 0.5rem; transition: background-color 0.2s ease-in-out; }
        .accordion-button:hover { background-color: #3f3f46; }
        .chevron { transition: transform 0.3s ease-in-out; color: #a1a1aa; }
        .chevron.rotate-180 { transform: rotate(180deg); }
        .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-in-out; }
        .accordion-content.open { max-height: 4000px; }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th, .custom-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #3f3f46; text-align: left; font-size: 0.875rem; color: #d4d4d8; }
        .custom-table th { font-semibold; color: #ffffff; }
        .custom-table tbody tr:hover { background-color: #27272a; }
        .custom-table td { vertical-align: middle; }
      `}</style>
    </>
  );
}