"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, ShieldCheck } from "lucide-react";

const journeys = {
  farmer: [
    [
      "1",
      "Tell us about your farm",
      "Add land, crops and current practices in simple steps.",
    ],
    [
      "2",
      "Keep proof as you go",
      "Save land papers, photos, soil tests, bills and a dated MRV diary.",
    ],
    [
      "3",
      "See what is missing",
      "Get an explained readiness score and specific next steps.",
    ],
    [
      "4",
      "Take a report to a program",
      "Download a PDF summary. A program decides eligibility and verifies outcomes.",
    ],
  ],
  mentor: [
    [
      "1",
      "Transparent scoring",
      "Six visible, weighted categories explain the farmer's preparation score.",
    ],
    [
      "2",
      "Evidence trail",
      "Account-linked plot, crop, monitoring, document and cost records support a preliminary review.",
    ],
    [
      "3",
      "Rule-based guide",
      "Prewritten answers use saved farm data. No AI provider or carbon model is claimed.",
    ],
    [
      "4",
      "Responsible outcome",
      "Reports separate readiness from issued credits and mark all farmer data unverified.",
    ],
  ],
};
const answers = [
  [
    "Does AgriCarbon give carbon credits?",
    "No. Credits require a program's rules, baseline, quantification, independent verification and registry issuance. This prototype helps farmers prepare.",
  ],
  [
    "Does the score show how much carbon I stored?",
    "No. The score shows completeness of practices and supporting records. It is not a soil-carbon measurement or credit estimate.",
  ],
  [
    "Is my uploaded land paper checked by the government?",
    "No. Files are private to your local account and marked unverified. Check official land records through the relevant government portal.",
  ],
  [
    "What does the guide use instead of AI?",
    "It uses clear, prewritten answers selected by your saved farm facts. You can read the reason for each suggestion.",
  ],
];
const portals = [
  {
    name: "Soil Health Card",
    url: "https://soilhealth.dac.gov.in/",
    help: "Find soil testing and card services",
  },
  {
    name: "Digital India Land Records",
    url: "https://dilrmp.gov.in/",
    help: "Find land-record information",
  },
  {
    name: "Jharkhand Jharbhoomi",
    url: "https://jharbhoomi.jharkhand.gov.in/",
    help: "Check Jharkhand land records",
  },
  {
    name: "PM-KISAN",
    url: "https://pmkisan.gov.in/",
    help: "Official farmer scheme portal",
  },
  {
    name: "eNAM",
    url: "https://www.enam.gov.in/web/",
    help: "Official agricultural market portal",
  },
];

export default function AboutExperience() {
  const [audience, setAudience] = useState<"farmer" | "mentor">("farmer");
  const [open, setOpen] = useState(0);
  return (
    <main className="agri-about-page">
      <header className="agri-about-top">
        <Link className="agri-about-brand" href="/">
          AgriCarbon
        </Link>
        <div>
          <Link href="/">Explore demo</Link>
          <Link className="button button-primary" href="/login">
            Farmer login <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <section className="agri-about-hero">
        <span className="hero-kicker">
          <BookOpen size={17} /> About the project
        </span>
        <h1>Farm records that are easier to use.</h1>
        <p>
          AgriCarbon is a hackathon prototype from Usha Martin University. It
          helps farmers organize land details, practice records, evidence, costs
          and questions before speaking with a carbon program.
        </p>
        <div className="agri-about-actions">
          <Link className="button button-light" href="/login">
            Start with my farm <ArrowRight size={17} />
          </Link>
          <Link className="button button-secondary" href="/">
            Try the public demo
          </Link>
        </div>
      </section>
      <section className="agri-about-content">
        <div className="agri-about-intro">
          <div>
            <span className="card-label">How it works</span>
            <h2>See the steps for farmers and mentors.</h2>
          </div>
          <div className="agri-about-switch">
            <button
              className={audience === "farmer" ? "selected" : ""}
              onClick={() => setAudience("farmer")}
            >
              I am a farmer
            </button>
            <button
              className={audience === "mentor" ? "selected" : ""}
              onClick={() => setAudience("mentor")}
            >
              I am a mentor
            </button>
          </div>
        </div>
        <div className="agri-about-steps">
          {journeys[audience].map(([number, title, detail]) => (
            <div className="panel" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="agri-about-content">
        <span className="card-label">Common questions</span>
        <h2>Common questions, plain answers.</h2>
        <div className="agri-about-faq">
          {answers.map(([question, answer], index) => (
            <div className="panel" key={question}>
              <button
                aria-expanded={open === index}
                onClick={() => setOpen(open === index ? -1 : index)}
              >
                {question}
                <span>{open === index ? "−" : "+"}</span>
              </button>
              {open === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="agri-about-content">
        <span className="card-label">Official resources</span>
        <h2>Check facts with government sources.</h2>
        <p>
          These links open official external portals. AgriCarbon does not
          receive data from them.
        </p>
        <div className="agri-official-grid">
          {portals.map((portal) => (
            <a
              className="panel"
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>
                {portal.name} <ArrowUpRight size={17} />
              </strong>
              <span>{portal.help}</span>
            </a>
          ))}
        </div>
      </section>
      <footer className="agri-about-foot">
        <ShieldCheck size={20} />
        <p>
          Readiness guidance is not credit issuance. Farmer records are
          self-entered, and documents are unverified until an authorized party
          reviews them.
        </p>
      </footer>
    </main>
  );
}
