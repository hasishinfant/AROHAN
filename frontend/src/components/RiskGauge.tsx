import React from 'react';

interface RiskGaugeProps {
  probability: number; // 0–1
  confidence?: string;
  label?: string;
  size?: number;
}

export function RiskGauge({ probability, confidence, label, size = 130 }: RiskGaugeProps) {
  const pct = Math.min(Math.max(probability, 0), 1);

  const cx = size / 2;
  const cy = size * 0.65;
  const r = size * 0.38;
  const strokeW = size * 0.09;

  // Arc path helper
  const arc = (startDeg: number, endDeg: number) => {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const color =
    pct > 0.6 ? '#dc2626'
    : pct > 0.3 ? '#d97706'
    : '#16a34a';

  const trackStart = -90;
  const trackEnd = 90;
  const fillEnd = trackStart + pct * 180;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Track */}
        <path
          d={arc(trackStart, trackEnd)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={arc(trackStart, fillEnd)}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        )}
        {/* Percentage text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.2}
          fontWeight="800"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(pct * 100)}%
        </text>
        {/* Sub label */}
        {label && (
          <text
            x={cx}
            y={cy + size * 0.12}
            textAnchor="middle"
            fill="#64748b"
            fontSize={size * 0.08}
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            {label}
          </text>
        )}
      </svg>
      {confidence && (
        <span
          className={`badge ${pct > 0.6 ? 'badge-critical' : pct > 0.3 ? 'badge-warning' : 'badge-success'}`}
          style={{ fontSize: '0.68rem' }}
        >
          <span className="badge-dot" />
          <span>{confidence} CONFIDENCE</span>
        </span>
      )}
    </div>
  );
}
