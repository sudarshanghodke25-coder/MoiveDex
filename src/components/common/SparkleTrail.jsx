import { useEffect, useRef } from 'react';

/**
 * SparkleTrail
 *
 * Site-wide sparkling mouse trail (replaces the old custom cursor circle).
 * A fixed, pointer-events-none canvas that spawns tiny fading sparkles
 * wherever the cursor moves.
 */
export default function SparkleTrail() {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  const trailRef  = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas ? canvas.getContext('2d') : null;
    if (!canvas || !ctx) return;

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // ── Mouse tracking & Sparks ────────────────────────────────
    const handleMouseMove = (e) => {
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

    // ── Animation Loop ─────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
      }}
    />
  );
}
