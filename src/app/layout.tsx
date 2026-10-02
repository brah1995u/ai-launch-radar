import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import { CompareProvider } from "@/features/compare/compare-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Launch Radar — Discover newly live AI products",
    template: "%s | AI Launch Radar",
  },
  description:
    "Discover newly live AI products by category, technology and Domain Rating. Search real FreeSERP site-level data, inspect discovery signals and compare products.",
  applicationName: "AI Launch Radar",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <CompareProvider>
          <Header />
          {children}
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}
