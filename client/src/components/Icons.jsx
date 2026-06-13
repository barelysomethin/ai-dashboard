import React from 'react';

const getStyle = (size, style) => {
  if (size) {
    return { width: size, height: size, ...style };
  }
  return style;
};

export const Layout = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

export const LogOut = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const Shield = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Database = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

export const Terminal = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

export const User = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Key = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5 3-3" />
  </svg>
);

export const Plus = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

export const Trash2 = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);

export const Copy = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const Check = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Eye = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
  </svg>
);

export const Search = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Filter = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const Cpu = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="16" height="16" x="4" y="4" rx="2" ry="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" ry="1" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
  </svg>
);

export const ExternalLink = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
  </svg>
);

export const X = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const PlusCircle = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);

export const Lock = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Mail = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Server = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

export const Play = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const ArrowLeft = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const HardDrive = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="20" height="8" x="2" y="3" rx="2" />
    <rect width="20" height="8" x="2" y="13" rx="2" />
    <line x1="6" x2="6.01" y1="7" y2="7" />
    <line x1="6" x2="6.01" y1="17" y2="17" />
  </svg>
);

export const RefreshCw = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <path d="M21 2v6h-6M3 22v-6h6" />
    <path d="M21 13a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 11a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
  </svg>
);

export const Clock = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Network = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <rect width="6" height="6" x="9" y="2" rx="1" />
    <rect width="6" height="6" x="2" y="16" rx="1" />
    <rect width="6" height="6" x="16" y="16" rx="1" />
    <path d="M12 8v8M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
  </svg>
);

export const Layers = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const AlertCircle = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const PlayCircle = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

export const Zap = ({ size, style, stroke = 'currentColor', fill = 'none', ...props }) => (
  <svg className="icon" viewBox="0 0 24 24" style={getStyle(size, style)} stroke={stroke} fill={fill} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
