import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export const Icons: React.FC<IconProps> = ({ name, size = 20, ...props }) => {
  const common: React.SVGProps<SVGSVGElement> = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props
  };

  switch (name) {
    case 'Car':
      return (
        <svg {...common}>
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    case 'Users':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'Bus':
      return (
        <svg {...common}>
          <rect width="16" height="16" x="4" y="3" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="m8 15 .01-.01" />
          <path d="m16 15 .01-.01" />
          <path d="M6 19v2" />
          <path d="M18 19v2" />
        </svg>
      );
    case 'Train':
      return (
        <svg {...common}>
          <rect width="16" height="16" x="4" y="3" rx="2" />
          <path d="M4 11h16" />
          <path d="M12 3v8" />
          <path d="M12 18H8" />
          <path d="m12 18 4 3" />
          <path d="m12 18-4 3" />
          <path d="m16 15 .01-.01" />
          <path d="m8 15 .01-.01" />
        </svg>
      );
    case 'Footprints':
      return (
        <svg {...common}>
          <path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.08-1.57A1.66 1.66 0 0 1 7.74 4h0c1 .07 1.66.96 1.52 1.95L9 8.25c-.15 1.12.46 2.18 1.48 2.58l.84.33a2.38 2.38 0 0 0 2.91-1.24L15.3 7.8" />
          <path d="M12 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M17 14v-2.38c0-2.12 1.88-3.77 2-6.55l.08-1.57A1.66 1.66 0 0 1 20.74 2h0c1 .07 1.66.96 1.52 1.95L21 6.25c-.15 1.12.46 2.18 1.48 2.58l.84.33a2.38 2.38 0 0 0 2.91-1.24L27.3 5.8" />
        </svg>
      );
    case 'Beef':
      return (
        <svg {...common}>
          <path d="M15 5c-3 0-5.5 2-7.5 5-1.7 2.6-3 5.5-3.5 8v2h12v-2c0-2.5-1.5-4.5-3.5-7-1.5-2-2.5-4.5-3.5-6Z" />
          <path d="M12 13h4" />
          <path d="M11 16h6" />
          <path d="M10 19h8" />
        </svg>
      );
    case 'Fish':
      return (
        <svg {...common}>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <path d="M12 5c0 4.8-3.2 7-10 7" />
          <path d="M12 19c0-4.8-3.2-7-10-7" />
          <circle cx="18" cy="12" r="1" />
        </svg>
      );
    case 'Egg':
      return (
        <svg {...common}>
          <path d="M12 2C7.5 2 4 7 4 12s3.5 10 8 10 8-5 8-10S16.5 2 12 2Z" />
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        </svg>
      );
    case 'Leaf':
      return (
        <svg {...common}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8A7 7 0 0 1 11 20Z" />
          <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
        </svg>
      );
    case 'Zap':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'Thermometer':
      return (
        <svg {...common}>
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
        </svg>
      );
    case 'Wind':
      return (
        <svg {...common}>
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
        </svg>
      );
    case 'ShieldAlert':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'ShoppingBag':
      return (
        <svg {...common}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'Recycle':
      return (
        <svg {...common}>
          <path d="M4.5 10.5L2 13h6M7 19.5L9.5 22v-6M18.5 7.5L16 5h6" />
          <path d="M16.2 16.8a8 8 0 0 0-9.6-9.6M8.2 18.2a8 8 0 0 0 9.6-9.6" />
        </svg>
      );
    case 'Sprout':
      return (
        <svg {...common}>
          <path d="M7 20h10" />
          <path d="M10 20v-5a4 4 0 0 1 4-4h1" />
          <path d="M12 11c0-4.8 3.2-7 10-7 0 4.8-3.2 7-10 7Z" />
          <path d="M12 11c0-3 1.5-5.5 4-7.5" />
          <path d="M10 15c0-3-1.5-5.5-4-7.5-6.8 0-10 2.2-10 7 6.8 0 10-2.2 10-7Z" />
        </svg>
      );
    case 'Trash2':
      return (
        <svg {...common}>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case 'Plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'Check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'Flame':
      return (
        <svg {...common}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'TrendingUp':
      return (
        <svg {...common}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case 'ChevronRight':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'ChevronLeft':
      return (
        <svg {...common}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case 'Calendar':
      return (
        <svg {...common}>
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'Info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'X':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'Sparkles':
      return (
        <svg {...common}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
          <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};
