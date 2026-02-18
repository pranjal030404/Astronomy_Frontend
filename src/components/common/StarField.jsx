import React, { useEffect, useRef } from 'react';

// Seeded pseudo-random so the star layout is always the same
const seededRand = (() => {
  let s = 1337;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
})();

const sr = seededRand;

// ── Star populations ──────────────────────────────────────────────────────────

// Faint background field stars (whole canvas)
const BG_STARS = Array.from({ length: 900 }, () => ({
  x: sr(),
  y: sr(),
  size: sr() * 1.0 + 0.15,
  opacity: sr() * 0.45 + 0.15,
  phase: sr() * Math.PI * 2,
  speed: sr() * 0.008 + 0.002,
}));

// Dense Milky Way band stars – distributed in a gaussian cross-section
// t = progress along band (0→1), off = signed offset across band (-1→1)
const BAND_STARS = Array.from({ length: 4500 }, () => {
  const off = (sr() + sr() + sr() - 1.5) / 1.5; // approx gaussian -1…1
  const nearCore = Math.abs(off) < 0.15;
  return {
    t: sr(),
    off,
    size: sr() * 0.9 + 0.1,
    opacity: sr() * 0.55 + 0.2,
    phase: sr() * Math.PI * 2,
    speed: sr() * 0.006 + 0.002,
    warm: nearCore || sr() < 0.35, // warmer (orange/gold) colour near core
  };
});

// Accent stars with soft glow
const ACCENT_STARS = Array.from({ length: 70 }, () => {
  const roll = sr();
  const color =
    roll < 0.3  ? [200, 180, 255] :  // blue-purple
    roll < 0.55 ? [255, 245, 190] :  // warm gold
    roll < 0.75 ? [180, 220, 255] :  // cool blue
                  [255, 255, 255];
  return {
    x: sr(), y: sr(),
    size: sr() * 2.0 + 1.0,
    opacity: sr() * 0.45 + 0.55,
    phase: sr() * Math.PI * 2,
    speed: sr() * 0.007 + 0.003,
    color,
  };
});

// Bright stars with cross-flare
const BRIGHT_STARS = Array.from({ length: 20 }, () => ({
  x: sr(), y: sr(),
  size: sr() * 2.2 + 1.8,
  opacity: sr() * 0.3 + 0.7,
  phase: sr() * Math.PI * 2,
  speed: sr() * 0.005 + 0.002,
}));

// ── Component ─────────────────────────────────────────────────────────────────
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

    // Milky Way band — diagonal from lower-left to upper-right
    const BAND_ANGLE = -32 * (Math.PI / 180);
    const cosA = Math.cos(BAND_ANGLE);
    const sinA = Math.sin(BAND_ANGLE);

    const getBandStarPos = (star, w, h) => {
      const diag = Math.sqrt(w * w + h * h);
      const bandLen = diag * 1.25;
      const bandHalfH = h * 0.30; // half-width of full band

      const px = star.t * bandLen - bandLen * 0.5; // along-band position
      const py = star.off * bandHalfH;             // across-band (gaussian)

      // Rotate and translate to canvas centre
      return {
        x: w * 0.5 + px * cosA - py * sinA,
        y: h * 0.5 + px * sinA + py * cosA,
        normOff: Math.abs(star.off), // 0=centre, 1=edge
      };
    };

    // Cross-flare helper
    const crossFlare = (x, y, size, alpha) => {
      const len = size * 9;
      ['rgba(230,225,255,', 'rgba(230,225,255,'].forEach((col, i) => {
        const g = i === 0
          ? ctx.createLinearGradient(x - len, y, x + len, y)
          : ctx.createLinearGradient(x, y - len, x, y + len);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, col + (alpha * 0.55) + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        if (i === 0) ctx.fillRect(x - len, y - 0.6, len * 2, 1.2);
        else         ctx.fillRect(x - 0.6, y - len, 1.2, len * 2);
      });
    };

    let animId;
    let frame = 0;

    // ── Draw the static Milky Way glow / nebula (redrawn each frame on top of bg)
    const drawMilkyWay = (w, h) => {
      // ── 1. Outer band haze
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(BAND_ANGLE);
      const diag = Math.sqrt(w * w + h * h);
      const bLen = diag * 1.25;
      const bH   = h * 0.60;

      const outerHaze = ctx.createLinearGradient(0, -bH / 2, 0, bH / 2);
      outerHaze.addColorStop(0,    'transparent');
      outerHaze.addColorStop(0.12, 'rgba(110, 90, 180, 0.05)');
      outerHaze.addColorStop(0.30, 'rgba(160, 140, 220, 0.10)');
      outerHaze.addColorStop(0.50, 'rgba(200, 180, 255, 0.17)');
      outerHaze.addColorStop(0.70, 'rgba(160, 140, 220, 0.10)');
      outerHaze.addColorStop(0.88, 'rgba(110, 90, 180, 0.05)');
      outerHaze.addColorStop(1,    'transparent');
      ctx.fillStyle = outerHaze;
      ctx.fillRect(-bLen / 2, -bH / 2, bLen, bH);

      // ── 2. Inner bright core ribbon
      const coreRibbon = ctx.createLinearGradient(0, -bH * 0.18, 0, bH * 0.18);
      coreRibbon.addColorStop(0,   'transparent');
      coreRibbon.addColorStop(0.25,'rgba(220, 200, 255, 0.12)');
      coreRibbon.addColorStop(0.5, 'rgba(240, 225, 255, 0.22)');
      coreRibbon.addColorStop(0.75,'rgba(220, 200, 255, 0.12)');
      coreRibbon.addColorStop(1,   'transparent');
      ctx.fillStyle = coreRibbon;
      ctx.fillRect(-bLen / 2, -bH * 0.18, bLen, bH * 0.36);

      // ── 3. Dust lane (dark rift — signature of the real Milky Way)
      const dustY = bH * 0.04;
      const dust = ctx.createLinearGradient(0, dustY - 18, 0, dustY + 18);
      dust.addColorStop(0,   'transparent');
      dust.addColorStop(0.5, 'rgba(0, 0, 4, 0.30)');
      dust.addColorStop(1,   'transparent');
      ctx.fillStyle = dust;
      ctx.fillRect(-bLen / 2, dustY - 18, bLen, 36);

      // Second thinner dust lane
      const dustY2 = -bH * 0.08;
      const dust2 = ctx.createLinearGradient(0, dustY2 - 9, 0, dustY2 + 9);
      dust2.addColorStop(0,   'transparent');
      dust2.addColorStop(0.5, 'rgba(0, 0, 3, 0.18)');
      dust2.addColorStop(1,   'transparent');
      ctx.fillStyle = dust2;
      ctx.fillRect(-bLen / 2, dustY2 - 9, bLen, 18);

      ctx.restore();

      // ── 4. Galactic centre — warm orange-gold glow (right of centre, mid-height)
      const gcx = w * 0.60;
      const gcy = h * 0.46;

      const gc = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, w * 0.24);
      gc.addColorStop(0,   'rgba(255, 230, 170, 0.30)');
      gc.addColorStop(0.18,'rgba(240, 180, 100, 0.20)');
      gc.addColorStop(0.45,'rgba(180, 100, 200, 0.10)');
      gc.addColorStop(0.75,'rgba(100,  60, 160, 0.05)');
      gc.addColorStop(1,   'transparent');
      ctx.fillStyle = gc;
      ctx.fillRect(0, 0, w, h);

      // ── 5. Purple nebula cloud — left of galactic centre
      const n1 = ctx.createRadialGradient(w * 0.28, h * 0.42, 0, w * 0.28, h * 0.42, w * 0.20);
      n1.addColorStop(0,   'rgba(130, 55, 210, 0.18)');
      n1.addColorStop(0.5, 'rgba( 90, 35, 160, 0.09)');
      n1.addColorStop(1,   'transparent');
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, w, h);

      // ── 6. Blue-teal nebula — lower right
      const n2 = ctx.createRadialGradient(w * 0.72, h * 0.58, 0, w * 0.72, h * 0.58, w * 0.17);
      n2.addColorStop(0,   'rgba( 70, 120, 240, 0.12)');
      n2.addColorStop(0.6, 'rgba( 20, 100, 180, 0.06)');
      n2.addColorStop(1,   'transparent');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, w, h);

      // ── 7. Reddish emission nebula — upper left
      const n3 = ctx.createRadialGradient(w * 0.14, h * 0.22, 0, w * 0.14, h * 0.22, w * 0.14);
      n3.addColorStop(0,   'rgba(200, 60, 80, 0.10)');
      n3.addColorStop(1,   'transparent');
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, w, h);

      // ── 8. Dark horizon vignette (landscape / ground feel at bottom)
      const vig = ctx.createLinearGradient(0, h * 0.72, 0, h);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(0, 1, 6, 0.90)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // ── 9. Edge vignette (left + right darkening)
      const vigL = ctx.createLinearGradient(0, 0, w * 0.12, 0);
      vigL.addColorStop(0, 'rgba(0,0,5,0.35)');
      vigL.addColorStop(1, 'transparent');
      ctx.fillStyle = vigL;
      ctx.fillRect(0, 0, w, h);

      const vigR = ctx.createLinearGradient(w * 0.88, 0, w, 0);
      vigR.addColorStop(0, 'transparent');
      vigR.addColorStop(1, 'rgba(0,0,5,0.35)');
      ctx.fillStyle = vigR;
      ctx.fillRect(0, 0, w, h);
    };

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // ── Base: deep space gradient
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0,   '#00010c');
      bg.addColorStop(0.45,'#010310');
      bg.addColorStop(1,   '#000108');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── Milky Way glow layers
      drawMilkyWay(w, h);

      // ── Band dense stars
      for (let i = 0; i < BAND_STARS.length; i++) {
        const star = BAND_STARS[i];
        const tw = Math.sin(frame * star.speed + star.phase) * 0.22 + 0.78;
        const { x, y, normOff } = getBandStarPos(star, w, h);
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;

        // Gaussian density — stars fade toward band edges
        const density = Math.exp(-normOff * normOff * 3.5);
        const alpha = star.opacity * tw * density;
        if (alpha < 0.025) continue;

        // Colour: warm near galactic core, cooler elsewhere
        const nearCore =
          Math.abs(x - w * 0.60) < w * 0.22 &&
          Math.abs(y - h * 0.46) < h * 0.18;
        const r = (nearCore || star.warm) ? 255 : 210;
        const g = (nearCore || star.warm) ? 225 : 215;
        const b = (nearCore || star.warm) ? 175 : 245;

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // ── Background field stars
      for (let i = 0; i < BG_STARS.length; i++) {
        const star = BG_STARS[i];
        const tw = Math.sin(frame * star.speed + star.phase) * 0.28 + 0.72;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.opacity * tw})`;
        ctx.fill();
      }

      // ── Accent coloured stars with soft glow
      for (let i = 0; i < ACCENT_STARS.length; i++) {
        const star = ACCENT_STARS[i];
        const tw = Math.sin(frame * star.speed + star.phase) * 0.22 + 0.78;
        const [r, g, b] = star.color;
        const x = star.x * w;
        const y = star.y * h;
        const r6 = star.size * 4;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, r6);
        glow.addColorStop(0, `rgba(${r},${g},${b},${star.opacity * tw * 0.30})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - r6, y - r6, r6 * 2, r6 * 2);

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${star.opacity * tw})`;
        ctx.fill();
      }

      // ── Bright stars with cross-flare
      for (let i = 0; i < BRIGHT_STARS.length; i++) {
        const star = BRIGHT_STARS[i];
        const tw = Math.sin(frame * star.speed + star.phase) * 0.18 + 0.82;
        const x = star.x * w;
        const y = star.y * h;
        const r6 = star.size * 7;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, r6);
        glow.addColorStop(0,   `rgba(215,205,255,${star.opacity * tw * 0.22})`);
        glow.addColorStop(0.5, `rgba(180,165,255,${star.opacity * tw * 0.08})`);
        glow.addColorStop(1,   'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(x - r6, y - r6, r6 * 2, r6 * 2);

        crossFlare(x, y, star.size, star.opacity * tw);

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.opacity * tw})`;
        ctx.fill();
      }

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
