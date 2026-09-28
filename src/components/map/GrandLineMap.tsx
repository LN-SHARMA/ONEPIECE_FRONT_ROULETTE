import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useFleetStore } from '../../store/fleetStore';
import { IslandBuildingModal } from './IslandBuildingModal';
import { ChallengeTeamDashboard } from '../dashboard/ChallengeTeamDashboard';
import { JollyRogerAvatar, LogPoseCompassIcon } from '../common/SvgIcons';
import { 
  Compass, ZoomIn, ZoomOut, RotateCcw, Bell, User, Ship, Map as MapIcon, 
  Anchor, Users, Trophy, Zap, Crown, Cpu 
} from 'lucide-react';

const MAP_WIDTH = 2560;
const MAP_HEIGHT = 1440;

interface MapIslandPin {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  xPct: number;
  yPct: number;
  color: string;
  icon: 'anchor' | 'users' | 'trophy' | 'zap' | 'ship' | 'crown';
}

export const GrandLineMap: React.FC = () => {
  const {
    participants,
    crews,
    challenges,
    balanceScore,
    selectedIslandId,
    setSelectedIslandId,
    gameState,
    viewMode,
    setViewMode,
  } = useFleetStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // State for rendering
  const [camera, setCamera] = useState<{ x: number; y: number; zoom: number }>({
    x: 800,
    y: 550,
    zoom: 0.85,
  });

  // Target camera for silky smooth physics loop
  const targetRef = useRef<{ x: number; y: number; zoom: number }>({
    x: 800,
    y: 550,
    zoom: 0.85,
  });

  const currentRef = useRef<{ x: number; y: number; zoom: number }>({
    x: 800,
    y: 550,
    zoom: 0.85,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, camX: 0, camY: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showCSEDashboard, setShowCSEDashboard] = useState(false);

  // Smooth Physics Animation Loop (Interpolation / Lerp)
  useEffect(() => {
    let animId: number;
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

    const tick = () => {
      const cur = currentRef.current;
      const tar = targetRef.current;

      const factor = isDraggingRef.current ? 0.4 : 0.18;
      cur.x = lerp(cur.x, tar.x, factor);
      cur.y = lerp(cur.y, tar.y, factor);
      cur.zoom = lerp(cur.zoom, tar.zoom, factor);

      setCamera({ x: cur.x, y: cur.y, zoom: cur.zoom });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Resize handler
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);

    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global mouseup / pointerup to ensure drag never gets stuck
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  // Hash deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/map/')) {
        const id = hash.replace('#/map/', '');
        if (id) setSelectedIslandId(id);
      } else if (hash.startsWith('#/dashboard')) {
        setShowCSEDashboard(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setSelectedIslandId]);

  // Island Coordinates accurately matching each island in the reference image
  const ISLANDS: MapIslandPin[] = [
    {
      id: 'island-sunny-hq',
      name: 'Thousand Sunny Dock',
      subtitle: 'Fleet HQ • Sunny Harbor',
      badge: `Level ${gameState.fleetLevel} • ${participants.length} Pirates`,
      xPct: 22,
      yPct: 26,
      color: '#f59e0b',
      icon: 'anchor',
    },
    {
      id: 'island-recruitment',
      name: 'Recruitment Isle',
      subtitle: 'Pink Mangrove • Wanted Wall',
      badge: `${participants.length} Bounties Active`,
      xPct: 37,
      yPct: 69,
      color: '#ec4899',
      icon: 'users',
    },
    {
      id: 'island-foxy',
      name: "Foxy's Arena Isle",
      subtitle: 'Red Coliseum • Davy Back Fight',
      badge: `${challenges.length} Sanctioned Trials`,
      xPct: 71,
      yPct: 73,
      color: '#f97316',
      icon: 'trophy',
    },
    {
      id: 'island-harbor',
      name: 'Harbor of Crews',
      subtitle: 'Harbor Docks • Shipyard',
      badge: `${crews.length} Crews Docked`,
      xPct: 66,
      yPct: 33,
      color: '#0ea5e9',
      icon: 'ship',
    },
    {
      id: 'island-haki-forge',
      name: 'Haki Forge Isle',
      subtitle: 'Skull Island • Parity Forge',
      badge: `Parity Score: ${balanceScore}%`,
      xPct: 91,
      yPct: 28,
      color: '#a855f7',
      icon: 'zap',
    },
    {
      id: 'island-laughtale',
      name: 'Laugh Tale Isle',
      subtitle: 'Golden Temple • Final Roster',
      badge: 'Roster Locked',
      xPct: 95,
      yPct: 71,
      color: '#eab308',
      icon: 'crown',
    },
  ];

  // Camera Pan Handlers (Pointer Events)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectedIslandId) return;
    if (e.button !== 0) return; // Only main left click

    // Prevent dragging when clicking buttons, links, inputs, or interactive pins
    const target = e.target as HTMLElement;
    if (target.closest('button, [role="button"], a, input, select, textarea, .interactive-island, .interactive-widget, header')) {
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      camX: targetRef.current.x,
      camY: targetRef.current.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = (e.clientX - dragStartRef.current.mouseX) / targetRef.current.zoom;
    const dy = (e.clientY - dragStartRef.current.mouseY) / targetRef.current.zoom;

    targetRef.current.x = Math.max(300, Math.min(MAP_WIDTH - 300, dragStartRef.current.camX - dx));
    targetRef.current.y = Math.max(200, Math.min(MAP_HEIGHT - 200, dragStartRef.current.camY - dy));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  // Stable Cursor-Centric Zoom Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (selectedIslandId) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    const mouseX = e.clientX - (rect?.left || 0);
    const mouseY = e.clientY - (rect?.top || 0);

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.max(0.5, Math.min(1.8, targetRef.current.zoom * zoomFactor));

    // Keep world coordinates under the mouse constant
    const dx = mouseX - viewport.width / 2;
    const dy = mouseY - viewport.height / 2;
    const newTargetX = targetRef.current.x + dx * (1 / targetRef.current.zoom - 1 / newZoom);
    const newTargetY = targetRef.current.y + dy * (1 / targetRef.current.zoom - 1 / newZoom);

    targetRef.current = {
      x: Math.max(300, Math.min(MAP_WIDTH - 300, newTargetX)),
      y: Math.max(200, Math.min(MAP_HEIGHT - 200, newTargetY)),
      zoom: newZoom,
    };
  };

  // Double-Click to Zoom In towards cursor
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedIslandId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const mouseX = e.clientX - (rect?.left || 0);
    const mouseY = e.clientY - (rect?.top || 0);
    const newZoom = Math.min(1.8, targetRef.current.zoom * 1.35);

    const dx = mouseX - viewport.width / 2;
    const dy = mouseY - viewport.height / 2;
    const newTargetX = targetRef.current.x + dx * (1 / targetRef.current.zoom - 1 / newZoom);
    const newTargetY = targetRef.current.y + dy * (1 / targetRef.current.zoom - 1 / newZoom);

    targetRef.current = {
      x: Math.max(300, Math.min(MAP_WIDTH - 300, newTargetX)),
      y: Math.max(200, Math.min(MAP_HEIGHT - 200, newTargetY)),
      zoom: newZoom,
    };
  };

  const handleIslandClick = (id: string) => {
    const targetIsland = ISLANDS.find(i => i.id === id);
    if (targetIsland) {
      targetRef.current = {
        x: (targetIsland.xPct / 100) * MAP_WIDTH,
        y: (targetIsland.yPct / 100) * MAP_HEIGHT,
        zoom: Math.max(0.9, targetRef.current.zoom),
      };
    }
    window.location.hash = `#/map/${id}`;
    setSelectedIslandId(id);
  };

  const recenterCamera = () => {
    const sunny = ISLANDS.find(i => i.id === 'island-sunny-hq');
    targetRef.current = {
      x: sunny ? (sunny.xPct / 100) * MAP_WIDTH : 600,
      y: sunny ? (sunny.yPct / 100) * MAP_HEIGHT : 400,
      zoom: 0.85,
    };
  };

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPct = (e.clientX - rect.left) / rect.width;
    const clickYPct = (e.clientY - rect.top) / rect.height;
    targetRef.current = {
      x: Math.max(350, Math.min(MAP_WIDTH - 350, clickXPct * MAP_WIDTH)),
      y: Math.max(250, Math.min(MAP_HEIGHT - 250, clickYPct * MAP_HEIGHT)),
      zoom: targetRef.current.zoom,
    };
  };

  const handleLogPoseClick = () => {
    const foxy = ISLANDS.find(i => i.id === 'island-foxy');
    if (foxy) {
      targetRef.current = {
        x: (foxy.xPct / 100) * MAP_WIDTH,
        y: (foxy.yPct / 100) * MAP_HEIGHT,
        zoom: 1.1,
      };
      setTimeout(() => {
        handleIslandClick('island-foxy');
      }, 450);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      className="relative w-screen h-screen overflow-hidden bg-[#031525] select-none cursor-grab active:cursor-grabbing font-body touch-none"
    >
      {/* ======================================================== */}
      {/* TOP HEADER BAR matching Reference Screenshot */}
      {/* ======================================================== */}
      <header 
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-0 inset-x-0 z-40 px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/30 flex items-center justify-between shadow-xl pointer-events-auto"
      >
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center shadow-lg">
            <JollyRogerAvatar hatType="straw" symbol="crossbones" size={34} />
          </div>
          <div>
            <div className="font-pirate text-2xl text-parchment leading-none tracking-wide drop-shadow">
              GRAND FLEET
            </div>
            <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
              Davy Back Fight
            </div>
          </div>
        </div>

        {/* Center: Mode Toggle Pill ("Voyage" / "Map") */}
        <div className="flex items-center bg-slate-900 border border-amber-500/40 rounded-full p-1 shadow-inner">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('voyage');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'voyage'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Voyage</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('map');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>

        {/* CSE Challenge & Team Dashboard Launcher */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setShowCSEDashboard(true);
          }}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/40"
          title="Open CSE Challenge & Team Selection Dashboard"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>CSE Dashboard</span>
        </button>

        {/* Right: Berries, Level, Profile, Bell */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-inner">
            <span className="text-amber-400">🪙</span>
            <span>{gameState.berries.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold text-xs">
            <span>Lv. {gameState.fleetLevel}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>

          <div className="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* PANNABLE / ZOOMABLE WORLD MAP CANVAS CONTAINER */}
      {/* ======================================================== */}
      <div
        className="absolute origin-top-left will-change-transform"
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          transform: `translate3d(${viewport.width / 2 - camera.x * camera.zoom}px, ${viewport.height / 2 - camera.y * camera.zoom}px, 0) scale(${camera.zoom})`,
        }}
      >
        {/* World Map Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center shadow-2xl"
          style={{ backgroundImage: `url('/assets/map/world_map_bg.jpg')` }}
        />

        {/* Dynamic Dotted Grand Line Route connecting all 6 Islands */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          {/* Main Loop Path linking all 6 Islands */}
          <path
            d="M 563 374 C 650 650, 750 900, 947 993 C 1200 1100, 1500 1120, 1817 1051 C 2050 990, 2250 1020, 2432 1022 C 2480 800, 2420 550, 2329 403 C 2150 280, 1900 350, 1689 475 C 1300 700, 850 300, 563 374"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray="12,14"
            opacity="0.85"
            className="animate-pulse"
          />
          {/* Glowing Secondary Dash */}
          <path
            d="M 563 374 C 650 650, 750 900, 947 993 C 1200 1100, 1500 1120, 1817 1051 C 2050 990, 2250 1020, 2432 1022 C 2480 800, 2420 550, 2329 403 C 2150 280, 1900 350, 1689 475 C 1300 700, 850 300, 563 374"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="6,16"
            opacity="0.65"
          />
        </svg>

        {/* 6 Interactive Islands with BIGGER, ULTRA-READABLE Circle Markers & Banners */}
        {ISLANDS.map((isle) => {
          const renderIcon = () => {
            switch (isle.icon) {
              case 'anchor': return <Anchor className="w-8 h-8 text-white drop-shadow" />;
              case 'users': return <Users className="w-8 h-8 text-white drop-shadow" />;
              case 'trophy': return <Trophy className="w-8 h-8 text-white drop-shadow" />;
              case 'ship': return <Ship className="w-8 h-8 text-white drop-shadow" />;
              case 'zap': return <Zap className="w-8 h-8 text-white drop-shadow" />;
              case 'crown': return <Crown className="w-8 h-8 text-white drop-shadow" />;
            }
          };

          return (
            <div
              key={isle.id}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleIslandClick(isle.id);
              }}
              style={{
                left: `${(isle.xPct / 100) * MAP_WIDTH}px`,
                top: `${(isle.yPct / 100) * MAP_HEIGHT}px`,
              }}
              className="interactive-island absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group flex flex-col items-center select-none pointer-events-auto"
              role="button"
              tabIndex={0}
              aria-label={`Open ${isle.name}`}
            >
              {/* BIG, RICH PARCHMENT BANNER (Readable from afar!) */}
              <div className="w-64 sm:w-72 px-4 py-3 rounded-2xl bg-[#fdf6e2] border-[3.5px] border-[#3e2311] shadow-[0_16px_35px_rgba(0,0,0,0.85)] text-center group-hover:border-amber-400 group-hover:scale-105 group-hover:shadow-[0_20px_45px_rgba(245,158,11,0.5)] transition-all duration-300 relative overflow-hidden">
                {/* Wood Corner Rivets */}
                <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-[#3e2311]/40" />
                <div className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#3e2311]/40" />
                <div className="absolute bottom-1 left-1.5 w-2 h-2 rounded-full bg-[#3e2311]/40" />
                <div className="absolute bottom-1 right-1.5 w-2 h-2 rounded-full bg-[#3e2311]/40" />

                {/* Island Title */}
                <div className="font-pirate text-xl sm:text-2xl text-[#1f1006] tracking-wider uppercase font-black leading-tight drop-shadow-sm truncate">
                  {isle.name}
                </div>

                {/* Island Subtitle */}
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#78350f] mt-0.5">
                  {isle.subtitle}
                </div>

                {/* High-Contrast Badge Pill */}
                <div 
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: isle.color }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{isle.badge}</span>
                </div>
              </div>

              {/* BIG CIRCULAR BEACON EMBLEM ("the circle ones to be more bigger") */}
              <div className="relative mt-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {/* Pulsing Outer Ping Ring */}
                <div
                  className="absolute w-20 h-20 rounded-full animate-ping opacity-40 pointer-events-none"
                  style={{ backgroundColor: isle.color }}
                />

                {/* Outer Golden Glow Circle */}
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.85)] flex items-center justify-center transform transition-all group-hover:rotate-12"
                  style={{ backgroundColor: isle.color }}
                >
                  {renderIcon()}
                </div>

                {/* Triangle Pointer underneath circle */}
                <div className="absolute -bottom-2 w-4 h-4 bg-amber-400 rotate-45 border-r-2 border-b-2 border-[#3e2311]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM-LEFT FLOATING WIDGET: LOG POSE COMPASS */}
      {/* ======================================================== */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-6 left-6 z-30 pointer-events-auto interactive-widget"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleLogPoseClick();
          }}
          className="flex items-center gap-3.5 px-5 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/60 shadow-2xl backdrop-blur-md cursor-pointer hover:border-amber-400 transition-all hover:scale-105 group"
        >
          <LogPoseCompassIcon progress={0.4} className="w-10 h-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] group-hover:rotate-12 transition-transform" />
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Log Pose Locked
            </div>
            <div className="font-pirate text-xl text-amber-300 leading-tight">
              Next: Foxy's Arena Isle →
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOP-RIGHT CORNER: MINI-MAP RADAR & ZOOM CONTROLS */}
      {/* ======================================================== */}
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-16 right-6 z-30 flex flex-col items-end gap-2.5 pointer-events-auto interactive-widget"
      >
        {/* Mini-Map Radar Box matching Reference */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleMiniMapClick(e);
          }}
          className="w-52 h-34 rounded-2xl bg-slate-950/90 border-2 border-amber-500/60 shadow-2xl overflow-hidden relative cursor-crosshair group"
          title="Click to jump camera"
        >
          {/* Mini-Map Thumbnail */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-65"
            style={{ backgroundImage: `url('/assets/map/world_map_bg.jpg')` }}
          />

          {/* Island Dots on Mini-Map */}
          {ISLANDS.map(isle => (
            <div
              key={`mini-${isle.id}`}
              style={{
                left: `${isle.xPct}%`,
                top: `${isle.yPct}%`,
                backgroundColor: isle.color,
              }}
              className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-black shadow"
            />
          ))}

          {/* Draggable/Current Camera Viewport Rectangle */}
          <div
            style={{
              left: `${Math.max(0, Math.min(100, ((camera.x - viewport.width / (2 * camera.zoom)) / MAP_WIDTH) * 100))}%`,
              top: `${Math.max(0, Math.min(100, ((camera.y - viewport.height / (2 * camera.zoom)) / MAP_HEIGHT) * 100))}%`,
              width: `${Math.min(100, (viewport.width / (camera.zoom * MAP_WIDTH)) * 100)}%`,
              height: `${Math.min(100, (viewport.height / (camera.zoom * MAP_HEIGHT)) * 100)}%`,
            }}
            className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none rounded"
          />
        </div>

        {/* Zoom In, Zoom Out, Recenter on HQ Buttons */}
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xl p-1.5 shadow-lg"
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              targetRef.current.zoom = Math.min(1.8, targetRef.current.zoom * 1.25);
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              targetRef.current.zoom = Math.max(0.5, targetRef.current.zoom * 0.8);
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              recenterCamera();
            }}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold px-2.5 cursor-pointer"
            title="Recenter on Thousand Sunny HQ"
            aria-label="Recenter on HQ"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Recenter</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ISLAND BUILDING PANEL (Split Modal) */}
      {/* ======================================================== */}
      {selectedIslandId && (
        <IslandBuildingModal
          islandId={selectedIslandId}
          onClose={() => {
            setSelectedIslandId(null);
            window.location.hash = '#/map';
          }}
        />
      )}

      {/* ======================================================== */}
      {/* CSE CHALLENGE & TEAM SELECTION DASHBOARD MODAL */}
      {/* ======================================================== */}
      {showCSEDashboard && (
        <div
          role="dialog"
          aria-modal="true"
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto">
            <ChallengeTeamDashboard onClose={() => setShowCSEDashboard(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
