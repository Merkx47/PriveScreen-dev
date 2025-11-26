interface LogoProps {
  className?: string;
  size?: number;
}

export function PriveScreenLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Heart-Shield hybrid shape */}
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="lockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#dcfce7" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Main shield-heart shape */}
      <path
        d="M32 4
           C24 4 16 8 12 14
           L12 28
           C12 38 20 48 32 58
           C44 48 52 38 52 28
           L52 14
           C48 8 40 4 32 4
           Z"
        fill="url(#shieldGrad)"
        stroke="#15803d"
        strokeWidth="1.5"
      />

      {/* Inner heart shape */}
      <path
        d="M32 18
           C28 14 22 14 20 18
           C18 22 18 26 20 30
           L32 44
           L44 30
           C46 26 46 22 44 18
           C42 14 36 14 32 18
           Z"
        fill="url(#lockGrad)"
        opacity="0.95"
      />

      {/* Keyhole/Lock element */}
      <circle cx="32" cy="28" r="4" fill="#16a34a"/>
      <path d="M30 30 L30 38 L34 38 L34 30 Z" fill="#16a34a"/>
    </svg>
  );
}

// Alternative monochrome version for different contexts
export function PriveScreenLogoMono({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Main shield-heart shape */}
      <path
        d="M32 4
           C24 4 16 8 12 14
           L12 28
           C12 38 20 48 32 58
           C44 48 52 38 52 28
           L52 14
           C48 8 40 4 32 4
           Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Inner heart shape */}
      <path
        d="M32 18
           C28 14 22 14 20 18
           C18 22 18 26 20 30
           L32 44
           L44 30
           C46 26 46 22 44 18
           C42 14 36 14 32 18
           Z"
        fill="white"
        opacity="0.95"
      />

      {/* Keyhole/Lock element */}
      <circle cx="32" cy="28" r="4" fill="currentColor"/>
      <path d="M30 30 L30 38 L34 38 L34 30 Z" fill="currentColor"/>
    </svg>
  );
}
