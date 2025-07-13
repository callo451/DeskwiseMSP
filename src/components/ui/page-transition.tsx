'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const pageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle page transitions
  useEffect(() => {
    if (!pageRef.current || !overlayRef.current) return;

    // Create timeline for page transition
    const tl = gsap.timeline();

    // Initial page load animation
    tl.fromTo(
      overlayRef.current,
      { 
        scaleY: 1,
        transformOrigin: 'top',
      },
      {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.8,
        ease: 'power3.inOut',
      }
    );

    tl.from(
      pageRef.current.children,
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      },
      '-=0.4'
    );

    // Clean up
    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div className="relative">
      {/* Transition overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-gradient-to-b from-primary to-accent z-50 pointer-events-none"
      />
      
      {/* Page content */}
      <div ref={pageRef}>
        {children}
      </div>
    </div>
  );
}
