import {
  ArrowRight,
  CheckCircle2,
  FileDown,
  FileText,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { farmSuggestions, mrvSummary, preliminaryReview } from "@/lib/insights";
import type { PortalData, PortalPage } from "@/lib/portal-types";

export default function OverviewPanel({
  data,
  onNavigate,
}: {
  data: PortalData;
  onNavigate: (page: PortalPage) => void;
}) {
  const { farm, assessment, documents, paths } = data;
  const mrv = mrvSummary(farm, data.mrvEvents, documents);
  const tips = farmSuggestions(
    farm,
    data.plots,
    data.mrvEvents,
    documents,
    data.financeEntries,
  );
  const review = preliminaryReview(farm, data.plots, data.mrvEvents, documents);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your farm record</p>
          <h1>{farm.name || "Your farm"}</h1>
          <p>
            {[farm.village, farm.district].filter(Boolean).join(", ") ||
              "Add your location"}{" "}
            · Your records and next steps.
          </p>
        </div>
        <span className="demo-badge">
          <span className="status-dot" />
          Saved in your account
        </span>
      </div>
      <section className="portal-hero">
        <div>
          <span className="hero-kicker">
            <Sprout size={16} /> Your next step
          </span>
          <h2>
            Keep your farm story clear.
            <br />
            Start with the records.
          </h2>
          <p>
            See which details support your carbon program readiness and which
            ones still need a record.
          </p>
          <button
            className="button button-light"
            onClick={() => onNavigate("analysis")}
          >
            See my carbon readiness <ArrowRight size={17} />
          </button>
        </div>
        <div className="farm-note portal-farm-note">
          <div className="farm-note-top">
            <span>FARM FILE</span>
            <span>AgriCarbon</span>
          </div>
          <strong>{farm.name || "Your farm"}</strong>
          <p>
            {[farm.village, farm.district].filter(Boolean).join(", ") ||
              "Location to add"}
          </p>
          <dl>
            <div>
              <dt>Land</dt>
              <dd>{farm.area ? `${farm.area} acres` : "To add"}</dd>
            </div>
            <div>
              <dt>Crop years</dt>
              <dd>{farm.cropHistoryYears} of 3 recorded</dd>
            </div>
            <div>
              <dt>Documents</dt>
              <dd>{documents.length} saved</dd>
            </div>
          </dl>
          <small>Built from your saved information</small>
        </div>
      </section>
      <div className="portal-stat-grid">
        <div className="panel portal-stat">
          <span className="mini-icon green">
            <TrendingUp size={19} />
          </span>
          <small>Readiness score</small>
          <strong>
            {assessment.score}
            <em>/100</em>
          </strong>
          <span className="portal-stat-caption">
            {assessment.level} preparation
          </span>
        </div>
        <div className="panel portal-stat">
          <span className="mini-icon orange">
            <Wheat size={19} />
          </span>
          <small>Crop history</small>
          <strong>
            {farm.cropHistoryYears}
            <em>/3 years</em>
          </strong>
          <span className="portal-stat-caption">
            From saved seasonal records
          </span>
        </div>
        <div className="panel portal-stat">
          <span className="mini-icon green">
            <FileText size={19} />
          </span>
          <small>Documents stored</small>
          <strong>{documents.length}</strong>
          <span className="portal-stat-caption">
            Private · awaiting verification
          </span>
        </div>
      </div>
      <section className="panel agri-overview-guide">
        <div>
          <span className="card-label">Suggested next step</span>
          <h3>{review.label}</h3>
          <p>{tips[0]?.title || "Keep your farm records current."}</p>
          <small>
            {tips[0]?.reason || "Your current checklist has no urgent gaps."}
          </small>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate("guide")}
        >
          See next steps <ArrowRight size={17} />
        </button>
      </section>
      <div className="agri-overview-status">
        <button className="panel" onClick={() => onNavigate("mrv")}>
          <span className="card-label">Field diary</span>
          <strong>{data.mrvEvents.length} activities</strong>
          <small>{mrv.linkedEvidence} linked to evidence · open diary →</small>
        </button>
        <button className="panel" onClick={() => onNavigate("land")}>
          <span className="card-label">Land papers</span>
          <strong>{data.plots.length} plots</strong>
          <small>Organize each plot and its property papers →</small>
        </button>
        <button className="panel" onClick={() => onNavigate("accounts")}>
          <span className="card-label">Current credits</span>
          <strong>Not verified</strong>
          <small>No registry connected · see accounts →</small>
        </button>
      </div>
      <div className="portal-overview-grid">
        <section className="panel portal-overview-card">
          <div className="panel-heading">
            <div>
              <span className="card-label">Your next steps</span>
              <h3>What to do next</h3>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("documents")}
            >
              Open records <ArrowRight size={16} />
            </button>
          </div>
          <div className="portal-gap-list">
            {assessment.gaps.slice(0, 5).map((gap, index) => (
              <div key={gap.title}>
                <span className="number-bubble">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong>{gap.title}</strong>
                  <p>{gap.detail}</p>
                </div>
              </div>
            ))}
            {assessment.gaps.length === 0 && (
              <div className="empty-good">
                <CheckCircle2 size={22} />
                Your checklist is strong. Keep your records current.
              </div>
            )}
          </div>
        </section>
        <section className="panel portal-overview-card">
          <div className="panel-heading">
            <div>
              <span className="card-label">How your score was made</span>
              <h3>Readiness by area</h3>
            </div>
          </div>
          <div className="bars">
            {assessment.categories.map((category) => (
              <div className="bar-row" key={category.key}>
                <div>
                  <span>{category.label}</span>
                  <strong>{Math.round(category.score)}%</strong>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${category.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="portal-overview-grid">
        <section className="panel portal-overview-card">
          <div className="panel-heading">
            <div>
              <span className="card-label">POSSIBLE PATHWAYS</span>
              <h3>What might fit your farm</h3>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("programs")}
            >
              See all <ArrowRight size={16} />
            </button>
          </div>
          <div className="portal-path-preview">
            {paths.slice(0, 3).map((path) => (
              <div key={path.key}>
                <span className="quick-icon">
                  <Leaf size={17} />
                </span>
                <div>
                  <strong>{path.title}</strong>
                  <small>{path.status}</small>
                </div>
                <ArrowRight size={15} />
              </div>
            ))}
          </div>
        </section>
        <section className="panel portal-overview-card">
          <div className="panel-heading">
            <div>
              <span className="card-label">FARM PROFILE</span>
              <h3>Details on record</h3>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("assessment")}
            >
              Edit <ArrowRight size={16} />
            </button>
          </div>
          <div className="portal-profile-points">
            <div>
              <MapPin size={18} />
              <span>
                {farm.village}, {farm.district}, {farm.state}
              </span>
            </div>
            <div>
              <Wheat size={18} />
              <span>
                {farm.area || "—"} acres ·{" "}
                {farm.tenure || "land status not added"}
              </span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>
                {farm.landProof
                  ? "Land proof noted"
                  : "Land proof still needed"}
              </span>
            </div>
          </div>
        </section>
      </div>
      <div className="portal-disclaimer">
        <ShieldCheck size={20} />
        <span>
          AgriCarbon organizes readiness and evidence. Credits require a
          verified program, formal measurement and independent checks.
        </span>
        <a href="/api/report/pdf">
          <FileDown size={16} />
          Download PDF report
        </a>
      </div>
    </>
  );
}
