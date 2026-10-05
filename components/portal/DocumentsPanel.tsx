"use client";

import { FormEvent, useState } from "react";
import {
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type { FarmDocument, LandPlot } from "@/lib/portal-types";

const kinds: Record<string, string> = {
  land: "Land proof",
  deed: "Ownership deed / land record",
  lease: "Lease agreement",
  boundary: "Boundary map / survey",
  tax: "Land tax receipt",
  soil: "Soil report",
  input: "Input bill",
  photo: "Field photo",
  other: "Other record",
};

export default function DocumentsPanel({
  documents,
  plots,
  onUpload,
  onDelete,
  busy,
}: {
  documents: FarmDocument[];
  plots: LandPlot[];
  onUpload: (kind: string, file: File, plotId: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const [kind, setKind] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [plotId, setPlotId] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (file) await onUpload(kind, file, plotId);
  }
  const counts = Object.keys(kinds).map((key) => ({
    key,
    label: kinds[key],
    count: documents.filter((item) => item.kind === key).length,
  }));
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PRIVATE FARM RECORDS</p>
          <h1>Your document locker.</h1>
          <p>
            Save soil reports, property papers, bills and photos. Only your
            signed-in account can download these files.
          </p>
        </div>
        <span className="demo-badge">
          <FolderOpen size={15} />
          {documents.length} files saved
        </span>
      </div>
      <div className="portal-record-grid">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span className="portal-icon-box">
              <UploadCloud size={20} />
            </span>
            <div>
              <h2>Add a document</h2>
              <p>PDF, JPEG, PNG or WebP · maximum 8 MB per file.</p>
            </div>
          </div>
          <form className="portal-upload-form" onSubmit={submit}>
            <label>
              Document type
              <select
                required
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="" disabled>
                  Choose document type
                </option>
                {Object.entries(kinds).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {plots.length > 0 && (
              <label>
                Related land plot (optional)
                <select
                  value={plotId}
                  onChange={(e) => setPlotId(e.target.value)}
                >
                  <option value="">General farm file</option>
                  {plots.map((plot) => (
                    <option key={plot.id} value={plot.id}>
                      {plot.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="portal-drop">
              <UploadCloud size={29} />
              <strong>
                {file ? file.name : "Choose a file from your device"}
              </strong>
              <span>Tap here to select a PDF or photo</span>
              <input
                required
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              className="button button-primary"
              disabled={busy || !file}
              type="submit"
            >
              {busy ? "Uploading…" : "Save document"}
              <UploadCloud size={17} />
            </button>
          </form>
          <div className="portal-info-note">
            <ShieldCheck size={18} />
            <span>
              Stored files are private to this account on this computer. A saved
              file is not independently verified.
            </span>
          </div>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">EVIDENCE CHECKLIST</span>
          <h3>What is in your locker?</h3>
          <div className="portal-kind-list">
            {counts.map((item) => (
              <div key={item.key}>
                <span className={item.count ? "filled" : ""}>
                  {item.count ? (
                    <FileCheck2 size={18} />
                  ) : (
                    <FileText size={18} />
                  )}
                </span>
                <strong>{item.label}</strong>
                <small>
                  {item.count ? `${item.count} saved` : "Still needed"}
                </small>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <section className="panel portal-files-card">
        <div className="panel-heading">
          <div>
            <span className="card-label">MY FILES</span>
            <h3>Documents on record</h3>
          </div>
        </div>
        {documents.length === 0 ? (
          <div className="portal-empty">
            <FolderOpen size={30} />
            <strong>No files saved yet</strong>
            <p>Use the form above to add your first record.</p>
          </div>
        ) : (
          <div className="portal-files-list">
            {documents.map((item) => (
              <div key={item.id}>
                <span className="portal-file-icon">
                  <FileText size={20} />
                </span>
                <div>
                  <strong>{item.original_name}</strong>
                  <small>
                    {kinds[item.kind] || item.kind} ·{" "}
                    {item.plot_id
                      ? (plots.find((plot) => plot.id === item.plot_id)?.name ||
                          "Plot") + " · "
                      : ""}
                    {new Date(item.created_at).toLocaleDateString()} ·{" "}
                    {(item.size_bytes / 1024).toFixed(0)} KB · Unverified
                  </small>
                </div>
                <a
                  href={`/api/documents/${item.id}`}
                  title="Download file"
                  aria-label={`Download ${item.original_name}`}
                >
                  <Download size={18} />
                </a>
                <button
                  disabled={busy}
                  title="Delete file"
                  aria-label={`Delete ${item.original_name}`}
                  onClick={() =>
                    window.confirm("Delete this file permanently?") &&
                    onDelete(item.id)
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
