// Curated, host-supplied singer testimonials. Never auto-create review placeholders.
// Every quote must be traceable to a genuine submission or provided screenshot.
// No reviewer identities are inferred from private message screenshots.
const testimonialsByHost: Record<string, string[]> = {
  "dayna-alice-austin": [
    "Dayna is fun! She's a great hostess and brings the party experience all the way. She's always positive and makes people want to sing their hearts out. She's a great singer too!",
    "Friendly, engaging personality, hard worker, responsible, dependable, on time, works well with others / team spirit, conscientious, professional in carrying out job assignments.",
    "I've told you before but you're top tier in the KJ world Dayna - that I've seen - no one beats you.",
  ],
};

export function HostSingerTestimonials({ slug }: { slug: string }) {
  const quotes = testimonialsByHost[slug]?.filter((quote) => quote.trim()) ?? [];
  if (!quotes.length) return null;
  return (
    <section className="host-system mx-auto max-w-6xl px-4 py-8 text-white" aria-labelledby="host-singers-say">
      <div className="rounded-3xl border border-white/15 bg-[#101927] p-5 sm:p-8">
        <h2 id="host-singers-say" className="text-2xl font-black tracking-wide">SINGERS SAY</h2>
        <p className="mt-1 text-sm text-slate-400">Words shared by singers, provided by the host</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {quotes.map((quote, index) => (
            <blockquote key={index} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-slate-100">
              <span aria-hidden="true" className="mb-2 block text-3xl leading-none text-cyan-300">“</span>
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
