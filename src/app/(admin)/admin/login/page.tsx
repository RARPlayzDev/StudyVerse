'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/common/logo';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  
  useEffect(() => {
    if (!isUserLoading && !isAdminRoleLoading && user) {
        if (adminRole) {
             router.push("/admin");
        } else {
            // Not an admin, sign them out and show an error
            auth.signOut();
            toast({
                title: 'Access Denied',
                description: 'You do not have permission to access the admin panel.',
                variant: 'destructive',
            });
        }
    }
  }, [user, adminRole, isUserLoading, isAdminRoleLoading, router, auth, toast]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
    toast({
      title: 'Logging In...',
      description: 'Please wait while we check your credentials.',
    });
  };

  if (isUserLoading || user) {
    return (
      <div className="w-full max-w-md text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
        <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50">
            <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
                <Logo />
            </div>
            <CardTitle className="text-2xl">Admin Panel Login</CardTitle>
            <CardDescription>Enter your administrator credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    className="bg-background/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    required
                    className="bg-background/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button type="submit" className="w-full">
                    Login
                </Button>
                </div>
            </form>
             <div className="mt-4 text-center text-sm">
                Not an admin?{' '}
                <Link href="/login" className="underline text-accent">
                Go to student login
                </Link>
            </div>
            </CardContent>
        </Card>
        </div>
    </div>
  );
}
