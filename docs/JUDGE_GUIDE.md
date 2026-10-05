# AgriCarbon: feature guide and judge demonstration

AgriCarbon is a carbon-program **readiness and documentation** prototype from Usha Martin University. It helps a farmer answer: **Am I prepared? What proof is missing? What should I do next?** It does not measure soil carbon, determine eligibility, or create sellable carbon credits.

## Start the app for a local demonstration

Open the `Agricarbon` folder, containing `package.json`, in VS Code. In **Terminal → New Terminal** on Windows PowerShell, run:

```powershell
git switch main
git pull --ff-only origin main
npm.cmd ci
npm.cmd run dev
```

Open the address printed by Next.js, usually `http://localhost:3000`. If another port is printed, use that address. Keep the terminal running; press **Ctrl+C** to stop. On later runs, `npm.cmd run dev` is usually enough. `npm.cmd` avoids the Windows PowerShell `npm.ps1` execution-policy error. If pulling reports local changes, preserve them and resolve the Git message before continuing.

The GitHub repository contains code, screenshots, and this guide. It is not a hosted live website. Signed-in data is stored on the computer running the app; it does not travel with a Git pull.

## What each screen does

| Screen | How to use it | Result to show |
| --- | --- | --- |
| Public homepage | Open **Check readiness**, change the example answers, and try the English/Hindi switch. | An editable example score and gap list; answers are saved in that browser. No account is needed. |
| About AgriCarbon | Switch between farmer and mentor views, expand the questions, and inspect the official-resource links. | Plain-language and mentor explanations. Government sites open externally; no government data is imported. |
| Farmer login | Register with a name, mobile number, password, location, land area, and land arrangement; sign in on later visits. | A private farmer workspace. The local prototype does not send an SMS or OTP. |
| Overview | Sign in and open the initial dashboard. | Readiness score, crop years, document count, action plan, category scores, plot and MRV status, and the next suggested action. |
| Farm assessment | Answer land, practice, input, water, soil, and document questions, then save. | A transparent readiness score and specific gaps. These answers are farmer reported. |
| Crop history | Add each season's year, crop, tillage, irrigation, and optional input and water notes. | A seasonal timeline; three **distinct years** count toward the historical baseline checklist. |
| Land & papers | Save each plot's name, acreage, tenure, village, and optional parcel reference. | Separate plot records, an indicative Indian holding-size category, and a warning if plot totals differ from the farm area. Program-specific minimum and maximum areas are not decided here. |
| Document locker | Upload a land record, deed, lease, boundary map, tax receipt, soil report, input bill, or field photo; optionally link it to a plot. | A private file list and evidence checklist. PDF, JPEG, PNG, and WebP files up to 8 MB are supported; saved files remain **unverified**. |
| MRV diary | Add a dated farming activity with a description; optionally link a saved photo, input bill, or soil report. | Four visible stages: baseline, monitoring, evidence, and independent verification. A land deed cannot count as practice evidence, and external verification remains pending. |
| My guide | Select a prewritten question, such as “What proof is missing?” | An answer, its reason, a navigation action, and up to five suggestions based on saved records. No AI model or API is used. |
| Program pathways | Read the practice-based, soil-carbon, agroforestry, and group cards. | Areas to **explore** or **build evidence** for, with reasons and next steps. These are not program offers or approvals. |
| Farmer groups | Create a group and share its invite code with another local account, or join with a code. | The organizer sees farmer count, total area, average readiness, member scores, and common gaps. Member documents remain private. |
| Farm accounts | Add income or expenses in INR; optionally attach a saved bill. | Recorded income, expenses, and net cash flow. No carbon price or revenue estimate is calculated. |
| Current carbon credits | View the status in Farm accounts. Only record an externally issued or retired credit transaction if a real program and registry reference exist. | **Verified balance unavailable** because no registry is connected. Any entered balance is clearly **self-reported and unverified**. |
| PDF report | Click **Download PDF report** from Overview or Farm accounts; a printable report is also available. | A generated preliminary report containing score, land, MRV, documents, accounts, gaps, and next actions. It is not a credit certificate. |

## What the score means

The TypeScript rule engine combines six categories: land and identity **15%**, farming practices **30%**, inputs and emissions **20%**, water and irrigation **10%**, soil health **10%**, and documentation **15%**. The bands are Getting started (0–39), Developing (40–59), Medium (60–79), and High (80–100). The score describes preparation based on saved answers; it does not estimate tonnes of carbon or credits.

Even a high score does not make a farmer eligible. To show **“Ready to request an external pre-screening,”** AgriCarbon also checks that saved plots total the farm area, three crop years are recorded, a land-rights file and soil report are saved, and a dated MRV activity is linked to a relevant evidence file. A program must still decide eligibility, use an approved method, and independently verify outcomes.

## Five-minute judge walkthrough

Prepare a fictional farmer profile and sample documents before the demonstration. Avoid using a real farmer's property papers or claiming sample credit issuance.

1. **Problem, 30 seconds:** “Farmers may use sustainable practices but often lack the records a carbon program needs to review them.”
2. **Public demo, 45 seconds:** Change one answer in **Check readiness** and show how the score and gap list respond.
3. **Saved farm, 90 seconds:** Open the prepared account's Overview, Crop history, Land & papers, and Document locker. Explain how the records build a farm history.
4. **MRV and guidance, 60 seconds:** Show one dated activity linked to a photo or bill; ask **My guide** what proof is missing.
5. **Accounts and PDF, 60 seconds:** Show recorded costs, the unavailable verified-credit balance, and the downloaded report.
6. **Close, 15 seconds:** “AgriCarbon prepares a farmer for an external program conversation; it does not issue or guarantee credits.”

### Short pitch

> “We built AgriCarbon at Usha Martin University to make carbon-program preparation understandable for farmers. Farmers record land, crop history, practices, costs, and evidence. Our rule-based system explains a readiness score, identifies missing proof, suggests next actions, and generates a preliminary PDF. MRV records are organized in one place, while eligibility, formal measurement, verification, and credit issuance remain with an independent program and registry.”

## Questions judges may ask

**Does the app calculate carbon credits?** No. The score measures readiness of self-entered practices and records. Credits require approved methods, baselines, quantification, independent verification, and registry issuance.

**What is innovative?** It connects farmer-friendly questions, transparent scoring, plot and crop records, evidence-linked MRV, costs, group aggregation, and an explained action plan. Farmers can see *why* a step is suggested.

**Where is the AI?** The guide uses prewritten rules selected from saved farm data. It needs no AI provider, and its explanations can be inspected. We do not claim an AI carbon model.

**How does MRV work here?** The prototype tracks three baseline crop years, dated activities, and supporting files. It visibly leaves independent verification incomplete; it does not perform scientific measurement or additionality checks.

**How does it help a small farmer?** It identifies missing evidence, shows an indicative land-size band, and lets a farmer group organizer see common readiness gaps and aggregate area. Actual program thresholds vary.

**Are government and registry systems connected?** No. Official government websites are provided as hyperlinks. No registry supplies verified-credit data yet, so the verified balance is unavailable.

**Where is data kept?** The public example uses browser `localStorage`. Signed-in records use local SQLite and uploads under ignored `.agricarbon-data/`. Accounts and file downloads are access controlled, but the local prototype does not encrypt data at rest and is not ready for public production hosting. Use fictional data in demonstrations.

For implementation details, checks, research sources, and screenshots, see the [repository README](../README.md).
