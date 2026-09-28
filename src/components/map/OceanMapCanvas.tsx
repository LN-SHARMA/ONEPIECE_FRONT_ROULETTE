import React, { useEffect, useRef } from 'react';

interface OceanMapCanvasProps {
  dayTimePhase: number; // 0 to 1 (0: Dawn, 0.25: Noon, 0.6: Dusk, 0.85: Night)
  isReducedMotion: boolean;
}

export const OceanMapCanvas: React.FC<OceanMapCanvasProps> = ({ dayTimePhase, isReducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let waveTick = 0;

    // Drifting cloud shadows
    const clouds = [
      { x: 100, y: 150, size: 200, speed: 0.4 },
      { x: 700, y: 300, size: 280, speed: 0.3 },
      { x: 1400, y: 600, size: 240, speed: 0.5 },
    ];

    const render = () => {
      waveTick += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Ocean Base Tint based on Day/Night phase
      let oceanColor = '#0369a1';
      if (dayTimePhase < 0.2) {
        oceanColor = '#0f766e'; // Dawn teal
      } else if (dayTimePhase < 0.5) {
        oceanColor = '#0284c7'; // Noon bright ocean
      } else if (dayTimePhase < 0.75) {
        oceanColor = '#c2410c'; // Sunset orange water reflection
      } else {
        oceanColor = '#020617'; // Night abyss
      }

      ctx.fillStyle = oceanColor;
      ctx.fillRect(0, 0, width, height);

      // 2. Wave pattern tiles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      const step = 60;
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 40) {
          const waveY = y + Math.sin((x * 0.05) + waveTick) * 4;
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }

      // 3. Drifting cloud shadows
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > width + cloud.size) cloud.x = -cloud.size;

        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Night Lantern Fireflies & Stars if Night
      if (dayTimePhase >= 0.75) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
        for (let i = 0; i < 30; i++) {
          const sx = (Math.sin(i * 99 + waveTick * 0.5) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 33 + waveTick * 0.5) * 0.5 + 0.5) * height;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [dayTimePhase, isReducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};
