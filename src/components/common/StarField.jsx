import React, { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Small background stars
    const stars = Array.from({ length: 750 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.4 + 0.2,
      opacity: Math.random() * 0.65 + 0.25,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.012 + 0.004,
    }));

    // Medium accent stars (slightly coloured)
    const accentStars = Array.from({ length: 80 }, () => {
      const roll = Math.random();
      const color =
        roll < 0.25
          ? [200, 180, 255]   // blue-purple tint
          : roll < 0.5
          ? [255, 240, 180]   // warm gold tint
          : roll < 0.7
          ? [180, 220, 255]   // cool blue
          : [255, 255, 255];  // pure white
      return {
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.2 + 1.0,
        opacity: Math.random() * 0.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.009 + 0.003,
        color,
      };
    });

    // Very bright "prominent" stars with cross-flare
    const brightStars = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2.5 + 2.0,
      opacity: Math.random() * 0.3 + 0.7,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.006 + 0.002,
    }));

    let animId;
    let frame = 0;

    const drawNebulaClouds = (w, h) => {
      // Large purple/violet nebula cloud – upper-right region
      const n1 = ctx.createRadialGradient(w * 0.78, h * 0.18, 0, w * 0.78, h * 0.18, w * 0.42);
      n1.addColorStop(0, 'rgba(120, 60, 220, 0.28)');
      n1.addColorStop(0.35, 'rgba(88, 28, 135, 0.18)');
      n1.addColorStop(0.7, 'rgba(60, 20, 100, 0.10)');
      n1.addColorStop(1, 'transparent');
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      // Smaller bright-core galaxy cluster (upper-right hotspot)
      const g1 = ctx.createRadialGradient(w * 0.82, h * 0.12, 0, w * 0.82, h * 0.12, w * 0.18);
      g1.addColorStop(0, 'rgba(200, 160, 255, 0.30)');
      g1.addColorStop(0.3, 'rgba(150, 80, 230, 0.18)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Pink-magenta nebula – left/center
      const n2 = ctx.createRadialGradient(w * 0.22, h * 0.45, 0, w * 0.22, h * 0.45, w * 0.30);
      n2.addColorStop(0, 'rgba(200, 50, 130, 0.14)');
      n2.addColorStop(0.5, 'rgba(160, 40, 100, 0.08)');
      n2.addColorStop(1, 'transparent');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      // Deep blue nebula – lower-center
      const n3 = ctx.createRadialGradient(w * 0.48, h * 0.65, 0, w * 0.48, h * 0.65, w * 0.28);
      n3.addColorStop(0, 'rgba(40, 80, 200, 0.12)');
      n3.addColorStop(1, 'transparent');
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      // Subtle teal accent – far left
      const n4 = ctx.createRadialGradient(w * 0.05, h * 0.75, 0, w * 0.05, h * 0.75, w * 0.20);
      n4.addColorStop(0, 'rgba(20, 140, 140, 0.10)');
      n4.addColorStop(1, 'transparent');
      ctx.fillStyle = n4;
      ctx.fillRect(0, 0, w, h);

      // Dark horizon vignette at the bottom
      const vignette = ctx.createLinearGradient(0, h * 0.72, 0, h);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(1, 2, 10, 0.70)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const drawCrossFlare = (x, y, size, alpha) => {
      const len = size * 7;
      const grad = ctx.createLinearGradient(x - len, y, x + len, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, `rgba(220, 220, 255, ${alpha * 0.6})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(x - len, y - 0.5, len * 2, 1);

      const grad2 = ctx.createLinearGradient(x, y - len, x, y + len);
      grad2.addColorStop(0, 'transparent');
      grad2.addColorStop(0.5, `rgba(220, 220, 255, ${alpha * 0.6})`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(x - 0.5, y - len, 1, len * 2);
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space base gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#010212');
      bg.addColorStop(0.5, '#04060f');
      bg.addColorStop(1, '#010208');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawNebulaClouds(w, h);

      // Small background stars
      stars.forEach((star) => {
        const t = Math.sin(frame * star.speed + star.twinkle) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * t})`;
        ctx.fill();
      });

      // Accent coloured stars
      accentStars.forEach((star) => {
        const t = Math.sin(frame * star.speed + star.twinkle) * 0.25 + 0.75;
        const [r, g, b] = star.color;
        const x = star.x * w;
        const y = star.y * h;

        // Soft glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, star.size * 3.5);
        glow.addColorStop(0, `rgba(${r},${g},${b},${star.opacity * t * 0.35})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - star.size * 3.5, y - star.size * 3.5, star.size * 7, star.size * 7);

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${star.opacity * t})`;
        ctx.fill();
      });

      // Bright prominent stars with cross-flare
      brightStars.forEach((star) => {
        const t = Math.sin(frame * star.speed + star.twinkle) * 0.2 + 0.8;
        const x = star.x * w;
        const y = star.y * h;

        // Outer glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, star.size * 6);
        glow.addColorStop(0, `rgba(210, 200, 255, ${star.opacity * t * 0.25})`);
        glow.addColorStop(0.5, `rgba(180, 160, 255, ${star.opacity * t * 0.10})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - star.size * 6, y - star.size * 6, star.size * 12, star.size * 12);

        drawCrossFlare(x, y, star.size, star.opacity * t);

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * t})`;
        ctx.fill();
      });

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

export default StarField;
