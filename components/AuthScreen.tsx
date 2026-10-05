"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "register" | "login";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("register");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    village: "",
    district: "",
    state: "",
    area: "",
    tenure: "owned",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch(
        `/api/auth/${mode === "register" ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "register"
              ? form
              : { phone: form.phone, password: form.password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Please check your details.");
      router.push("/farmer");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Link href="/" className="auth-brand">
          <strong>AgriCarbon</strong>
        </Link>
        <div className="auth-story-inner">
          <span className="auth-pill">
            Usha Martin University · Farm records
          </span>
          <h1>
            Your farm records,
            <br />
            in one place.
          </h1>
          <p>
            Keep your farm details, crop history and evidence together. See what
            is ready, what is missing and what to do next.
          </p>
          <div className="auth-points">
            <div>
              <span>01</span> Tell us about your farm
            </div>
            <div>
              <span>02</span> Record your practices
            </div>
            <div>
              <span>03</span> Get a clear action plan
            </div>
          </div>
        </div>
        <div className="auth-story-foot">
          <ShieldCheck size={19} /> Preparation guidance only. Credit
          eligibility requires an independent program review.
        </div>
      </section>
      <section className="auth-main">
        <div className="auth-card">
          <Link className="auth-back" href="/">
            <ArrowLeft size={16} /> View public demo
          </Link>
          <span className="eyebrow">
            {mode === "register" ? "Start your farm record" : "Welcome back"}
          </span>
          <h2>
            {mode === "register"
              ? "Create your account"
              : "Sign in to your farm"}
          </h2>
          <p className="auth-subtitle">
            {mode === "register"
              ? "Begin with a few basic details. You can add records after signing in."
              : "Your farm records are waiting for you."}
          </p>
          <div className="auth-tabs">
            <button
              className={mode === "register" ? "selected" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              New farmer
            </button>
            <button
              className={mode === "login" ? "selected" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              I have an account
            </button>
          </div>
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <>
                <label>
                  <span>Farmer name</span>
                  <input
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </label>
                <div className="auth-row">
                  <label>
                    <span>Village</span>
                    <input
                      required
                      value={form.village}
                      onChange={(e) => update("village", e.target.value)}
                      placeholder="Village"
                    />
                  </label>
                  <label>
                    <span>District</span>
                    <input
                      required
                      value={form.district}
                      onChange={(e) => update("district", e.target.value)}
                      placeholder="District"
                    />
                  </label>
                </div>
                <div className="auth-row">
                  <label>
                    <span>State</span>
                    <input
                      required
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="State"
                    />
                  </label>
                  <label>
                    <span>Farm area (acres)</span>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.area}
                      onChange={(e) => update("area", e.target.value)}
                      placeholder="2.5"
                    />
                  </label>
                </div>
                <label>
                  <span>Land arrangement</span>
                  <select
                    value={form.tenure}
                    onChange={(e) => update("tenure", e.target.value)}
                  >
                    <option value="owned">Owned land</option>
                    <option value="leased">Leased / rented land</option>
                    <option value="other">Other arrangement</option>
                  </select>
                </label>
              </>
            )}
            <label>
              <span>Mobile number</span>
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                minLength={10}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="10-digit mobile number"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                required
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={mode === "register" ? 8 : 1}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={
                  mode === "register"
                    ? "At least 8 characters"
                    : "Your password"
                }
              />
            </label>
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}
            <button
              className="button button-primary auth-submit"
              disabled={busy}
              type="submit"
            >
              {busy
                ? "Please wait…"
                : mode === "register"
                  ? "Create my farm"
                  : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-note">
            <LockKeyhole size={15} /> Your details stay in this local app
            database. This demo does not send SMS or OTP.
          </p>
        </div>
      </section>
    </main>
  );
}
