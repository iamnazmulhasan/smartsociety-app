// app/(main)/messaging/page.tsx

import { Suspense } from 'react';
import MessagingClient from './MessagingClient';

export default function MessagingPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading conversations...</div>}>
      <MessagingClient />
    </Suspense>
  );
}