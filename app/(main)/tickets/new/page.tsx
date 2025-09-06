"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Lists of options for our form
const serviceCategories = [
  "Plumbing", "Electrical", "AC Service", "Gas Line Service", 
  "Carpentry", "Painting", "Pest Control", "Appliance Repair", "Internet/Cable Issue"
];
const serviceTypes = ["Repair", "Installation", "Inspection", "Replacement"];
const urgencyLevels = ["Low", "Medium", "High", "Emergency"];

export default function NewTicketPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  
  // Form state
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceCategory || !serviceType || !description || !urgency) {
      setError("Please fill out all fields.");
      return;
    }
    if (!userProfile) {
      setError("You must be logged in to create a ticket.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a new document in the "tickets" collection
      await addDoc(collection(firestore, "tickets"), {
        residentId: userProfile.uid,
        residentName: userProfile.fullName,
        residentAddress: userProfile.address,
        serviceCategory,
        serviceType,
        description,
        urgency,
        status: "Pending", // Initial status
        createdAt: serverTimestamp(),
        // We will add fields like 'assignedTo', 'price', etc. later
      });
      
      // Redirect to the dashboard on success
      router.push("/dashboard");

    } catch (err) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a New Service Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Service Category Selection */}
            <div>
              <Label className="text-base font-semibold">Service Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat} type="button"
                    onClick={() => setServiceCategory(cat)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      serviceCategory === cat 
                      ? 'bg-sky-700 text-white border-sky-700' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Service Type Selection */}
            <div>
              <Label className="text-base font-semibold">Type of Service</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {serviceTypes.map((type) => (
                   <button
                    key={type} type="button"
                    onClick={() => setServiceType(type)}
                    className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                      serviceType === type 
                      ? 'bg-sky-700 text-white border-sky-700' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
               <Label className="text-base font-semibold">Urgency Level</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                {urgencyLevels.map((level) => (
                   <button
                    key={level} type="button"
                    onClick={() => setUrgency(level)}
                    className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                      urgency === level 
                      ? 'bg-sky-700 text-white border-sky-700' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">Describe the Problem</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full mt-2 bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
                placeholder="e.g., The kitchen sink is leaking, or the AC is not cooling."
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" disabled={isSubmitting} className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold text-base py-3">
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}