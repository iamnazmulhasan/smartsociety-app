// /app/(main)/me/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Wallet, Calendar, MapPin, Building, Wrench, Star, FileText } from "lucide-react";

// Helper to format the address
const formatAddress = (address: { houseNo: string, postOffice: string, upazila: string, district: string }) => {
    return `${address.houseNo}, ${address.postOffice}, ${address.upazila}, ${address.district}`;
};

// Helper to format the location
const formatLocation = (location: { upazila: string, district: string }) => {
    return `${location.upazila}, ${location.district}`;
};

export default function MePage() {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return <div className="text-center text-gray-400">Loading your profile...</div>;
    }

    if (!userProfile) {
        return <div className="text-center text-red-400">Could not load profile. Please try again.</div>;
    }

    // Get a list of enabled payment methods for Admins
    const paymentMethods = userProfile.role === 'Administrator' && userProfile.paymentMethods
        ? Object.entries(userProfile.paymentMethods)
                .filter(([, isEnabled]) => isEnabled)
                .map(([method]) => method)
                .join(', ')
        : null;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">My Profile</h2>
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold">{userProfile.fullName}</CardTitle>
                    <Badge className="bg-sky-600">{userProfile.role}</Badge>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    {/* --- General Information --- */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">General Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400"/><span>{userProfile.email}</span></div>
                            <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400"/><span>{userProfile.phoneNumber}</span></div>
                            <div className="flex items-center gap-3"><Wallet size={16} className="text-gray-400"/><span className="font-bold text-green-400">{userProfile.balance.toFixed(2)} Taka</span></div>
                            <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-400"/><span>Member since {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}</span></div>
                        </div>
                    </div>

                    {/* --- Resident-Specific Details --- */}
                    {userProfile.role === 'Resident' && userProfile.address && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">My Address</h3>
                            <div className="flex items-center gap-3 text-sm"><Building size={16} className="text-gray-400"/><span>{formatAddress(userProfile.address)}</span></div>
                        </div>
                    )}

                    {/* --- Maintenance Staff-Specific Details --- */}
                    {userProfile.role === 'Maintenance Staff' && (
                         <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">Professional Details</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3"><Wrench size={16} className="text-gray-400"/><span>Service: {userProfile.serviceCategory}</span></div>
                                {userProfile.location && <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-400"/><span>Location: {formatLocation(userProfile.location)}</span></div>}
                                <div className="flex items-center gap-3"><Star size={16} className="text-gray-400"/><span>Experience: {userProfile.experience} years</span></div>
                                <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400"/><span>NID: {userProfile.nid}</span></div>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Administrator-Specific Details --- */}
                    {userProfile.role === 'Administrator' && paymentMethods && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-300 border-b border-zinc-700 pb-2">Configuration</h3>
                            <div className="flex items-center gap-3 text-sm"><Wallet size={16} className="text-gray-400"/><span>Payment Methods: {paymentMethods}</span></div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}