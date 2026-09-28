import React from 'react';
import { PirateRole, DevilFruitType } from '../../types';

export const LogPoseCompassIcon: React.FC<{ progress?: number; className?: string }> = ({ progress = 0, className = 'w-10 h-10' }) => {
  const rotation = progress * 360;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="Log Pose Compass">
      <defs>
        <radialGradient id="brassGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id="glassSphere" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="40%" stopColor="rgba(56,189,248,0.2)" />
          <stop offset="80%" stopColor="rgba(3,105,161,0.4)" />
          <stop offset="100%" stopColor="rgba(2,132,199,0.7)" />
        </radialGradient>
      </defs>
      {/* Outer Brass Ring */}
      <circle cx="50" cy="50" r="46" fill="url(#brassGradient)" stroke="#451a03" strokeWidth="4" />
      <circle cx="50" cy="50" r="41" fill="#1e293b" stroke="#78350f" strokeWidth="2" />
      
      {/* Compass Ticks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="14"
          x2="50"
          y2="19"
          stroke="#fbbf24"
          strokeWidth="2"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      
      {/* Glass Sphere */}
      <circle cx="50" cy="50" r="34" fill="url(#glassSphere)" />
      
      {/* Floating Pointer / Needle */}
      <g transform={`rotate(${rotation} 50 50)`} style={{ transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <polygon points="50,18 56,50 50,44 44,50" fill="#dc2626" />
        <polygon points="50,78 55,50 50,54 45,50" fill="#cbd5e1" />
        <circle cx="50" cy="50" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
      </g>
      
      {/* Specular highlight */}
      <ellipse cx="40" cy="35" rx="14" ry="7" fill="rgba(255,255,255,0.45)" transform="rotate(-30 40 35)" />
    </svg>
  );
};

export const SunnyShipSilhouette: React.FC<{ className?: string; bobbing?: boolean }> = ({ className = 'w-24 h-24', bobbing = true }) => {
  return (
    <svg viewBox="0 0 200 160" className={`${className} ${bobbing ? 'animate-float-slow' : ''}`} fill="none" aria-label="Thousand Sunny Silhouette">
      <defs>
        <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
        <linearGradient id="sailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Water Ripple */}
      <path d="M10 145 C 50 142, 100 148, 190 144" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      
      {/* Hull */}
      <path d="M30 110 L50 140 Q100 145 160 140 L180 115 Q110 112 30 110 Z" fill="url(#hullGrad)" stroke="#451a03" strokeWidth="3" />
      
      {/* Lion Figurehead */}
      <circle cx="178" cy="115" r="14" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
      {/* Petals / Mane */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
        <circle key={ang} cx="178" cy="115" r="3.5" fill="#ea580c" transform={`rotate(${ang} 178 115) translate(0, -14)`} />
      ))}
      <circle cx="178" cy="115" r="5" fill="#fef08a" />
      
      {/* Masts */}
      <line x1="90" y1="30" x2="90" y2="112" stroke="#451a03" strokeWidth="5" strokeLinecap="round" />
      <line x1="140" y1="45" x2="140" y2="112" stroke="#451a03" strokeWidth="4" strokeLinecap="round" />
      
      {/* Main Sail with Straw Hat crest */}
      <path d="M60 40 Q90 35 120 45 Q115 80 85 85 Q65 75 60 40 Z" fill="url(#sailGrad)" stroke="#78350f" strokeWidth="2" />
      {/* Mini Jolly Roger skull on sail */}
      <circle cx="90" cy="58" r="7" fill="#18181b" />
      <path d="M80 54 Q90 48 100 54" stroke="#ea580c" strokeWidth="2" fill="none" />
      
      {/* Fore Sail */}
      <path d="M125 55 Q145 52 165 60 Q160 88 135 90 Q122 80 125 55 Z" fill="url(#sailGrad)" stroke="#78350f" strokeWidth="2" />
      
      {/* Crow's Nest */}
      <rect x="83" y="42" width="14" height="8" rx="2" fill="#78350f" />
      
      {/* Pirate Flag on Top */}
      <path d="M90 28 L112 32 L90 36 Z" fill="#09090b" />
      <circle cx="98" cy="32" r="2" fill="#fafafa" />
    </svg>
  );
};

export const JollyRogerAvatar: React.FC<{
  hatType?: 'straw' | 'tricorn' | 'bandana' | 'tophat' | 'crown';
  symbol?: 'crossbones' | 'swords' | 'flames' | 'heart' | 'anchor';
  baseColor?: string;
  accentColor?: string;
  size?: number;
  className?: string;
}> = ({
  hatType = 'straw',
  symbol = 'crossbones',
  baseColor = '#18181b',
  accentColor = '#f59e0b',
  size = 64,
  className = '',
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-label="Jolly Roger Avatar">
      <defs>
        <radialGradient id={`skullGrad-${hatType}-${symbol}`} cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
      
      {/* Background Crest Circle */}
      <circle cx="50" cy="50" r="46" fill={baseColor} stroke={accentColor} strokeWidth="3" />
      
      {/* Background Symbol: Crossbones or Swords or Anchor */}
      {symbol === 'crossbones' && (
        <g stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round">
          <line x1="22" y1="22" x2="78" y2="78" />
          <line x1="22" y1="78" x2="78" y2="22" />
          <circle cx="20" cy="20" r="4" fill="#cbd5e1" />
          <circle cx="80" cy="80" r="4" fill="#cbd5e1" />
          <circle cx="20" cy="80" r="4" fill="#cbd5e1" />
          <circle cx="80" cy="20" r="4" fill="#cbd5e1" />
        </g>
      )}
      {symbol === 'swords' && (
        <g stroke="#94a3b8" strokeWidth="5" strokeLinecap="round">
          <line x1="18" y1="18" x2="82" y2="82" />
          <line x1="18" y1="82" x2="82" y2="18" />
          <rect x="24" y="24" width="8" height="3" fill={accentColor} transform="rotate(45 28 25)" />
          <rect x="70" y="24" width="8" height="3" fill={accentColor} transform="rotate(-45 74 25)" />
        </g>
      )}
      {symbol === 'anchor' && (
        <g stroke="#38bdf8" strokeWidth="4" fill="none">
          <circle cx="50" cy="22" r="6" />
          <line x1="50" y1="28" x2="50" y2="80" strokeLinecap="round" />
          <path d="M26 62 Q50 88 74 62" strokeLinecap="round" />
          <line x1="34" y1="36" x2="66" y2="36" strokeLinecap="round" />
        </g>
      )}
      {symbol === 'flames' && (
        <path d="M50 15 Q65 35 55 50 Q75 60 70 85 Q50 90 30 85 Q25 60 45 50 Q35 35 50 15 Z" fill="#ea580c" opacity="0.6" />
      )}
      {symbol === 'heart' && (
        <path d="M50 30 Q30 10 20 30 Q10 55 50 85 Q90 55 80 30 Q70 10 50 30 Z" fill="#ec4899" opacity="0.5" />
      )}
      
      {/* Central Skull */}
      <g>
        {/* Cranium */}
        <circle cx="50" cy="48" r="18" fill="url(#skullGrad)" stroke="#1e293b" strokeWidth="1.5" />
        {/* Jaw */}
        <rect x="42" y="58" width="16" height="12" rx="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" />
        {/* Teeth */}
        <line x1="47" y1="62" x2="47" y2="68" stroke="#0f172a" strokeWidth="1.5" />
        <line x1="53" y1="62" x2="53" y2="68" stroke="#0f172a" strokeWidth="1.5" />
        
        {/* Eye Sockets */}
        <ellipse cx="43" cy="48" rx="4.5" ry="5.5" fill="#09090b" />
        <ellipse cx="57" cy="48" rx="4.5" ry="5.5" fill="#09090b" />
        {/* Nose Socket */}
        <polygon points="50,54 48,58 52,58" fill="#09090b" />
      </g>
      
      {/* Hats */}
      {hatType === 'straw' && (
        <g>
          {/* Brim */}
          <ellipse cx="50" cy="38" rx="28" ry="8" fill="#eab308" stroke="#854d0e" strokeWidth="1.5" />
          {/* Crown */}
          <path d="M34 38 Q50 20 66 38" fill="#eab308" stroke="#854d0e" strokeWidth="1.5" />
          {/* Red Ribbon */}
          <path d="M35 37 Q50 30 65 37" stroke="#dc2626" strokeWidth="3" fill="none" />
        </g>
      )}
      {hatType === 'tricorn' && (
        <path d="M20 40 Q50 15 80 40 Q50 32 20 40 Z" fill="#1e1b4b" stroke={accentColor} strokeWidth="1.5" />
      )}
      {hatType === 'bandana' && (
        <g>
          <path d="M30 40 Q50 30 70 40 L70 34 Q50 24 30 34 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
          <circle cx="28" cy="40" r="3" fill="#16a34a" />
        </g>
      )}
      {hatType === 'tophat' && (
        <g>
          <ellipse cx="50" cy="38" rx="22" ry="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <rect x="36" y="16" width="28" height="20" rx="2" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
          <rect x="36" y="32" width="28" height="4" fill="#9333ea" />
        </g>
      )}
      {hatType === 'crown' && (
        <polygon points="32,38 32,22 41,30 50,18 59,30 68,22 68,38" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
      )}
    </svg>
  );
};

export const DenDenMushiIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-label="Den Den Mushi Transponder Snail">
      <defs>
        <radialGradient id="shellSpiral" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="70%" stopColor="#db2777" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>
      </defs>
      {/* Snail Body */}
      <path d="M15 75 Q25 60 45 68 Q75 66 90 75 Q92 82 80 84 L22 84 Q14 82 15 75 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2.5" />
      {/* Eyestalks & Receiver Handset */}
      <line x1="26" y1="65" x2="20" y2="45" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />
      <circle cx="20" cy="44" r="5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
      <circle cx="20" cy="44" r="2.5" fill="#0f172a" />
      
      <line x1="36" y1="65" x2="32" y2="45" stroke="#ca8a04" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="44" r="5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
      <circle cx="32" cy="44" r="2.5" fill="#0f172a" />
      
      {/* Telephone Handset Receiver on top of shell */}
      <path d="M42 32 Q62 25 82 32" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="43" cy="32" r="5" fill="#334155" />
      <circle cx="81" cy="32" r="5" fill="#334155" />
      
      {/* Snail Shell */}
      <circle cx="62" cy="58" r="24" fill="url(#shellSpiral)" stroke="#4c0519" strokeWidth="3" />
      {/* Shell Spiral Lines */}
      <path d="M62 42 A 16 16 0 1 1 50 64 A 10 10 0 1 1 60 68" fill="none" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const DevilFruitSwirlIcon: React.FC<{ type: DevilFruitType; className?: string }> = ({ type, className = 'w-6 h-6' }) => {
  const colorMap: Record<DevilFruitType, { bg: string; stroke: string }> = {
    'Paramecia': { bg: '#8b5cf6', stroke: '#c084fc' },
    'Zoan': { bg: '#f97316', stroke: '#fdba74' },
    'Logia': { bg: '#06b6d4', stroke: '#67e8f9' },
    'Mythical Zoan': { bg: '#eab308', stroke: '#fef08a' },
    'None': { bg: '#64748b', stroke: '#94a3b8' },
  };

  const { bg, stroke } = colorMap[type] || colorMap['None'];

  return (
    <svg viewBox="0 0 60 60" className={className} aria-label={`${type} Fruit Swirl`}>
      <circle cx="30" cy="32" r="22" fill={bg} stroke={stroke} strokeWidth="2" />
      {/* Stem */}
      <path d="M30 10 Q35 15 30 20" stroke="#15803d" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Signature Devil Fruit Swirls */}
      <path d="M22 28 Q26 24 30 28 Q34 32 30 36 Q26 40 22 36" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M36 30 Q40 26 44 30 Q48 34 44 38" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M26 42 Q30 46 34 42" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Whitebeard's Legendary Flagship: MOBY DICK
 * Giant white whale figurehead, 3 towering masts, Whitebeard crescent mustache flag
 */
export const MobyDickShip: React.FC<{ className?: string; scale?: number }> = ({ className = 'w-96 h-72', scale = 1 }) => {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-label="Whitebeard's Flagship Moby Dick">
      <defs>
        <linearGradient id="whaleHull" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="woodDeck" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="wbSail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <filter id="mobyGlow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Whale Prow & Gigantic Hull */}
      <g filter="url(#mobyGlow)">
        {/* Massive White Whale Head Prow */}
        <path
          d="M 280 200 C 350 200, 395 210, 390 235 C 385 260, 330 265, 270 260 L 50 260 C 20 260, 10 230, 30 215 L 70 210 Z"
          fill="url(#whaleHull)"
          stroke="#475569"
          strokeWidth="3"
        />
        {/* Whale Eye & Smile */}
        <circle cx="360" cy="225" r="5" fill="#0f172a" />
        <circle cx="362" cy="223" r="1.5" fill="#ffffff" />
        <path d="M 345 240 Q 370 248 385 235" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Whale Throat Grooves */}
        <path d="M 300 245 Q 340 252 360 245" stroke="#cbd5e1" strokeWidth="2" fill="none" />
        <path d="M 280 250 Q 320 256 345 250" stroke="#cbd5e1" strokeWidth="2" fill="none" />

        {/* Multi-deck Wooden Superstructure */}
        <path d="M 80 210 L 260 210 L 250 185 L 90 185 Z" fill="url(#woodDeck)" stroke="#451a03" strokeWidth="2" />
        <path d="M 100 185 L 220 185 L 210 165 L 110 165 Z" fill="url(#woodDeck)" stroke="#451a03" strokeWidth="2" />

        {/* Portholes */}
        {[100, 130, 160, 190, 220, 250].map((x) => (
          <circle key={x} cx={x} cy="225" r="3.5" fill="#fde047" stroke="#78350f" strokeWidth="1.5" />
        ))}
      </g>

      {/* 3 Giant Masts */}
      {/* Fore Mast */}
      <line x1="220" y1="40" x2="220" y2="185" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
      {/* Main Mast (Tallest) */}
      <line x1="160" y1="20" x2="160" y2="185" stroke="#451a03" strokeWidth="8" strokeLinecap="round" />
      {/* Mizzen Mast */}
      <line x1="100" y1="50" x2="100" y2="185" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />

      {/* Sails on Main Mast */}
      <path d="M 120 40 Q 160 30 200 40 Q 195 85 160 90 Q 125 85 120 40 Z" fill="url(#wbSail)" stroke="#64748b" strokeWidth="2" />
      <path d="M 115 100 Q 160 90 205 100 Q 200 145 160 150 Q 120 145 115 100 Z" fill="url(#wbSail)" stroke="#64748b" strokeWidth="2" />

      {/* Whitebeard Jolly Roger on Main Sail (Crossbones + Purple Cross + Crescent Mustache) */}
      <g transform="translate(160, 120) scale(0.65)">
        {/* Purple Cross behind skull */}
        <line x1="-35" y1="0" x2="35" y2="0" stroke="#7e22ce" strokeWidth="6" strokeLinecap="round" />
        <line x1="0" y1="-35" x2="0" y2="35" stroke="#7e22ce" strokeWidth="6" strokeLinecap="round" />
        {/* Skull */}
        <circle cx="0" cy="-5" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
        <circle cx="-5" cy="-7" r="3" fill="#0f172a" />
        <circle cx="5" cy="-7" r="3" fill="#0f172a" />
        {/* The Legendary White Crescent Mustache */}
        <path d="M -24 -2 Q 0 -10 24 -2 Q 22 -6 0 -14 Q -22 -6 -24 -2 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
      </g>

      {/* Fore Sails */}
      <path d="M 205 60 Q 235 52 265 60 Q 260 100 235 105 Q 210 100 205 60 Z" fill="url(#wbSail)" stroke="#64748b" strokeWidth="2" />
      <path d="M 200 115 Q 235 108 270 115 Q 265 155 235 160 Q 205 155 200 115 Z" fill="url(#wbSail)" stroke="#64748b" strokeWidth="2" />

      {/* Mizzen Sails */}
      <path d="M 70 70 Q 100 62 130 70 Q 125 110 100 115 Q 75 110 70 70 Z" fill="url(#wbSail)" stroke="#64748b" strokeWidth="2" />

      {/* Top Flag: Whitebeard Crescent Banner */}
      <path d="M 160 18 L 195 24 L 160 30 Z" fill="#7e22ce" />
      <path d="M 168 24 Q 180 20 190 24" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Gura Gura no Mi: Atmospheric Tremor / Glass Shatter Cracks
 */
export const GuraGuraCrack: React.FC<{ className?: string; opacity?: number }> = ({ className = 'w-full h-full', opacity = 0.8 }) => {
  return (
    <svg viewBox="0 0 800 600" className={className} fill="none" opacity={opacity} aria-hidden="true">
      <defs>
        <filter id="crackGlow">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#ffffff" floodOpacity="0.7" />
        </filter>
      </defs>
      <g filter="url(#crackGlow)" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="miter">
        {/* Central impact node */}
        <circle cx="400" cy="280" r="8" fill="#e0f2fe" />
        {/* Main lightning-like glass fracture lines */}
        <path d="M 400 280 L 340 220 L 260 240 L 180 180 L 90 190 L 20 120" />
        <path d="M 400 280 L 460 210 L 530 230 L 620 160 L 710 170 L 780 110" />
        <path d="M 400 280 L 380 360 L 320 420 L 260 480 L 190 540" />
        <path d="M 400 280 L 440 350 L 500 410 L 580 470 L 660 550" />
        <path d="M 400 280 L 390 190 L 410 120 L 395 50" />
        <path d="M 400 280 L 410 380 L 400 470 L 415 570" />
        {/* Branching Fractures */}
        <path d="M 340 220 L 350 160 L 310 110" strokeWidth="2" />
        <path d="M 460 210 L 470 150 L 520 90" strokeWidth="2" />
        <path d="M 530 230 L 570 290 L 640 310" strokeWidth="2" />
        <path d="M 260 240 L 230 300 L 170 320" strokeWidth="2" />
        <path d="M 320 420 L 360 460 L 340 520" strokeWidth="2" />
        <path d="M 500 410 L 470 470 L 490 530" strokeWidth="2" />
      </g>
    </svg>
  );
};

/**
 * Distant Grand Line Island Silhouettes
 */
export const DistantIslands: React.FC<{ className?: string; opacity?: number }> = ({ className = 'w-full h-32', opacity = 0.5 }) => {
  return (
    <svg viewBox="0 0 1200 160" className={className} fill="none" opacity={opacity} preserveAspectRatio="none" aria-hidden="true">
      {/* Distant Sea mist */}
      <rect x="0" y="80" width="1200" height="80" fill="url(#mistGrad)" />
      {/* Island 1: Tropical Mountain with Palm tree silhouette */}
      <path d="M 80 140 Q 140 80 190 70 Q 230 65 270 100 Q 310 120 340 140 Z" fill="#0f2b38" />
      <path d="M 190 70 Q 200 45 220 50 Q 200 55 190 70" stroke="#0f2b38" strokeWidth="4" />
      {/* Island 2: Huge Drum Kingdom cylinder peak silhouette */}
      <path d="M 520 140 L 550 50 Q 600 40 650 50 L 680 140 Z" fill="#132e3d" />
      {/* Island 3: Distant Skypiea giant stalk / volcano */}
      <path d="M 880 140 Q 940 90 970 85 Q 1020 80 1080 140 Z" fill="#0a1f29" />
    </svg>
  );
};

