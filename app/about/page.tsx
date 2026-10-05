import type { Metadata } from "next";
import AboutExperience from "@/components/AboutExperience";

export const metadata: Metadata = {
  title: "About AgriCarbon | A clearer path to farm proof",
};

export default function AboutPage() {
  return <AboutExperience />;
}
