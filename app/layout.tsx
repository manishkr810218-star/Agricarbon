import type { Metadata } from "next";
import "./globals.css";
import "./portal.css";
import "./report.css";
import "./expansion.css";

export const metadata: Metadata = {
  title: "AgriCarbon | Farm readiness, made simple",
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
