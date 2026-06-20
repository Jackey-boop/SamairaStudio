import { promises as fs } from "fs";
import path from "path";

// content.json is the lightweight CMS for brands + reels (not orders).
// It lives at the project root and is edited from the admin panel.
// Note: file writes persist on a long-running server / VM. On read-only
// serverless filesystems you would back this with a DB or object store.

const CONTENT_PATH = path.join(process.cwd(), "content.json");

export interface Reel {
  id: string;
  title: string;
  views: string;
  thumbnail: string;
  url: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  engagement: string;
  description: string;
}

export interface StudioInfo {
  name: string;
  tagline: string;
  bio: string;
  instagram: string;
  email: string;
}

export interface SiteContent {
  studio: StudioInfo;
  reels: Reel[];
  brands: Brand[];
}

const FALLBACK: SiteContent = {
  studio: {
    name: "Samaira Studio",
    tagline: "we turn scrolls into stories",
    bio: "A tiny content studio with big ideas.",
    instagram: "https://instagram.com/samairastudio",
    email: "hello@samairastudio.com",
  },
  reels: [],
  brands: [],
};

export async function getContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      studio: { ...FALLBACK.studio, ...parsed.studio },
      reels: parsed.reels ?? [],
      brands: parsed.brands ?? [],
    };
  } catch {
    return FALLBACK;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n", "utf-8");
}

// Small helper to generate stable-ish ids for new entries.
export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
