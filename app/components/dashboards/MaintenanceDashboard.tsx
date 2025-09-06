import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from './TicketList';

interface MaintenanceDashboardProps {
  profile: UserProfile;
}

const getUrgencyColor = (urgency: Ticket['urgency']) => {
  switch (urgency) {
    case 'Low': return 'bg-green-600';
    case 'Medium': return 'bg-yellow-500';
    case 'High': return 'bg-orange-500';
    case 'Emergency': return 'bg-red-600';
    default: return 'bg-gray-500';
  }
};

const AssignedTicketList = ({ staffId }: { staffId: string }) => {
    const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ticketsRef = collection(firestore, 'tickets');
        const q = query(
            ticketsRef,
            where('assignedToId', '==', staffId),
            where('status', 'in', ['Assigned', 'In Progress'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tickets: Ticket[] = [];
            snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() } as Ticket));
            setAssignedTickets(tickets);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [staffId]);
    
    return (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
             {loading ? <p>Loading assigned tickets...</p> : assignedTickets.length > 0 ? (
                 <div className="space-y-4">
                     {assignedTickets.map((ticket) => (
                         <Link href={`/tickets/${ticket.id}`} key={ticket.id}>
                           <div className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg transition-colors hover:bg-zinc-700 cursor-pointer">
                               <div>
                                 <p className="font-semibold text-white">{ticket.serviceCategory}</p>
                                 <p className="text-xs text-gray-400">Status: {ticket.status}</p>
                               </div>
                               <Badge className={getUrgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>
                           </div>
                         </Link>
                     ))}
                 </div>
             ) : (
                 <p>You have no tickets currently assigned to you.</p>
             )}
          </CardContent>
        </Card>
    );
};

export default function MaintenanceDashboard({ profile }: MaintenanceDashboardProps) {
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.serviceCategory || !profile?.location?.district) return;
    const ticketsRef = collection(firestore, 'tickets');
    const q = query(
      ticketsRef,
      where('status', 'in', ['Pending', 'Awaiting Resident']),
      where('serviceCategory', '==', profile.serviceCategory),
      where('residentAddress.district', '==', profile.location.district)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tickets: Ticket[] = [];
      snapshot.forEach((doc) => tickets.push({ id: doc.id, ...doc.data() } as Ticket));
      setAvailableTickets(tickets);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [profile]);

  return (
    // --- LAYOUT REORDERED HERE ---
    <div className="space-y-8">
      {/* 1. Available Tickets Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Available Service Tickets</h2>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            {loading ? <p>Loading available tickets...</p> : availableTickets.length > 0 ? (
              <div className="space-y-4">
                {availableTickets.map((ticket) => (
                  <Link href={`/tickets/${ticket.id}`} key={ticket.id}>
                    <div className="flex justify-between items-center bg-zinc-800 p-3 rounded-lg transition-colors hover:bg-zinc-700 cursor-pointer">
                      <div>
                        <p className="font-semibold text-white">{ticket.serviceCategory}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(ticket.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getUrgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No available tickets matching your service and location.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Assigned Tickets Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4">My Assigned Tickets</h2>
        <AssignedTicketList staffId={profile.uid} />
      </div>

      {/* 3. Resolved Tickets Section */}
      <div>
        <h2 className="text-3xl font-bold mb-4">My Resolved Tickets</h2>
        <Card className="bg-zinc-900 border-zinc-800">
           <CardContent className="pt-6">
             <p className="text-sm text-muted-foreground">You have no resolved tickets yet.</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}