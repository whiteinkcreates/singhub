/** Shared, noninteractive cue for the scroll-over hero pattern. */
export function HeroScrollCue() {
  return (
    <div className="hero-scroll-cue" aria-hidden="true">
      <span className="hero-scroll-cue__chevrons">
        {[0, 1, 2].map((index) => (
          <span className="hero-scroll-cue__step" key={index} style={{ animationDelay: `${(2 - index) * 0.18}s` }}>
            <svg viewBox="0 0 24 14" aria-hidden="true" focusable="false">
              <path d="M2 12 12 2 22 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </span>
        ))}
      </span>
      <span className="hero-scroll-cue__label">Scroll</span>
    </div>
  );
}
