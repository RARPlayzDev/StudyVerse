'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageTitle from '@/components/common/page-title';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useAuth, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import DeleteAccountDialog from '@/components/settings/delete-account-dialog';

const profileFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [isProfileSaving, setProfileSaving] = useState(false);
  const [isPasswordSaving, setPasswordSaving] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { setTheme } = useTheme();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserType>(userDocRef);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
        name: userData?.name || user?.displayName || '',
    }
  });

  const passwordForm = useForm<PasswordFormValues>({
      resolver: zodResolver(passwordFormSchema),
      defaultValues: {
          newPassword: '',
          confirmPassword: '',
      }
  });


  const handleProfileUpdate = async (values: ProfileFormValues) => {
    if (!user || !userDocRef) return;
    setProfileSaving(true);
    try {
        await updateDoc(userDocRef, { name: values.name });
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: values.name });
        }
        toast({ title: 'Profile Updated', description: 'Your name has been updated successfully.' });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
        setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (values: PasswordFormValues) => {
    if (!auth.currentUser) {
        toast({ title: 'Not authenticated', variant: 'destructive'});
        return;
    }
    setPasswordSaving(true);
    try {
        await updatePassword(auth.currentUser, values.newPassword);
        toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
        passwordForm.reset();
    } catch (error: any) {
        console.error(error);
        if (error.code === 'auth/requires-recent-login') {
            toast({
                title: 'Action Required',
                description: 'This is a sensitive action. Please log out and log in again before changing your password.',
                variant: 'destructive',
                duration: 8000,
            });
        } else {
            toast({ title: 'Error updating password', description: error.message, variant: 'destructive' });
        }
    } finally {
        setPasswordSaving(false);
    }
  }

  const handleAccountDelete = async () => {
    if (!auth.currentUser) {
        toast({ title: 'Not authenticated', variant: 'destructive'});
        return;
    }
    try {
        await deleteUser(auth.currentUser);
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
        // The user will be signed out and redirected by the auth state listener.
    } catch (error: any) {
        console.error(error);
         if (error.code === 'auth/requires-recent-login') {
            toast({
                title: 'Action Required',
                description: 'This is a sensitive action. Please log out and log in again before deleting your account.',
                variant: 'destructive',
                duration: 8000,
            });
        } else {
            toast({ title: 'Error deleting account', description: error.message, variant: 'destructive' });
        }
    } finally {
        setDeleteDialogOpen(false);
    }
  }

  return (
    <div>
      <PageTitle title="Settings" subtitle="Manage your account and preferences." />
      <div className="grid gap-8">
        {/* Profile Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>My Account</CardTitle>
            <CardDescription>
              View and manage your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                 <Avatar className="h-24 w-24">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={userData?.name} data-ai-hint="person portrait" />}
                    <AvatarFallback className="text-3xl">{userData?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                     <h3 className="text-2xl font-semibold">{userData?.name || user?.displayName}</h3>
                     <p className="text-muted-foreground">{user?.email}</p>
                     {userData?.role && <Badge variant="secondary" className="capitalize">{userData.role}</Badge>}
                </div>
            </div>

            <Separator />

            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                     <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="max-w-sm">
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormDescription>This is how your name will be displayed.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isProfileSaving}>
                        {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle>Display Theme</CardTitle>
                <CardDescription>Customise the look and feel of your StudyVerse.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button variant="outline" onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                </div>
            </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings and security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 max-w-sm">
                    <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                     <Button type="submit" variant="secondary" disabled={isPasswordSaving}>
                        {isPasswordSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </Form>
            
            <Separator />

            <div>
                <h3 className="text-md font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Permanently delete your account and all associated data. This action is irreversible.</p>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete My Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>

       <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleAccountDelete}
      />
    </div>
  );
}
