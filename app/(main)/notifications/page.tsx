"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, writeBatch, runTransaction, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";

interface Notification {
    id: string; title: string; body: string; isRead: boolean; createdAt: Timestamp; link?: string;
    type?: 'action_required_resolution';
    details?: { previousBalance: number; currentBalance: number; issuedBy: string; };
    context?: { ticketId: string; finalPrice: number; assignedToId: string; };
}

// New component for the interactive notification card
const ActionableNotificationCard = ({ notif, currentUser }: { notif: Notification, currentUser: UserProfile }) => {
    
    const handleDeny = async () => {
        const ticketRef = doc(firestore, 'tickets', notif.context!.ticketId);
        await updateDoc(ticketRef, { status: 'In Progress' });
        const notifRef = doc(firestore, 'notifications', notif.id);
        await deleteDoc(notifRef);
    };

    const handleAccept = async () => {
        const { ticketId, finalPrice, assignedToId } = notif.context!;
        const siteCharge = finalPrice * 0.05;
        const totalCost = finalPrice + siteCharge;

        if (currentUser.balance < totalCost) {
            alert("Insufficient balance.");
            return;
        }

        try {
            await runTransaction(firestore, async (transaction) => {
                const residentRef = doc(firestore, 'users', currentUser.uid);
                const staffRef = doc(firestore, 'users', assignedToId);
                const ticketRef = doc(firestore, 'tickets', ticketId);
                const notifRef = doc(firestore, 'notifications', notif.id);

                const residentDoc = await transaction.get(residentRef);
                const staffDoc = await transaction.get(staffRef);
                if (!residentDoc.exists() || !staffDoc.exists()) throw new Error("User or Staff not found");

                const residentPrevBalance = residentDoc.data().balance || 0;
                const staffPrevBalance = staffDoc.data().balance || 0;
                const residentNewBalance = residentPrevBalance - totalCost;
                const staffNewBalance = staffPrevBalance + finalPrice;

                transaction.update(residentRef, { balance: residentNewBalance });
                transaction.update(staffRef, { balance: staffNewBalance });
                transaction.update(ticketRef, { status: 'Resolved' });
                
                const finalNotifBody = `Cost: ${finalPrice} Taka\nSite Charge: ${siteCharge.toFixed(2)} Taka\nTotal Cost: ${totalCost.toFixed(2)} Taka`;
                transaction.update(notifRef, {
                    title: `Ticket Resolved: ${notif.title.split('"')[1]}`,
                    body: finalNotifBody,
                    type: 'receipt', // Change type to a simple receipt
                    details: {
                        previousBalance: residentPrevBalance,
                        currentBalance: residentNewBalance,
                        issuedBy: notif.body.split('Assigned to: ')[1].split('\n')[0],
                    }
                });
            });
        } catch (e: any) {
            console.error("Resolution transaction failed:", e);
            alert("Failed to resolve ticket.");
        }
    };
    
    return (
      <Card className="bg-zinc-800 border-teal-500">
          <CardHeader><CardTitle>{notif.title}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-4 whitespace-pre-wrap">
              <p className="text-gray-300">{notif.body}</p>
              <div className="flex gap-4 pt-4 border-t border-zinc-700">
                  <Button onClick={handleDeny} className="w-full bg-red-600 hover:bg-red-700"><Ban className="h-4 w-4 mr-2"/> Deny</Button>
                  <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2"/> Accept</Button>
              </div>
          </CardContent>
      </Card>
    );
};


export default function NotificationsPage() {
    const { userProfile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProfile) return;
        const q = query(collection(firestore, 'notifications'), where('userId', '==', userProfile.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [userProfile]);

    useEffect(() => {
        if (!userProfile || notifications.length === 0) return;
        const unread = notifications.filter(n => !n.isRead && n.type !== 'action_required_resolution');
        if (unread.length > 0) {
            const batch = writeBatch(firestore);
            unread.forEach(notif => batch.update(doc(firestore, 'notifications', notif.id), { isRead: true }));
            batch.commit();
        }
    }, [userProfile, notifications]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Notifications</h2>
            {loading && <p>Loading notifications...</p>}
            {!loading && notifications.length === 0 && <p>You have no notifications.</p>}
            <div className="space-y-4">
                {notifications.map(notif => (
                    notif.type === 'action_required_resolution' && userProfile ? (
                        <ActionableNotificationCard key={notif.id} notif={notif} currentUser={userProfile} />
                    ) : (
                      <Card key={notif.id} className={`bg-zinc-900 border-zinc-800 ${!notif.isRead ? 'border-sky-500' : ''}`}>
                          <CardHeader>
                              <div className="flex justify-between items-center">
                                  <CardTitle>{notif.title}</CardTitle>
                                  <span className="text-xs text-gray-500">{new Date(notif.createdAt.seconds * 1000).toLocaleString()}</span>
                              </div>
                          </CardHeader>
                          <CardContent className="text-sm space-y-3 whitespace-pre-wrap">
                              <p className="text-gray-300">{notif.body}</p>
                              {notif.details && (
                                <div className="text-xs text-gray-400 border-t border-zinc-700 pt-3">
                                    <p>Previous Balance: {notif.details.previousBalance} Taka</p>
                                    <p>Current Balance: {notif.details.currentBalance} Taka</p>
                                    <p>Issued by: {notif.details.issuedBy}</p>
                                </div>
                              )}
                          </CardContent>
                      </Card>
                    )
                ))}
            </div>
        </div>
    );
}