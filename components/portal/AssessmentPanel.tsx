import { FormEvent } from "react";
import { ArrowRight, ClipboardCheck, Leaf, ShieldCheck } from "lucide-react";
import { assessFarm, type Farm } from "@/lib/readiness";

function Flag({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="portal-flag">
      <span>
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
}

export default function AssessmentPanel({
  farm,
  score,
  onChange,
  onSave,
  busy,
}: {
  farm: Farm;
  score: number;
  onChange: (farm: Farm) => void;
  onSave: () => Promise<void>;
  busy: boolean;
}) {
  function update<K extends keyof Farm>(key: K, value: Farm[K]) {
    onChange({ ...farm, [key]: value });
  }
  const preview = assessFarm(farm);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave();
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EDITABLE FARM PROFILE</p>
          <h1>Tell us about your farm.</h1>
          <p>
            Simple answers create your readiness score and personalized next
            steps. Save whenever things change.
          </p>
        </div>
        <span className="demo-badge">
          <ClipboardCheck size={15} />
          Saved score {score}/100
        </span>
      </div>
      <div className="portal-form-layout">
        <form className="portal-form" onSubmit={submit}>
          <section className="panel portal-form-card">
            <div className="portal-section-title">
              <span>01</span>
              <div>
                <h2>Land and identity</h2>
                <p>Where you farm and how you use the land.</p>
              </div>
            </div>
            <div className="portal-field-grid">
              <label>
                Farmer name
                <input
                  value={farm.name}
                  maxLength={100}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Farm area (acres)
                <input
                  value={farm.area}
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={(e) => update("area", e.target.value)}
                  placeholder="2.5"
                />
              </label>
              <label>
                Village
                <input
                  value={farm.village}
                  maxLength={100}
                  onChange={(e) => update("village", e.target.value)}
                  placeholder="Village"
                />
              </label>
              <label>
                District
                <input
                  value={farm.district}
                  maxLength={100}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="District"
                />
              </label>
              <label>
                State
                <input
                  value={farm.state}
                  maxLength={100}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="State"
                />
              </label>
              <label>
                Land arrangement
                <select
                  value={farm.tenure}
                  onChange={(e) =>
                    update("tenure", e.target.value as Farm["tenure"])
                  }
                >
                  <option value="">Choose one</option>
                  <option value="owned">Owned</option>
                  <option value="leased">Leased / rented</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <div className="portal-flags">
              <Flag
                label="I have ownership or lease proof"
                checked={farm.landProof}
                onChange={(v) => update("landProof", v)}
              />
              <Flag
                label="I have a GPS point or map pin"
                checked={farm.gps}
                onChange={(v) => update("gps", v)}
              />
            </div>
          </section>
          <section className="panel portal-form-card">
            <div className="portal-section-title">
              <span>02</span>
              <div>
                <h2>Farming practices</h2>
                <p>What you do in the field today.</p>
              </div>
            </div>
            <div className="portal-field-grid">
              <label>
                Tillage method
                <select
                  value={farm.tillage}
                  onChange={(e) =>
                    update("tillage", e.target.value as Farm["tillage"])
                  }
                >
                  <option value="conventional">Conventional tillage</option>
                  <option value="reduced">Reduced tillage</option>
                  <option value="zero">Zero tillage</option>
                </select>
              </label>
              <label>
                Crop residue
                <select
                  value={
                    farm.residueBurning === null
                      ? "unknown"
                      : farm.residueBurning
                        ? "burn"
                        : "no-burn"
                  }
                  onChange={(e) =>
                    update(
                      "residueBurning",
                      e.target.value === "unknown"
                        ? null
                        : e.target.value === "burn",
                    )
                  }
                >
                  <option value="unknown">Not answered</option>
                  <option value="no-burn">I do not burn it</option>
                  <option value="burn">I burn it</option>
                </select>
              </label>
            </div>
            <div className="portal-flags">
              <Flag
                label="I use cover crops or green manure"
                checked={farm.coverCrops}
                onChange={(v) => update("coverCrops", v)}
              />
              <Flag
                label="I rotate crops"
                checked={farm.cropRotation}
                onChange={(v) => update("cropRotation", v)}
              />
              <Flag
                label="I mulch or keep residue on soil"
                checked={farm.mulching}
                onChange={(v) => update("mulching", v)}
              />
              <Flag
                label="I grow trees on or near the farm"
                checked={farm.agroforestry}
                onChange={(v) => update("agroforestry", v)}
              />
            </div>
          </section>
          <section className="panel portal-form-card">
            <div className="portal-section-title">
              <span>03</span>
              <div>
                <h2>Inputs and water</h2>
                <p>Track what you apply and how you irrigate.</p>
              </div>
            </div>
            <div className="portal-field-grid">
              <label>
                Irrigation method
                <select
                  value={farm.irrigation}
                  onChange={(e) =>
                    update("irrigation", e.target.value as Farm["irrigation"])
                  }
                >
                  <option value="flood">Flood / channel</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="drip">Drip</option>
                  <option value="rainfed">Rain-fed</option>
                </select>
              </label>
            </div>
            <div className="portal-flags">
              <Flag
                label="I record fertilizer use"
                checked={farm.fertilizerRecords}
                onChange={(v) => update("fertilizerRecords", v)}
              />
              <Flag
                label="I use manure or compost"
                checked={farm.manure}
                onChange={(v) => update("manure", v)}
              />
              <Flag
                label="I keep input purchase bills"
                checked={farm.inputBills}
                onChange={(v) => update("inputBills", v)}
              />
              <Flag
                label="I record irrigation dates"
                checked={farm.waterRecords}
                onChange={(v) => update("waterRecords", v)}
              />
            </div>
          </section>
          <section className="panel portal-form-card">
            <div className="portal-section-title">
              <span>04</span>
              <div>
                <h2>Soil and evidence</h2>
                <p>
                  These answers are self-reported until a program verifies them.
                </p>
              </div>
            </div>
            <div className="portal-flags">
              <Flag
                label="I have a Soil Health Card or lab report"
                checked={farm.soilTest}
                onChange={(v) => update("soilTest", v)}
              />
              <Flag
                label="My report includes organic carbon"
                checked={farm.soilCarbon}
                onChange={(v) => update("soilCarbon", v)}
              />
              <Flag
                label="I have dated field photos"
                checked={farm.fieldPhotos}
                onChange={(v) => update("fieldPhotos", v)}
              />
              <Flag
                label="I belong to an FPO or farmer group"
                checked={farm.fpo}
                onChange={(v) => update("fpo", v)}
              />
            </div>
            <div className="portal-info-note">
              <Leaf size={18} />
              <span>
                Three years of crop history are counted from the seasonal
                records you add in Crop history.
              </span>
            </div>
          </section>
          <div className="portal-save-bar">
            <span>
              <ShieldCheck size={18} />
              Your saved score and action plan update after you save.
            </span>
            <button
              className="button button-primary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Saving…" : "Save farm details"}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
        <aside className="portal-assessment-side">
          <div className="panel live-score">
            <span className="card-label">SCORE PREVIEW</span>
            <div className="live-score-number">
              {preview.score}
              <span>/100</span>
            </div>
            <strong>{preview.level}</strong>
            <p>
              Based on these answers and {farm.cropHistoryYears} years of saved
              crop history.
            </p>
            <div className="mini-bars">
              {preview.categories.map((item) => (
                <div key={item.key}>
                  <span>{item.label}</span>
                  <div>
                    <i style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="aside-note">
            <ShieldCheck size={22} />
            <p>
              Readiness is a preparation guide, not a carbon-credit estimate or
              acceptance decision.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
