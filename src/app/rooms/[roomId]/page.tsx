
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is no longer needed as the collaboration feature has been unified.
// We redirect any lingering bookmarks to the new collab space.
export default function OldCollabRoomPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/collab');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
        <p className="text-white">Redirecting to the new collaboration space...</p>
    </div>
  );
}
