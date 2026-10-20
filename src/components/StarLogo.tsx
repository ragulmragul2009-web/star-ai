import React from 'react';

interface StarLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StarLogo: React.FC<StarLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  animated = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', tagline: 'text-[9px]' },
    md: { icon: 36, text: 'text-lg', tagline: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', tagline: 'text-xs' },
    xl: { icon: 64, text: 'text-3xl', tagline: 'text-sm' },
  };

  const { icon, text, tagline } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Visual Star Mark */}
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: icon, height: icon }}
      >
        {/* Soft background ambient glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#35D7FF]/30 to-[#8B5CF6]/30 blur-md ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        {/* SVG Graphic with 5-point star, orbital ring, and radiant core */}
        <svg
          viewBox="0 0 100 100"
          className={`relative z-10 w-full h-full ${animated ? 'animate-pulse-glow' : ''}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="orbitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
            </linearGradient>
            <filter id="starCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
          </defs>

          {/* Orbital Ring with slight tilt and rotation */}
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="18"
            stroke="url(#orbitalGradient)"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            transform="rotate(-25 50 50)"
            className={animated ? 'origin-center animate-spin [animation-duration:22s]' : ''}
          />

          {/* Outer Orbital Node */}
          <circle
            cx="84"
            cy="36"
            r="3.5"
            fill="#2563EB"
            className={animated ? 'animate-twinkle' : ''}
          />

          {/* 5-Point Futuristic Silhouette Star */}
          <polygon
            points="50,14 61,38 86,41 68,58 73,83 50,70 27,83 32,58 14,41 39,38"
            fill="url(#starGradient)"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Subtle Inner Star Facets */}
          <polygon
            points="50,22 57,40 76,43 62,56 66,75 50,65"
            fill="rgba(255, 255, 255, 0.3)"
          />

          {/* Glowing Luminous AI Core */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="#FFFFFF"
            filter="url(#starCoreGlow)"
          />
          <circle
            cx="50"
            cy="50"
            r="3.5"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider text-slate-900 ${text}`}>
              STAR
            </span>
            <span
              className={`font-extrabold tracking-wider bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent ${text}`}
            >
              AI
            </span>
          </div>
          {showTagline && (
            <span className={`font-medium tracking-wide text-slate-500 ${tagline}`}>
              Your World. Your Ideas.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
