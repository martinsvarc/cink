'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, loading } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // ADD THIS FIRST - Cleanup stuck overlays
  useEffect(() => {
    document.querySelectorAll('.page-wave-transition').forEach(el => el.remove());
  }, []);

  // Authentication check
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth');
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    // Trigger page transition animation
    setIsTransitioning(true);
    
    // Create wave effect element
    const waveElement = document.createElement('div');
    waveElement.className = 'page-wave-transition';
    document.body.appendChild(waveElement);
    
    // Update content after wave starts
    const updateTimer = setTimeout(() => {
      setDisplayChildren(children);
    }, 100);
    
    // Clean up wave element and reset transition state
    const cleanupTimer = setTimeout(() => {
      if (document.body.contains(waveElement)) {
        document.body.removeChild(waveElement);
      }
      setIsTransitioning(false);
    }, 400);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(cleanupTimer);
      if (document.body.contains(waveElement)) {
        document.body.removeChild(waveElement);
      }
    };
  }, [pathname]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--obsidian))] via-[rgb(var(--charcoal))] to-[rgb(var(--obsidian))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--neon-orchid))] mx-auto mb-4" />
          <p className="text-[rgb(var(--muted-foreground))]">Loading PINK™ Command Center...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen page-transition-container">
      <Navbar />
      <main className={`pt-20 px-6 transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-95' : 'opacity-100'
      }`}>
        <div className="max-w-7xl mx-auto page-fade-slide">
          {displayChildren}
        </div>
      </main>
    </div>
  );
}