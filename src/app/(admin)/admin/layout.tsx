
import AdminSidebar from '@/components/admin/sidebar';
import Header from '@/components/dashboard/header';
import { AdminAuthGuard } from '@/firebase/auth/admin-auth-guard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full flex-col">
        <AdminSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
          <Header />
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
