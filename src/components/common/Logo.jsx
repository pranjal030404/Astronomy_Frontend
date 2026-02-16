import React from 'react';
import './Logo.css';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xl' },
    md: { container: 'w-10 h-10', text: 'text-2xl' },
    lg: { container: 'w-16 h-16', text: 'text-4xl' },
    xl: { container: 'w-24 h-24', text: 'text-6xl' },
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <div className={`relative ${className}`}>
      {/* Animated SVG Logo */}
      <svg
        className={`${sizeClasses.container} logo-animation`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Space Background Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#spaceGradient)"
          className="logo-circle"
        />
        
        {/* Stars */}
        <circle cx="25" cy="25" r="1.5" fill="white" className="star star-1" />
        <circle cx="75" cy="30" r="1" fill="white" className="star star-2" />
        <circle cx="70" cy="70" r="1.5" fill="white" className="star star-3" />
        <circle cx="30" cy="65" r="1" fill="white" className="star star-4" />
        <circle cx="50" cy="20" r="1" fill="white" className="star star-5" />
        
        {/* Telescope */}
        <g transform="translate(35, 40)">
          {/* Telescope Stand */}
          <path
            d="M 15 25 L 15 30"
            stroke="url(#telescopeGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Telescope Body */}
          <path
            d="M 5 15 L 25 15 L 30 10 L 10 10 Z"
            fill="url(#telescopeGradient)"
            stroke="#8b5cf6"
            strokeWidth="0.5"
          />
          {/* Telescope Lens */}
          <circle cx="30" cy="12.5" r="2" fill="#c084fc" />
          <circle cx="30" cy="12.5" r="1" fill="white" opacity="0.7" />
          {/* Eyepiece */}
          <rect x="3" y="11.5" width="4" height="3" fill="#6b21a8" rx="1" />
        </g>
        
        {/* Earth/Moon */}
        <circle cx="65" cy="50" r="8" fill="url(#planetGradient)" />
        <circle cx="68" cy="47" r="2" fill="#1e1b4b" opacity="0.3" />
        <circle cx="63" cy="52" r="1.5" fill="#1e1b4b" opacity="0.3" />
        
        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="spaceGradient">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0a2a" />
          </radialGradient>
          <linearGradient id="telescopeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <radialGradient id="planetGradient">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
