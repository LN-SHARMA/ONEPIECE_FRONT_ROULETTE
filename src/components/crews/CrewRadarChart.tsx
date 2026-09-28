import React from 'react';
import { SkillSet } from '../../types';
import { SKILL_AXES } from '../../services/teamEngine';

interface CrewRadarChartProps {
  scores: SkillSet;
  maxScore?: number;
  size?: number;
  className?: string;
}

export const CrewRadarChart: React.FC<CrewRadarChartProps> = ({
  scores,
  maxScore = 20,
  size = 180,
  className = '',
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const totalAxes = SKILL_AXES.length; // 6 axes

  // Calculate polygon points
  const points = SKILL_AXES.map((axis, i) => {
    const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
    const value = Math.min(scores[axis], maxScore);
    const r = (value / Math.max(1, maxScore)) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.45)" />
            <stop offset="100%" stopColor="rgba(220, 38, 38, 0.15)" />
          </radialGradient>
        </defs>

        {/* Concentric Reference Rings */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const ringPoints = SKILL_AXES.map((_, i) => {
            const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
            const r = radius * level;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={ringPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={level < 1.0 ? '2,2' : undefined}
            />
          );
        })}

        {/* Axis Spokes & Labels */}
        {SKILL_AXES.map((axis, i) => {
          const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          const labelX = center + (radius + 15) * Math.cos(angle);
          const labelY = center + (radius + 15) * Math.sin(angle);

          return (
            <g key={axis}>
              <line x1={center} y1={center} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="bold"
                className="uppercase tracking-wider"
              >
                {axis.slice(0, 3)}
              </text>
            </g>
          );
        })}

        {/* Data Radar Polygon */}
        <polygon
          points={points}
          fill="url(#radarGlow)"
          stroke="#f59e0b"
          strokeWidth="2"
        />

        {/* Data Points */}
        {SKILL_AXES.map((axis, i) => {
          const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
          const value = Math.min(scores[axis], maxScore);
          const r = (value / Math.max(1, maxScore)) * radius;
          const cx = center + r * Math.cos(angle);
          const cy = center + r * Math.sin(angle);

          return (
            <circle
              key={`dot-${axis}`}
              cx={cx}
              cy={cy}
              r="3"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};
