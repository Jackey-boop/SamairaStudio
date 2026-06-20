import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";

// Wraps all customer-facing pages with the sticky navbar + footer.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { studio } = await getContent();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar studioName={studio.name} />
      <main className="flex-1">{children}</main>
      <Footer studio={studio} />
    </div>
  );
}
