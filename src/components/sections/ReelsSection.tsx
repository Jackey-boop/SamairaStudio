import SectionHeading from "@/components/SectionHeading";
import type { Reel } from "@/lib/content";

export default function ReelsSection({ reels }: { reels: Reel[] }) {
  return (
    <section id="reels" className="section pt-6">
      <SectionHeading eyebrow="Watch" title="Our top performing reels" />

      <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {reels.map((reel, i) => (
          <a
            key={reel.id}
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-doodle group block p-0 overflow-hidden"
            style={{ transform: `rotate(${i % 2 === 0 ? -0.6 : 0.6}deg)` }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reel.thumbnail}
                alt={reel.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-coral shadow-doodle transition-transform duration-300 group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <h3 className="font-hand text-2xl text-ink">{reel.title}</h3>
              <span className="whitespace-nowrap rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                {reel.views} views
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
