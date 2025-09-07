"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, Wrench, ChevronDown } from "lucide-react";
import Link from "next/link"; // Import Link for navigation

interface AdminTicket {
  id: string;
  residentName: string;
  serviceCategory: string;
  status: 'Pending' | 'Awaiting Resident' | 'Assigned' | 'In Progress' | 'Resolved' | 'Cancelled';
  assignedToName?: string;
  createdAt: Timestamp;
}

const TicketCard = ({ ticket, onDelete }: { ticket: AdminTicket, onDelete: (id: string) => void }) => {
  const getStatusColor = (status: AdminTicket['status']) => {
    // ... (status color logic remains the same)
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'Awaiting Resident': return 'bg-orange-500';
      case 'Assigned': return 'bg-blue-500';
      case 'In Progress': return 'bg-purple-500';
      case 'Resolved': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    // The Link component makes the entire card clickable
    <Link href={`/tickets/${ticket.id}`}>
        <Card className="bg-zinc-800 border-zinc-700 w-full transition-colors hover:border-zinc-500">
            <CardContent className="p-3">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-base">{ticket.serviceCategory}</h4>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </div>
                <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <p className="flex items-center gap-2"><User size={12} /> {ticket.residentName}</p>
                    {ticket.assignedToName && <p className="flex items-center gap-2"><Wrench size={12} /> {ticket.assignedToName}</p>}
                </div>
                <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-gray-500">
                        {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                    {/* The delete button is now outside the link to prevent navigation */}
                    <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={(e) => {
                            e.preventDefault(); // Stop the link from navigating
                            onDelete(ticket.id);
                        }}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
};

export default function AdminDashboard() {
  const [ticketsByStatus, setTicketsByStatus] = useState<Record<string, AdminTicket[]>>({});
  const [loading, setLoading] = useState(true);
  // State to track which accordion is open. 'Pending' is open by default.
  const [openAccordion, setOpenAccordion] = useState<string | null>('Pending');

  useEffect(() => {
    const ticketsRef = collection(firestore, "tickets");
    const q = query(ticketsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTickets: AdminTicket[] = [];
      snapshot.forEach(doc => {
        allTickets.push({ id: doc.id, ...doc.data() } as AdminTicket);
      });

      const grouped = allTickets.reduce((acc, ticket) => {
        const { status } = ticket;
        if (!acc[status]) acc[status] = [];
        acc[status].push(ticket);
        return acc;
      }, {} as Record<string, AdminTicket[]>);
      
      setTicketsByStatus(grouped);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to permanently delete this ticket?")) return;
    try {
      await deleteDoc(doc(firestore, "tickets", ticketId));
    } catch (error) {
      console.error("Error deleting ticket:", error);
      alert("Failed to delete ticket.");
    }
  };
  
  const handleAccordionClick = (status: string) => {
    setOpenAccordion(openAccordion === status ? null : status);
  };

  const statusOrder = ['Pending', 'Awaiting Resident', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'];

  if (loading) {
    return <div>Loading all tickets...</div>;
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold mb-6">All Tickets</h2>
        <div className="accordion-container space-y-2">
          {statusOrder.map(status => {
            const tickets = ticketsByStatus[status] || [];
            const isOpen = openAccordion === status;
            return (
              <div key={status} className="accordion-item bg-zinc-900 rounded-lg">
                <button
                  onClick={() => handleAccordionClick(status)}
                  className="accordion-button"
                >
                  <span className="font-semibold text-white">{status} ({tickets.length})</span>
                  <ChevronDown className={`chevron ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <div className="p-4 space-y-3">
                    {tickets.length > 0 ? (
                      tickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} onDelete={handleDeleteTicket} />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No tickets in this category.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .accordion-button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          text-align: left;
          background-color: #27272a; /* zinc-800 */
          border: none;
          cursor: pointer;
          border-radius: 0.5rem;
          transition: background-color 0.2s ease-in-out;
        }
        .accordion-button:hover {
          background-color: #3f3f46; /* zinc-700 */
        }
        .chevron {
          transition: transform 0.3s ease-in-out;
          color: #a1a1aa; /* zinc-400 */
        }
        .chevron.rotate-180 {
          transform: rotate(180deg);
        }
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .accordion-content.open {
          max-height: 2000px; /* A large value to allow content to expand */
        }
      `}</style>
    </>
  );
}