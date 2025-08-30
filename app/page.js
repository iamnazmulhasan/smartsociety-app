'use client';

import { db } from '../lib/firebase/config'; // Our import to test the connection

export default function Home() {
  // This will print the Firestore object to your browser's console if the connection is successful
  console.log(db);

  return (
    <main>
      <h1>Welcome to Smart Society!</h1>
      <p>Your Next.js app is running and connected to Firebase.</p>
    </main>
  );
}