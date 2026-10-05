import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileDown, Leaf, ShieldCheck } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { analyzeCarbonReadiness } from "@/lib/carbon-analysis";
import {
  accountingSummary,
  mrvSummary,
  selfReportedCredits,
} from "@/lib/insights";
import type {
  CreditEntry,
  FarmDocument,
  FinanceEntry,
  LandPlot,
  MrvEvent,
} from "@/lib/portal-types";
import { matchProgramPaths } from "@/lib/programs";
import { userFromPageCookie } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { farmSummary } from "@/lib/server/farm";

export const runtime = "nodejs";

type CropRow = {
  year: number;
  season: string;
  crop: string;
  tillage: string;
  irrigation: string;
};
type DocumentRow = { kind: string; original_name: string; created_at: string };

export default async function FarmerReportPage() {
  const user = await userFromPageCookie();
  if (!user) redirect("/login");
  const { farm, assessment } = farmSummary(user.id);
  const crops = getDb()
    .prepare(
      `SELECT year, season, crop, tillage, irrigation FROM crop_records
    WHERE user_id = ? ORDER BY year DESC, season`,
    )
    .all(user.id) as CropRow[];
  const documents = getDb()
    .prepare(
      `SELECT kind, original_name, created_at FROM documents
    WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(user.id) as DocumentRow[];
  const paths = matchProgramPaths(farm);
  const events = getDb()
    .prepare(
      "SELECT * FROM mrv_events WHERE user_id = ? ORDER BY event_date DESC",
    )
    .all(user.id) as MrvEvent[];
  const finance = getDb()
    .prepare("SELECT * FROM finance_entries WHERE user_id = ?")
    .all(user.id) as FinanceEntry[];
  const credits = getDb()
    .prepare("SELECT * FROM credit_entries WHERE user_id = ?")
    .all(user.id) as CreditEntry[];
  const docIds = getDb()
    .prepare(
      "SELECT id, kind, original_name, mime_type, size_bytes, created_at, plot_id FROM documents WHERE user_id = ?",
    )
    .all(user.id) as FarmDocument[];
  const plots = getDb()
    .prepare("SELECT * FROM land_plots WHERE user_id = ?")
    .all(user.id) as LandPlot[];
  const creditAnalysis = analyzeCarbonReadiness(
    farm,
    crops,
    plots,
    events,
    docIds,
  );
  const mrv = mrvSummary(farm, events, docIds);
  const accounts = accountingSummary(finance);
  const date = new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="report-page">
      <div className="report-toolbar">
        <Link href="/farmer">
          <ArrowLeft size={16} />
          Back to my farm
        </Link>
        <PrintButton />
        <a href="/api/report/pdf">
          <FileDown size={16} /> Download PDF
        </a>
      </div>
      <article className="report-sheet">
        <header className="report-header">
          <div className="report-brand">
            <span className="brand-mark">
              <Leaf size={22} />
            </span>
            <strong>AgriCarbon</strong>
          </div>
          <span>FARM READINESS REPORT · {date}</span>
        </header>
        <div className="report-title">
          <span className="eyebrow">PERSONAL FARM ACTION PLAN</span>
          <h1>{farm.name || user.name}&apos;s readiness report</h1>
          <p>
            {farm.village}, {farm.district}, {farm.state} · {farm.area || "—"}{" "}
            acres · {farm.tenure || "Land arrangement not added"}
          </p>
        </div>
        <div className="report-score">
          <div>
            <span>READINESS SCORE</span>
            <strong>
              {assessment.score}
              <em>/100</em>
            </strong>
            <b>{assessment.level}</b>
          </div>
          <p>
            This score describes how prepared your records and practices are for
            discussing a carbon program. It is not a carbon-credit amount,
            approval or guarantee.
          </p>
        </div>
        <section className="report-section">
          <h2>Where you stand</h2>
          <div className="report-categories">
            {assessment.categories.map((item) => (
              <div key={item.key}>
                <span>{item.label}</span>
                <b>{Math.round(item.score)}%</b>
                <small>{item.weight}% of total score</small>
              </div>
            ))}
          </div>
        </section>
        <section className="report-section">
          <h2>Carbon credit analysis</h2>
          <p>
            <strong>{creditAnalysis.review.label}.</strong>{" "}
            {creditAnalysis.review.reason}
          </p>
          <p>
            Practice preparation: {Math.round(creditAnalysis.practiceScore)}
            /100 (self-reported). Evidence on file:{" "}
            {creditAnalysis.evidenceReady}/{creditAnalysis.evidenceTotal}{" "}
            preparation checks (unverified).
          </p>
          <p>
            {creditAnalysis.historySignal.title}: {" "}
            {creditAnalysis.historySignal.detail}
          </p>
          {creditAnalysis.checks.some((check) => !check.done) ? (
            <ul className="report-documents">
              {creditAnalysis.checks
                .filter((check) => !check.done)
                .map((check) => (
                  <li key={check.key}>
                    <strong>Still needed: {check.title}</strong>
                    <span>{check.detail}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p>
              All six preparation checks are on file. A real program must
              decide eligibility and verify the evidence.
            </p>
          )}
          <p>No credit quantity is calculated. Verified balance unavailable.</p>
        </section>
        <section className="report-section">
          <h2>What to do next</h2>
          {assessment.gaps.length === 0 ? (
            <p>
              Your checklist looks strong. Keep your records up to date each
              season.
            </p>
          ) : (
            <ol className="report-gaps">
              {assessment.gaps.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
        <section className="report-section">
          <h2>Crop history</h2>
          <p>{farm.cropHistoryYears} of 3 target years are recorded.</p>
          {crops.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Season</th>
                  <th>Crop</th>
                  <th>Tillage</th>
                  <th>Irrigation</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((item, index) => (
                  <tr key={`${item.year}-${item.season}-${index}`}>
                    <td>{item.year}</td>
                    <td>{item.season}</td>
                    <td>{item.crop}</td>
                    <td>{item.tillage}</td>
                    <td>{item.irrigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No crop seasons have been entered yet.</p>
          )}
        </section>
        <section className="report-section">
          <h2>Document checklist</h2>
          {documents.length > 0 ? (
            <ul className="report-documents">
              {documents.map((item, index) => (
                <li key={`${item.original_name}-${index}`}>
                  <strong>{item.original_name}</strong>
                  <span>
                    {item.kind} · added{" "}
                    {new Date(item.created_at).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}{" "}
                    · unverified
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No files are stored yet. Add land records, soil reports, bills and
              field photos to your locker.
            </p>
          )}
        </section>
        <section className="report-section">
          <h2>Pathways to ask about</h2>
          <div className="report-pathways">
            {paths.map((path) => (
              <div key={path.key}>
                <strong>{path.title}</strong>
                <span>{path.status}</span>
                <p>{path.why}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="report-section">
          <h2>MRV and farm accounts</h2>
          <p>
            {events.length} dated activity logs; {mrv.linkedEvidence} linked to
            saved evidence. Independent verification remains required.
          </p>
          <p>
            Recorded income: ₹{(accounts.incomePaise / 100).toFixed(2)} ·
            expenses: ₹{(accounts.expensePaise / 100).toFixed(2)} · net: ₹
            {(accounts.netPaise / 100).toFixed(2)}
          </p>
        </section>
        <section className="report-section">
          <h2>Current carbon credits</h2>
          <p>
            Verified balance unavailable; no registry is connected.
            Self-reported transaction balance:{" "}
            {selfReportedCredits(credits).toFixed(3)} credits (unverified).
          </p>
        </section>
        <footer className="report-foot">
          <ShieldCheck size={19} />
          <p>
            AgriCarbon provides preparation guidance. A verified carbon program
            must decide eligibility and carry out baseline assessment,
            measurement and independent verification. Uploaded files are not
            verified by AgriCarbon.
          </p>
        </footer>
      </article>
    </main>
  );
}
