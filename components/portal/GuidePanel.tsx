"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb, ShieldCheck } from "lucide-react";
import { farmSuggestions, landSizeGuide, mrvSummary } from "@/lib/insights";
import type { PortalData, PortalPage } from "@/lib/portal-types";

const questions = [
  { id: "next", title: "What should I do next?" },
  { id: "score", title: "Why is my score this level?" },
  { id: "proof", title: "What proof is missing?" },
  { id: "credits", title: "How many credits do I have?" },
  { id: "land", title: "Does my land size matter?" },
] as const;
type Question = (typeof questions)[number]["id"];

export default function GuidePanel({
  data,
  onNavigate,
}: {
  data: PortalData;
  onNavigate: (page: PortalPage) => void;
}) {
  const [question, setQuestion] = useState<Question>("next");
  const tips = farmSuggestions(
    data.farm,
    data.plots,
    data.mrvEvents,
    data.documents,
    data.financeEntries,
  );
  const mrv = mrvSummary(data.farm, data.mrvEvents, data.documents);
  const size = landSizeGuide(Number(data.farm.area) || 0);
  const answers: Record<
    Question,
    { answer: string; reason: string; page: PortalPage; action: string }
  > = {
    next: {
      answer: tips[0]?.action || "Keep your records current each season.",
      reason: tips[0]?.reason || "Your current checklist has no urgent gaps.",
      page: data.farm.cropHistoryYears < 3 ? "crops" : "mrv",
      action: "Open next step",
    },
    score: {
      answer:
        "Your readiness is " +
        data.assessment.level.toLowerCase() +
        " (" +
        data.assessment.score +
        "/100).",
      reason:
        "The six weighted areas are land, practices, inputs, water, soil and documents. " +
        (data.assessment.gaps[0]?.detail ||
          "Your records cover the current checklist."),
      page: "assessment",
      action: "Review answers",
    },
    proof: {
      answer:
        data.documents.length +
        " files are saved; " +
        mrv.linkedEvidence +
        " monitoring logs have a file linked.",
      reason:
        data.assessment.gaps.find(
          (gap) => gap.category === "Evidence" || gap.category === "Land",
        )?.detail ||
        "Keep adding dated photos and original documents each season.",
      page: "documents",
      action: "Open documents",
    },
    credits: {
      answer: "No verified credit balance is available here.",
      reason:
        "A readiness score and a monitoring diary do not issue credits. An approved program and registry must confirm issuance.",
      page: "accounts",
      action: "Open credit records",
    },
    land: {
      answer:
        "Your recorded area is about " +
        size.hectares +
        " hectares (" +
        size.band.toLowerCase() +
        ").",
      reason:
        size.advice + " Every program sets its own area and tenure rules.",
      page: "land",
      action: "Open land records",
    },
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR PREWRITTEN FARM GUIDE</p>
          <h1>Ask a simple question.</h1>
          <p>
            Answers use your saved records and visible rules. You can see why
            each answer appears.
          </p>
        </div>
      </div>
      <div className="agri-guide-grid">
        <section className="panel agri-feature-card">
          <span className="card-label">CHOOSE A QUESTION</span>
          <div className="agri-question-list">
            {questions.map((item) => (
              <button
                key={item.id}
                className={question === item.id ? "selected" : ""}
                onClick={() => setQuestion(item.id)}
              >
                {item.title}
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel agri-guide-answer">
          <span className="agri-guide-icon">
            <Lightbulb size={25} />
          </span>
          <span className="card-label">YOUR ANSWER</span>
          <h2>{answers[question].answer}</h2>
          <div>
            <strong>Why?</strong>
            <p>{answers[question].reason}</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => onNavigate(answers[question].page)}
          >
            {answers[question].action} <ArrowRight size={17} />
          </button>
        </section>
      </div>
      <section className="panel agri-feature-card agri-section-spacer">
        <span className="card-label">SUGGESTIONS FROM YOUR RECORDS</span>
        <h2>Your next useful actions</h2>
        <div className="agri-suggestion-list">
          {tips.length ? (
            tips.map((tip, index) => (
              <div key={tip.title}>
                <span>{index + 1}</span>
                <div>
                  <strong>{tip.title}</strong>
                  <p>{tip.reason}</p>
                  <small>{tip.action}</small>
                </div>
              </div>
            ))
          ) : (
            <p>
              Your basic checklist looks strong. Keep it updated each season.
            </p>
          )}
        </div>
      </section>
      <div className="portal-info-note agri-section-spacer">
        <ShieldCheck size={18} /> This is a transparent, rule-based example. It
        does not call an AI model, measure carbon or make a program decision.
      </div>
    </>
  );
}
