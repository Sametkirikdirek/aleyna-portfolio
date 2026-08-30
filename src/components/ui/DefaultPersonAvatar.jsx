export default function DefaultPersonAvatar({ className = "w-full h-full" }) {
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-b from-[#2a2c3a] via-[#1c1d29] to-[#12131b] overflow-hidden select-none ${className}`}
    >
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(244,63,94,0.18),transparent_70%)] pointer-events-none" />

      <svg
        viewBox="0 0 140 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover transition-transform duration-500"
      >
        <defs>
          <linearGradient id="avatarHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="avatarBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>

          <filter id="avatarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Head Aura Glow */}
        <circle cx="70" cy="65" r="30" fill="rgba(244,63,94,0.12)" />

        {/* Head Silhouette */}
        <circle
          cx="70"
          cy="65"
          r="26"
          fill="url(#avatarHeadGrad)"
          stroke="rgba(253,164,175,0.4)"
          strokeWidth="1.5"
        />

        {/* Minimalist glasses / artistic gaze accent */}
        <path
          d="M57 66 C63 69, 77 69, 83 66"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Neck */}
        <path
          d="M62 90 L62 104 C62 107, 78 107, 78 104 L78 90 Z"
          fill="url(#avatarHeadGrad)"
          opacity="0.7"
        />

        {/* Shoulders & Bust Silhouette */}
        <path
          d="M26 160 C26 122, 44 106, 70 106 C96 106, 114 122, 114 160 L114 200 L26 200 Z"
          fill="url(#avatarBodyGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Dynamic V-collar neckline */}
        <path
          d="M55 107 L70 130 L85 107"
          stroke="rgba(244,63,94,0.5)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
