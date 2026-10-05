"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Copy, Leaf, Plus, ShieldCheck, Users } from "lucide-react";
import type { FarmerGroup, GroupSummary } from "@/lib/portal-types";

export default function GroupsPanel({
  groups,
  userId,
  summary,
  onAction,
  onView,
  busy,
}: {
  groups: FarmerGroup[];
  userId: string;
  summary: GroupSummary | null;
  onAction: (
    body: { action: "create"; name: string } | { action: "join"; code: string },
  ) => Promise<void>;
  onView: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAction({ action: "create", name });
  }
  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onAction({ action: "join", code: code.trim().toUpperCase() });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GROW TOGETHER</p>
          <h1>Farmer groups and FPOs.</h1>
          <p>
            Gather farmers, understand shared gaps and explore group
            opportunities. Only the group organizer sees member readiness.
          </p>
        </div>
        <span className="demo-badge">
          <Users size={15} />
          {groups.length} groups joined
        </span>
      </div>
      <div className="portal-record-grid">
        <section className="panel portal-form-card">
          <div className="portal-section-title">
            <span className="portal-icon-box">
              <Plus size={20} />
            </span>
            <div>
              <h2>Start a farmer group</h2>
              <p>Create a code to invite your FPO or neighbors.</p>
            </div>
          </div>
          <form className="portal-simple-form" onSubmit={create}>
            <label>
              Group or FPO name
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bundu Farmers"
              />
            </label>
            <button
              className="button button-primary"
              disabled={busy}
              type="submit"
            >
              Create group <Plus size={17} />
            </button>
          </form>
          <hr />
          <div className="portal-section-title">
            <span className="portal-icon-box">
              <Users size={20} />
            </span>
            <div>
              <h2>Join an existing group</h2>
              <p>Ask the organizer for their 12-character invite code.</p>
            </div>
          </div>
          <form className="portal-simple-form" onSubmit={join}>
            <label>
              Invite code
              <input
                required
                minLength={12}
                maxLength={12}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="A1B2C3D4E5F6"
              />
            </label>
            <button
              className="button button-secondary"
              disabled={busy}
              type="submit"
            >
              Join group <ArrowRight size={17} />
            </button>
          </form>
        </section>
        <aside className="panel portal-record-list">
          <span className="card-label">MY GROUPS</span>
          <h3>Groups you belong to</h3>
          {groups.length === 0 ? (
            <div className="portal-empty">
              <Users size={29} />
              <strong>No groups yet</strong>
              <p>Create one or join using a code.</p>
            </div>
          ) : (
            <div className="portal-groups-list">
              {groups.map((group) => (
                <div key={group.id}>
                  <span className="portal-program-icon">
                    <Leaf size={20} />
                  </span>
                  <div>
                    <strong>{group.name}</strong>
                    <small>
                      {group.member_count} farmer
                      {group.member_count === 1 ? "" : "s"} ·{" "}
                      {group.owner_user_id === userId ? "Organizer" : "Member"}
                    </small>
                    {group.invite_code && (
                      <button
                        className="portal-code"
                        title="Copy invite code"
                        onClick={() =>
                          navigator.clipboard?.writeText(group.invite_code!)
                        }
                      >
                        <Copy size={13} />
                        {group.invite_code}
                      </button>
                    )}
                  </div>
                  {group.owner_user_id === userId && (
                    <button
                      className="portal-view-group"
                      disabled={busy}
                      onClick={() => onView(group.id)}
                    >
                      View readiness <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
      {summary && (
        <section className="panel portal-group-summary">
          <div className="panel-heading">
            <div>
              <span className="card-label">GROUP READINESS</span>
              <h3>{summary.group.name}</h3>
            </div>
          </div>
          <div className="portal-group-stats">
            <div>
              <small>Farmers</small>
              <strong>{summary.summary.count}</strong>
            </div>
            <div>
              <small>Total area</small>
              <strong>
                {summary.summary.totalArea.toFixed(1)} <em>acres</em>
              </strong>
            </div>
            <div>
              <small>Average readiness</small>
              <strong>
                {summary.summary.averageScore}
                <em>/100</em>
              </strong>
            </div>
          </div>
          <h4>Members needing support</h4>
          <div className="portal-member-list">
            {summary.members.map((member, index) => (
              <div key={`${member.name}-${index}`}>
                <span className="avatar">{member.name[0]}</span>
                <div>
                  <strong>{member.name}</strong>
                  <small>
                    {member.village} · {member.area} acres ·{" "}
                    {member.topGap || "Records looking strong"}
                  </small>
                </div>
                <b>{member.score}/100</b>
              </div>
            ))}
          </div>
          {summary.summary.commonGaps.length > 0 && (
            <div className="portal-common-gaps">
              <strong>Common first gaps</strong>
              {summary.summary.commonGaps.map((gap) => (
                <span key={gap.title}>
                  {gap.title} · {gap.count} farmer{gap.count === 1 ? "" : "s"}
                </span>
              ))}
            </div>
          )}
        </section>
      )}
      <div className="portal-disclaimer">
        <ShieldCheck size={20} />
        <span>
          Joining a group shares your name, village, farm area, readiness score
          and top gap with its organizer. Your documents stay private.
        </span>
      </div>
    </>
  );
}
