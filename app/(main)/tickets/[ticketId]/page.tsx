"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, Timestamp, updateDoc, collection, addDoc, serverTimestamp, deleteDoc, writeBatch } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, X, CreditCard, Play, Check, Ban } from "lucide-react";
import CommentSection from "@/components/dashboards/CommentSection";
import StaffActionPanel from "@/components/dashboards/StaffActionPanel";
import OfferList from "@/components/dashboards/OfferList";

interface TicketDetails {
  id: string; residentId: string; residentName: string; serviceCategory: string; serviceType: string; description: string; urgency: string;
  status: 'Pending' | 'Awaiting Resident' | 'Assigned' | 'In Progress' | 'Pending Approval' | 'Resolved' | 'Cancelled';
  createdAt: Timestamp; assignedToName?: string; assignedToId?: string; assignedToPhone?: string; finalPrice?: number;
  resolutionNotificationId?: string; 
}

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { ticketId } = params;
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    const docRef = doc(firestore, "tickets", ticketId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTicket({ id: docSnap.id, ...docSnap.data() } as TicketDetails);
      } else {
        console.error("No such ticket document!");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ticketId]);

  const handleCancelNegotiation = async () => {
    if (!confirm("Are you sure you want to cancel all negotiations and revert this ticket to Pending?")) return;
    const ticketRef = doc(firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, { status: 'Pending' });
  };
  
  const handleStartWork = async () => {
    const ticketRef = doc(firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, { status: 'In Progress' });
  };

  const handleMarkAsResolved = async () => {
    if (!ticket || !userProfile) return;
    const ticketRef = doc(firestore, 'tickets', ticketId);
    const notifRef = doc(collection(firestore, "notifications"));

    // Using a batch write to perform multiple operations at once
    const batch = writeBatch(firestore);
    batch.update(ticketRef, { status: 'Pending Approval', resolutionNotificationId: notifRef.id });
    
    const notifBody = `Service Type: ${ticket.serviceType}\nAssigned to: ${ticket.assignedToName}\nPhone no: ${ticket.assignedToPhone}\nCost: ${ticket.finalPrice} Taka\nThe staff has set this ticket as resolved. Please review and take action.`;
    batch.set(notifRef, {
        userId: ticket.residentId,
        title: `Action Required: Ticket "${ticket.serviceCategory}"`,
        body: notifBody,
        isRead: false,
        createdAt: serverTimestamp(),
        link: `/tickets/${ticket.id}`,
        type: 'action_required_resolution',
        context: {
            ticketId: ticket.id,
        }
    });
    await batch.commit();
  };

  const handleDenyResolution = async () => {
    if (!ticket) return;
    const ticketRef = doc(firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, { status: 'In Progress' });
    if (ticket.resolutionNotificationId) {
        const notifRef = doc(firestore, 'notifications', ticket.resolutionNotificationId);
        await deleteDoc(notifRef);
    }
  };

  // This function now securely creates a payment request for an admin
  const handleAcceptResolution = async () => {
    if (!ticket || !userProfile || !ticket.finalPrice || !ticket.assignedToId) return;

    const siteCharge = ticket.finalPrice * 0.05;
    const totalCost = ticket.finalPrice + siteCharge;

    if (userProfile.balance < totalCost) {
        alert("Insufficient balance to complete this transaction.");
        return;
    }

    try {
        const batch = writeBatch(firestore);
        const ticketRef = doc(firestore, 'tickets', ticketId);
        batch.update(ticketRef, { status: 'Resolved' });

        const transRef = doc(collection(firestore, "transactions"));
        batch.set(transRef, {
            type: 'ticket-payment',
            status: 'Pending',
            createdAt: serverTimestamp(),
            residentId: ticket.residentId,
            residentName: ticket.residentName,
            staffId: ticket.assignedToId,
            staffName: ticket.assignedToName,
            ticketId: ticket.id,
            serviceCategory: ticket.serviceCategory,
            finalPrice: ticket.finalPrice,
            siteCharge: siteCharge,
            totalCost: totalCost
        });

        if (ticket.resolutionNotificationId) {
            const notifRef = doc(firestore, 'notifications', ticket.resolutionNotificationId);
            const finalNotifBody = `Cost: ${ticket.finalPrice} Taka\nSite Charge: ${siteCharge.toFixed(2)} Taka\nTotal Cost: ${totalCost.toFixed(2)} Taka`;
            batch.update(notifRef, {
                title: `Ticket Payment Pending: ${ticket.serviceCategory}`,
                body: finalNotifBody,
                type: 'receipt', // Update the notification to a permanent receipt
                details: { issuedBy: ticket.assignedToName }
            });
        }
        await batch.commit();
    } catch (e: any) {
        console.error("Resolution failed:", e);
        alert("Failed to accept resolution. Please try again.");
    }
  };

  const getStatusColor = (status: TicketDetails['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-500'; case 'Awaiting Resident': return 'bg-orange-500'; case 'Assigned': return 'bg-blue-500';
        case 'In Progress': return 'bg-purple-500'; case 'Pending Approval': return 'bg-teal-500';
        case 'Resolved': return 'bg-green-500'; case 'Cancelled': return 'bg-red-500'; default: return 'bg-gray-500';
    }
  };

  if (loading || !userProfile) return <div className="text-center">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center">Ticket not found.</div>;

  const isResidentOwner = userProfile.role === 'Resident' && userProfile.uid === ticket.residentId;
  const isStaff = userProfile.role === 'Maintenance Staff';
  const isAssignedStaff = isStaff && userProfile.uid === ticket.assignedToId;

  const showOfferPanel = (isResidentOwner || isStaff) && ticket.status === 'Awaiting Resident';
  const showStaffActionPanel = isStaff && ticket.status === 'Pending';
  const showStartWorkButton = isAssignedStaff && ticket.status === 'Assigned';
  const showMarkAsResolvedButton = isAssignedStaff && ticket.status === 'In Progress';
  const showResidentApprovalPanel = isResidentOwner && ticket.status === 'Pending Approval';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
            <div className="flex justify-between items-start">
              <div><CardTitle className="text-2xl font-bold">{ticket.serviceCategory}</CardTitle><p className="text-sm text-gray-400">Created on {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}</p></div>
              <div className="flex items-center gap-2"><Badge className={`text-base ${getStatusColor(ticket.status)}`}>{ticket.status}</Badge>{ticket.status === 'Awaiting Resident' && (<Button size="sm" variant="destructive" onClick={handleCancelNegotiation}><X className="h-4 w-4 mr-1"/> Cancel</Button>)}</div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div><h4 className="font-semibold text-gray-300">Description</h4><p className="text-gray-400 bg-zinc-800 p-2 rounded-none">{ticket.description}</p></div>
            <div className="grid grid-cols-2 gap-4">
                <div><h4 className="font-semibold text-gray-300">Service Type</h4><p className="text-gray-400">{ticket.serviceType}</p></div>
                <div><h4 className="font-semibold text-gray-300">Urgency</h4><p className="text-gray-400">{ticket.urgency}</p></div>
            </div>
            {ticket.assignedToName && (
                <div className="border-t border-zinc-700 pt-4">
                <h4 className="font-semibold text-gray-300 mb-2">Assigned To</h4>
                <div className="flex flex-col gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><User size={16}/> {ticket.assignedToName}</div>
                    <div className="flex items-center gap-2"><Phone size={16}/> {ticket.assignedToPhone}</div>
                    {ticket.finalPrice != null && (<div className="flex items-center gap-2 font-bold"><CreditCard size={16}/> Cost: {ticket.finalPrice} Taka</div>)}
                </div>
                </div>
            )}
            {showStartWorkButton && (<div className="border-t border-zinc-700 pt-4"><Button onClick={handleStartWork} className="w-full bg-purple-600 hover:bg-purple-700"><Play className="h-4 w-4 mr-2"/> Start Work</Button></div>)}
            {showMarkAsResolvedButton && (<div className="border-t border-zinc-700 pt-4"><Button onClick={handleMarkAsResolved} className="w-full bg-teal-600 hover:bg-teal-700"><Check className="h-4 w-4 mr-2"/> Mark as Complete</Button></div>)}
            {showResidentApprovalPanel && (
                <div className="border-t border-zinc-700 pt-4 space-y-3">
                    <h4 className="font-bold text-center text-amber-400">Action Required</h4>
                    <p className="text-sm text-center text-gray-400">The assigned staff has marked this service as complete. Please confirm the work has been finished to your satisfaction.</p>
                    <div className="flex gap-4">
                        <Button onClick={handleDenyResolution} className="w-full bg-red-600 hover:bg-red-700"><Ban className="h-4 w-4 mr-2"/> Deny</Button>
                        <Button onClick={handleAcceptResolution} className="w-full bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-2"/> Accept & Finalize</Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      {showOfferPanel && <OfferList ticketId={ticket.id} residentName={ticket.residentName} />}
      {showStaffActionPanel && <StaffActionPanel ticketId={ticket.id} staffProfile={userProfile} />}
      <CommentSection ticketId={ticket.id} />
    </div>
  );
}