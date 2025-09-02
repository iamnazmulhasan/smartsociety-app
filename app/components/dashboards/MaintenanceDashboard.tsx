// /app/components/dashboards/MaintenanceDashboard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wrench, ListChecks, Star } from "lucide-react";
import { UserProfile } from "@/hooks/useAuth"; // Import the UserProfile type

// Define the props for the component
interface MaintenanceDashboardProps {
  profile: UserProfile & { ratingCount?: number; totalStars?: number };
}

export default function MaintenanceDashboard({ profile }: MaintenanceDashboardProps) {
  // Calculate the average rating
  const ratingCount = profile.ratingCount || 0;
  const totalStars = profile.totalStars || 0;
  const averageRating = ratingCount > 0 ? (totalStars / ratingCount).toFixed(2) : "N/A";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Maintenance Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting your attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Great work!</p>
          </CardContent>
        </Card>
        {/* New Rating Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
            <p className="text-xs text-muted-foreground">Based on {ratingCount} reviews</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}