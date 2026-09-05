import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export function Logo({ size = 32, showText = true, variant = 'dark' }: LogoProps) {
  const isLight = variant === 'light';
  const textColor = isLight ? '#ffffff' : '#0f172a';
  const subtextColor = isLight ? '#93c5fd' : '#1d4ed8';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      {/* Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Shield Outer Body */}
        <path
          d="M20 2L34 8V18C34 27.5 28 35.5 20 38C12 35.5 6 27.5 6 18V8L20 2Z"
          fill="url(#logo_grad_primary)"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />

        {/* Inner Mountain & Highway Peak Motif */}
        <path
          d="M20 9L29 24H23.5L20 17.5L16.5 24H11L20 9Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Highway Ribbon Pass */}
        <path
          d="M14 28C17 25 23 25 26 28"
          stroke="#60a5fa"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center Satellite / Star Dot */}
        <circle cx="20" cy="14" r="2" fill="#3b82f6" />

        <defs>
          <linearGradient
            id="logo_grad_primary"
            x1="6"
            y1="2"
            x2="34"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1e3a8a" />
            <stop offset="0.5" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div
            style={{
              fontSize: `${size * 0.45}px`,
              fontWeight: 900,
              color: textColor,
              letterSpacing: '0.05em',
              lineHeight: 1.05,
            }}
          >
            AROHAN
          </div>
          <div
            style={{
              fontSize: `${Math.max(size * 0.22, 9)}px`,
              fontWeight: 800,
              color: subtextColor,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            NER LOGISTICS CONTROL
          </div>
        </div>
      )}
    </div>
  );
}
