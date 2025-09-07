// /app/(main)/profile/[userId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, Wrench, MessageSquare } from 'lucide-react';

// Helper to format the address
const formatLocation = (location: { upazila: string, district: string }) => {
    return `${location.upazila}, ${location.district}`;
};

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { userProfile: currentUserProfile } = useAuth(); // The person who is logged in

    const userId = params.userId as string; // The ID of the profile being viewed

    const [viewedProfile, setViewedProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch the profile data for the user whose page is being viewed
    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            const userDocRef = doc(firestore, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setViewedProfile(userDocSnap.data() as UserProfile);
            } else {
                console.error("No such user found!");
            }
            setLoading(false);
        };

        fetchProfile();
    }, [userId]);

    // When the "Send Message" button is clicked
    const handleSendMessage = () => {
        // Navigate to the messaging page with a query parameter
        // to start a new conversation with this user.
        router.push(`/messaging?new=${userId}`);
    };

    if (loading) {
        return <div className="text-center text-gray-400">Loading profile...</div>;
    }

    if (!viewedProfile) {
        return <div className="text-center text-red-400">This user profile could not be found.</div>;
    }
    
    // We only show the "Send Message" button if you are logged in AND not viewing your own profile
    const showSendMessageButton = currentUserProfile && currentUserProfile.uid !== viewedProfile.uid;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">{viewedProfile.fullName}</CardTitle>
                    <Badge className="bg-sky-600">{viewedProfile.role}</Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">Public Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                           <div className="flex items-center gap-3"><User size={16} className="text-gray-400"/><span>{viewedProfile.role}</span></div>
                           <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-400"/><span>Member since {new Date(viewedProfile.createdAt.seconds * 1000).toLocaleDateString()}</span></div>
                        </div>
                    </div>

                    {/* Show professional details only for Maintenance Staff */}
                    {viewedProfile.role === 'Maintenance Staff' && (
                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">Professional Details</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3"><Wrench size={16} className="text-gray-400"/><span>Service: {viewedProfile.serviceCategory}</span></div>
                                {viewedProfile.location && <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-400"/><span>Location: {formatLocation(viewedProfile.location)}</span></div>}
                                <div className="flex items-center gap-3"><Wrench size={16} className="text-gray-400"/><span>Experience: {viewedProfile.experience} years</span></div>
                            </div>
                        </div>
                    )}
                    
                    {/* The "Send Message" button */}
                    {showSendMessageButton && (
                         <div className="border-t border-zinc-700 pt-6">
                            <Button onClick={handleSendMessage} className="w-full bg-sky-700 hover:bg-sky-800">
                                <MessageSquare size={16} className="mr-2"/> Send Message
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}