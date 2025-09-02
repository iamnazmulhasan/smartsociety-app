// /app/components/dashboards/ResidentDashboard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2, Building2 } from "lucide-react";

export default function ResidentDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Resident Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button className="w-full justify-start">
              <FilePlus2 className="mr-2 h-4 w-4" /> Create New Service Ticket
            </Button>
            <Button className="w-full justify-start" variant="secondary">
              <Building2 className="mr-2 h-4 w-4" /> Book a Facility
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You have no recent tickets.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}