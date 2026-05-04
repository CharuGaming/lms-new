import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-12">{children}</main>
      <Footer />
    </>
  );
}
