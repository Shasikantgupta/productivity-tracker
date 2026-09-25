'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    isVisible: true,
    prefersReducedMotion: false,
    time: 0,
  });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const state = stateRef.current;

    let width, height;
    let stars = [];
    let nebulae = [];
    let galaxies = [];
    let constellations = [];
    let meteors = [];
    let dustParticles = [];
    let voidCore = {};

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e) => { state.prefersReducedMotion = e.matches; };
    motionQuery.addEventListener('change', handleMotionChange);

    // Star color temperatures (O B A F G K M spectral classes)
    const starColors = [
      { r: 155, g: 176, b: 255 },  // Blue-white (B)
      { r: 170, g: 191, b: 255 },  // Blue (A)
      { r: 202, g: 215, b: 255 },  // Blue-white
      { r: 248, g: 247, b: 255 },  // White (F)
      { r: 255, g: 244, b: 234 },  // Yellow-white (G)
      { r: 255, g: 210, b: 161 },  // Orange (K)
      { r: 255, g: 204, b: 111 },  // Warm yellow
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (state.mouse.targetX === 0 && state.mouse.targetY === 0) {
        state.mouse.targetX = width / 2;
        state.mouse.targetY = height / 2;
        state.mouse.x = width / 2;
        state.mouse.y = height / 2;
      }

      initEnvironment();
    };

    const initEnvironment = () => {
      // ── Stars ──
      const isMobile = width < 768;
      const isTablet = width < 1024;
      const baseDensity = isMobile ? 4500 : isTablet ? 2800 : 1800;
      const numStars = Math.min(Math.floor((width * height) / baseDensity), isMobile ? 400 : 1000);

      stars = [];
      for (let i = 0; i < numStars; i++) {
        const rand = Math.random();
        // 55% far, 30% mid, 15% near
        const layer = rand < 0.55 ? 1 : rand < 0.85 ? 2 : 3;
        const colorData = starColors[Math.floor(Math.random() * starColors.length)];
        const baseRadius = layer === 1 ? Math.random() * 0.8 + 0.3
                         : layer === 2 ? Math.random() * 1.2 + 0.5
                         : Math.random() * 2.0 + 0.8;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: 0, baseY: 0, // set below
          layer,
          radius: baseRadius,
          color: colorData,
          // ~25% of stars twinkle
          twinkleSpeed: Math.random() < 0.25 ? (Math.random() * 0.008 + 0.003) : 0,
          twinklePhase: Math.random() * Math.PI * 2,
          baseOpacity: layer === 1 ? Math.random() * 0.4 + 0.2
                     : layer === 2 ? Math.random() * 0.6 + 0.3
                     : Math.random() * 0.8 + 0.4,
        });
        stars[stars.length - 1].baseX = stars[stars.length - 1].x;
        stars[stars.length - 1].baseY = stars[stars.length - 1].y;
      }

      // ── Nebulae ──
      const nebulaPalettes = [
        // Cosmic blue-purple
        [
          { r: 30, g: 50, b: 120, a: 0.035 },
          { r: 80, g: 40, b: 140, a: 0.02 },
          { r: 0, g: 0, b: 0, a: 0 },
        ],
        // Deep violet
        [
          { r: 100, g: 30, b: 160, a: 0.025 },
          { r: 40, g: 20, b: 100, a: 0.015 },
          { r: 0, g: 0, b: 0, a: 0 },
        ],
        // Teal-cyan haze
        [
          { r: 10, g: 80, b: 110, a: 0.025 },
          { r: 30, g: 50, b: 90, a: 0.015 },
          { r: 0, g: 0, b: 0, a: 0 },
        ],
        // Warm amber dust (very faint)
        [
          { r: 140, g: 70, b: 20, a: 0.015 },
          { r: 80, g: 40, b: 30, a: 0.008 },
          { r: 0, g: 0, b: 0, a: 0 },
        ],
      ];

      nebulae = [];
      const nebulaCount = isMobile ? 2 : 4;
      for (let i = 0; i < nebulaCount; i++) {
        const palette = nebulaPalettes[i % nebulaPalettes.length];
        nebulae.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.max(width, height) * (Math.random() * 0.35 + 0.25),
          colors: palette,
          vx: (Math.random() - 0.5) * 0.03,
          vy: (Math.random() - 0.5) * 0.03,
          // Elliptical distortion
          scaleX: Math.random() * 0.4 + 0.8,
          scaleY: Math.random() * 0.4 + 0.8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.00005,
        });
      }

      // ── Galaxies (vivid, prominent) ──
      galaxies = [];
      const galaxyCount = isMobile ? 2 : 5;
      for (let i = 0; i < galaxyCount; i++) {
        galaxies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 50 + 30,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.0008,
          opacity: Math.random() * 0.4 + 0.2,
          arms: Math.floor(Math.random() * 3) + 2,
        });
      }

      // ── Constellations ──
      constellations = [];
      if (!isMobile) {
        const constCount = Math.floor(Math.random() * 2) + 2; // 2-3
        for (let c = 0; c < constCount; c++) {
          const cx = Math.random() * width * 0.8 + width * 0.1;
          const cy = Math.random() * height * 0.8 + height * 0.1;
          const nodeCount = Math.floor(Math.random() * 4) + 3; // 3-6 nodes
          const nodes = [];
          for (let n = 0; n < nodeCount; n++) {
            nodes.push({
              x: cx + (Math.random() - 0.5) * 150,
              y: cy + (Math.random() - 0.5) * 120,
            });
          }
          // Connect nodes in a chain, with some random extra connections
          const edges = [];
          for (let n = 0; n < nodes.length - 1; n++) {
            edges.push([n, n + 1]);
          }
          // Add 1-2 extra random connections
          for (let e = 0; e < Math.floor(Math.random() * 2) + 1; e++) {
            const a = Math.floor(Math.random() * nodes.length);
            const b = Math.floor(Math.random() * nodes.length);
            if (a !== b) edges.push([a, b]);
          }
          constellations.push({
            nodes,
            edges,
            driftX: (Math.random() - 0.5) * 0.015,
            driftY: (Math.random() - 0.5) * 0.01,
            opacity: Math.random() * 0.06 + 0.03,
          });
        }
      }

      // ── Dust Particles ──
      dustParticles = [];
      const dustCount = isMobile ? 15 : 40;
      for (let i = 0; i < dustCount; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.15 + 0.03,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          layer: Math.random() < 0.5 ? 2 : 3,
          pulseSpeed: Math.random() * 0.005 + 0.002,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // ── Void Core ──
      voidCore = {
        x: width * 0.5,
        y: height * 0.45,
        radius: Math.min(width, height) * 0.22,
        pulsePhase: 0,
        pulseSpeed: 0.003,
      };

      // ── Meteors (start empty, spawn occasionally) ──
      meteors = [];
    };

    // ── Event Listeners ──
    window.addEventListener('resize', resize);

    const handleVisibility = () => {
      state.isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleMouseMove = (e) => {
      state.mouse.targetX = e.clientX;
      state.mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    resize();

    // ── Render Helpers ──
    const drawNebula = (nebula) => {
      ctx.save();
      ctx.translate(nebula.x, nebula.y);
      ctx.rotate(nebula.rotation);
      ctx.scale(nebula.scaleX, nebula.scaleY);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
      const c = nebula.colors;
      grad.addColorStop(0, `rgba(${c[0].r},${c[0].g},${c[0].b},${c[0].a})`);
      grad.addColorStop(0.5, `rgba(${c[1].r},${c[1].g},${c[1].b},${c[1].a})`);
      grad.addColorStop(1, `rgba(${c[2].r},${c[2].g},${c[2].b},${c[2].a})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, nebula.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawGalaxy = (galaxy) => {
      ctx.save();
      ctx.translate(galaxy.x, galaxy.y);
      ctx.rotate(galaxy.angle);
      ctx.globalAlpha = galaxy.opacity;

      // Core glow
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.25);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGrad.addColorStop(0.5, 'rgba(180, 200, 255, 0.4)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, galaxy.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms
      for (let arm = 0; arm < galaxy.arms; arm++) {
        ctx.beginPath();
        const armOffset = (Math.PI * 2 / galaxy.arms) * arm;
        for (let j = 0; j < 50; j++) {
          const angle = (j * 0.12) + armOffset;
          const r = (j / 50) * galaxy.radius;
          const alpha = Math.max(0, 0.7 - (j / 50) * 0.7);
          const gx = Math.cos(angle) * r;
          const gy = Math.sin(angle) * r * 0.6; // Flatten for elliptical feel
          if (j === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
          ctx.strokeStyle = `rgba(180, 210, 255, ${alpha})`;
        }
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const drawVoidCore = (time) => {
      const pulse = Math.sin(time * voidCore.pulseSpeed) * 0.15 + 1;
      const r = voidCore.radius * pulse;
      const cx = voidCore.x;
      const cy = voidCore.y;

      // Outer gravitational glow ring — purple/blue
      const outerGrad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.3);
      outerGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      outerGrad.addColorStop(0.4, 'rgba(40, 20, 80, 0.012)');
      outerGrad.addColorStop(0.7, 'rgba(30, 40, 120, 0.008)');
      outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Inner void — deeper black
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
      innerGrad.addColorStop(0, 'rgba(0, 0, 2, 0.15)');
      innerGrad.addColorStop(0.6, 'rgba(0, 0, 5, 0.08)');
      innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawConstellation = (constellation, time) => {
      const drift = state.prefersReducedMotion ? 0 : time;
      ctx.save();
      ctx.globalAlpha = constellation.opacity;

      // Draw connecting lines
      ctx.strokeStyle = 'rgba(100, 140, 255, 0.5)';
      ctx.lineWidth = 0.4;
      constellation.edges.forEach(([a, b]) => {
        const na = constellation.nodes[a];
        const nb = constellation.nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.x + drift * constellation.driftX, na.y + drift * constellation.driftY);
        ctx.lineTo(nb.x + drift * constellation.driftX, nb.y + drift * constellation.driftY);
        ctx.stroke();
      });

      // Draw node stars
      constellation.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(
          node.x + drift * constellation.driftX,
          node.y + drift * constellation.driftY,
          1.2, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(160, 190, 255, 0.7)';
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const spawnMeteor = () => {
      if (meteors.length >= 2) return; // Max 2 concurrent
      const startX = Math.random() * width;
      const startY = Math.random() * height * 0.4;
      const angle = Math.random() * 0.4 + 0.3; // 0.3-0.7 radians downward
      const speed = Math.random() * 1.5 + 0.8;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 60 + 30,
        opacity: Math.random() * 0.3 + 0.1,
        life: 0,
        maxLife: Math.random() * 120 + 60,
      });
    };

    // ── Main Render Loop ──
    let lastTime = performance.now();

    const render = (currentTime) => {
      rafRef.current = requestAnimationFrame(render);

      if (!state.isVisible) return;

      const dt = Math.min(currentTime - lastTime, 50); // Cap at 50ms
      lastTime = currentTime;
      state.time += dt * 0.06; // Normalized time

      const reduced = state.prefersReducedMotion;

      // Smooth mouse interpolation
      if (!reduced) {
        state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.03;
        state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.03;
      }

      // ── Clear with deep space base color ──
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, width, height);

      // ── Void Core (behind everything) ──
      drawVoidCore(state.time);

      // ── Nebulae ──
      nebulae.forEach(nebula => {
        if (!reduced) {
          nebula.x += nebula.vx;
          nebula.y += nebula.vy;
          nebula.rotation += nebula.rotSpeed;

          // Soft wrap
          if (nebula.x > width + nebula.radius * 0.5) nebula.x = -nebula.radius * 0.5;
          if (nebula.x < -nebula.radius * 0.5) nebula.x = width + nebula.radius * 0.5;
          if (nebula.y > height + nebula.radius * 0.5) nebula.y = -nebula.radius * 0.5;
          if (nebula.y < -nebula.radius * 0.5) nebula.y = height + nebula.radius * 0.5;
        }
        drawNebula(nebula);
      });

      // ── Galaxies ──
      galaxies.forEach(galaxy => {
        if (!reduced) {
          galaxy.angle += galaxy.rotSpeed;
        }
        drawGalaxy(galaxy);
      });

      // ── Constellations ──
      constellations.forEach(c => drawConstellation(c, state.time));

      // ── Stars with parallax ──
      const parallaxX = reduced ? 0 : (state.mouse.x - width / 2);
      const parallaxY = reduced ? 0 : (state.mouse.y - height / 2);

      stars.forEach(star => {
        // Parallax offset per layer
        const px = star.layer === 1 ? parallaxX * 0.003
                 : star.layer === 2 ? parallaxX * 0.008
                 : parallaxX * 0.018;
        const py = star.layer === 1 ? parallaxY * 0.003
                 : star.layer === 2 ? parallaxY * 0.008
                 : parallaxY * 0.018;

        const drawX = star.baseX + px;
        const drawY = star.baseY + py;

        // Twinkle
        let opacity = star.baseOpacity;
        if (star.twinkleSpeed > 0 && !reduced) {
          star.twinklePhase += star.twinkleSpeed;
          opacity *= (0.5 + Math.abs(Math.sin(star.twinklePhase)) * 0.5);
        }

        const c = star.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${opacity})`;
        ctx.fill();

        // Add glow halo for brighter/larger stars
        if (star.radius > 1.0 && star.layer === 3) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${opacity * 0.08})`;
          ctx.fill();
        }
      });

      // ── Dust Particles ──
      dustParticles.forEach(p => {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Wrap
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        const px = reduced ? 0 : (parallaxX * (p.layer === 2 ? 0.008 : 0.018));
        const py = reduced ? 0 : (parallaxY * (p.layer === 2 ? 0.008 : 0.018));
        const pOpacity = p.opacity * (0.7 + Math.sin(p.pulsePhase) * 0.3);

        ctx.beginPath();
        ctx.arc(p.x + px, p.y + py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 170, 255, ${pOpacity})`;
        ctx.fill();
      });

      // ── Meteors ──
      if (!reduced) {
        // Rare spawning: ~1 every 8 seconds average
        if (Math.random() < 0.002) {
          spawnMeteor();
        }

        meteors.forEach(m => {
          m.x += m.vx;
          m.y += m.vy;
          m.life++;

          // Fade in/out
          let alpha = m.opacity;
          const fadeIn = Math.min(m.life / 15, 1);
          const fadeOut = Math.max(1 - (m.life - m.maxLife + 30) / 30, 0);
          alpha *= fadeIn * fadeOut;

          if (alpha > 0.005) {
            const tailX = m.x - m.vx * m.length * 0.5;
            const tailY = m.y - m.vy * m.length * 0.5;

            const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            grad.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
            grad.addColorStop(0.4, `rgba(160, 180, 255, ${alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(100, 130, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Bright head
            ctx.beginPath();
            ctx.arc(m.x, m.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 230, 255, ${alpha * 0.8})`;
            ctx.fill();
          }
        });

        // Remove dead meteors
        meteors = meteors.filter(m => m.life < m.maxLife);
      }

      // ── Subtle cosmic glow patches (static, CSS-like gradients) ──
      // Top-right blue glow
      const glowGrad1 = ctx.createRadialGradient(
        width * 0.85, height * 0.1, 0,
        width * 0.85, height * 0.1, width * 0.3
      );
      glowGrad1.addColorStop(0, 'rgba(30, 60, 150, 0.015)');
      glowGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad1;
      ctx.fillRect(0, 0, width, height);

      // Bottom-left purple glow
      const glowGrad2 = ctx.createRadialGradient(
        width * 0.15, height * 0.85, 0,
        width * 0.15, height * 0.85, width * 0.25
      );
      glowGrad2.addColorStop(0, 'rgba(80, 30, 120, 0.012)');
      glowGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad2;
      ctx.fillRect(0, 0, width, height);

      // ── Vignette for readability ──
      const vGrad = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.25,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      vGrad.addColorStop(0, 'rgba(2, 2, 8, 0.15)');
      vGrad.addColorStop(0.6, 'rgba(2, 2, 8, 0.3)');
      vGrad.addColorStop(1, 'rgba(2, 2, 8, 0.55)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#020208',
      }}
    />
  );
}
