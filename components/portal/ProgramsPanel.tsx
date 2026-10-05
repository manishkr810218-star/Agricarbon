import {
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Sprout,
  TreePine,
  Users,
  Wheat,
} from "lucide-react";
import type { ProgramPath } from "@/lib/programs";

const icons = { practice: Wheat, soil: Sprout, trees: TreePine, group: Users };

export default function ProgramsPanel({ paths }: { paths: ProgramPath[] }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATHWAYS TO EXPLORE</p>
          <h1>Where your farm might fit.</h1>
          <p>
            These are types of opportunities to research with a verified program
            or local FPO. They are not offers or approvals.
          </p>
        </div>
      </div>
      <div className="portal-program-grid">
        {paths.map((path) => {
          const Icon = icons[path.key as keyof typeof icons] || Leaf;
          return (
            <article className="panel portal-program" key={path.key}>
              <div className="portal-program-top">
                <span className="portal-program-icon">
                  <Icon size={23} />
                </span>
                <span
                  className={`portal-status ${path.status === "Explore" ? "ready" : "building"}`}
                >
                  {path.status}
                </span>
              </div>
              <h2>{path.title}</h2>
              <p>{path.why}</p>
              <div className="portal-program-next">
                <strong>Your next step</strong>
                <span>{path.next}</span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="portal-disclaimer">
        <ShieldCheck size={21} />
        <span>
          Each real carbon program sets its own rules. AgriCarbon does not
          estimate sellable credits or promise acceptance.
        </span>
        <a
          href="https://verra.org/methodologies/vm0042-improved-agricultural-land-management-v2-2/"
          target="_blank"
          rel="noreferrer"
        >
          Read Verra VM0042 <ArrowUpRight size={15} />
        </a>
      </div>
    </>
  );
}
