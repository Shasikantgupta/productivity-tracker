'use client';

import { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;

    let width, height;
    let stars = [];
    let nebulas = [];
    let galaxies = [];
    
    // Interaction states
    let mouse = { x: 0, y: 0 };
    let scrollVelocity = 0;
    
    // Star color temperatures
    const starColors = ['#ffffff', '#e0f7fa', '#fff9c4', '#ffe0b2', '#ffcc80'];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      if (mouse.x === 0 && mouse.y === 0) {
        mouse.x = width / 2;
        mouse.y = height / 2;
      }
      
      initEnvironment();
    };

    const initEnvironment = () => {
      stars = [];
      nebulas = [];
      galaxies = [];
      
      // Responsive star count
      const density = width < 768 ? 3000 : 1500;
      const numStars = Math.min(Math.floor((width * height) / density), 1200);

      // Initialize Stars
      for (let i = 0; i < numStars; i++) {
        const layer = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * width,
          layer: layer, // 1: far, 2: mid, 3: near
          radius: (Math.random() * 0.8 + 0.2) * (layer * 0.7),
          color: starColors[Math.floor(Math.random() * starColors.length)],
          twinkleSpeed: Math.random() < 0.2 ? Math.random() * 0.05 + 0.01 : 0,
          twinklePhase: Math.random() * Math.PI * 2,
          speed: layer * 0.2
        });
      }

      // Initialize Nebulas (JWST Palettes)
      const nebulaPalettes = [
        // Pillars of Creation (Amber/Gold/Brown)
        ['rgba(210, 105, 30, 0.08)', 'rgba(255, 140, 0, 0.04)', 'transparent'],
        // Cosmic Cliffs (Teal/Purple)
        ['rgba(0, 128, 128, 0.06)', 'rgba(138, 43, 226, 0.04)', 'transparent'],
        // Deep Space (Magenta/Blue)
        ['rgba(255, 0, 255, 0.05)', 'rgba(0, 0, 255, 0.03)', 'transparent']
      ];

      for (let i = 0; i < 3; i++) {
        nebulas.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.max(width, height) * (Math.random() * 0.4 + 0.3),
          colors: nebulaPalettes[i % nebulaPalettes.length],
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1
        });
      }

      // Initialize Galaxies
      for (let i = 0; i < 3; i++) {
        galaxies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 40 + 20,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.002,
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    };

    window.addEventListener('resize', resize);
    
    // Visibility API for performance
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Mouse Tracking
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll Tracking for hyper-drive effect
    let scrollTimeout;
    const handleScroll = () => {
      scrollVelocity = Math.min(scrollVelocity + 0.5, 15);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Let it decay in the render loop
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    resize();

    // Helper: Draw Spiral Galaxy
    const drawGalaxy = (galaxy) => {
      ctx.save();
      ctx.translate(galaxy.x, galaxy.y);
      ctx.rotate(galaxy.angle);
      
      // Core
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.radius * 0.3);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, galaxy.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = galaxy.color;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        for (let j = 0; j < 40; j++) {
          const angle = (j * 0.1) + (i * Math.PI);
          const r = j * (galaxy.radius / 40);
          const alpha = Math.max(0, 0.4 - (j / 40) * 0.4);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          const gx = Math.cos(angle) * r;
          const gy = Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.stroke();
      }
      
      ctx.restore();
      galaxy.angle += galaxy.rotationSpeed;
    };

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Decay scroll velocity
      scrollVelocity *= 0.92;
      if (scrollVelocity < 0.1) scrollVelocity = 0;

      // Dark background with slight motion blur trail
      ctx.fillStyle = 'rgba(2, 2, 5, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Render Nebulas
      nebulas.forEach(nebula => {
        nebula.x += nebula.vx;
        nebula.y += nebula.vy;
        
        // Wrap around
        if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
        if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;

        const grad = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        grad.addColorStop(0, nebula.colors[0]);
        grad.addColorStop(0.5, nebula.colors[1]);
        grad.addColorStop(1, nebula.colors[2]);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Galaxies
      galaxies.forEach(galaxy => drawGalaxy(galaxy));

      // Render Stars (Parallax & Wormhole)
      const centerX = mouse.x;
      const centerY = mouse.y;

      stars.forEach(star => {
        // Parallax drift based on mouse position
        const dx = (centerX - width / 2) * (star.layer * 0.02);
        const dy = (centerY - height / 2) * (star.layer * 0.02);
        
        // Base movement
        star.x -= dx * 0.05;
        star.y -= dy * 0.05;
        
        // Wrap around bounds
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Calculate stretch for wormhole effect
        const distToMouse = Math.sqrt(Math.pow(star.x - centerX, 2) + Math.pow(star.y - centerY, 2));
        const maxDist = Math.max(width, height);
        
        // Stretch multiplier based on proximity to cursor AND scroll speed
        let stretch = 1;
        if (distToMouse < 300) {
          stretch = 1 + ((300 - distToMouse) / 100) * (star.layer * 0.5);
        }
        stretch += scrollVelocity * (star.layer * 0.5);

        // Calculate opacity and twinkle
        let opacity = star.layer * 0.3;
        if (star.twinkleSpeed > 0) {
          star.twinklePhase += star.twinkleSpeed;
          opacity *= (0.5 + Math.abs(Math.sin(star.twinklePhase)) * 0.5);
        }

        ctx.beginPath();
        if (stretch > 1.2) {
          // Draw streak line away from center
          const angle = Math.atan2(star.y - centerY, star.x - centerX);
          const length = star.radius * stretch * 2;
          const endX = star.x + Math.cos(angle) * length;
          const endY = star.y + Math.sin(angle) * length;
          
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = star.radius;
          ctx.stroke();
        } else {
          // Draw normal star
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = opacity;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0; // Reset
      });

      // Dark Overlay / Vignette to ensure content readability
      const overlayGrad = ctx.createRadialGradient(width/2, height/2, height * 0.2, width/2, height/2, Math.max(width, height) * 0.8);
      overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)'); // Center is moderately dark
      overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)'); // Edges are very dark
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#020205',
      }}
    />
  );
}
