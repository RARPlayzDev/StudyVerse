

import { AdminAuthGuard } from '@/firebase/auth/admin-auth-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      {children}
    </AdminAuthGuard>
  );
}
