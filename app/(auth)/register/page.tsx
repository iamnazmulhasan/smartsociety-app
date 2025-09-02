// /app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Resident");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        role: role,
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
    }
  };

  return (
    <div className="glow-card w-full max-w-md">
      <div className="relative z-10 p-8 space-y-6 bg-[hsl(var(--card))] rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-100">
          SmartSociety
        </h1>
        <p className="text-muted-foreground mt-2">Create an Account</p>
        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Register as</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Resident">Resident</option>
              <option value="Maintenance Staff">Maintenance Staff</option>
              <option value="Security Staff">Security Staff</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm pt-2">{error}</p>}
          <Button type="submit" className="w-full bg-[#a8c7fa] hover:bg-[#c4d7f7] text-black font-bold pt-2">
            Create Account
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}