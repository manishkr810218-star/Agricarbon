import type { Metadata } from "next";
import "./globals.css";
import "./portal.css";
import "./report.css";
import "./expansion.css";
import "./carbon-analysis.css";
import "./humanized.css";

export const metadata: Metadata = {
  title: "AgriCarbon | Farm records and carbon readiness",
  description:
    "A simple guide to farm records, climate-smart practices, and carbon-program readiness.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
