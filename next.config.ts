import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@pdf-lib/fontkit", "pdf-lib"],
};

export default nextConfig;
