"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CloudSun,
  FileCheck2,
  FileText,
  FolderOpen,
  HandHeart,
  Leaf,
  MapPin,
  Menu,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
  Wheat,
} from "lucide-react";
import { assessFarm, demoFarm, emptyFarm, type Farm } from "@/lib/readiness";

type View = "overview" | "assessment" | "records" | "guide";
type Language = "en" | "hi";

const copy = {
  en: {
    overview: "My farm",
    assessment: "Farm check",
    records: "My records",
    guide: "Getting started",
    topNote: "Public example",
    demo: "Example farm · you can edit it",
    personal: "My farm",
    hello: "Farm record",
    heroTitle: "Know what your farm record can show.",
    heroBody:
      "See how ready your farm is for a carbon program, what evidence is missing, and what to do next.",
    start: "Check my readiness",
    how: "How it works",
    score: "Readiness score",
    based: "Based on the details saved for this farm",
    scoreHelp:
      "This is a preparation score, not a carbon credit estimate or an eligibility decision.",
    next: "Your next best steps",
    allSteps: "See full action plan",
    strengths: "What is going well",
    breakdown: "Your readiness by area",
    viewDetails: "Review answers",
    quick: "At a glance",
    area: "Farm area",
    history: "Crop history",
    evidence: "Evidence items",
    years: "years",
    step: "Step",
    save: "Save and see results",
    continue: "Continue",
    back: "Back",
    formIntro:
      "A few simple answers make your advice more useful. You can change them anytime.",
    recordsTitle: "Keep your evidence together",
    recordsIntro:
      "Tick the records you have. Start collecting anything missing, one season at a time.",
    evidenceNote:
      "This prototype stores checklist answers in this browser. It does not upload or verify documents.",
    ready: "Available",
    missing: "Still needed",
    guideTitle: "From farm practice to proof",
    guideIntro:
      "Carbon programs need a history of what happened on a farm. AgriCarbon helps you get organized before approaching one.",
    reset: "Start with a blank farm",
    demoReset: "Load demo farm",
    disclaimer:
      "AgriCarbon supports preparation only. A verified program decides eligibility and credits after formal measurement and independent checks.",
  },
  hi: {
    overview: "मेरा खेत",
    assessment: "तैयारी जाँचें",
    records: "मेरे रिकॉर्ड",
    guide: "यह कैसे काम करता है",
    topNote: "सार्वजनिक नमूना",
    demo: "बदलने योग्य नमूना खेत",
    personal: "मेरा खेत",
    hello: "नमस्ते",
    heroTitle: "जानें कि आपके खेत के रिकॉर्ड में क्या है।",
    heroBody:
      "देखें कि आपका खेत कार्बन कार्यक्रम के लिए कितना तैयार है, क्या प्रमाण कम हैं और आगे क्या करना है।",
    start: "तैयारी जाँचें",
    how: "यह कैसे काम करता है",
    score: "तैयारी अंक",
    based: "इस खेत की दर्ज जानकारी के आधार पर",
    scoreHelp: "यह तैयारी का अंक है, कार्बन क्रेडिट या पात्रता की गारंटी नहीं।",
    next: "अगले ज़रूरी कदम",
    allSteps: "पूरी कार्य योजना देखें",
    strengths: "क्या अच्छा चल रहा है",
    breakdown: "हर क्षेत्र में तैयारी",
    viewDetails: "जवाब बदलें",
    quick: "एक नज़र में",
    area: "खेत का क्षेत्र",
    history: "फसल का इतिहास",
    evidence: "प्रमाण",
    years: "वर्ष",
    step: "कदम",
    save: "सहेजें और परिणाम देखें",
    continue: "आगे",
    back: "पीछे",
    formIntro: "कुछ आसान जवाब दें। आप इन्हें कभी भी बदल सकते हैं।",
    recordsTitle: "अपने प्रमाण एक जगह रखें",
    recordsIntro:
      "जो रिकॉर्ड हैं, उन्हें चुनें। बाकी रिकॉर्ड एक-एक मौसम में जुटाएँ।",
    evidenceNote:
      "यह नमूना केवल इस ब्राउज़र में चेकलिस्ट बचाता है। दस्तावेज़ अपलोड या सत्यापित नहीं होते।",
    ready: "उपलब्ध",
    missing: "अभी चाहिए",
    guideTitle: "खेती से प्रमाण तक",
    guideIntro:
      "कार्बन कार्यक्रमों को खेत में क्या हुआ, इसका पुराना रिकॉर्ड चाहिए। AgriCarbon आपको पहले से तैयारी करने में मदद करता है।",
    reset: "नया खाली खेत",
    demoReset: "नमूना खेत दिखाएँ",
    disclaimer:
      "AgriCarbon केवल तैयारी में मदद करता है। पात्रता और क्रेडिट का निर्णय औपचारिक माप और स्वतंत्र जाँच के बाद मान्य कार्यक्रम करता है।",
  },
};

const field = (en: string, hi: string, lang: Language) =>
  lang === "hi" ? hi : en;
const categoryHindi: Record<string, string> = {
  land: "भूमि और पहचान",
  practices: "खेती के तरीके",
  inputs: "खर्च और उत्सर्जन",
  water: "पानी और सिंचाई",
  soil: "मिट्टी का स्वास्थ्य",
  documents: "दस्तावेज़",
};
const gapHindi: Record<string, [string, string]> = {
  "Complete three years of crop history": [
    "तीन साल का फसल इतिहास पूरा करें",
    "हर बचे हुए साल की फसल और मौसम लिखें। इससे पुरानी खेती की स्थिति समझ आती है।",
  ],
  "Add land ownership or lease proof": [
    "भूमि या पट्टे का प्रमाण जोड़ें",
    "इस खेत के लिए भूमि रिकॉर्ड या पट्टे की प्रति रखें।",
  ],
  "Start a fertilizer-use diary": [
    "उर्वरक का रिकॉर्ड शुरू करें",
    "हर उपयोग की तारीख, मात्रा, उत्पाद और फसल लिखें।",
  ],
  "Get a soil test": [
    "मिट्टी की जाँच कराएँ",
    "मृदा स्वास्थ्य कार्ड या लैब रिपोर्ट शुरुआती जानकारी देती है। यह अंतिम सत्यापन नहीं है।",
  ],
  "Avoid burning crop residue": [
    "फसल अवशेष न जलाएँ",
    "अपने खेत के लिए मल्च या कम्पोस्ट का तरीका जानें।",
  ],
  "Take dated field photos": [
    "तारीख वाली खेत की तस्वीरें लें",
    "हर मौसम में खेती की तस्वीरें लें और मूल तारीख सुरक्षित रखें।",
  ],
  "Keep input bills": [
    "खरीद बिल सुरक्षित रखें",
    "उर्वरक, बीज और दूसरी खरीद के बिल मौसम के अनुसार रखें।",
  ],
  "Record irrigation dates": [
    "सिंचाई की तारीखें लिखें",
    "हर खेत में कब और कैसे पानी दिया, लिखें।",
  ],
  "Mark your plot location": [
    "खेत का स्थान दर्ज करें",
    "खेत की सीमा के लिए मैप पिन या GPS स्थान रखें।",
  ],
  "Explore soil-cover practices": [
    "मिट्टी ढकने के तरीके जानें",
    "आवरण फसल या मल्च मिट्टी की रक्षा कर सकते हैं। स्थानीय सलाह लें।",
  ],
  "Ask about a local farmer group": [
    "स्थानीय किसान समूह से जुड़ें",
    "FPO छोटे खेतों को समूह कार्यक्रम और रिकॉर्ड में मदद कर सकता है।",
  ],
};
const localizeGap = (title: string, detail: string, lang: Language) =>
  lang === "hi" ? (gapHindi[title] ?? [title, detail]) : [title, detail];
const localizeLevel = (level: string, lang: Language) =>
  lang === "hi"
    ? ({
        High: "उच्च",
        Medium: "मध्यम",
        Developing: "बढ़ रही है",
        "Getting started": "शुरुआत",
      }[level] ?? level)
    : level;

function FarmNote({ farm, lang }: { farm: Farm; lang: Language }) {
  return (
    <div
      className="farm-note"
      aria-label={field("Example farm details", "खेत का विवरण", lang)}
    >
      <div className="farm-note-top">
        <span>{field("FIELD NOTES", "खेत की जानकारी", lang)}</span>
        <span>AgriCarbon</span>
      </div>
      <strong>{farm.name || field("Your farm", "आपका खेत", lang)}</strong>
      <p>
        {[farm.village, farm.district].filter(Boolean).join(", ") ||
          field("Add your village", "अपना गाँव जोड़ें", lang)}
      </p>
      <dl>
        <div>
          <dt>{field("Land area", "खेत का क्षेत्र", lang)}</dt>
          <dd>
            {farm.area ? `${farm.area} ${field("acres", "एकड़", lang)}` : "—"}
          </dd>
        </div>
        <div>
          <dt>{field("Crop history", "फसल का इतिहास", lang)}</dt>
          <dd>
            {farm.cropHistoryYears} / 3 {field("years", "वर्ष", lang)}
          </dd>
        </div>
        <div>
          <dt>{field("Next record", "अगला रिकॉर्ड", lang)}</dt>
          <dd>
            {farm.cropHistoryYears < 3
              ? field("Past crop seasons", "पिछले फसल मौसम", lang)
              : field("Keep photos dated", "तारीख सहित फोटो रखें", lang)}
          </dd>
        </div>
      </dl>
      <small>
        {field(
          "Change any answer to see the result update.",
          "जवाब बदलें और नया परिणाम देखें।",
          lang,
        )}
      </small>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="toggle-row">
      <span className="toggle-text">
        <strong>{label}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

export default function AgriCarbonApp() {
  const [farm, setFarm] = useState<Farm>(demoFarm);
  const [view, setView] = useState<View>("overview");
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Language>("en");
  const [isDemo, setIsDemo] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const t = copy[lang];
  const assessment = useMemo(() => assessFarm(farm), [farm]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agricarbon-farm-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.farm) {
          setFarm({ ...demoFarm, ...parsed.farm });
          setIsDemo(Boolean(parsed.isDemo));
          setLang(parsed.lang === "hi" ? "hi" : "en");
        }
      }
    } catch {
      /* Keep the editable demo if browser storage is unavailable. */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        "agricarbon-farm-v1",
        JSON.stringify({ farm, isDemo, lang }),
      );
    } catch {
      /* The app remains usable without local persistence. */
    }
  }, [farm, isDemo, lang, loaded]);

  function update<K extends keyof Farm>(key: K, value: Farm[K]) {
    setFarm((prev) => ({ ...prev, [key]: value }));
  }
  function navigate(next: View) {
    setView(next);
    setMenuOpen(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function selectStart(demo: boolean) {
    setFarm(demo ? demoFarm : emptyFarm);
    setIsDemo(demo);
    setStep(0);
    navigate(demo ? "overview" : "assessment");
  }
  const nav: { id: View; icon: typeof Leaf; text: string }[] = [
    { id: "overview", icon: Sprout, text: t.overview },
    { id: "assessment", icon: ClipboardCheck, text: t.assessment },
    { id: "records", icon: FolderOpen, text: t.records },
    { id: "guide", icon: BookOpen, text: t.guide },
  ];
  const completedEvidence = [
    farm.landProof,
    farm.cropHistoryYears >= 3,
    farm.inputBills,
    farm.soilTest,
    farm.fieldPhotos,
  ].filter(Boolean).length;
  const strengths = [
    farm.coverCrops &&
      field("Cover crops protect your soil", "आवरण फसल मिट्टी बचाती है", lang),
    farm.tillage !== "conventional" &&
      field("Reduced soil disturbance", "मिट्टी की कम जुताई", lang),
    farm.irrigation === "drip" &&
      field(
        "Water-saving drip irrigation",
        "पानी बचाने वाली ड्रिप सिंचाई",
        lang,
      ),
    farm.soilTest &&
      field("Soil test is on record", "मिट्टी की जाँच दर्ज है", lang),
    farm.residueBurning === false &&
      field("No crop-residue burning", "फसल अवशेष नहीं जलाए", lang),
  ].filter(Boolean) as string[];

  return (
    <div className="app-shell" ref={topRef}>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span>
            <strong>AgriCarbon</strong>
            <small>
              {field(
                "Farm records & readiness",
                "खेती का रिकॉर्ड और तैयारी",
                lang,
              )}
            </small>
          </span>
        </div>
        <div className="sidebar-label">
          {field("Public example", "सार्वजनिक नमूना", lang)}
        </div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={19} />
              <span>{item.text}</span>
              {view === item.id && <ChevronRight size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-help">
            <span className="side-help-icon">
              <HandHeart size={21} />
            </span>
            <strong>
              {field("Start with one season.", "एक मौसम से शुरुआत करें।", lang)}
            </strong>
            <p>
              {field(
                "Keep a record each season to make your hard work easier to show.",
                "हर मौसम का रिकॉर्ड रखें ताकि आपकी मेहनत दिखे।",
                lang,
              )}
            </p>
            <button onClick={() => navigate("guide")}>
              {field("Learn more", "और जानें", lang)} <ArrowUpRight size={15} />
            </button>
          </div>
          <span className="hackathon-label">
            Made at Usha Martin University
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
            <span className="topbar-eyebrow">{t.topNote}</span>
            <span className="topbar-page">
              {nav.find((n) => n.id === view)?.text}
            </span>
          </div>
          <div className="topbar-actions">
            <Link className="account-link" href="/about">
              About
            </Link>
            <Link className="account-link" href="/login">
              {field("Farmer login", "किसान लॉगिन", lang)}{" "}
              <ArrowRight size={15} />
            </Link>
            <button
              className="language-button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              aria-label="Change language"
            >
              {lang === "en" ? "अ / EN" : "EN / अ"}
            </button>
            <span className="profile-pill">
              <span className="avatar">
                {(farm.name || "F").slice(0, 1).toUpperCase()}
              </span>
              <span>{farm.name || field("My farm", "मेरा खेत", lang)}</span>
            </span>
          </div>
        </header>
        <div className="content">
          {view === "overview" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {t.hello}
                    {farm.name ? `, ${farm.name.split(" ")[0]}` : ""}
                  </p>
                  <h1>
                    {field(
                      "Start with your farm records.",
                      "अपने खेत के रिकॉर्ड से शुरू करें।",
                      lang,
                    )}
                  </h1>
                  <p>
                    {field(
                      "See what is recorded, what is missing, and what to do next.",
                      "देखें क्या दर्ज है, क्या बाकी है और अगला कदम क्या है।",
                      lang,
                    )}
                  </p>
                </div>
                <span className="demo-badge">
                  <span className="status-dot" />
                  {isDemo ? t.demo : t.personal}
                </span>
              </div>
              <section className="hero-card">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <Sprout size={16} />
                    {field("YOUR FARM FILE", "आपके खेत का रिकॉर्ड", lang)}
                  </span>
                  <h2>{t.heroTitle}</h2>
                  <p>{t.heroBody}</p>
                  <div className="hero-actions">
                    <button
                      className="button button-light"
                      onClick={() => {
                        setStep(0);
                        navigate("assessment");
                      }}
                    >
                      {t.start}
                      <ArrowRight size={17} />
                    </button>
                    <button
                      className="hero-link"
                      onClick={() => navigate("guide")}
                    >
                      {t.how}
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
                <FarmNote farm={farm} lang={lang} />
              </section>
              <section className="overview-grid">
                <div className="score-card panel">
                  <div className="section-top">
                    <span className="mini-icon green">
                      <TrendingUp size={19} />
                    </span>
                    <span className="plain-tag">
                      {field(
                        "From these answers",
                        "इन जवाबों के आधार पर",
                        lang,
                      )}
                    </span>
                  </div>
                  <div className="score-main">
                    <div
                      className="score-ring"
                      style={
                        {
                          "--score": `${assessment.score}%`,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <strong>{assessment.score}</strong>
                        <span>/ 100</span>
                      </div>
                    </div>
                    <div className="score-copy">
                      <span className="card-label">{t.score}</span>
                      <h3>{localizeLevel(assessment.level, lang)}</h3>
                      <p>{t.based}</p>
                    </div>
                  </div>
                  <div className="score-footer">
                    <ShieldCheck size={17} />
                    <span>{t.scoreHelp}</span>
                  </div>
                </div>
                <div className="next-card panel">
                  <div className="panel-heading">
                    <div>
                      <span className="card-label">
                        {field(
                          "What to record next",
                          "अगला क्या दर्ज करें",
                          lang,
                        )}
                      </span>
                      <h3>{t.next}</h3>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("records")}
                    >
                      {t.allSteps}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="next-list">
                    {assessment.gaps.slice(0, 3).map((gap, i) => (
                      <div className="next-item" key={gap.title}>
                        <span className="number-bubble">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <strong>
                            {localizeGap(gap.title, gap.detail, lang)[0]}
                          </strong>
                          <small>
                            {localizeGap(gap.title, gap.detail, lang)[1]}
                          </small>
                        </div>
                        <ArrowUpRight size={17} />
                      </div>
                    ))}
                    {assessment.gaps.length === 0 && (
                      <div className="empty-good">
                        <CheckCircle2 size={22} />
                        {field(
                          "Your checklist is looking strong. Keep your records up to date.",
                          "आपकी सूची अच्छी है। रिकॉर्ड ताज़ा रखें।",
                          lang,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
              <section className="bottom-grid">
                <div className="panel breakdown-card">
                  <div className="panel-heading">
                    <div>
                      <span className="card-label">
                        {field("Your farm check", "आपके खेत की जाँच", lang)}
                      </span>
                      <h3>{t.breakdown}</h3>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("assessment")}
                    >
                      {t.viewDetails}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="bars">
                    {assessment.categories.map((c) => (
                      <div className="bar-row" key={c.key}>
                        <div>
                          <span>
                            {lang === "hi" ? categoryHindi[c.key] : c.label}
                          </span>
                          <strong>{Math.round(c.score)}%</strong>
                        </div>
                        <div className="bar-track">
                          <span style={{ width: `${c.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="right-stack">
                  <div className="panel quick-card">
                    <span className="card-label">{t.quick}</span>
                    <h3>{field("Farm details", "खेत का विवरण", lang)}</h3>
                    <div className="quick-items">
                      <div>
                        <span className="quick-icon">
                          <MapPin size={20} />
                        </span>
                        <span>
                          <small>{t.area}</small>
                          <strong>
                            {farm.area || "—"} {field("acres", "एकड़", lang)}
                          </strong>
                        </span>
                      </div>
                      <div>
                        <span className="quick-icon">
                          <Wheat size={20} />
                        </span>
                        <span>
                          <small>{t.history}</small>
                          <strong>
                            {farm.cropHistoryYears} / 3 {t.years}
                          </strong>
                        </span>
                      </div>
                      <div>
                        <span className="quick-icon">
                          <FileCheck2 size={20} />
                        </span>
                        <span>
                          <small>{t.evidence}</small>
                          <strong>
                            {completedEvidence} / 5{" "}
                            {field("tracked", "दर्ज", lang)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="tip-card">
                    <span>
                      <CloudSun size={22} />
                    </span>
                    <div>
                      <strong>
                        {field(
                          "Keep a record each season.",
                          "हर मौसम का रिकॉर्ड रखें।",
                          lang,
                        )}
                      </strong>
                      <p>
                        {field(
                          "A dated field photo is a useful place to start.",
                          "तारीख वाली खेत की फोटो से शुरुआत करें।",
                          lang,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <div className="strength-strip">
                <div>
                  <span className="small-leaf">
                    <Leaf size={17} />
                  </span>
                  <strong>{t.strengths}</strong>
                </div>
                <div className="strength-tags">
                  {strengths.length ? (
                    strengths.slice(0, 4).map((s) => (
                      <span key={s}>
                        <Check size={14} />
                        {s}
                      </span>
                    ))
                  ) : (
                    <span>
                      {field(
                        "Add farm details to see your strengths",
                        "अपनी जानकारी भरें",
                        lang,
                      )}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {view === "assessment" && (
            <>
              <div className="page-heading form-heading">
                <div>
                  <p className="eyebrow">
                    {field("Your answers", "आपके जवाब", lang)}
                  </p>
                  <h1>{t.assessment}</h1>
                  <p>{t.formIntro}</p>
                </div>
                <span className="demo-badge">
                  <ClipboardCheck size={15} />
                  {t.step} {step + 1} / 3
                </span>
              </div>
              <div className="assessment-layout">
                <div className="assessment-main panel">
                  <div className="stepper">
                    {[
                      field("Your farm", "आपका खेत", lang),
                      field("Your practices", "खेती के तरीके", lang),
                      field("Records & soil", "रिकॉर्ड और मिट्टी", lang),
                    ].map((s, i) => (
                      <button
                        key={i}
                        className={`step-dot ${step === i ? "current" : ""} ${step > i ? "done" : ""}`}
                        onClick={() => setStep(i)}
                      >
                        <span>{step > i ? <Check size={15} /> : i + 1}</span>
                        <small>{s}</small>
                      </button>
                    ))}
                  </div>
                  {step === 0 && (
                    <div className="form-section">
                      <span className="form-icon">
                        <MapPin size={23} />
                      </span>
                      <h2>
                        {field(
                          "Tell us about your farm",
                          "अपने खेत के बारे में बताएं",
                          lang,
                        )}
                      </h2>
                      <p>
                        {field(
                          "Basic details help organize your records. You can skip anything you don't know yet.",
                          "मूल जानकारी से रिकॉर्ड व्यवस्थित होते हैं। जो अभी नहीं पता, उसे छोड़ सकते हैं।",
                          lang,
                        )}
                      </p>
                      <div className="field-grid">
                        <label className="input-field">
                          <span>
                            {field("Farmer's name", "किसान का नाम", lang)}
                          </span>
                          <input
                            value={farm.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder={field(
                              "e.g. Asha Devi",
                              "जैसे आशा देवी",
                              lang,
                            )}
                          />
                        </label>
                        <label className="input-field">
                          <span>
                            {field(
                              "Farm area (acres)",
                              "खेत का क्षेत्र (एकड़)",
                              lang,
                            )}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={farm.area}
                            onChange={(e) => update("area", e.target.value)}
                            placeholder="2.5"
                          />
                        </label>
                        <label className="input-field">
                          <span>{field("Village", "गाँव", lang)}</span>
                          <input
                            value={farm.village}
                            onChange={(e) => update("village", e.target.value)}
                            placeholder={field(
                              "Your village",
                              "आपका गाँव",
                              lang,
                            )}
                          />
                        </label>
                        <label className="input-field">
                          <span>{field("District", "ज़िला", lang)}</span>
                          <input
                            value={farm.district}
                            onChange={(e) => update("district", e.target.value)}
                            placeholder={field(
                              "Your district",
                              "आपका ज़िला",
                              lang,
                            )}
                          />
                        </label>
                        <label className="input-field">
                          <span>{field("State", "राज्य", lang)}</span>
                          <input
                            value={farm.state}
                            onChange={(e) => update("state", e.target.value)}
                            placeholder={field(
                              "Your state",
                              "आपका राज्य",
                              lang,
                            )}
                          />
                        </label>
                        <label className="input-field">
                          <span>
                            {field("Land arrangement", "भूमि का प्रकार", lang)}
                          </span>
                          <select
                            value={farm.tenure}
                            onChange={(e) =>
                              update("tenure", e.target.value as Farm["tenure"])
                            }
                          >
                            <option value="">
                              {field("Choose one", "एक चुनें", lang)}
                            </option>
                            <option value="owned">
                              {field("Owned", "अपनी भूमि", lang)}
                            </option>
                            <option value="leased">
                              {field("Leased / rented", "पट्टा / किराया", lang)}
                            </option>
                            <option value="other">
                              {field("Other", "अन्य", lang)}
                            </option>
                          </select>
                        </label>
                      </div>
                      <div className="toggle-group">
                        <Toggle
                          checked={farm.landProof}
                          onChange={(v) => update("landProof", v)}
                          label={field(
                            "I have land ownership or lease proof",
                            "मेरे पास भूमि या पट्टे का प्रमाण है",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.gps}
                          onChange={(v) => update("gps", v)}
                          label={field(
                            "I have my field's map pin or GPS point",
                            "मेरे पास खेत का मैप पिन या GPS है",
                            lang,
                          )}
                        />
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div className="form-section">
                      <span className="form-icon">
                        <Sprout size={23} />
                      </span>
                      <h2>
                        {field(
                          "How do you care for your land?",
                          "आप अपने खेत की देखभाल कैसे करते हैं?",
                          lang,
                        )}
                      </h2>
                      <p>
                        {field(
                          "Choose the practices you currently use. Your answers can change each season.",
                          "जो तरीके आप अभी अपनाते हैं, उन्हें चुनें। हर मौसम में जवाब बदल सकते हैं।",
                          lang,
                        )}
                      </p>
                      <div className="field-grid">
                        <label className="input-field">
                          <span>
                            {field("Tillage method", "जुताई का तरीका", lang)}
                          </span>
                          <select
                            value={farm.tillage}
                            onChange={(e) =>
                              update(
                                "tillage",
                                e.target.value as Farm["tillage"],
                              )
                            }
                          >
                            <option value="conventional">
                              {field(
                                "Conventional tillage",
                                "सामान्य जुताई",
                                lang,
                              )}
                            </option>
                            <option value="reduced">
                              {field("Reduced tillage", "कम जुताई", lang)}
                            </option>
                            <option value="zero">
                              {field("Zero tillage", "बिना जुताई", lang)}
                            </option>
                          </select>
                        </label>
                        <label className="input-field">
                          <span>
                            {field(
                              "Crop history recorded",
                              "दर्ज फसल का इतिहास",
                              lang,
                            )}
                          </span>
                          <select
                            value={farm.cropHistoryYears}
                            onChange={(e) =>
                              update("cropHistoryYears", Number(e.target.value))
                            }
                          >
                            <option value={0}>
                              {field("No years yet", "अभी कोई वर्ष नहीं", lang)}
                            </option>
                            <option value={1}>1 {t.years}</option>
                            <option value={2}>2 {t.years}</option>
                            <option value={3}>3+ {t.years}</option>
                          </select>
                        </label>
                      </div>
                      <div className="toggle-group">
                        <Toggle
                          checked={farm.coverCrops}
                          onChange={(v) => update("coverCrops", v)}
                          label={field(
                            "I grow cover crops or green manure",
                            "मैं आवरण फसल या हरी खाद उगाता/उगाती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.cropRotation}
                          onChange={(v) => update("cropRotation", v)}
                          label={field(
                            "I rotate crops between seasons",
                            "मैं मौसम के अनुसार फसल बदलता/बदलती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.mulching}
                          onChange={(v) => update("mulching", v)}
                          label={field(
                            "I use mulch or leave residue on the soil",
                            "मैं मिट्टी पर मल्च या फसल अवशेष रखता/रखती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.agroforestry}
                          onChange={(v) => update("agroforestry", v)}
                          label={field(
                            "I grow trees around or within my farm",
                            "मेरे खेत में या आसपास पेड़ हैं",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.manure}
                          onChange={(v) => update("manure", v)}
                          label={field(
                            "I use compost or animal manure",
                            "मैं कम्पोस्ट या गोबर की खाद उपयोग करता/करती हूँ",
                            lang,
                          )}
                        />
                        <label className="input-field residue-field">
                          <span>
                            {field(
                              "What do you do with crop residue?",
                              "आप फसल अवशेष का क्या करते हैं?",
                              lang,
                            )}
                          </span>
                          <select
                            value={
                              farm.residueBurning === null
                                ? ""
                                : farm.residueBurning
                                  ? "yes"
                                  : "no"
                            }
                            onChange={(e) =>
                              update(
                                "residueBurning",
                                e.target.value === ""
                                  ? null
                                  : e.target.value === "yes",
                              )
                            }
                          >
                            <option value="">
                              {field(
                                "Not answered yet",
                                "अभी जवाब नहीं दिया",
                                lang,
                              )}
                            </option>
                            <option value="no">
                              {field(
                                "I do not burn it",
                                "मैं इसे नहीं जलाता/जलाती",
                                lang,
                              )}
                            </option>
                            <option value="yes">
                              {field(
                                "I burn it",
                                "मैं इसे जलाता/जलाती हूँ",
                                lang,
                              )}
                            </option>
                          </select>
                        </label>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="form-section">
                      <span className="form-icon">
                        <FileText size={23} />
                      </span>
                      <h2>
                        {field(
                          "What records do you have?",
                          "आपके पास कौन से रिकॉर्ड हैं?",
                          lang,
                        )}
                      </h2>
                      <p>
                        {field(
                          "Simply mark what is available. Original documents stay with you.",
                          "जो उपलब्ध है, बस उसे चुनें। असली दस्तावेज़ आपके पास ही रहेंगे।",
                          lang,
                        )}
                      </p>
                      <div className="field-grid">
                        <label className="input-field">
                          <span>
                            {field(
                              "Irrigation method",
                              "सिंचाई का तरीका",
                              lang,
                            )}
                          </span>
                          <select
                            value={farm.irrigation}
                            onChange={(e) =>
                              update(
                                "irrigation",
                                e.target.value as Farm["irrigation"],
                              )
                            }
                          >
                            <option value="flood">
                              {field("Flood / channel", "बाढ़ / नाली", lang)}
                            </option>
                            <option value="sprinkler">
                              {field("Sprinkler", "स्प्रिंकलर", lang)}
                            </option>
                            <option value="drip">
                              {field("Drip", "ड्रिप", lang)}
                            </option>
                            <option value="rainfed">
                              {field("Rain-fed", "वर्षा आधारित", lang)}
                            </option>
                          </select>
                        </label>
                      </div>
                      <div className="toggle-group">
                        <Toggle
                          checked={farm.fertilizerRecords}
                          onChange={(v) => update("fertilizerRecords", v)}
                          label={field(
                            "I record fertilizer use",
                            "मैं उर्वरक का उपयोग लिखता/लिखती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.inputBills}
                          onChange={(v) => update("inputBills", v)}
                          label={field(
                            "I keep seed and input bills",
                            "मैं बीज और अन्य खरीद बिल रखता/रखती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.waterRecords}
                          onChange={(v) => update("waterRecords", v)}
                          label={field(
                            "I record irrigation dates",
                            "मैं सिंचाई की तारीखें लिखता/लिखती हूँ",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.soilTest}
                          onChange={(v) => update("soilTest", v)}
                          label={field(
                            "I have a Soil Health Card or lab test",
                            "मेरे पास मृदा स्वास्थ्य कार्ड या जाँच है",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.soilCarbon}
                          onChange={(v) => update("soilCarbon", v)}
                          label={field(
                            "My soil report includes organic carbon",
                            "मिट्टी की रिपोर्ट में ऑर्गेनिक कार्बन है",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.fieldPhotos}
                          onChange={(v) => update("fieldPhotos", v)}
                          label={field(
                            "I have dated photos of my field",
                            "मेरे पास खेत की तारीख वाली तस्वीरें हैं",
                            lang,
                          )}
                        />
                        <Toggle
                          checked={farm.fpo}
                          onChange={(v) => update("fpo", v)}
                          label={field(
                            "I belong to an FPO or farmer group",
                            "मैं FPO या किसान समूह में हूँ",
                            lang,
                          )}
                        />
                      </div>
                    </div>
                  )}
                  <div className="form-footer">
                    <button
                      className="button button-secondary"
                      disabled={step === 0}
                      onClick={() => setStep(step - 1)}
                    >
                      <ChevronLeft size={17} />
                      {t.back}
                    </button>
                    <button
                      className="button button-primary"
                      onClick={() =>
                        step < 2 ? setStep(step + 1) : navigate("overview")
                      }
                    >
                      {step < 2 ? t.continue : t.save}
                      {step < 2 ? (
                        <ChevronRight size={17} />
                      ) : (
                        <Check size={17} />
                      )}
                    </button>
                  </div>
                </div>
                <aside className="assessment-aside">
                  <div className="panel live-score">
                    <span className="card-label">
                      {field("YOUR LIVE READINESS", "आपकी मौजूदा तैयारी", lang)}
                    </span>
                    <div className="live-score-number">
                      {assessment.score}
                      <span>/100</span>
                    </div>
                    <strong>{localizeLevel(assessment.level, lang)}</strong>
                    <p>
                      {field(
                        "Your score updates as you answer. Every point comes from the six visible areas.",
                        "जवाब देते ही अंक बदलते हैं। हर अंक छह क्षेत्रों से आता है।",
                        lang,
                      )}
                    </p>
                    <div className="mini-bars">
                      {assessment.categories.map((c) => (
                        <div key={c.key}>
                          <span>
                            {lang === "hi" ? categoryHindi[c.key] : c.label}
                          </span>
                          <div>
                            <i style={{ width: `${c.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="aside-note">
                    <ShieldCheck size={22} />
                    <p>{t.scoreHelp}</p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {view === "records" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {field(
                      "YOUR EVIDENCE CHECKLIST",
                      "आपके प्रमाण की सूची",
                      lang,
                    )}
                  </p>
                  <h1>{t.recordsTitle}</h1>
                  <p>{t.recordsIntro}</p>
                </div>
                <span className="demo-badge">
                  <FileCheck2 size={15} />
                  {completedEvidence} / 5 {t.ready}
                </span>
              </div>
              <div className="record-banner">
                <div>
                  <span className="record-banner-icon">
                    <FolderOpen size={25} />
                  </span>
                  <div>
                    <strong>
                      {field(
                        "Evidence makes your efforts visible.",
                        "प्रमाण से आपकी मेहनत दिखती है।",
                        lang,
                      )}
                    </strong>
                    <p>
                      {field(
                        "Programs may ask for more or different documents. This list is a starting point.",
                        "कार्यक्रम अन्य दस्तावेज़ भी माँग सकते हैं। यह एक शुरुआती सूची है।",
                        lang,
                      )}
                    </p>
                  </div>
                </div>
                <span>
                  {Math.round((completedEvidence / 5) * 100)}%{" "}
                  {field("collected", "दर्ज", lang)}
                </span>
              </div>
              <div className="records-grid">
                <section className="panel checklist-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="card-label">
                        {field("CORE RECORDS", "मुख्य रिकॉर्ड", lang)}
                      </span>
                      <h3>
                        {field(
                          "What do you have today?",
                          "आज आपके पास क्या है?",
                          lang,
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="evidence-list">
                    <Toggle
                      checked={farm.landProof}
                      onChange={(v) => update("landProof", v)}
                      label={field(
                        "Land ownership / lease proof",
                        "भूमि / पट्टे का प्रमाण",
                        lang,
                      )}
                      hint={field(
                        "For the plot you want to include",
                        "जिस खेत को आप शामिल करना चाहते हैं",
                        lang,
                      )}
                    />
                    <div className="history-row">
                      <span>
                        <strong>
                          {field(
                            "Three years of crop history",
                            "तीन साल का फसल इतिहास",
                            lang,
                          )}
                        </strong>
                        <small>
                          {field(
                            "Crop and season for each year",
                            "हर साल की फसल और मौसम",
                            lang,
                          )}
                        </small>
                      </span>
                      <select
                        aria-label="Crop history years"
                        value={farm.cropHistoryYears}
                        onChange={(e) =>
                          update("cropHistoryYears", Number(e.target.value))
                        }
                      >
                        <option value={0}>0 / 3</option>
                        <option value={1}>1 / 3</option>
                        <option value={2}>2 / 3</option>
                        <option value={3}>3 / 3</option>
                      </select>
                    </div>
                    <Toggle
                      checked={farm.inputBills}
                      onChange={(v) => update("inputBills", v)}
                      label={field(
                        "Seed and input purchase bills",
                        "बीज और अन्य खरीद बिल",
                        lang,
                      )}
                      hint={field(
                        "Keep them by crop season",
                        "हर फसल मौसम के अनुसार रखें",
                        lang,
                      )}
                    />
                    <Toggle
                      checked={farm.soilTest}
                      onChange={(v) => update("soilTest", v)}
                      label={field(
                        "Soil Health Card or lab report",
                        "मृदा स्वास्थ्य कार्ड या रिपोर्ट",
                        lang,
                      )}
                      hint={field(
                        "A helpful first record, not final verification",
                        "शुरुआती रिकॉर्ड, अंतिम सत्यापन नहीं",
                        lang,
                      )}
                    />
                    <Toggle
                      checked={farm.fieldPhotos}
                      onChange={(v) => update("fieldPhotos", v)}
                      label={field(
                        "Dated field and practice photos",
                        "खेत और खेती की तारीख वाली तस्वीरें",
                        lang,
                      )}
                      hint={field(
                        "Take photos throughout the season",
                        "पूरे मौसम में तस्वीरें लें",
                        lang,
                      )}
                    />
                  </div>
                </section>
                <section className="records-side">
                  <div className="panel action-panel">
                    <span className="card-label">
                      {field("PERSONAL ACTION PLAN", "आपकी कार्य योजना", lang)}
                    </span>
                    <h3>{field("What to do next", "अब क्या करें", lang)}</h3>
                    {assessment.gaps.length ? (
                      <div className="action-list">
                        {assessment.gaps.map((gap, i) => (
                          <div key={gap.title}>
                            <span className="action-count">{i + 1}</span>
                            <div>
                              <strong>
                                {localizeGap(gap.title, gap.detail, lang)[0]}
                              </strong>
                              <p>
                                {localizeGap(gap.title, gap.detail, lang)[1]}
                              </p>
                              <small>
                                {gap.category} · {gap.priority}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-good">
                        <CheckCircle2 size={22} />
                        {field(
                          "All suggested steps are covered. Keep records current each season.",
                          "सुझाए गए सभी कदम पूरे हैं। हर मौसम रिकॉर्ड रखें।",
                          lang,
                        )}
                      </div>
                    )}
                  </div>
                  <div className="privacy-note">
                    <ShieldCheck size={20} />
                    <p>{t.evidenceNote}</p>
                  </div>
                </section>
              </div>
            </>
          )}

          {view === "guide" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {field(
                      "SIMPLE, HONEST GUIDANCE",
                      "सरल और सही मार्गदर्शन",
                      lang,
                    )}
                  </p>
                  <h1>{t.guideTitle}</h1>
                  <p>{t.guideIntro}</p>
                </div>
              </div>
              <div className="guide-hero">
                <div>
                  <span className="guide-hero-icon">
                    <Sprout size={27} />
                  </span>
                  <h2>
                    {field(
                      "Three questions. Clear answers.",
                      "तीन सवाल। साफ़ जवाब।",
                      lang,
                    )}
                  </h2>
                  <p>
                    {field(
                      "AgriCarbon turns your farm details into a simple plan you can act on.",
                      "AgriCarbon आपके खेत की जानकारी से आसान कार्य योजना बनाता है।",
                      lang,
                    )}
                  </p>
                </div>
                <div className="guide-steps">
                  <div>
                    <span>01</span>
                    <strong>
                      {field("Am I ready?", "क्या मैं तैयार हूँ?", lang)}
                    </strong>
                    <p>
                      {field(
                        "See a transparent preparation score across six areas.",
                        "छह क्षेत्रों पर तैयारी के अंक देखें।",
                        lang,
                      )}
                    </p>
                  </div>
                  <div>
                    <span>02</span>
                    <strong>
                      {field("What is missing?", "क्या कमी है?", lang)}
                    </strong>
                    <p>
                      {field(
                        "Spot gaps in practice, history and evidence.",
                        "खेती, इतिहास और प्रमाण की कमी जानें।",
                        lang,
                      )}
                    </p>
                  </div>
                  <div>
                    <span>03</span>
                    <strong>
                      {field("What should I do next?", "अब क्या करूँ?", lang)}
                    </strong>
                    <p>
                      {field(
                        "Follow small steps that fit your farm.",
                        "अपने खेत के लिए छोटे कदम अपनाएँ।",
                        lang,
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="guide-grid">
                <div className="panel">
                  <span className="mini-icon orange">
                    <Wheat size={20} />
                  </span>
                  <h3>
                    {field(
                      "Practices matter",
                      "खेती के तरीके ज़रूरी हैं",
                      lang,
                    )}
                  </h3>
                  <p>
                    {field(
                      "Cover crops, less tillage, mulching and careful water use can help, depending on your land. Programs look for evidence that practices happened over time.",
                      "आवरण फसल, कम जुताई, मल्च और पानी का सही उपयोग मदद कर सकते हैं। कार्यक्रम इनके समय के साथ प्रमाण देखते हैं।",
                      lang,
                    )}
                  </p>
                </div>
                <div className="panel">
                  <span className="mini-icon green">
                    <FileText size={20} />
                  </span>
                  <h3>
                    {field("Records matter too", "रिकॉर्ड भी ज़रूरी हैं", lang)}
                  </h3>
                  <p>
                    {field(
                      "Crop history, input logs, field photos and land records help establish a baseline. Some programs need at least three years of historical practices.",
                      "फसल इतिहास, खर्च रिकॉर्ड, तस्वीरें और भूमि रिकॉर्ड पुरानी स्थिति समझने में मदद करते हैं। कुछ कार्यक्रम कम से कम तीन साल का इतिहास माँगते हैं।",
                      lang,
                    )}
                  </p>
                </div>
                <div className="panel">
                  <span className="mini-icon blue">
                    <Users size={20} />
                  </span>
                  <h3>{field("Grow together", "मिलकर आगे बढ़ें", lang)}</h3>
                  <p>
                    {field(
                      "An FPO or farmer group may help small farms organize evidence and explore projects together. Availability and program rules vary.",
                      "FPO या किसान समूह छोटे खेतों को प्रमाण जुटाने और परियोजनाएँ देखने में मदद कर सकता है। नियम अलग-अलग होते हैं।",
                      lang,
                    )}
                  </p>
                </div>
              </div>
              <div className="truth-card">
                <ShieldCheck size={26} />
                <div>
                  <strong>
                    {field("What this score means", "इन अंकों का मतलब", lang)}
                  </strong>
                  <p>{t.disclaimer}</p>
                </div>
              </div>
              <div className="guide-bottom">
                <div>
                  <span className="card-label">
                    {field("READY TO TRY?", "शुरू करें?", lang)}
                  </span>
                  <h2>
                    {field(
                      "Start with what you know today.",
                      "आज जो जानते हैं, उससे शुरू करें।",
                      lang,
                    )}
                  </h2>
                </div>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setStep(0);
                    navigate("assessment");
                  }}
                >
                  {t.start}
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="sources">
                <strong>
                  {field("Research references", "शोध स्रोत", lang)}
                </strong>
                <a
                  href="https://verra.org/methodologies/vm0042-improved-agricultural-land-management-v2-2/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Verra VM0042 <ArrowUpRight size={14} />
                </a>
                <a
                  href="https://verra.org/methodologies-main/frequently-asked-questions-vm0042/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Verra VM0042 FAQ <ArrowUpRight size={14} />
                </a>
                <a
                  href="https://www.fao.org/4/i2485e/i2485e00.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  FAO smallholder carbon markets <ArrowUpRight size={14} />
                </a>
              </div>
            </>
          )}
          <footer className="footer">
            <span>
              © 2026 AgriCarbon ·{" "}
              {field(
                "Made for farmers, at Usha Martin University",
                "किसानों के लिए, उषा मार्टिन विश्वविद्यालय में",
                lang,
              )}
            </span>
            <div>
              <button onClick={() => selectStart(false)}>
                <Plus size={14} />
                {t.reset}
              </button>
              <button onClick={() => selectStart(true)}>
                <RotateCcw size={14} />
                {t.demoReset}
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
