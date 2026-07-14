import React from 'react';

function Logo() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <line x1="16" y1="18" x2="16" y2="3" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 3l-3 4M16 3l3 4"
        stroke="#4f46e5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <line
        x1="16"
        y1="18"
        x2="29"
        y2="25"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M29 25l-5-1M29 25l-2-4.5"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <line x1="16" y1="18" x2="3" y2="25" stroke="#dd4444" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M3 25l5-1M3 25l2-4.5"
        stroke="#dd4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <circle cx="16" cy="18" r="1.6" fill="#1e1b4b" />
    </svg>
  );
}

export default Logo;
