import React from 'react';

interface LionCrownProps {
  className?: string;
}

const LionCrown: React.FC<LionCrownProps> = ({ className = "h-8 w-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} text-yellow-500 hover-glow hover-rotate`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 5-Point Crown */}
      <g transform="translate(50,15)">
        {/* Crown base */}
        <path
          d="M-25,15 L-20,5 L-10,10 L0,0 L10,10 L20,5 L25,15 L25,20 L-25,20 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Crown jewels */}
        <circle cx="-15" cy="12" r="1.5" fill="currentColor" />
        <circle cx="-5" cy="8" r="1.5" fill="currentColor" />
        <circle cx="0" cy="5" r="2" fill="currentColor" />
        <circle cx="5" cy="8" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      </g>
      
      {/* Lion Head */}
      <g transform="translate(50,50)">
        {/* Main head circle */}
        <circle cx="0" cy="0" r="20" fill="currentColor" />
        
        {/* Mane - outer layer */}
        <g>
          <circle cx="-18" cy="-12" r="6" fill="currentColor" opacity="0.8" />
          <circle cx="18" cy="-12" r="6" fill="currentColor" opacity="0.8" />
          <circle cx="-22" cy="0" r="7" fill="currentColor" opacity="0.8" />
          <circle cx="22" cy="0" r="7" fill="currentColor" opacity="0.8" />
          <circle cx="-18" cy="12" r="6" fill="currentColor" opacity="0.8" />
          <circle cx="18" cy="12" r="6" fill="currentColor" opacity="0.8" />
          <circle cx="-12" cy="18" r="5" fill="currentColor" opacity="0.8" />
          <circle cx="12" cy="18" r="5" fill="currentColor" opacity="0.8" />
          <circle cx="0" cy="22" r="6" fill="currentColor" opacity="0.8" />
        </g>
        
        {/* Mane - inner layer */}
        <g>
          <circle cx="-15" cy="-8" r="4" fill="currentColor" opacity="0.9" />
          <circle cx="15" cy="-8" r="4" fill="currentColor" opacity="0.9" />
          <circle cx="-18" cy="3" r="5" fill="currentColor" opacity="0.9" />
          <circle cx="18" cy="3" r="5" fill="currentColor" opacity="0.9" />
          <circle cx="-10" cy="15" r="4" fill="currentColor" opacity="0.9" />
          <circle cx="10" cy="15" r="4" fill="currentColor" opacity="0.9" />
        </g>
        
        {/* Eyes */}
        <circle cx="-6" cy="-3" r="2" fill="#000" />
        <circle cx="6" cy="-3" r="2" fill="#000" />
        <circle cx="-5.5" cy="-3.5" r="0.5" fill="#fff" />
        <circle cx="6.5" cy="-3.5" r="0.5" fill="#fff" />
        
        {/* Nose */}
        <path d="M-2,3 L0,1 L2,3 L0,5 Z" fill="#000" />
        
        {/* Mouth */}
        <path d="M-4,8 Q0,12 4,8" stroke="#000" strokeWidth="1.5" fill="none" />
        <path d="M0,5 L0,8" stroke="#000" strokeWidth="1" />
        
        {/* Whiskers */}
        <line x1="-15" y1="2" x2="-25" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="-15" y1="6" x2="-25" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="15" y1="2" x2="25" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <line x1="15" y1="6" x2="25" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
};

export default LionCrown;