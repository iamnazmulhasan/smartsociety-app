// /app/components/dashboards/StaffTicketList.tsx
"use client";

import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timestamp } from "firebase/firestore";

export interface Ticket {
  id: string;
  serviceCategory: string;
  status: 'Pending' | 'Awaiting Resident' | 'Assigned' | 'In Progress' | 'Pending Approval' | 'Resolved' | 'Cancelled';
  urgency?: 'Low' | 'Medium' | 'High' | 'Emergency';
  createdAt: Timestamp;
}

const getStatusColor = (status: Ticket['status']) => {
  switch (status) {
    case 'Pending': return 'bg-yellow-500';
    case 'Awaiting Resident': return 'bg-orange-500';
    case 'Assigned': return 'bg-blue-500';
    case 'In Progress': return 'bg-purple-500';
    case 'Pending Approval': return 'bg-teal-500';
    case 'Resolved': return 'bg-green-500';
    case 'Cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// This helper function was added to fix the variant error
const getUrgencyColor = (urgency: Ticket['urgency']) => {
  switch (urgency) {
    case 'Low': return 'bg-green-600';
    case 'Medium': return 'bg-yellow-500';
    case 'High': return 'bg-orange-500';
    case 'Emergency': return 'bg-red-600';
    default: return 'bg-gray-500';
  }
};


interface StaffTicketListProps {
  title: string;
  tickets: Ticket[];
  loading: boolean;
  emptyMessage: string;
}

export default function StaffTicketList({ title, tickets, loading, emptyMessage }: StaffTicketListProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
                    <div className="flex items-center gap-2">
                        {/* THE FIX IS HERE: Using className instead of variant */}
                        {ticket.urgency && <Badge className={getUrgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>}
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}