"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  BadgeIndianRupee,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Lightbulb,
  Leaf,
  LogOut,
  Menu,
  MapPinned,
  ShieldCheck,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { api, jsonRequest } from "@/lib/client-api";
import type { User } from "@/lib/server/auth";
import type { Farm } from "@/lib/readiness";
import type {
  Crop,
  FarmDocument,
  FarmerGroup,
  FarmResponse,
  GroupSummary,
  PortalData,
  PortalPage,
} from "@/lib/portal-types";
import OverviewPanel from "./portal/OverviewPanel";
import AssessmentPanel from "./portal/AssessmentPanel";
import CropsPanel from "./portal/CropsPanel";
import DocumentsPanel from "./portal/DocumentsPanel";
import ProgramsPanel from "./portal/ProgramsPanel";
import GroupsPanel from "./portal/GroupsPanel";
import LandPanel from "./portal/LandPanel";
import MrvPanel from "./portal/MrvPanel";
import AccountsPanel from "./portal/AccountsPanel";
import GuidePanel from "./portal/GuidePanel";

export default function FarmerPortal({ user }: { user: User }) {
  const router = useRouter();
  const [page, setPage] = useState<PortalPage>("overview");
  const [data, setData] = useState<PortalData | null>(null);
  const [draft, setDraft] = useState<Farm | null>(null);
  const [groupSummary, setGroupSummary] = useState<GroupSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [
      farm,
      crops,
      documents,
      groups,
      programs,
      plots,
      mrv,
      finance,
      credits,
    ] = await Promise.all([
      api<FarmResponse>("/api/farm"),
      api<{ records: Crop[] }>("/api/crops"),
      api<{ documents: FarmDocument[] }>("/api/documents"),
      api<{ groups: FarmerGroup[] }>("/api/groups"),
      api<{ paths: PortalData["paths"] }>("/api/programs"),
      api<{ records: PortalData["plots"] }>("/api/records/plots"),
      api<{ records: PortalData["mrvEvents"] }>("/api/records/mrv"),
      api<{ records: PortalData["financeEntries"] }>("/api/records/finance"),
      api<{ records: PortalData["creditEntries"] }>("/api/records/credits"),
    ]);
    const next = {
      ...farm,
      crops: crops.records,
      documents: documents.documents,
      groups: groups.groups,
      paths: programs.paths,
      plots: plots.records,
      mrvEvents: mrv.records,
      financeEntries: finance.records,
      creditEntries: credits.records,
    };
    setData(next);
    setDraft(farm.farm);
    return next;
  }, []);

  useEffect(() => {
    refresh().catch((cause) =>
      setError(
        cause instanceof Error ? cause.message : "Could not load your farm.",
      ),
    );
  }, [refresh]);

  function navigate(next: PortalPage) {
    setPage(next);
    setMenuOpen(false);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveFarm() {
    if (!draft) return;
    await run(async () => {
      await api<FarmResponse>("/api/farm", jsonRequest("PUT", draft));
      await refresh();
    }, "Your farm details are saved.");
  }

  async function addCrop(
    record: Omit<Crop, "id" | "created_at" | "input_notes" | "water_notes"> & {
      inputNotes: string;
      waterNotes: string;
    },
  ) {
    await run(async () => {
      await api("/api/crops", jsonRequest("POST", record));
      await refresh();
    }, "Crop season added.");
  }

  async function deleteCrop(id: string) {
    await run(async () => {
      await api(`/api/crops/${id}`, { method: "DELETE" });
      await refresh();
    }, "Crop record removed.");
  }

  async function uploadDocument(kind: string, file: File, plotId: string) {
    await run(async () => {
      const body = new FormData();
      body.set("kind", kind);
      body.set("file", file);
      if (plotId) body.set("plotId", plotId);
      await api("/api/documents", { method: "POST", body });
      await refresh();
    }, "Document saved privately. It is not yet verified.");
  }

  async function deleteDocument(id: string) {
    await run(async () => {
      await api(`/api/documents/${id}`, { method: "DELETE" });
      await refresh();
    }, "Document removed.");
  }

  async function groupAction(
    body: { action: "create"; name: string } | { action: "join"; code: string },
  ) {
    await run(
      async () => {
        await api("/api/groups", jsonRequest("POST", body));
        await refresh();
      },
      body.action === "create"
        ? "Farmer group created. Share its invite code with members."
        : "You joined the farmer group.",
    );
  }

  async function loadGroup(id: string) {
    await run(async () => {
      setGroupSummary(await api<GroupSummary>(`/api/groups/${id}`));
    }, "Group summary loaded.");
  }

  async function addRecord(
    kind: "plots" | "mrv" | "finance" | "credits",
    value: unknown,
  ) {
    return await run(async () => {
      await api("/api/records/" + kind, jsonRequest("POST", value));
      await refresh();
    }, "Record saved privately.");
  }

  async function deleteRecord(
    kind: "plots" | "mrv" | "finance" | "credits",
    id: string,
  ) {
    await run(async () => {
      await api("/api/records/" + kind + "?id=" + encodeURIComponent(id), {
        method: "DELETE",
      });
      await refresh();
    }, "Record removed.");
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = [
    { id: "overview" as PortalPage, text: "Overview", icon: Sprout },
    {
      id: "assessment" as PortalPage,
      text: "Farm assessment",
      icon: ClipboardCheck,
    },
    { id: "crops" as PortalPage, text: "Crop history", icon: BookOpen },
    { id: "land" as PortalPage, text: "Land & papers", icon: MapPinned },
    { id: "mrv" as PortalPage, text: "MRV diary", icon: Activity },
    {
      id: "documents" as PortalPage,
      text: "Document locker",
      icon: FolderOpen,
    },
    { id: "programs" as PortalPage, text: "Program pathways", icon: FileText },
    { id: "groups" as PortalPage, text: "Farmer groups", icon: Users },
    {
      id: "accounts" as PortalPage,
      text: "Farm accounts",
      icon: BadgeIndianRupee,
    },
    { id: "guide" as PortalPage, text: "My guide", icon: Lightbulb },
  ];

  return (
    <div className="app-shell portal-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          <span>
            <strong>AgriCarbon</strong>
            <small>FARM READINESS</small>
          </span>
        </Link>
        <div className="sidebar-label">MY FARM WORKSPACE</div>
        <nav aria-label="Farmer navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={19} />
              <span>{item.text}</span>
              {page === item.id && <ArrowRight size={15} />}
            </button>
          ))}
        </nav>
        <Link className="agri-about-nav" href="/about">
          About AgriCarbon →
        </Link>
        <div className="sidebar-bottom">
          <div className="side-help">
            <span className="side-help-icon">
              <ShieldCheck size={21} />
            </span>
            <strong>Keep your proof together.</strong>
            <p>
              Record each season, save documents, and follow your next steps.
            </p>
            <button onClick={() => navigate("documents")}>
              Open document locker <ArrowRight size={14} />
            </button>
          </div>
          <span className="hackathon-label">
            PREPARATION · NOT CREDIT ISSUANCE
          </span>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={23} />
          </button>
          <div className="topbar-copy">
            <span className="topbar-eyebrow">Your farm workspace</span>
            <span className="topbar-page">
              {nav.find((item) => item.id === page)?.text}
            </span>
          </div>
          <div className="topbar-actions">
            <span className="profile-pill">
              <span className="avatar">{user.name[0]?.toUpperCase()}</span>
              <span>{user.name}</span>
            </span>
            <button
              className="portal-logout"
              onClick={logout}
              aria-label="Sign out"
            >
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </div>
        </header>
        <div className="content portal-content">
          {notice && (
            <div className="portal-message success" role="status">
              <ShieldCheck size={18} />
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {error && (
            <div className="portal-message failure" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {!data || !draft ? (
            <div className="portal-loading">
              <Sprout size={34} />
              <strong>Preparing your farm…</strong>
              <p>Loading your saved details and records.</p>
              {error && (
                <button
                  className="button button-secondary"
                  onClick={() =>
                    refresh().catch((cause) =>
                      setError(
                        cause instanceof Error
                          ? cause.message
                          : "Could not load your farm.",
                      ),
                    )
                  }
                >
                  Try again
                </button>
              )}
            </div>
          ) : (
            <>
              {page === "overview" && (
                <OverviewPanel data={data} onNavigate={navigate} />
              )}
              {page === "assessment" && (
                <AssessmentPanel
                  farm={draft}
                  score={data.assessment.score}
                  onChange={setDraft}
                  onSave={saveFarm}
                  busy={busy}
                />
              )}
              {page === "crops" && (
                <CropsPanel
                  crops={data.crops}
                  years={data.farm.cropHistoryYears}
                  onAdd={addCrop}
                  onDelete={deleteCrop}
                  busy={busy}
                />
              )}
              {page === "documents" && (
                <DocumentsPanel
                  documents={data.documents}
                  plots={data.plots}
                  onUpload={uploadDocument}
                  onDelete={deleteDocument}
                  busy={busy}
                />
              )}
              {page === "programs" && <ProgramsPanel paths={data.paths} />}
              {page === "groups" && (
                <GroupsPanel
                  groups={data.groups}
                  userId={user.id}
                  summary={groupSummary}
                  onAction={groupAction}
                  onView={loadGroup}
                  busy={busy}
                />
              )}
              {page === "land" && (
                <LandPanel
                  farmArea={data.farm.area}
                  state={data.farm.state}
                  village={data.farm.village}
                  plots={data.plots}
                  documents={data.documents}
                  onAdd={(value) => addRecord("plots", value)}
                  onDelete={(id) => deleteRecord("plots", id)}
                  onNavigate={navigate}
                  busy={busy}
                />
              )}
              {page === "mrv" && (
                <MrvPanel
                  farm={data.farm}
                  events={data.mrvEvents}
                  documents={data.documents}
                  onAdd={(value) => addRecord("mrv", value)}
                  onDelete={(id) => deleteRecord("mrv", id)}
                  onNavigate={navigate}
                  busy={busy}
                />
              )}
              {page === "accounts" && (
                <AccountsPanel
                  financeEntries={data.financeEntries}
                  creditEntries={data.creditEntries}
                  documents={data.documents}
                  onAddMoney={(value) => addRecord("finance", value)}
                  onAddCredit={(value) => addRecord("credits", value)}
                  onDeleteMoney={(id) => deleteRecord("finance", id)}
                  onDeleteCredit={(id) => deleteRecord("credits", id)}
                  busy={busy}
                />
              )}
              {page === "guide" && (
                <GuidePanel data={data} onNavigate={navigate} />
              )}
            </>
          )}
          <footer className="footer">
            <span>© 2026 AgriCarbon · Usha Martin University</span>
            <span>
              Readiness guidance only. Program verification is separate.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
