'use client';

import { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width, height;
    let stars = [];
    const numStars = 800;
    
    // Mouse interaction for the "wormhole" effect
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      mouse.x = width / 2;
      mouse.y = height / 2;
      targetMouse.x = width / 2;
      targetMouse.y = height / 2;
    };

    window.addEventListener('resize', resize);
    resize();

    // James Webb color palette (gold, deep blues, purples, oranges)
    const colors = [
      '#FFD700', // Gold
      '#FF8C00', // DarkOrange
      '#9370DB', // MediumPurple
      '#00BFFF', // DeepSkyBlue
      '#FFFFFF'  // White
    ];

    class Star {
      constructor() {
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
        this.z = Math.random() * width;
        this.radius = Math.random() * 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.z -= 2; // Speed of movement towards camera
        
        if (this.z <= 0) {
          this.z = width;
          this.x = (Math.random() - 0.5) * width * 2;
          this.y = (Math.random() - 0.5) * height * 2;
        }
      }

      draw() {
        // Project 3D coordinates to 2D screen
        const xProjected = (this.x / this.z) * width + mouse.x;
        const yProjected = (this.y / this.z) * height + mouse.y;
        
        const radiusProjected = (this.radius / this.z) * 100;
        
        // Only draw if within bounds
        if (
          xProjected >= 0 && xProjected <= width &&
          yProjected >= 0 && yProjected <= height
        ) {
          const opacity = (1 - this.z / width) * 0.8; // Fade in as it gets closer
          ctx.beginPath();
          ctx.arc(xProjected, yProjected, radiusProjected, 0, Math.PI * 2);
          
          // Add a glow effect
          ctx.shadowBlur = radiusProjected * 5;
          ctx.shadowColor = this.color;
          ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${opacity})`;
          ctx.fill();
          
          // Reset shadow for performance on other elements if any
          ctx.shadowBlur = 0;
        }
      }
    }

    // Helper to convert hex to rgb for opacity control
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '255, 255, 255';
    }

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    const handleMouseMove = (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Smooth mouse interpolation for the wormhole effect
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Dark background with slight transparency for motion blur
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle nebula gradients (James Webb style)
      const gradient1 = ctx.createRadialGradient(
        width * 0.2, height * 0.2, 0, 
        width * 0.2, height * 0.2, width * 0.5
      );
      gradient1.addColorStop(0, 'rgba(147, 112, 219, 0.03)'); // Purple nebula
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const gradient2 = ctx.createRadialGradient(
        width * 0.8, height * 0.8, 0, 
        width * 0.8, height * 0.8, width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(255, 140, 0, 0.03)'); // Orange/Gold nebula
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
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
        background: '#000', // Fallback background
      }}
    />
  );
}
