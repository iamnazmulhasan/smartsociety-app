"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { districts, upazilas } from "@/lib/data/bd-divisions";

// Define service categories for maintenance staff
const serviceCategories = [
  "Plumbing", "Electrical", "AC Service", "Gas Line Service", 
  "Carpentry", "Painting", "Pest Control", "Appliance Repair", "Internet/Cable Issue"
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  // State for resident-specific fields
  const [postOffice, setPostOffice] = useState("");
  const [houseNo, setHouseNo] = useState("");

  // State for maintenance-specific fields
  const [serviceCategory, setServiceCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [nid, setNid] = useState("");

  // Shared state for location
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [availableUpazilas, setAvailableUpazilas] = useState<string[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    if (district) {
      setAvailableUpazilas(upazilas[district] || []);
      setUpazila("");
    } else {
      setAvailableUpazilas([]);
    }
  }, [district]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation for all roles
    if (!fullName || !phoneNumber || !email || !password || !role) {
      setError("Please fill in all general fields.");
      return;
    }
    
    // Role-specific validation
    if (role === 'Resident' && (!district || !upazila || !postOffice || !houseNo)) {
      setError("Please fill in all address details for resident registration.");
      return;
    }
    if (role === 'Maintenance Staff' && (!serviceCategory || !district || !upazila || !experience || !nid)) {
      setError("Please fill in all professional details for staff registration.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData: { [key: string]: any } = {
        uid: user.uid,
        fullName,
        email: user.email,
        phoneNumber,
        role,
        createdAt: new Date(),
      };

      // Add role-specific data to the user document
      if (role === 'Resident') {
        userData.address = { district, upazila, postOffice, houseNo };
      } else if (role === 'Maintenance Staff') {
        userData.serviceCategory = serviceCategory;
        userData.experience = parseInt(experience, 10); // Store as a number
        userData.nid = nid;
        userData.location = { district, upazila }; // Store location separately
      }

      await setDoc(doc(firestore, "users", user.uid), userData);
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create an account. Please try again.");
        console.error("Registration error:", error);
      }
    }
  };
  
  const inputStyles = "bg-zinc-800 border-zinc-600 rounded-lg focus:ring-zinc-500";
  const selectStyles = `custom-select flex h-10 w-full items-center justify-between rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

  return (
    <>
      <div className="register-glow-card w-full max-w-md my-8">
        <div className="relative z-10 p-8 space-y-4 bg-black rounded-[0.875rem] shadow-2xl text-center">
          <h1 className="text-4xl font-bold text-gray-100">SmartSociety</h1>
          <p className="text-sm text-[hsl(215_20%_65%)] -mt-6">Create an Account</p>
          <hr className="border-white" />
          <form onSubmit={handleRegister} className="space-y-4 text-left">
            {/* --- General Fields --- */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyles} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Register as</Label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required className={selectStyles}>
                <option value="" disabled>Select register type</option>
                <option value="Resident">Resident</option>
                <option value="Maintenance Staff">Maintenance Staff</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            {/* --- Conditional Fields for RESIDENT --- */}
            {role === 'Resident' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required className={selectStyles}>
                    <option value="" disabled>Select your district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upazila">Upazila / Thana</Label>
                  <select id="upazila" value={upazila} onChange={(e) => setUpazila(e.target.value)} disabled={!district} required className={selectStyles}>
                    <option value="" disabled>Select your upazila</option>
                    {availableUpazilas.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postOffice">Post Office</Label>
                  <Input id="postOffice" type="text" value={postOffice} onChange={(e) => setPostOffice(e.target.value)} required className={inputStyles} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseNo">House No.</Label>
                  <Input id="houseNo" type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} required className={inputStyles} />
                </div>
              </>
            )}
            
            {/* --- Conditional Fields for MAINTENANCE STAFF --- */}
            {role === 'Maintenance Staff' && (
               <>
                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <select id="serviceCategory" value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} required className={selectStyles}>
                     <option value="" disabled>Select your specialization</option>
                     {serviceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Service District</Label>
                  <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required className={selectStyles}>
                    <option value="" disabled>Select service district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upazila">Service Upazila / Thana</Label>
                  <select id="upazila" value={upazila} onChange={(e) => setUpazila(e.target.value)} disabled={!district} required className={selectStyles}>
                    <option value="" disabled>Select service upazila</option>
                    {availableUpazilas.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} required className={inputStyles} placeholder="e.g., 5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nid">NID Number</Label>
                  <Input id="nid" type="text" value={nid} onChange={(e) => setNid(e.target.value)} required className={inputStyles} placeholder="Enter your National ID number"/>
                </div>
              </>
            )}

            {error && <p className="text-red-400 text-sm pt-2">{error}</p>}
            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold pt-2">Create Account</Button>
          </form>
          <div className="text-center">
            <p className="text-sm text-[hsl(215_20%_65%)]">
              Already have an account?{" "}
              <Link href="/login" className="font-medium bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 no-underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Glow styles remain the same */
        @keyframes glow-enter-blur {
          0% { opacity: 0; filter: blur(1px); }
          25% { opacity: 0.7; filter: blur(30px); }
          to { opacity: 0.5; filter: blur(60px); }
        }
        @keyframes glow-enter-stroke {
          from { background-position: 0% 0%; }
          to { background-position: 100% 100%; }
        }
        .register-glow-card { position: relative; }
        .register-glow-card::before {
          content: ''; position: absolute; inset: -5px; z-index: 0;
          border-radius: calc(0.875rem + 5px);
          background: linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #f8682f 50%, #e62c6d 75%, #b25aff 100%);
          animation: glow-enter-blur 1s ease .5s forwards; opacity: 0;
        }
        .register-glow-card::after {
          content: ''; position: absolute; inset: -2px; z-index: 0;
          border-radius: calc(0.875rem + 2px);
          background: linear-gradient(135deg, transparent 0%, transparent 34%, transparent 49%, #fff 57%, #fff 64%, #ffc400 66%, #ff9100 75%, #f8682f 83%, #e62c6d 92%, #b25aff 100%);
          background-size: 300% 300%; background-position: 0% 0%;
          animation: glow-enter-stroke 0.5s ease 0.5s forwards; opacity: 0.5;
        }
        .custom-select option {
          background-color: #27272a; color: white;
        }
      `}</style>
    </>
  );
}