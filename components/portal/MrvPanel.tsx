"use client";

import { FormEvent, useState } from "react";
import { Activity, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import {
  hasPracticeEvidence,
  mrvSummary,
  practiceEvidenceKinds,
} from "@/lib/insights";
import { todayIndia } from "@/lib/date";
import type { Farm } from "@/lib/readiness";
import type { FarmDocument, MrvEvent, PortalPage } from "@/lib/portal-types";

const practices: Record<string, string> = {
  tillage: "Tillage",
  cover_crop: "Cover crop",
  residue: "Crop residue",
  fertilizer: "Fertilizer / manure",
  irrigation: "Irrigation",
  soil_sample: "Soil sample",
  field_photo: "Field photo",
  other: "Other activity",
};
type EventInput = {
  eventDate: string;
  practice: string;
  details: string;
  evidenceDocumentId: string | null;
};

export default function MrvPanel({
  farm,
  events,
  documents,
  onAdd,
  onDelete,
  onNavigate,
  busy,
}: {
  farm: Farm;
  events: MrvEvent[];
  documents: FarmDocument[];
  onAdd: (value: EventInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onNavigate: (page: PortalPage) => void;
  busy: boolean;
}) {
  const [date, setDate] = useState(todayIndia());
  const [practice, setPractice] = useState("cover_crop");
  const [details, setDetails] = useState("");
  const [evidenceDocumentId, setEvidenceDocumentId] = useState("");
  const summary = mrvSummary(farm, events, documents);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const saved = await onAdd({
      eventDate: date,
      practice,
      details,
      evidenceDocumentId: evidenceDocumentId || null,
    });
    if (saved) {
      setDetails("");
      setEvidenceDocumentId("");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MONITOR · REPORT · VERIFY</p>
          <h1>Make a record while the work is fresh.</h1>
          <p>
            Your MRV diary connects dated farming activities with photos and
            documents. An independent program must still verify results.
          </p>
        </div>
      </div>
      <div className="agri-mrv-steps">
        {summary.steps.map((step, index) => (
          <div className="panel" key={step.title}>
            <span>
              {step.done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
            </span>
            <small>STEP {index + 1}</small>
            <strong>{step.title}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
      <div className="portal-record-grid agri-section-spacer">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span>
              <Activity size={20} />
            </span>
            <div>
              <h2>Log a farm activity</h2>
              <p>A clear date, action and proof make a stronger record.</p>
            </div>
          </div>
          <form className="portal-simple-form agri-form" onSubmit={submit}>
            <div className="portal-field-grid">
              <label>
                Date
                <input
                  required
                  type="date"
                  max={todayIndia()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Activity
                <select
                  value={practice}
                  onChange={(e) => setPractice(e.target.value)}
                >
                  {Object.entries(practices).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              What happened?
              <textarea
                required
                minLength={3}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Example: Added compost to the north field"
              />
            </label>
            <label>
              Attach saved evidence (optional)
              <select
                value={evidenceDocumentId}
                onChange={(e) => setEvidenceDocumentId(e.target.value)}
              >
                <option value="">No file attached yet</option>
                {documents
                  .filter((doc) =>
                    practiceEvidenceKinds.some((kind) => kind === doc.kind),
                  )
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.original_name}
                    </option>
                  ))}
              </select>
            </label>
            <button className="button button-primary" disabled={busy}>
              <Plus size={17} /> Save activity
            </button>
          </form>
          <div className="portal-info-note">
            Need a photo or bill?{" "}
            <button
              className="text-button"
              onClick={() => onNavigate("documents")}
            >
              Upload evidence first →
            </button>
          </div>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">YOUR ACTIVITY TIMELINE</span>
          <h3>
            {events.length} dated logs · {summary.linkedEvidence} linked files
          </h3>
          {events.length === 0 ? (
            <div className="portal-empty">
              <Activity size={28} />
              <strong>No monitoring logs yet</strong>
              <p>Start with one activity from this season.</p>
            </div>
          ) : (
            <div className="agri-record-list">
              {events.map((item) => (
                <div key={item.id}>
                  <div>
                    <strong>{practices[item.practice] || item.practice}</strong>
                    <small>
                      {item.event_date} ·{" "}
                      {hasPracticeEvidence(item, documents)
                        ? "Practice proof linked"
                        : "No practice proof linked"}
                    </small>
                    <p>{item.details}</p>
                  </div>
                  <button
                    aria-label="Delete activity"
                    disabled={busy}
                    onClick={() =>
                      window.confirm("Delete this monitoring log?") &&
                      onDelete(item.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
      <p className="agri-caution agri-section-spacer">
        This diary is farmer-entered monitoring data. It does not measure soil
        carbon, establish additionality, or count as independent verification.
      </p>
    </>
  );
}
