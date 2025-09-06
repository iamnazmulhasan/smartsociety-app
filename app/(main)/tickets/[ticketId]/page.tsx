"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, X, CreditCard, Play } from "lucide-react"; // Import Play icon
import CommentSection from "@/components/dashboards/CommentSection";
import StaffActionPanel from "@/components/dashboards/StaffActionPanel";
import OfferList from "@/components/dashboards/OfferList";

// ADD 'In Progress' to the status list
interface TicketDetails {
  id: string;
  residentName: string;
  serviceCategory: string;
  serviceType: string;
  description: string;
  urgency: string;
  status: 'Pending' | 'Awaiting Resident' | 'Assigned' | 'In Progress' | 'Resolved' | 'Cancelled';
  createdAt: Timestamp;
  assignedToName?: string;
  assignedToId?: string; // We need this to check who the ticket is assigned to
  assignedToPhone?: string;
  finalPrice?: number;
}

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { ticketId } = params;
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
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
    }
  }, [ticketId]);
  
  const handleCancelNegotiation = async () => {
    if (!confirm("Are you sure you want to cancel all negotiations and revert this ticket to Pending?")) return;
    const ticketRef = doc(firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, { status: 'Pending' });
  };
  
  // NEW function for staff to start the work
  const handleStartWork = async () => {
    const ticketRef = doc(firestore, 'tickets', ticketId);
    await updateDoc(ticketRef, { status: 'In Progress' });
  };


  const getStatusColor = (status: TicketDetails['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-500';
        case 'Awaiting Resident': return 'bg-orange-500';
        case 'Assigned': return 'bg-blue-500';
        case 'In Progress': return 'bg-purple-500'; // Added new color
        case 'Resolved': return 'bg-green-500';
        case 'Cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
  };

  if (loading || !userProfile) {
    return <div className="text-center">Loading ticket details...</div>;
  }
  if (!ticket) {
    return <div className="text-center">Ticket not found.</div>;
  }

  const isResidentOwner = userProfile.role === 'Resident';
  const isStaff = userProfile.role === 'Maintenance Staff';
  const isAssignedStaff = isStaff && userProfile.uid === ticket.assignedToId;

  const showOfferPanel = (isResidentOwner || isStaff) && ticket.status === 'Awaiting Resident';
  const showStaffActionPanel = isStaff && ticket.status === 'Pending';
  const showStartWorkButton = isAssignedStaff && ticket.status === 'Assigned';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{ticket.serviceCategory}</CardTitle>
              <p className="text-sm text-gray-400">
                Created on {new Date(ticket.createdAt.seconds * 1000).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-base ${getStatusColor(ticket.status)}`}>{ticket.status}</Badge>
              {ticket.status === 'Awaiting Resident' && (
                <Button size="sm" variant="destructive" onClick={handleCancelNegotiation}>
                  <X className="h-4 w-4 mr-1"/> Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-300">Description</h4>
            <p className="text-gray-400 bg-zinc-800 p-2 rounded-none">{ticket.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-300">Service Type</h4>
              <p className="text-gray-400">{ticket.serviceType}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300">Urgency</h4>
              <p className="text-gray-400">{ticket.urgency}</p>
            </div>
          </div>
          
          {ticket.assignedToName && (
            <div className="border-t border-zinc-700 pt-4">
              <h4 className="font-semibold text-gray-300 mb-2">Assigned To</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><User size={16}/> {ticket.assignedToName}</div>
                  <div className="flex items-center gap-2"><Phone size={16}/> {ticket.assignedToPhone}</div>
                  {ticket.finalPrice && (
                    <div className="flex items-center gap-2 font-bold"><CreditCard size={16}/> Cost: {ticket.finalPrice} Taka</div>
                  )}
              </div>
            </div>
          )}
          
          {/* NEW: Show "Start Work" button for assigned staff */}
          {showStartWorkButton && (
             <div className="border-t border-zinc-700 pt-4">
               <Button onClick={handleStartWork} className="w-full bg-purple-600 hover:bg-purple-700">
                 <Play className="h-4 w-4 mr-2"/> Start Work (Set to "In Progress")
               </Button>
             </div>
          )}

        </CardContent>
      </Card>
      
      {showStaffActionPanel && <StaffActionPanel ticketId={ticket.id} staffProfile={userProfile} />}
      {showOfferPanel && <OfferList ticketId={ticket.id} residentName={ticket.residentName} />}
      <CommentSection ticketId={ticket.id} />
    </div>
  );
}