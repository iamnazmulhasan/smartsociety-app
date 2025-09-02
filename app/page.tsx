// /app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="glow-card w-full max-w-3xl text-center">
      <div className="relative z-10 p-12 bg-[hsl(var(--card))] rounded-2xl shadow-2xl">
        <h1 className="text-6xl font-bold text-gray-100 mb-4">
          SmartSociety
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The all-in-one platform for seamless community and facilities management.
        </p>
        <div className="space-x-4">
          <Link href="/login">
            <Button size="lg" className="bg-[#a8c7fa] hover:bg-[#c4d7f7] text-black font-bold px-8 py-6 text-lg">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="font-bold px-8 py-6 text-lg">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}