import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useAuth";
import Image from "next/image";
import { UserCircle2 } from "lucide-react";

interface ProfileSidebarProps {
  userProfile: UserProfile | null;
  loading: boolean;
}

export default function ProfileSidebar({ userProfile, loading }: ProfileSidebarProps) {
  if (loading) {
    return <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-4">Loading profile...</CardContent></Card>;
  }

  if (!userProfile) {
    return null;
  }
  
  const residentAddress = userProfile.role === 'Resident' && userProfile.address
    ? `${userProfile.address.houseNo}, ${userProfile.address.postOffice}, ${userProfile.address.upazila}, ${userProfile.address.district}`
    : null;

  const staffLocation = userProfile.role === 'Maintenance Staff' && userProfile.location
    ? `Service Location: ${userProfile.location.upazila}, ${userProfile.location.district}`
    : null;

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-center">
      <CardContent className="p-6">
        <div className="relative w-20 h-20 mx-auto mb-4">
          {userProfile.imageUrl ? (
            <Image
              src={userProfile.imageUrl}
              alt="Profile Picture"
              layout="fill"
              className="rounded-full object-cover"
            />
          ) : (
            <UserCircle2 className="w-20 h-20 text-gray-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-white">{userProfile.fullName}</h3>
        <p className="text-sm text-muted-foreground mb-2">{userProfile.role}</p>

        {/* Conditionally render address or location */}
        {residentAddress && <p className="text-xs text-gray-400">{residentAddress}</p>}
        {staffLocation && <p className="text-xs text-gray-400">{staffLocation}</p>}
      </CardContent>
    </Card>
  );
}