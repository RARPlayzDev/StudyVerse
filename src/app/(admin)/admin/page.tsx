'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRootPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/login');
    }, [router]);
    
    // You can add a loading spinner here
    return <div className="flex min-h-screen items-center justify-center">Redirecting to admin login...</div>;
}
