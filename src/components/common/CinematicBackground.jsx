import { useEffect, useRef } from 'react';

/**
 * CinematicBackground
 *
 * Movie-production themed hero background with:
 * - Cinematic background image (parallax)
 * - Animated bokeh particles (ambient)
 * - Sparkling mouse trail (interactive)
 * - Film grain texture
 */
export default function CinematicBackground() {
  const layer1Ref  = useRef(null);
  const layer2Ref  = useRef(null);
  const layer3Ref  = useRef(null);
  const canvasRef  = useRef(null);
  
  const frameRef   = useRef(null);
  const targetRef  = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  
  // Array for mouse trail particles
  const trailRef   = useRef([]);

  useEffect(() => {
    // ── Mouse tracking & Sparks ────────────────────────────────
    const handleMouseMove = (e) => {
      // Normalise for parallax: -1 to +1
      targetRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      targetRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      // Add sparkling particles at mouse position
      const colors = ['#e11d48', '#f59e0b', '#fbbf24', '#f8fafc'];
      for (let i = 0; i < 3; i++) {
        trailRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 + 1.5, // slight gravity
          life: 1, // fades from 1 to 0
          size: Math.random() * 2.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ── Canvas setup ───────────────────────────────────────────
    const canvas = canvasRef.current;
    const ctx    = canvas ? canvas.getContext('2d') : null;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Ambient bokeh particles
    const PARTICLE_COUNT = 30;
    const ambientParticles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random(),
      y:     Math.random(),
      r:     Math.random() * 3 + 1,
      speed: Math.random() * 0.0003 + 0.0001,
      hue:   Math.random() > 0.5
        ? `rgba(99,102,241,${Math.random() * 0.2 + 0.05})`
        : `rgba(245,158,11,${Math.random() * 0.15 + 0.04})`,
      phase: Math.random() * Math.PI * 2,
    }));

    let tick = 0;

    // ── Animation Loop ─────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      // Parallax easing
      const LERP = 0.04;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * LERP;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * LERP;
      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      if (layer1Ref.current) layer1Ref.current.style.transform = `translate(${cx * -18}px, ${cy * -12}px) scale(1.08)`;
      if (layer2Ref.current) layer2Ref.current.style.transform = `translate(${cx * -32}px, ${cy * -20}px)`;
      if (layer3Ref.current) layer3Ref.current.style.transform = `translate(${cx * -50}px, ${cy * -30}px)`;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        tick += 1;

        // Draw ambient bokeh
        ambientParticles.forEach(p => {
          const x = (p.x + cx * -0.015) * canvas.width;
          const y = (p.y + cy * -0.01 + Math.sin(tick * p.speed + p.phase) * 0.03) * canvas.height;
          const pulse = 0.8 + 0.2 * Math.sin(tick * p.speed * 3 + p.phase);
          const r = p.r * pulse;

          const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 8);
          grad.addColorStop(0, p.hue);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r * 8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw interactive sparkling trail
        const trail = trailRef.current;
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015; // decay

          if (p.life <= 0) {
            trail.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
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
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        ref={layer1Ref}
        style={{
          position: 'absolute', inset: '-10% -10%',
          backgroundImage: 'url(/cinema-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center',
          willChange: 'transform', transition: 'transform 0.05s linear',
        }}
      />
      <div
        ref={layer2Ref}
        style={{
          position: 'absolute', inset: '-8% -8%', willChange: 'transform',
          background: 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(5,5,16,0.55) 0%, rgba(5,5,16,0.85) 60%, rgba(5,5,16,0.95) 100%)',
        }}
      />
      <div
        ref={layer3Ref}
        style={{
          position: 'absolute', inset: '-15% -15%', willChange: 'transform',
          background: 'radial-gradient(ellipse 40% 35% at 25% 40%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse 35% 30% at 75% 65%, rgba(168,85,247,0.14) 0%, transparent 70%), radial-gradient(ellipse 30% 25% at 60% 25%, rgba(245,158,11,0.08) 0%, transparent 60%)',
        }}
      />
      
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen' }} />
      
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat', backgroundSize: '128px 128px', opacity: 0.5, mixBlendMode: 'overlay',
      }} />
    </div>
  );
}
