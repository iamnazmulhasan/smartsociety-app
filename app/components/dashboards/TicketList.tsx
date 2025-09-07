"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// This interface now includes the 'Pending Approval' status
export interface Ticket {
  id: string;
  serviceCategory: string;
  status: 'Pending' | 'Awaiting Resident' | 'Assigned' | 'In Progress' | 'Pending Approval' | 'Resolved' | 'Cancelled';
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  createdAt: Timestamp;
}

// The color helper is also updated with the new status
const getStatusColor = (status: Ticket['status']) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500';
    case 'Awaiting Resident': return 'bg-orange-500';
    case 'Assigned': return 'bg-blue-500';
    case 'In Progress': return 'bg-purple-500';
    case 'Pending Approval': return 'bg-teal-500'; // Added new color for the new status
    case 'Resolved': return 'bg-green-500';
    case 'Cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export default function TicketList() {
  const { userProfile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const ticketsRef = collection(firestore, "tickets");
    const q = query(
      ticketsRef,
      where("residentId", "==", userProfile.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userTickets: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        userTickets.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(userTickets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading tickets...</p>;
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>My Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no recent tickets.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link href={`/tickets/${ticket.id}`} key={ticket.id}>
                <div className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg transition-colors hover:bg-zinc-700 cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">{ticket.serviceCategory}</p>
                    <p className="text-xs text-gray-400">
                      Created on: {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}