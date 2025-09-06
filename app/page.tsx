import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const buttonStyles = "inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-bold border-0 transition-colors";

  return (
    // This new div will center your homepage content again
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-4xl">
        <div className="opacity-0 animate-fade-in-up-1">
          <Image 
            src="https://bloomapp.club/AppIcon.png" 
            alt="SmartSociety Logo" 
            width={80}
            height={80}
            className="mb-6"
          />
        </div>

        <h1 className="text-6xl md:text-7xl font-bold text-gray-100 mb-4 opacity-0 animate-fade-in-up-2">
          SmartSociety
        </h1>

        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in-up-3">
          The all-in-one platform for seamless community and facilities management.
        </p>

        <div className="space-x-4 opacity-0 animate-fade-in-up-4">
          <Link 
            href="/login"
            className={`${buttonStyles} bg-sky-700 hover:bg-sky-800 text-white rounded-lg`}
          >
            Login
          </Link>
          <Link 
            href="/register"
            className={`${buttonStyles} bg-pink-700 hover:bg-pink-800 text-white rounded-lg`}
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}