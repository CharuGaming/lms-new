import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/frontend/components/ThemeProvider";
import { AuthProvider } from "@/frontend/components/AuthProvider";
import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["400", "500", "600", "700", "800", "900"], subsets: ["latin"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "TheEducator — Learn. Grow. Inspire.",
  description: "Personal brand portfolio & LMS platform for quality education through video content and structured courses.",
  keywords: "educator, teacher, LMS, courses, YouTube, tutorials, learning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1 pt-24 pb-12">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
