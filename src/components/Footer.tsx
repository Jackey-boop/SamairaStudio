import Signature from "./Signature";
import type { StudioInfo } from "@/lib/content";

export default function Footer({ studio }: { studio: StudioInfo }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-sand/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-12 text-center sm:px-8">
        <Signature className="opacity-90" />
        <p className="font-hand text-2xl text-ink">{studio.name}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-ink/70">
          <a
            href={studio.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-coral"
          >
            Instagram
          </a>
          <a
            href={`mailto:${studio.email}`}
            className="transition-colors hover:text-coral"
          >
            {studio.email}
          </a>
          <a href="/track" className="transition-colors hover:text-coral">
            Track an order
          </a>
        </div>
        <p className="text-xs text-ink/40">
          © {year} {studio.name}. Made with care and a little doodle ✦
        </p>
      </div>
    </footer>
  );
}
