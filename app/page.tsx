'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { authenticated, loading, usersExist } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (authenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [authenticated, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--obsidian))] via-[rgb(var(--charcoal))] to-[rgb(var(--obsidian))] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--neon-orchid))] mx-auto mb-4" />
        <p className="text-[rgb(var(--muted-foreground))]">Loading PINK™ Command Center...</p>
      </div>
    </div>
  );
}