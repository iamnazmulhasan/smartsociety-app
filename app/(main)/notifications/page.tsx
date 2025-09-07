// /app/(main)/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, writeBatch } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Ban } from "lucide-react";
import Link from "next/link";
import { acceptResolution, denyResolution } from "@/lib/actions/ticketActions";

interface Notification {
    id: string;
    userId: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: Timestamp;
    type?: 'ticket-approval' | 'transaction';
    isActionable?: boolean;
    link?: string;
    details?: {
        previousBalance: number;
        currentBalance: number;
        issuedBy: string;
    };
    context?: {
        ticketId: string;
        residentId: string; // <<< THE FIX IS HERE
        serviceCategory: string;
        serviceType: string;
        assignedToName: string;
        assignedToId: string;
        assignedToPhone: string;
        finalPrice: number;
        resolutionNotificationId?: string;
    };
}

const ActionableNotificationCard = ({ notif, currentUser }: { notif: Notification, currentUser: UserProfile }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDeny = async () => {
        if (!notif.context) return;
        setIsProcessing(true);
        try {
            const ticketContext = { ...notif.context, id: notif.context.ticketId, resolutionNotificationId: notif.id };
            await denyResolution(ticketContext);
        } catch (e: any) {
            alert(`Failed to deny: ${e.message}`);
            setIsProcessing(false);
        }
    };

    const handleAccept = async () => {
        if (!notif.context) return;
        setIsProcessing(true);
        try {
            const ticketContext = { ...notif.context, id: notif.context.ticketId, resolutionNotificationId: notif.id };
            await acceptResolution(ticketContext, currentUser);
            alert("Payment successful and ticket resolved!");
        } catch (e: any) {
            console.error("Resolution transaction failed:", e);
            alert(`Failed to resolve ticket: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
      // <<< CSS FIX IS HERE: Removed the conflicting 'border-zinc-800' class
      <Card className="bg-zinc-900 border-teal-500">
          <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{notif.title}</CardTitle>
                <span className="text-xs text-gray-500">{new Date(notif.createdAt.seconds * 1000).toLocaleString()}</span>
              </div>
          </CardHeader>
          <CardContent className="text-sm space-y-4 whitespace-pre-wrap">
              <p className="text-gray-300">{notif.body}</p>
              {notif.context && (
                  <div className="text-xs text-gray-400 border-t border-zinc-700 pt-3">
                     <p>Service: {notif.context.serviceType}</p>
                     <p>Staff: {notif.context.assignedToName} ({notif.context.assignedToPhone})</p>
                     <p className="font-bold">Cost: {notif.context.finalPrice} Taka</p>
                  </div>
              )}
              <div className="flex gap-4 pt-4 border-t border-zinc-700">
                  <Button onClick={handleDeny} disabled={isProcessing} className="w-full bg-red-600 hover:bg-red-700"><Ban className="h-4 w-4 mr-2"/> Deny</Button>
                  <Button onClick={handleAccept} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2"/> Accept & Pay</Button>
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
        const unread = notifications.filter(n => !n.isRead);
        if (unread.length > 0) {
            const batch = writeBatch(firestore);
            unread.forEach(notif => batch.update(doc(firestore, 'notifications', notif.id), { isRead: true }));
            batch.commit().catch(err => console.error("Failed to mark notifications as read:", err));
        }
    }, [userProfile, notifications]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Notifications</h2>
            {loading && <p>Loading notifications...</p>}
            {!loading && notifications.length === 0 && <p>You have no notifications.</p>}
            <div className="space-y-4">
                {notifications.map(notif => {
                    if (notif.type === 'ticket-approval' && notif.isActionable && userProfile) {
                        return <ActionableNotificationCard key={notif.id} notif={notif} currentUser={userProfile} />;
                    }

                    return (
                        <Card key={notif.id} className={`bg-zinc-900 border-zinc-800 ${!notif.isRead ? 'border-sky-500' : ''}`}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{notif.title}</CardTitle>
                                    <span className="text-xs text-gray-500">{new Date(notif.createdAt.seconds * 1000).toLocaleString()}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3 whitespace-pre-wrap">
                                <p className="text-gray-300">{notif.body}</p>
                                {notif.details && (
                                    <div className="text-xs text-gray-400 border-t border-zinc-700 pt-3">
                                        <p>Previous Balance: {notif.details.previousBalance.toFixed(2)} Taka</p>
                                        <p>Current Balance: {notif.details.currentBalance.toFixed(2)} Taka</p>
                                        <p>Issued by: {notif.details.issuedBy}</p>
                                    </div>
                                )}
                                {notif.link && <Link href={notif.link} className="text-sky-400 hover:underline text-xs pt-2 inline-block">View Details</Link>}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}