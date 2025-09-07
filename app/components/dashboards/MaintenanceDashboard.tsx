// /app/components/dashboards/MaintenanceDashboard.tsx
"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { UserProfile } from '@/hooks/useAuth';
import StaffTicketList, { Ticket } from './StaffTicketList'; // Import the new component and type

interface MaintenanceDashboardProps {
  profile: UserProfile;
}

export default function MaintenanceDashboard({ profile }: MaintenanceDashboardProps) {
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<Ticket[]>([]); // State for resolved tickets

  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [loadingResolved, setLoadingResolved] = useState(true); // Loading state for resolved tickets

  // Effect for Available Tickets
  useEffect(() => {
    if (!profile?.serviceCategory || !profile?.location?.district) return;

    const ticketsRef = collection(firestore, 'tickets');
    const q = query(
      ticketsRef,
      where('status', 'in', ['Pending', 'Awaiting Resident']),
      where('serviceCategory', '==', profile.serviceCategory),
      where('residentAddress.district', '==', profile.location.district),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setAvailableTickets(ticketsData);
      setLoadingAvailable(false);
    });

    return () => unsubscribe();
  }, [profile]);

  // Effect for Assigned Tickets
  useEffect(() => {
    if (!profile?.uid) return;
    const ticketsRef = collection(firestore, 'tickets');
    const q = query(
      ticketsRef,
      where('assignedToId', '==', profile.uid),
      where('status', 'in', ['Assigned', 'In Progress', 'Pending Approval']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setAssignedTickets(ticketsData);
      setLoadingAssigned(false);
    });

    return () => unsubscribe();
  }, [profile]);

  // NEW: Effect for Resolved Tickets
  useEffect(() => {
    if (!profile?.uid) return;
    const ticketsRef = collection(firestore, 'tickets');
    const q = query(
      ticketsRef,
      where('assignedToId', '==', profile.uid), // Tickets assigned to THIS staff member
      where('status', '==', 'Resolved'),       // That have a "Resolved" status
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setResolvedTickets(ticketsData);
      setLoadingResolved(false);
    });

    return () => unsubscribe();
  }, [profile]);

  return (
    <div className="space-y-8">
      <StaffTicketList
        title="Available Service Tickets"
        tickets={availableTickets}
        loading={loadingAvailable}
        emptyMessage="No available tickets matching your service and location."
      />
      <StaffTicketList
        title="My Assigned Tickets"
        tickets={assignedTickets}
        loading={loadingAssigned}
        emptyMessage="You have no tickets currently assigned to you."
      />
      <StaffTicketList
        title="My Resolved Tickets"
        tickets={resolvedTickets}
        loading={loadingResolved}
        emptyMessage="You have no resolved tickets yet."
      />
    </div>
  );
}