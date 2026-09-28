import React, { useEffect, useRef, useState } from 'react';

interface VoyageBackgroundProps {
  currentSceneIndex: number;
  scrollProgress: number;
}

const SCENE_ASSETS = [
  { id: 'sky', src: '/assets/scenes/scene1_sky.jpg', range: [0.0, 0.25] },
  { id: 'islands', src: '/assets/scenes/scene2_islands.jpg', range: [0.15, 0.48] },
  { id: 'sunny', src: '/assets/scenes/scene3_sunny.jpg', range: [0.38, 0.68] },
  { id: 'whitebeard', src: '/assets/scenes/scene4_whitebeard.jpg', range: [0.58, 0.85] },
  { id: 'battlefield', src: '/assets/scenes/scene5_battlefield.jpg', range: [0.75, 1.0] },
];

export const VoyageBackground: React.FC<VoyageBackgroundProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [smoothProgress, setSmoothProgress] = useState(scrollProgress);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Desktop subtle mouse parallax
  useEffect(() => {
    if (isReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x: normX, y: normY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReducedMotion]);

  // Smooth lerper for scrollProgress
  useEffect(() => {
    let current = smoothProgress;
    const update = () => {
      const diff = scrollProgress - current;
      current += diff * 0.15;
      setSmoothProgress(current);
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scrollProgress]);

  const p = Math.max(0, Math.min(1, smoothProgress));

  // Compute opacities for continuous crossfade between the 5 scenes
  const computeOpacity = (start: number, end: number, current: number) => {
    if (current < start) return 0;
    if (current > end) return 0;
    const mid = (start + end) / 2;
    const halfSpan = (end - start) / 2;
    // Bell curve / smooth window
    const dist = Math.abs(current - mid);
    const normalized = 1 - dist / halfSpan;
    return Math.max(0, Math.min(1, normalized * 1.4));
  };

  const opacities = [
    // Scene 1: Sky & Luffy (starts at 1.0, fades out around 0.25)
    p < 0.15 ? 1 : Math.max(0, 1 - (p - 0.15) / 0.12),
    // Scene 2: Islands & Ocean Reveal (peaks around 0.32)
    computeOpacity(0.12, 0.48, p),
    // Scene 3: Thousand Sunny Crew (peaks around 0.52)
    computeOpacity(0.35, 0.68, p),
    // Scene 4: Whitebeard Moby Dick (peaks around 0.72)
    computeOpacity(0.55, 0.86, p),
    // Scene 5: Battlefield Sunset Flag (fades in from 0.75, stays 1.0 at bottom)
    p > 0.88 ? 1 : Math.max(0, (p - 0.74) / 0.14),
  ];

  // Ambient Weather & Particle Canvas (Sun glints, rain, embers, lightning)
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

    // Weather particle pools
    const embers = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1.5 + Math.random() * 3,
      speedY: 1 + Math.random() * 2.5,
      wobble: Math.random() * Math.PI * 2,
      color: Math.random() > 0.35 ? '#ef4444' : '#f59e0b',
    }));

    const seaSpray = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 12 + Math.random() * 15,
      speed: 12 + Math.random() * 8,
    }));

    let lightningTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sea spray / storm rain during mid-descent (Scenes 3 & 4)
      if (p >= 0.35 && p <= 0.8) {
        const intensity = Math.sin(((p - 0.35) / 0.45) * Math.PI);
        ctx.strokeStyle = `rgba(224, 242, 254, ${0.35 * intensity})`;
        ctx.lineWidth = 1.2;
        for (const drop of seaSpray) {
          drop.y += drop.speed;
          drop.x -= 2;
          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.len);
          ctx.stroke();
        }
      }

      // Fiery Embers during Battlefield Sunset (Scene 5: p > 0.7)
      if (p > 0.68) {
        const emberIntensity = (p - 0.68) / 0.32;
        for (const ember of embers) {
          ember.y -= ember.speedY;
          ember.wobble += 0.05;
          const currX = ember.x + Math.sin(ember.wobble) * 2;

          if (ember.y < -10) {
            ember.y = height + 10;
            ember.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(currX, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fillStyle = ember.color;
          ctx.shadowColor = ember.color;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = emberIntensity * 0.9;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }

        // Stochastic Conqueror lightning flash
        lightningTimer++;
        if (lightningTimer > 120 && Math.random() < 0.12) {
          lightningTimer = 0;
          ctx.save();
          ctx.strokeStyle = Math.random() > 0.4 ? '#dc2626' : '#ffffff';
          ctx.lineWidth = 2 + Math.random() * 3;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 18;

          let lx = Math.random() * width;
          let ly = 0;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          for (let step = 0; step < 7; step++) {
            lx += (Math.random() - 0.5) * 90;
            ly += Math.random() * (height * 0.15);
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [p, isReducedMotion]);

  const mouseX = mouseOffset.x * 12;
  const mouseY = mouseOffset.y * 10;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-slate-950" aria-hidden="true">
      {/* 5 Continuous Photo-Scene Layers matching the reference image */}
      {SCENE_ASSETS.map((asset, idx) => {
        const opacity = opacities[idx];
        // Calculate progressive zoom/scale as camera plunges into each scene
        const depthScale = 1.05 + (p * 0.08) + (idx * 0.02);

        return (
          <div
            key={asset.id}
            className="absolute inset-0 bg-cover bg-center will-change-transform transition-opacity duration-700 ease-out"
            style={{
              backgroundImage: `url(${asset.src})`,
              opacity,
              transform: `scale(${depthScale}) translate(${mouseX * 0.3}px, ${mouseY * 0.3}px)`,
              zIndex: idx + 1,
            }}
          />
        );
      })}

      {/* Atmospheric Weather Canvas (Spray, Embers, Lightning) */}
      {!isReducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
      )}

      {/* Subtle Vignette Scrim to ensure WCAG AA contrast for text and cards */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-colors duration-500"
        style={{
          background: p < 0.3
            ? 'linear-gradient(to bottom, rgba(2, 6, 23, 0.25) 0%, rgba(2, 6, 23, 0.45) 100%)'
            : p < 0.75
            ? 'linear-gradient(to bottom, rgba(2, 6, 23, 0.35) 0%, rgba(2, 6, 23, 0.6) 100%)'
            : 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.75) 100%)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
        }}
      />
    </div>
  );
};
