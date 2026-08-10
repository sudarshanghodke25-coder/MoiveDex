import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Loader({ onComplete }) {
  const containerRef = useRef(null);
  const letterRef = useRef(null);

  useEffect(() => {
    // Force scroll to top on reload and disable browser scroll restoration
    window.scrollTo(0, 0);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Lock scroll while loading
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          if (onComplete) onComplete();
        }
      });

      // Netflix style dramatic cinematic zoom intro
      tl.fromTo(letterRef.current, 
        { scale: 0, opacity: 0, rotationX: 90 },
        { scale: 1, opacity: 1, rotationX: 0, duration: 1.4, ease: 'expo.out' }
      )
      .to(letterRef.current, {
        scale: 1.2,
        textShadow: '0 0 40px #e11d48, 0 0 80px #4f46e5',
        duration: 0.8,
        ease: 'power1.inOut'
      })
      .to(letterRef.current, {
        scale: 100, // Massive zoom in to fill screen
        opacity: 0,
        duration: 0.7,
        ease: 'expo.in'
      }, '+=0.1')
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, '-=0.2');

    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#020205',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <div
        ref={letterRef}
        style={{
          fontSize: 'clamp(6rem, 15vw, 12rem)',
          fontWeight: 900,
          fontFamily: '"Inter", sans-serif',
          lineHeight: 1,
          transformOrigin: 'center center',
          background: 'linear-gradient(180deg, #ef4444 0%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        M
      </div>
    </div>
  );
}
