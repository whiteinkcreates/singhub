type SingHubMarkProps = {
  className?: string;
};

export function SingHubMark({ className = "" }: SingHubMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      role="img"
      aria-label="SingHUB"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="singhub-mark-gradient" x1="35" y1="14" x2="92" y2="112" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb3f8f" />
          <stop offset="0.44" stopColor="#e233ff" />
          <stop offset="1" stopColor="#17e4f2" />
        </linearGradient>
        <filter id="singhub-mark-glow" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="128" height="128" rx="28" fill="#020617" />
      <g filter="url(#singhub-mark-glow)">
        <path
          d="M64 13C42 13 24 31 24 53C24 80 58 112 64 118C70 112 104 80 104 53C104 31 86 13 64 13Z"
          fill="none"
          stroke="url(#singhub-mark-gradient)"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M44 42C44 31 52 25 64 25H77V37H65C59 37 56 39 56 43C56 47 60 49 68 53C79 58 84 64 84 74C84 86 75 93 61 93C54 93 48 91 42 88L47 77C51 80 57 82 62 82C69 82 73 79 73 74C73 70 70 67 62 64C50 59 44 52 44 42Z"
          fill="url(#singhub-mark-gradient)"
        />
        <path
          d="M77 27H89V57H108V27H120V94H108V68H89V94H77V27Z"
          fill="url(#singhub-mark-gradient)"
          transform="translate(-16 0)"
        />
        <path d="M84 30L88 39L97 43L88 47L84 56L80 47L71 43L80 39L84 30Z" fill="#fb3f8f" />
        <g transform="translate(52 73)">
          <rect x="8" y="18" width="8" height="23" rx="4" fill="#020617" stroke="#17e4f2" strokeWidth="3" />
          <circle cx="12" cy="13" r="10" fill="#020617" stroke="#9bdcff" strokeWidth="3" />
          <path d="M2 13H22" stroke="#17e4f2" strokeWidth="3" strokeLinecap="round" />
          <path d="M7 10C10 8 14 8 17 10M6 15C9 18 15 18 18 15" stroke="#e9a7ff" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <path d="M48 112C56 116 72 116 80 112" stroke="#17e4f2" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
