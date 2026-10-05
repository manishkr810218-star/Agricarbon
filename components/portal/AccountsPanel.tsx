"use client";

import { FormEvent, useState } from "react";
import { BadgeIndianRupee, FileDown, Plus, Trash2 } from "lucide-react";
import { accountingSummary, selfReportedCredits } from "@/lib/insights";
import { todayIndia } from "@/lib/date";
import type {
  CreditEntry,
  FarmDocument,
  FinanceEntry,
} from "@/lib/portal-types";

type MoneyInput = {
  entryDate: string;
  kind: "expense" | "income";
  category: string;
  amountRupees: number;
  note: string;
  evidenceDocumentId: string | null;
};
type CreditInput = {
  entryDate: string;
  action: "issued" | "retired";
  quantity: number;
  registry: string;
  reference: string;
  note: string;
};
const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);

export default function AccountsPanel({
  financeEntries,
  creditEntries,
  documents,
  onAddMoney,
  onAddCredit,
  onDeleteMoney,
  onDeleteCredit,
  busy,
}: {
  financeEntries: FinanceEntry[];
  creditEntries: CreditEntry[];
  documents: FarmDocument[];
  onAddMoney: (value: MoneyInput) => Promise<boolean>;
  onAddCredit: (value: CreditInput) => Promise<boolean>;
  onDeleteMoney: (id: string) => Promise<void>;
  onDeleteCredit: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const today = todayIndia();
  const [entryDate, setEntryDate] = useState(today);
  const [kind, setKind] = useState<MoneyInput["kind"]>("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [evidenceDocumentId, setEvidenceDocumentId] = useState("");
  const [creditDate, setCreditDate] = useState(today);
  const [action, setAction] = useState<CreditInput["action"]>("issued");
  const [quantity, setQuantity] = useState("");
  const [registry, setRegistry] = useState("");
  const [reference, setReference] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const totals = accountingSummary(financeEntries);
  const claimedBalance = selfReportedCredits(creditEntries);
  async function submitMoney(event: FormEvent) {
    event.preventDefault();
    const saved = await onAddMoney({
      entryDate,
      kind,
      category,
      amountRupees: Number(amount),
      note,
      evidenceDocumentId: evidenceDocumentId || null,
    });
    if (saved) {
      setCategory("");
      setAmount("");
      setNote("");
      setEvidenceDocumentId("");
    }
  }
  async function submitCredit(event: FormEvent) {
    event.preventDefault();
    const saved = await onAddCredit({
      entryDate: creditDate,
      action,
      quantity: Number(quantity),
      registry,
      reference,
      note: creditNote,
    });
    if (saved) {
      setQuantity("");
      setRegistry("");
      setReference("");
      setCreditNote("");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FARM ACCOUNTS</p>
          <h1>Know the cost. Know what is recorded.</h1>
          <p>
            Track farm income, expenses and externally reported credit
            transactions. These figures are bookkeeping, not a carbon-credit
            valuation.
          </p>
        </div>
        <a className="button button-secondary" href="/api/report/pdf">
          <FileDown size={17} /> Download PDF report
        </a>
      </div>
      <div className="agri-account-stats">
        <div className="panel">
          <small>Farm income recorded</small>
          <strong>{money(totals.incomePaise)}</strong>
        </div>
        <div className="panel">
          <small>Farm expenses recorded</small>
          <strong>{money(totals.expensePaise)}</strong>
        </div>
        <div className="panel">
          <small>Net recorded cash flow</small>
          <strong>{money(totals.netPaise)}</strong>
        </div>
      </div>
      <div className="agri-credit-status panel">
        <div>
          <span className="card-label">CURRENT CARBON CREDITS</span>
          <h2>Verified balance unavailable</h2>
          <p>
            No registry is connected. Readiness scores and MRV logs never create
            credits.
          </p>
        </div>
        <div>
          <small>Self-reported balance</small>
          <strong>{claimedBalance.toFixed(3)}</strong>
          <span>credits · unverified</span>
        </div>
      </div>
      <div className="portal-record-grid agri-section-spacer">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span>
              <BadgeIndianRupee size={20} />
            </span>
            <div>
              <h2>Add income or expense</h2>
              <p>Use a bill or receipt when you have one.</p>
            </div>
          </div>
          <form className="portal-simple-form agri-form" onSubmit={submitMoney}>
            <div className="portal-field-grid">
              <label>
                Date
                <input
                  type="date"
                  required
                  max={today}
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </label>
              <label>
                Type
                <select
                  value={kind}
                  onChange={(e) =>
                    setKind(e.target.value as MoneyInput["kind"])
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
            </div>
            <div className="portal-field-grid">
              <label>
                Category
                <input
                  required
                  maxLength={100}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Example: Compost"
                />
              </label>
              <label>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
            </div>
            <label>
              Bill or receipt (optional)
              <select
                value={evidenceDocumentId}
                onChange={(e) => setEvidenceDocumentId(e.target.value)}
              >
                <option value="">No file linked</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.original_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Note (optional)
              <input
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              <Plus size={17} /> Add account entry
            </button>
          </form>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">INCOME & EXPENSE HISTORY</span>
          <h3>{financeEntries.length} entries</h3>
          {financeEntries.length === 0 ? (
            <div className="portal-empty">
              <BadgeIndianRupee size={28} />
              <strong>No account entries yet</strong>
              <p>Record a farm expense or income above.</p>
            </div>
          ) : (
            <div className="agri-record-list">
              {financeEntries.map((entry) => (
                <div key={entry.id}>
                  <div>
                    <strong>
                      {entry.category} · {money(entry.amount_paise)}
                    </strong>
                    <small>
                      {entry.entry_date} · {entry.kind} ·{" "}
                      {entry.evidence_document_id
                        ? "receipt linked"
                        : "no receipt"}
                    </small>
                    {entry.note && <p>{entry.note}</p>}
                  </div>
                  <button
                    aria-label="Delete account entry"
                    disabled={busy}
                    onClick={() =>
                      window.confirm("Delete this account entry?") &&
                      onDeleteMoney(entry.id)
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
      <div className="portal-record-grid agri-section-spacer">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span>CO₂</span>
            <div>
              <h2>Record a registry transaction</h2>
              <p>
                Only enter credits that a program has actually issued or retired
                elsewhere.
              </p>
            </div>
          </div>
          <form
            className="portal-simple-form agri-form"
            onSubmit={submitCredit}
          >
            <div className="portal-field-grid">
              <label>
                Date
                <input
                  type="date"
                  required
                  max={today}
                  value={creditDate}
                  onChange={(e) => setCreditDate(e.target.value)}
                />
              </label>
              <label>
                Transaction
                <select
                  value={action}
                  onChange={(e) =>
                    setAction(e.target.value as CreditInput["action"])
                  }
                >
                  <option value="issued">Issued externally</option>
                  <option value="retired">Retired externally</option>
                </select>
              </label>
            </div>
            <label>
              Quantity of credits
              <input
                type="number"
                min="0.001"
                step="0.001"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <div className="portal-field-grid">
              <label>
                Registry / program name
                <input
                  required
                  maxLength={100}
                  value={registry}
                  onChange={(e) => setRegistry(e.target.value)}
                />
              </label>
              <label>
                Registry transaction reference
                <input
                  required
                  maxLength={100}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
            </div>
            <label>
              Note (optional)
              <input
                maxLength={500}
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
              />
            </label>
            <button className="button button-primary" disabled={busy}>
              <Plus size={17} /> Save self-reported entry
            </button>
          </form>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">SELF-REPORTED CREDIT ENTRIES</span>
          <h3>{creditEntries.length} entries · none verified here</h3>
          {creditEntries.length === 0 ? (
            <div className="portal-empty">
              <strong>No credit transactions recorded</strong>
              <p>
                This is normal. A readiness score does not mean credits have
                been issued.
              </p>
            </div>
          ) : (
            <div className="agri-record-list">
              {creditEntries.map((entry) => (
                <div key={entry.id}>
                  <div>
                    <strong>
                      {entry.action === "issued" ? "+" : "−"}
                      {(entry.quantity_milli / 1000).toFixed(3)} credits
                    </strong>
                    <small>
                      {entry.entry_date} · {entry.registry}
                    </small>
                    <p>Reference: {entry.reference} · self-reported</p>
                  </div>
                  <button
                    aria-label="Delete credit entry"
                    disabled={busy}
                    onClick={() =>
                      window.confirm("Delete this credit entry?") &&
                      onDeleteCredit(entry.id)
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
        No carbon price, revenue or sellable-credit estimate is calculated. A
        program and independent verifier decide issuance; the registry is the
        source of truth for actual holdings.
      </p>
    </>
  );
}
