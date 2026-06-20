import Link from "next/link";
import DoodleStar from "@/components/DoodleStar";
import Squiggle from "@/components/Squiggle";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <DoodleStar size="lg" />
      <h1 className="mt-4 font-hand text-7xl text-ink">Oops!</h1>
      <div className="mt-1">
        <Squiggle width={200} />
      </div>
      <p className="mt-4 max-w-sm text-ink/60">
        We couldn’t find that page. It may have wandered off to doodle
        somewhere.
      </p>
      <Link href="/" className="btn-coral mt-6">
        Back home
      </Link>
    </div>
  );
}
