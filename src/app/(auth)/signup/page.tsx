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
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithGoogle } from '@/firebase/auth/google-signin';
import { User, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (user) {
      // Redirect to admin if the user is an admin, otherwise to dashboard
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      // This is a one-off check, not real-time.
      // A full solution would use a listener or a custom hook.
      setDoc(adminRoleRef, {}).then(() => router.push('/admin')).catch(() => router.push('/dashboard'));
    }
  }, [user, router, firestore]);

  const createUserProfile = async (user: User, name: string) => {
    const userRef = doc(firestore, 'users', user.uid);
    // Hardcoded admin email
    const isAdmin = user.email === 'kaarthik@studysync.app';
    
    const newUser = {
      id: user.uid,
      name,
      email: user.email,
      role: isAdmin ? 'admin' : 'student',
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      banned: false,
    };

    try {
      await setDoc(userRef, newUser);
      if (isAdmin) {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        // Add a document to the roles_admin collection to grant admin privileges
        await setDoc(adminRoleRef, { role: 'admin' });
      }
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: newUser,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please check your passwords and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await createUserProfile(userCredential.user, name);
        toast({
          title: 'Account Created',
          description: 'Welcome to StudyVerse! Redirecting you now.',
        });
        // The useEffect will handle redirection.
      })
      .catch((error) => {
        toast({
          title: 'Signup Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  };
  
  const handleGoogleSignIn = () => {
    // Note: Google Sign-in will also need a mechanism to check/grant admin roles
    // This is typically done via a backend function after the user record is created.
    signInWithGoogle(auth);
  };

  if (isUserLoading || user) {
    return (
      <div className="w-full max-w-md text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Join the StudyVerse</CardTitle>
          <CardDescription>
            Create an account to start learning smarter. Use 'kaarthik@studysync.app' with password 'kaarthi2007' to create the admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="Kaarthik"
                  required
                  className="bg-background/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kaarthik@studysync.app"
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
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  className="bg-background/50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                Sign up with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-accent">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
