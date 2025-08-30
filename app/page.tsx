// /app/page.tsx
import Link from 'next/link';
import { Button } from './components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-5xl font-bold mb-4">Welcome to SmartSociety 2.0</h1>
      <p className="text-xl text-gray-600 mb-8">The all-in-one platform for community and facilities management.</p>
      <div className="space-x-4">
        <Link href="/login">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}