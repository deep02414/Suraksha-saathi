import React from 'react';

interface SurakshaLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const SurakshaLogo: React.FC<SurakshaLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Gold Shield Crest Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield with Gold Accent */}
          <path
            d="M24 4L7 11V22C7 33.1 14.3 43.4 24 46C33.7 43.4 41 33.1 41 22V11L24 4Z"
            fill="#0c1527"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner Golden Ring */}
          <circle cx="24" cy="23" r="10" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="2 2" />
          {/* Center Lock / Emblem */}
          <path
            d="M20 21V19C20 16.79 21.79 15 24 15C26.21 15 28 16.79 28 19V21M18 21H30V29C30 30.1 29.1 31 28 31H20C18.9 31 18 30.1 18 29V21Z"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Tiny Ashoka Dot */}
          <circle cx="24" cy="25" r="1.5" fill="#f59e0b" />
        </svg>
      </div>

      {/* Indian Flag SVG */}
      <div className="shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-slate-300">
        <svg className="w-5 h-3.5" viewBox="0 0 640 480">
          <path fill="#f93" d="M0 0h640v160H0z" />
          <path fill="#fff" d="M0 160h640v160H0z" />
          <path fill="#128807" d="M0 320h640v160H0z" />
          <g transform="matrix(3.2 0 0 3.2 320 240)">
            <circle r="20" fill="none" stroke="#008" strokeWidth="2" />
            <circle r="3.5" fill="#008" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="0"
                y1="0"
                x2="0"
                y2="-20"
                stroke="#008"
                strokeWidth="0.8"
                transform={`rotate(${i * 15})`}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="leading-tight flex flex-col justify-center">
        <div className="flex items-center gap-1.5 font-bold">
          <span
            className={`tracking-wider uppercase font-black ${
              variant === 'dark' ? 'text-white' : 'text-black'
            } ${size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm'}`}
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            SURAKSHA SAATHI
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-[9.5px] font-normal tracking-tight ${
              variant === 'dark' ? 'text-[#94a3b8]' : 'text-[#64748b]'
            }`}
          >
            Digital Security & Asset Trust Companion
          </span>
        )}
      </div>
    </div>
  );
};

export const DigitalIndiaBadge: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md shadow-xs select-none">
      <div className="flex items-center gap-1">
        {/* Modern styled tri-color leaf / power icon */}
        <div className="relative w-4 h-4 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-500 border-t-green-600 border-r-blue-700 animate-spin-slow" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-800" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-black tracking-tight text-[#1e293b]">
            Digital India
          </span>
          <span className="text-[6.5px] font-bold tracking-widest text-[#f97316] uppercase">
            Power To Empower
          </span>
        </div>
      </div>
    </div>
  );
};
