// /app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="glow-card w-full max-w-md">
      <div className="relative z-10 p-8 space-y-3 bg-card rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-100">
          SmartSociety
        </h1>
        <p className="text-foreground pb-2">Login to your Account</p>
        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-pinkish-blue hover:bg-pinkish-blue/90 text-white font-bold">
            Login
          </Button>
        </form>
        <div className="text-center pt-2">
          <p className="text-sm text-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-white hover:bg-bloom-pink/90 bg-bloom-pink rounded-md px-3 py-1.5 text-sm">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}