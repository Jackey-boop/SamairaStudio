import Link from "next/link";
import DoodleStar from "@/components/DoodleStar";
import Squiggle from "@/components/Squiggle";
import type { StudioInfo } from "@/lib/content";

export default function Hero({ studio }: { studio: StudioInfo }) {
  return (
    <section id="about" className="relative overflow-hidden">
      {/* scattered doodle stars */}
      <DoodleStar size="lg" className="absolute left-[6%] top-16" color="#E07A5F" />
      <DoodleStar size="sm" className="absolute left-[22%] top-40" color="#81B29A" />
      <DoodleStar size="md" className="absolute right-[10%] top-24" color="#81B29A" />
      <DoodleStar size="sm" className="absolute right-[28%] bottom-16" color="#E07A5F" />

      <div className="section grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-coral">
            About us
          </p>
          <h1 className="font-hand text-5xl font-bold leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            {studio.tagline}
          </h1>
          <div className="mt-2">
            <Squiggle width={260} />
          </div>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            {studio.bio}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="#contact" className="btn-coral">
              Work with us
              <span aria-hidden="true">↓</span>
            </Link>
            <Link href="#shop" className="btn-ghost">
              Shop our products
            </Link>
          </div>
        </div>

        {/* hero image */}
        <div className="relative">
          <DoodleStar size="md" className="absolute -left-3 -top-3 z-10" />
          <div
            className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-doodle"
            style={{ transform: "rotate(1deg)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80"
              alt="Samaira Studio at work"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>
          <div
            className="absolute -bottom-5 -right-3 rounded-2xl border border-ink/10 bg-coral px-4 py-2 font-hand text-xl text-white shadow-doodle"
            style={{ transform: "rotate(-3deg)" }}
          >
            made with love ✦
          </div>
        </div>
      </div>
    </section>
  );
}
