'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // ADD THIS FIRST - Cleanup stuck overlays
  useEffect(() => {
    document.querySelectorAll('.page-wave-transition').forEach(el => el.remove());
  }, []);

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