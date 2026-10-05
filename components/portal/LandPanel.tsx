"use client";

import { FormEvent, useState } from "react";
import { FileText, MapPinned, Plus, Trash2 } from "lucide-react";
import { landSizeGuide } from "@/lib/insights";
import type { FarmDocument, LandPlot, PortalPage } from "@/lib/portal-types";

type PlotInput = {
  name: string;
  areaAcres: number;
  tenure: "owned" | "leased" | "other";
  village: string;
  parcelReference: string;
  notes: string;
};
const paperwork = [
  { kind: "deed", label: "Ownership deed / land record" },
  { kind: "lease", label: "Lease or tenancy agreement" },
  { kind: "boundary", label: "Survey map / boundary proof" },
  { kind: "tax", label: "Land tax or payment receipt" },
];

export default function LandPanel({
  farmArea,
  state,
  village,
  plots,
  documents,
  onAdd,
  onDelete,
  onNavigate,
  busy,
}: {
  farmArea: string;
  state: string;
  village: string;
  plots: LandPlot[];
  documents: FarmDocument[];
  onAdd: (value: PlotInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  onNavigate: (page: PortalPage) => void;
  busy: boolean;
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [tenure, setTenure] = useState<PlotInput["tenure"]>("owned");
  const [plotVillage, setPlotVillage] = useState(village);
  const [parcelReference, setParcelReference] = useState("");
  const [notes, setNotes] = useState("");
  const guide = landSizeGuide(Number(farmArea) || 0);
  const plotArea = plots.reduce((sum, plot) => sum + plot.area_acres, 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const saved = await onAdd({
      name,
      areaAcres: Number(area),
      tenure,
      village: plotVillage,
      parcelReference,
      notes,
    });
    if (saved) {
      setName("");
      setArea("");
      setParcelReference("");
      setNotes("");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LAND & PROPERTY</p>
          <h1>Know each plot. Keep its papers safe.</h1>
          <p>
            Record plots separately and store the papers you may need to show
            your right to farm them.
          </p>
        </div>
      </div>
      <div className="agri-feature-grid">
        <section className="panel agri-feature-card">
          <span className="card-label">YOUR LAND SIZE</span>
          <h2>
            {farmArea || "0"} acres <small>≈ {guide.hectares} hectares</small>
          </h2>
          <strong>{guide.band}</strong>
          <p>{guide.advice}</p>
          <p className="agri-caution">
            This is an indicative size group, not carbon-program eligibility.
            Each program sets its own minimum area, maximum area, tenure and
            aggregation rules.
          </p>
        </section>
        <section className="panel agri-feature-card">
          <span className="card-label">PROPERTY PAPERWORK</span>
          {paperwork.map((item) => (
            <div className="agri-check-row" key={item.kind}>
              <FileText size={18} />
              <span>{item.label}</span>
              <b>
                {documents.some(
                  (doc) =>
                    doc.kind === item.kind ||
                    (item.kind === "deed" && doc.kind === "land"),
                )
                  ? "Saved · unverified"
                  : "Missing"}
              </b>
            </div>
          ))}
          <button
            className="text-button"
            onClick={() => onNavigate("documents")}
          >
            Open private document locker →
          </button>
        </section>
      </div>
      <div className="portal-record-grid agri-section-spacer">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span>
              <MapPinned size={20} />
            </span>
            <div>
              <h2>Add a land plot</h2>
              <p>
                Keep parcel numbers private. Enter only the details you know.
              </p>
            </div>
          </div>
          <form className="portal-simple-form agri-form" onSubmit={submit}>
            <label>
              Plot name
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: North field"
              />
            </label>
            <div className="portal-field-grid">
              <label>
                Area in acres
                <input
                  required
                  type="number"
                  min="0.001"
                  max="100000"
                  step="any"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </label>
              <label>
                Right to farm
                <select
                  value={tenure}
                  onChange={(e) =>
                    setTenure(e.target.value as PlotInput["tenure"])
                  }
                >
                  <option value="owned">Owned</option>
                  <option value="leased">Leased</option>
                  <option value="other">Other arrangement</option>
                </select>
              </label>
            </div>
            <div className="portal-field-grid">
              <label>
                Village
                <input
                  required
                  maxLength={100}
                  value={plotVillage}
                  onChange={(e) => setPlotVillage(e.target.value)}
                />
              </label>
              <label>
                Parcel / khata reference (optional)
                <input
                  maxLength={100}
                  value={parcelReference}
                  onChange={(e) => setParcelReference(e.target.value)}
                />
              </label>
            </div>
            <label>
              Notes (optional)
              <textarea
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="For example, boundary or lease renewal notes"
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              <Plus size={17} /> Save plot
            </button>
          </form>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">SAVED PLOTS</span>
          <h3>
            {plots.length} plots · {plotArea.toFixed(2)} acres recorded
          </h3>
          {plots.length === 0 ? (
            <div className="portal-empty">
              <MapPinned size={28} />
              <strong>No plots recorded yet</strong>
              <p>Add your first plot to organize its paperwork.</p>
            </div>
          ) : (
            <div className="agri-record-list">
              {plots.map((plot) => (
                <div key={plot.id}>
                  <div>
                    <strong>{plot.name}</strong>
                    <small>
                      {plot.area_acres} acres · {plot.tenure} · {plot.village}
                    </small>
                    <small>
                      {
                        documents.filter((doc) => doc.plot_id === plot.id)
                          .length
                      }{" "}
                      private files linked
                    </small>
                    {plot.parcel_reference && (
                      <small>Parcel: {plot.parcel_reference}</small>
                    )}
                    {plot.notes && <p>{plot.notes}</p>}
                  </div>
                  <button
                    aria-label={"Delete " + plot.name}
                    disabled={busy}
                    onClick={() =>
                      window.confirm("Delete this plot record?") &&
                      onDelete(plot.id)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {plots.length > 0 && Math.abs(plotArea - Number(farmArea)) > 0.01 && (
            <p className="agri-caution">
              The plot total differs from the farm area in your assessment.
              Review both figures before sharing a report.
            </p>
          )}
        </aside>
      </div>
      <div className="portal-info-note agri-section-spacer">
        Official land records are held by government systems.{" "}
        {state.toLowerCase() === "jharkhand" ? (
          <a
            href="https://jharbhoomi.jharkhand.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Jharkhand Jharbhoomi ↗
          </a>
        ) : (
          <a
            href="https://dilrmp.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find Indian land-record services ↗
          </a>
        )}{" "}
        AgriCarbon does not check property ownership.
      </div>
    </>
  );
}
