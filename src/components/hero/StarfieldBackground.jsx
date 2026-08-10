import { useEffect, useRef } from 'react';

/**
 * CinematicBackground
 *
 * Movie-production themed hero background with:
 * - Cinematic background image (film reels, clapperboard, projector)
 * - Multi-layer mouse parallax (cursor moves → layers shift at different speeds)
 * - Film grain texture overlay via CSS
 * - Animated light beams / bokeh particles via Canvas
 * - Does NOT change the mouse cursor
 */
export default function CinematicBackground() {
  const layer1Ref  = useRef(null); // bg image — slowest parallax
  const layer2Ref  = useRef(null); // mid particles — medium
  const layer3Ref  = useRef(null); // foreground glow — fastest
  const canvasRef  = useRef(null); // bokeh particles canvas
  const mouseRef   = useRef({ x: 0, y: 0 });
  const frameRef   = useRef(null);
  const targetRef  = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // ── Mouse tracking ─────────────────────────────────────────
    const handleMouseMove = (e) => {
      // Normalise: -1 to +1 range
      targetRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      targetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── Bokeh canvas setup ─────────────────────────────────────
    const canvas = canvasRef.current;
    const ctx    = canvas ? canvas.getContext('2d') : null;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Create bokeh particles
    const PARTICLE_COUNT = 35;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 3 + 1,
      speed: Math.random() * 0.0003 + 0.0001,
      hue:   Math.random() > 0.5
        ? `rgba(99,102,241,${Math.random() * 0.25 + 0.05})`
        : `rgba(245,158,11,${Math.random() * 0.2 + 0.04})`,
      phase: Math.random() * Math.PI * 2,
    }));

    let tick = 0;

    // ── Smooth parallax animation loop ─────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Lerp current toward target (smoothing factor 0.04 = very smooth)
      const LERP = 0.04;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * LERP;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * LERP;

      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      // Layer parallax shifts (different depth = different multiplier)
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate(${cx * -18}px, ${cy * -12}px) scale(1.08)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate(${cx * -32}px, ${cy * -20}px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate(${cx * -50}px, ${cy * -30}px)`;
      }

      // ── Draw bokeh on canvas ──────────────────────────────────
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tick += 1;

        particles.forEach(p => {
          const x = (p.x + cx * -0.015) * canvas.width;
          const y = (p.y + cy * -0.01 + Math.sin(tick * p.speed + p.phase) * 0.03) * canvas.height;
          const pulseFactor = 0.8 + 0.2 * Math.sin(tick * p.speed * 3 + p.phase);
          const r = p.r * pulseFactor;

          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 8);
          grad.addColorStop(0, p.hue);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r * 8, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* ── Layer 1: Cinematic background image (slowest) ─────── */}
      <div
        ref={layer1Ref}
        style={{
          position: 'absolute',
          inset: '-10% -10%',
          backgroundImage: 'url(/cinema-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
          transition: 'transform 0.05s linear',
        }}
      />

      {/* ── Layer 2: Colour overlay + vignette ───────────────── */}
      <div
        ref={layer2Ref}
        style={{
          position: 'absolute',
          inset: '-8% -8%',
          willChange: 'transform',
          background: `
            radial-gradient(ellipse 100% 80% at 50% 50%,
              rgba(5,5,16,0.15) 0%,
              rgba(5,5,16,0.65) 60%,
              rgba(5,5,16,0.92) 100%
            )
          `,
        }}
      />

      {/* ── Layer 3: Moving gradient orbs (fastest parallax) ─── */}
      <div
        ref={layer3Ref}
        style={{
          position: 'absolute',
          inset: '-15% -15%',
          willChange: 'transform',
          background: `
            radial-gradient(ellipse 40% 35% at 25% 40%, rgba(99,102,241,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 35% 30% at 75% 65%, rgba(168,85,247,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 30% 25% at 60% 25%, rgba(245,158,11,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Bokeh particles canvas ────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Film grain texture overlay ────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
          opacity: 0.5,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Film strip top edge decoration ───────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.6), transparent)',
      }} />
    </div>
  );
}
