"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Circle,
  FileDown,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import { analyzeCarbonReadiness } from "@/lib/carbon-analysis";
import type { PortalData, PortalPage } from "@/lib/portal-types";

export default function CarbonAnalysisPanel({
  data,
  onNavigate,
}: {
  data: PortalData;
  onNavigate: (page: PortalPage) => void;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const analysis = analyzeCarbonReadiness(
    data.farm,
    data.crops,
    data.plots,
    data.mrvEvents,
    data.documents,
  );
  const selected =
    analysis.possibleActions.find((action) => action.key === selectedKey) ||
    analysis.possibleActions[0];

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR MAIN ANALYSIS</p>
          <h1>Carbon credit analysis, made clear.</h1>
          <p>
            See what your farming records show today and what a carbon program
            would still need to review.
          </p>
        </div>
        <a className="button button-secondary" href="/api/report/pdf">
          <FileDown size={17} /> Download analysis PDF
        </a>
      </div>

      <section className="panel carbon-analysis-hero">
        <div>
          <span className="hero-kicker">
            <BarChart3 size={17} /> YOUR CURRENT POSITION
          </span>
          <h2>{analysis.review.label}</h2>
          <p>{analysis.review.reason}</p>
          <button
            className="button button-light"
            onClick={() => onNavigate("guide")}
          >
            See my next actions <ArrowRight size={17} />
          </button>
        </div>
        <div className="carbon-analysis-score" aria-label="Readiness score">
          <strong>{analysis.readinessScore}</strong>
          <span>/100 readiness</span>
          <small>{analysis.level} preparation</small>
        </div>
      </section>

      <div className="carbon-analysis-metrics">
        <div className="panel">
          <span>FARMING PRACTICES</span>
          <strong>{Math.round(analysis.practiceScore)}<small>/100</small></strong>
          <p>Self-reported practice preparation</p>
        </div>
        <div className="panel">
          <span>PROOF CHECKLIST</span>
          <strong>{analysis.evidenceReady}<small>/{analysis.evidenceTotal}</small></strong>
          <p>Key records on file, still unverified</p>
        </div>
        <div className="panel">
          <span>ISSUED CREDITS</span>
          <strong className="carbon-unavailable">Unavailable</strong>
          <p>No registry connected to verify a balance</p>
        </div>
      </div>

      <div className="carbon-analysis-grid">
        <section className="panel carbon-analysis-card">
          <span className="card-label">WHAT YOUR FARM REPORTS</span>
          <h2>Practices worth documenting</h2>
          <p>
            These are your saved answers. A program decides which practices,
            changes, and methods qualify.
          </p>
          {analysis.reportedPractices.length ? (
            <div className="carbon-practice-list">
              {analysis.reportedPractices.map((practice) => (
                <span key={practice}>
                  <Leaf size={15} /> {practice}
                </span>
              ))}
            </div>
          ) : (
            <div className="carbon-empty">
              No soil-friendly practice has been reported yet. Open Farm
              assessment to record what you actually do.
            </div>
          )}
          <div className="carbon-history">
            <strong>{analysis.historySignal.title}</strong>
            <p>{analysis.historySignal.detail}</p>
          </div>
          <button
            className="text-button"
            onClick={() => onNavigate("assessment")}
          >
            Review farm answers <ArrowRight size={16} />
          </button>
        </section>

        <section className="panel carbon-analysis-card">
          <span className="card-label">WHAT A REVIEWER WOULD ASK FOR</span>
          <h2>Six evidence checks</h2>
          <p>
            A complete checklist supports a first conversation. Every file and
            claim still needs independent review.
          </p>
          <div className="carbon-evidence-list">
            {analysis.checks.map((check) => (
              <div key={check.key}>
                {check.done ? (
                  <CheckCircle2 size={21} className="complete" />
                ) : (
                  <Circle size={21} className="missing" />
                )}
                <div>
                  <strong>{check.title}</strong>
                  <small>{check.detail}</small>
                </div>
                <button onClick={() => onNavigate(check.page)}>
                  {check.done ? "Review" : check.action}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel carbon-scenario">
        <div>
          <span className="card-label">TRY A NEXT STEP</span>
          <h2>What could improve my readiness?</h2>
          <p>
            Choose an action to see its effect on the transparent readiness
            rules. This preview changes no saved records and estimates no carbon
            credits. Follow locally suitable farming advice before changing a
            practice.
          </p>
          {selected ? (
            <>
              <label htmlFor="carbon-scenario-select">Possible action</label>
              <select
                id="carbon-scenario-select"
                value={selected.key}
                onChange={(event) => setSelectedKey(event.target.value)}
              >
                {analysis.possibleActions.map((action) => (
                  <option value={action.key} key={action.key}>
                    {action.title}
                  </option>
                ))}
              </select>
              <button
                className="text-button"
                onClick={() => onNavigate("assessment")}
              >
                Record a real change <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <div className="carbon-empty">
              All of these scored actions are already reported. Keep the proof
              current and ask a verified program about its own rules.
            </div>
          )}
        </div>
        {selected && (
          <div className="carbon-scenario-result">
            <small>ILLUSTRATIVE READINESS</small>
            <div>
              <span>{analysis.readinessScore}/100 now</span>
              <ArrowRight size={19} />
              <strong>{selected.projectedScore}/100</strong>
            </div>
            <b>+{selected.increase} readiness points</b>
            <p>
              Only if this answer truthfully changes. Supporting records and
              program verification are still needed.
            </p>
          </div>
        )}
      </section>

      <section className="panel carbon-journey">
        <span className="card-label">FROM RECORDS TO REAL CREDITS</span>
        <h2>Where AgriCarbon ends and a program begins</h2>
        <div>
          <article>
            <span>1</span>
            <strong>Prepare records</strong>
            <p>Farm profile, crop history, practice diary, and evidence.</p>
          </article>
          <article>
            <span>2</span>
            <strong>Program screening</strong>
            <p>A real program checks its method, eligibility, and additionality.</p>
          </article>
          <article>
            <span>3</span>
            <strong>Measure and verify</strong>
            <p>Approved monitoring and independent verification quantify results.</p>
          </article>
          <article>
            <span>4</span>
            <strong>Registry issuance</strong>
            <p>Only a registry can establish issued and held credits.</p>
          </article>
        </div>
        <p className="carbon-disclaimer">
          <ShieldCheck size={19} /> A readiness score, practice signal, or PDF
          is not a credit estimate, approval, or certificate.
        </p>
      </section>
    </>
  );
}
