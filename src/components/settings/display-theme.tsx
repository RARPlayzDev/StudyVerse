// Version 1.0 Final Push
'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function DisplayTheme() {
  const { setTheme } = useTheme();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>Display Theme</CardTitle>
        <CardDescription>
          Choose how you want StudyVerse to look.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline" onClick={() => setTheme('light')}>
            <Sun className="mr-2" /> Light
          </Button>
          <Button variant="outline" onClick={() => setTheme('dark')}>
            <Moon className="mr-2" /> Dark
          </Button>
          <Button variant="outline" onClick={() => setTheme('system')}>
            <Monitor className="mr-2" /> System
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
