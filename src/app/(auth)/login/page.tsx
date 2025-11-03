
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/common/logo";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithGoogle } from "@/firebase/auth/google-signin";
import { doc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
             router.push("/dashboard");
        }
    }
  }, [user, adminRole, isUserLoading, isAdminRoleLoading, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting you now...",
        });
        // The useEffect will handle the redirect.
      })
      .catch((error) => {
        let description = "An unexpected error occurred. Please try again.";
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = "Invalid credentials. Please check your email and password.";
            break;
          case 'auth/invalid-email':
            description = "The email address is not valid.";
            break;
          default:
            description = error.message;
        }
        toast({
          title: "Login Failed",
          description: description,
          variant: "destructive",
        });
      });
  };

  const handleGoogleSignIn = () => {
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
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your studyverse.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-foreground">
                    Forgot your password?
                  </Link>
                </div>
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
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn}>
                Login with Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline text-accent">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
