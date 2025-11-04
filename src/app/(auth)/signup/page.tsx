
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
import { User, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { signInWithGoogle } from '@/firebase/auth/google-signin';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, isClient]);

  const createUserProfile = async (user: User, name: string) => {
    const userRef = doc(firestore, 'users', user.uid);
    const newUser = {
      id: user.uid,
      name:
        name || user.displayName || user.email?.split('@')[0] || 'Anonymous',
      email: user.email,
      role: 'student',
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      banned: false,
    };
    await setDoc(userRef, newUser);
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
    signInWithGoogle(auth, firestore)
      .then(() => {
        toast({
          title: 'Signed up with Google',
          description: 'Welcome to StudyVerse!',
        });
        // The useEffect will handle redirect
      })
      .catch((error) => {
        toast({
          title: 'Google Sign-Up Failed',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  if (!isClient || isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join the StudyVerse and start learning smarter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="Your Name"
                  required
                  className="bg-background/70"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-background/70"
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
                  className="bg-background/70"
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
                  className="bg-background/70"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </div>
          </form>
          <div className="my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">
              OR SIGN UP WITH
            </span>
            <Separator className="flex-1" />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.3 0 129.8 27.8 174.4 72.4l-64 64c-21-19.5-49.8-32-84.4-32-68.9 0-125.6 56.2-125.6 125.6s56.7 125.6 125.6 125.6c76.3 0 110.4-53.8 114.9-82.4H244v-79h244z"
              ></path>
            </svg>
            Google
          </Button>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
