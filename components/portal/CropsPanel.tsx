"use client";

import { FormEvent, useState } from "react";
import { BookOpen, CalendarDays, Plus, Trash2, Wheat } from "lucide-react";
import type { Crop } from "@/lib/portal-types";

type NewCrop = {
  year: number;
  season: string;
  crop: string;
  tillage: string;
  irrigation: string;
  inputNotes: string;
  waterNotes: string;
};

export default function CropsPanel({
  crops,
  years,
  onAdd,
  onDelete,
  busy,
}: {
  crops: Crop[];
  years: number;
  onAdd: (record: NewCrop) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState<NewCrop>({
    year: new Date().getFullYear(),
    season: "Kharif",
    crop: "",
    tillage: "conventional",
    irrigation: "rainfed",
    inputNotes: "",
    waterNotes: "",
  });
  function update<K extends keyof NewCrop>(key: K, value: NewCrop[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAdd(form);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR FARMING BASELINE</p>
          <h1>Crop history, season by season.</h1>
          <p>
            Add what you grew and how you managed the field. Each distinct year
            counts toward the three-year record goal.
          </p>
        </div>
        <span className="demo-badge">
          <CalendarDays size={15} />
          {years} / 3 years recorded
        </span>
      </div>
      <div className="portal-record-grid">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span className="portal-icon-box">
              <Plus size={20} />
            </span>
            <div>
              <h2>Add a crop season</h2>
              <p>
                Past seasons are useful even if you only know approximate
                details.
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="portal-crop-form">
            <div className="portal-field-grid">
              <label>
                Year
                <input
                  required
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => update("year", Number(e.target.value))}
                />
              </label>
              <label>
                Season
                <select
                  value={form.season}
                  onChange={(e) => update("season", e.target.value)}
                >
                  <option>Kharif</option>
                  <option>Rabi</option>
                  <option>Zaid</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Crop grown
                <input
                  required
                  maxLength={100}
                  value={form.crop}
                  onChange={(e) => update("crop", e.target.value)}
                  placeholder="e.g. rice, wheat, lentils"
                />
              </label>
              <label>
                Tillage
                <select
                  value={form.tillage}
                  onChange={(e) => update("tillage", e.target.value)}
                >
                  <option value="conventional">Conventional</option>
                  <option value="reduced">Reduced</option>
                  <option value="zero">Zero tillage</option>
                </select>
              </label>
              <label>
                Irrigation
                <select
                  value={form.irrigation}
                  onChange={(e) => update("irrigation", e.target.value)}
                >
                  <option value="rainfed">Rain-fed</option>
                  <option value="flood">Flood / channel</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="drip">Drip</option>
                </select>
              </label>
            </div>
            <label className="portal-wide-field">
              Fertilizer or input notes
              <textarea
                maxLength={1000}
                value={form.inputNotes}
                onChange={(e) => update("inputNotes", e.target.value)}
                placeholder="What did you apply? Add amounts if known."
              />
            </label>
            <label className="portal-wide-field">
              Water notes
              <textarea
                maxLength={1000}
                value={form.waterNotes}
                onChange={(e) => update("waterNotes", e.target.value)}
                placeholder="How often did you irrigate?"
              />
            </label>
            <button
              className="button button-primary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Saving…" : "Save crop season"}
              <Plus size={17} />
            </button>
          </form>
        </section>
        <aside>
          <div className="panel portal-record-list">
            <span className="card-label">SAVED SEASONS</span>
            <h3>Your crop timeline</h3>
            {crops.length === 0 ? (
              <div className="portal-empty">
                <Wheat size={28} />
                <strong>No crop seasons yet</strong>
                <p>Add the first season to start your history.</p>
              </div>
            ) : (
              <div className="portal-crop-list">
                {crops.map((item) => (
                  <div key={item.id}>
                    <span className="portal-timeline-icon">
                      <Wheat size={17} />
                    </span>
                    <div>
                      <strong>{item.crop}</strong>
                      <small>
                        {item.season} {item.year} · {item.tillage} tillage ·{" "}
                        {item.irrigation}
                      </small>
                      {item.input_notes && <p>Inputs: {item.input_notes}</p>}
                      {item.water_notes && <p>Water: {item.water_notes}</p>}
                    </div>
                    <button
                      title="Remove crop season"
                      aria-label={`Remove ${item.crop} ${item.year}`}
                      disabled={busy}
                      onClick={() =>
                        window.confirm("Remove this crop season?") &&
                        onDelete(item.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="portal-info-note outside">
            <BookOpen size={19} />
            <span>
              For many programs, the history needs at least three years and a
              full crop rotation where applicable. This is a preparation
              checklist.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
