"use client"; // Add this line if it's not already there

import { useRouter } from 'next/navigation'; // Import the router
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Building2 } from "lucide-react";
import TicketList from './TicketList';

export default function ResidentDashboard() {
  const router = useRouter(); // Initialize the router

  const handleCreateTicketClick = () => {
    router.push('/tickets/new'); // Navigate to the new ticket page
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          {/* We've replaced the Link with a Button that has an onClick handler */}
          <Button 
            onClick={handleCreateTicketClick}
            className="w-full justify-start bg-sky-700 hover:bg-sky-800 text-white"
          >
            <FilePlus2 className="mr-2 h-4 w-4" /> Create New Service Ticket
          </Button>
          
          <Button className="w-full justify-start" variant="secondary">
            <Building2 className="mr-2 h-4 w-4" /> Book a Facility
          </Button>
        </CardContent>
      </Card>
      
      <TicketList />
    </div>
  );
}