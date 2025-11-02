'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  useEffect(() => {
    const isAuthCheckComplete = !isUserLoading && !isAdminRoleLoading;

    if (isAuthCheckComplete) {
      if (!user) {
        // Not logged in, redirect to admin login
        router.push('/admin/login');
      } else if (!adminRole) {
        // Logged in but not an admin, redirect to student dashboard
        router.push('/dashboard');
      }
    }
  }, [user, adminRole, isUserLoading, isAdminRoleLoading, router]);

  // While checking, show a loading state
  if (isUserLoading || isAdminRoleLoading || !adminRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verifying permissions...</p>
      </div>
    );
  }

  // If checks pass, render the admin layout
  return <>{children}</>;
}
