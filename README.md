# MSA Admission Intelligence

A responsive admissions analytics website that turns aggregate conversation data into an interactive report on inquiry demand, response patterns, repeated questions, and opportunities to improve admissions communication.

The supplied dashboard covers **January 1–September 15, 2026**, in the **Africa/Cairo** timezone. This is an independent analysis of supplied MSA conversation data and **is not an official university website**.

## Overview

Explore what prospective applicants ask, when inquiries peak, which topics warrant review, and how clearer answers might affect repeated inquiry workload. The project combines an executive overview, charts, interactive filters, topic review details, an assumption-based impact calculator, downloadable metrics, and an executive PDF report.

The website is ready to serve from `dist/`. No framework build, npm installation, database, API key, or backend application is required to view the included analysis.

## Features

- **Executive overview:** candidate visits, inbound messages, fees or eligibility reach, and unique visits flagged for review.
- **Two evidence cohorts:** broad includes strong and possible admission signals; strict includes strong signals only.
- **Period filters:** the full observation period or individual months from January through September 2026.
- **Demand charts:** monthly visits or visits per calendar day, with full-period context for the chosen cohort and highlighting for the selected month.
- **Topic and faculty breakdowns:** locally rendered charts of overlapping conversation signals.
- **Response analysis:** timely business replies, first-response latency, reply gaps, and repeated topics on later visits.
- **Review priorities:** select a topic to inspect its review signals, an improvement hypothesis, and a suggested measure.
- **Impact lab:** explore assumed reductions in repeated inquiry messages and optional handling time.
- **Downloads:** export the selected priority table as CSV, selected metrics as JSON, and the full broad-cohort report as PDF.
- **Proposed 30-day plan:** verify signals, improve answers, run a small test, and assess outcomes.
- **Responsive presentation:** mobile layouts, labeled controls, keyboard-accessible buttons, a skip link, descriptive SVG charts, and live metric announcements.
- **Local assets:** bundled fonts and SVG graphics, with no external chart library, remote font request, or user tracking code in the supplied website.

## Included dataset

These are full-period values from the supplied aggregates, rather than live statistics:

| Metric | Value |
| --- | ---: |
| Broad-cohort candidate visits | 12,016 |
| Strict-cohort candidate visits | 6,147 |
| Broad-cohort inbound messages | 41,932 |
| Visits mentioning fees or eligibility, counted as a union | 8,142 |
| Unique mature visits flagged for review | 1,989 |
| Mature query visits in the timely-response denominator | 11,959 |
| Mature query visits with a business reply within 24 hours | 11,646 |
| Inbound messages in visits repeating an earlier topic | 6,244 |

There are **20 precomputed views**: two cohorts multiplied by the full period plus nine monthly selections. September includes only days 1–15.

## Technology

| Component | Technology |
| --- | --- |
| Report content | HTML5 |
| Layout and styling | CSS |
| Filters, rendering, and downloads | Vanilla JavaScript and ES modules |
| Charts and graphics | SVG |
| Published data | Aggregate JSON |
| Data generation | Python with an external analysis package |
| Verification | Node.js built-in modules |
| Typography | Bundled DejaVu Sans fonts |

## Run locally

### Requirements

- Python 3 for the simple local server below, or another static HTTP server.
- A modern browser supporting JavaScript and ES modules.
- Node.js only to run the supplied verification script.

### Setup

1. Download and extract the repository ZIP, or clone it:

   ```bash
   git clone https://github.com/mostafa8899/msa-admission-intelligence.git
   cd msa-admission-intelligence
   ```

   This repository is private, so cloning requires an authorized GitHub account.

2. From the project root, start a local server:

   ```bash
   python -m http.server 8000 --directory dist
   ```

   On Windows, you can also use the Python launcher:

   ```powershell
   py -m http.server 8000 --directory dist
   ```

3. Open **http://localhost:8000** in your browser.
4. Stop the server with **Ctrl+C** when finished.

Use HTTP instead of opening `index.html` directly: the dashboard loads `data.json` with `fetch()`, which can fail under a `file://` URL.

## Using the dashboard

1. Choose **Evidence scope** and **Period** to update the metric cards, topic breakdowns, response results, review table, and impact baseline.
2. In the demand panel, choose **Visits** or **Per day**. The chart shows the complete observation period for the chosen cohort.
3. Select a topic in **Review priorities** to inspect signals and a proposed improvement.
4. In **Impact lab**, adjust the reduction assumption from 0% to 50%. Enter handling minutes from 0 to 60; 0 leaves time savings unestimated.
5. Use **Export table** for selected priority rows and **Download metrics** for the selected aggregate view.
6. Use **Reset view** to return to the full broad cohort.

The hero statistic and PDF always describe the **full broad cohort**. Dashboard filters do not regenerate the PDF or change the hero statistic.

## Project structure

The original supplied archive is also retained at [`MSA_Admission_Intelligence_Website_Code.zip`](MSA_Admission_Intelligence_Website_Code.zip). It preserves the original source snapshot and original README. The extracted files below are available directly for browsing and use; this repository's expanded README and `.gitignore` were added during upload preparation.

```text
msa-admission-intelligence/
├── README.md
├── .gitignore
├── build_data.py
├── check.mjs
└── dist/
    ├── index.html
    ├── styles.css
    ├── app.js
    ├── calculations.mjs
    ├── data.json
    ├── mark.svg
    ├── MSA_2026_Senior_Admission_Report.pdf
    └── fonts/
        ├── DejaVuSans.ttf
        ├── DejaVuSans-Bold.ttf
        └── LICENSE.txt
```

| File | Purpose |
| --- | --- |
| `dist/index.html` | Report narrative, sections, controls, navigation, and download links. |
| `dist/styles.css` | Responsive layout, colors, typography, and component styling. |
| `dist/app.js` | Loads aggregate data and implements filters, charts, topic details, scenarios, and downloads. |
| `dist/calculations.mjs` | Bounded scenario calculations and spreadsheet-safe CSV formatting. |
| `dist/data.json` | Coverage metadata, classification note, and 20 aggregate views. |
| `dist/MSA_2026_Senior_Admission_Report.pdf` | Included executive report for the full broad cohort. |
| `build_data.py` | Generates website aggregates from the separate original analysis package. |
| `check.mjs` | Checks known totals, cohort reconciliation, response denominators, scenarios, exports, selected data-field exclusions, and assets. |

## Verification

Run the data and calculation checks from the project root:

```bash
node check.mjs
```

Check the browser script as an ES module. In Windows PowerShell:

```powershell
Get-Content -Raw dist/app.js | node --input-type=module --check
```

On Bash-compatible shells:

```bash
node --input-type=module --check < dist/app.js
```

The supplied checks validate all 20 views, monthly-to-total reconciliation, reference totals, response denominators, review-exposure bounds, scenario limits, CSV escaping, selected private-field exclusions, local asset references, and unique HTML element IDs.

The data checks and ES-module syntax check passed when this repository was prepared. These checks do not validate the original classifications, prove anonymization, or replace browser accessibility and visual testing.

## Updating the analysis

The included website runs independently, but **rebuilding its data requires a separate Python analysis package that is not included here**.

The external package must provide:

- `analysis.py` with the `candidates()` and `analyze()` functions used by the builder.
- `data/analytics_2026.json` containing the original analysis inputs.
- `data/decision_summary.json` containing the reference broad-cohort summary.
- Any dependencies required by that package.

Rebuild the external analysis first, then run:

```bash
python build_data.py --analysis-dir /path/to/msa_admissions_v2
node check.mjs
```

The builder writes `dist/data.json`; it does not regenerate the PDF. Replace the PDF separately when an updated report is available.

The builder and checks contain assumptions for the supplied 2026 dataset, including months, September coverage, and fixed reference totals. When replacing the dataset or observation period, review those assumptions, page dates, hero statistic, chart labels, and README values. Keep raw conversation inputs and participant-level analysis files outside this repository.

## Definitions and interpretation

- **Candidate visit:** an inquiry session based on a 24-hour inactivity gap. Visits are not unique applicants.
- **Admission signals:** deterministic classifications of conversation content; unvalidated and requiring human review.
- **Topics and faculty mentions:** overlapping labels. Faculty mentions are conversation signals, not verified applications or confirmed university offerings.
- **Timely reply:** an eligible business reply within 24 hours. Only query visits with a complete 24-hour observation window enter the denominator. Replies may be automated.
- **Repeated topic:** a topic seen in an earlier candidate visit from the same identifier. Repeat labels remain anchored to full-period history after filtering.
- **Review exposure:** the union of mature query visits with a reply gap, repeated topic, or friction signal. This is a review queue, not confirmed failures or lost applicants.
- **Matched comparison:** August versus September days 1–15; descriptive and not evidence of causation.
- **Impact scenario:** editable assumptions applied to observed repeated-inquiry message volume; not measured savings, a conversion forecast, or enrollment uplift.

Enrollment, revenue, campaign attribution, customer satisfaction, and causal effects cannot be established from these aggregates. Missing background information means it was not detected in conversations; it may exist in another system.

## Privacy and hosting

The published JSON contains aggregate summaries. The source archive does not include raw conversation text, participant names, participant-level identifiers, or audit samples. Aggregate counts of identifiers are still shown as metrics.

This static website has **no built-in authentication or access-control layer**. Anyone who can access hosted files can also access the JSON and PDF. Use your hosting provider's access controls when restricted access is required. Repository privacy and website access are separate settings.

To host the website, publish the contents of `dist/` as the document root on a static host supporting JavaScript modules, JSON, fonts, and PDF files. No build command is needed. Uploading a repository to GitHub alone does not create a live website.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Analysis data is unavailable | Serve `dist/` over HTTP, confirm `data.json` is present, and reload. |
| Port 8000 is already in use | Use another port, for example `python -m http.server 8001 --directory dist`, then open port 8001. |
| Python command is not recognized | Try the Windows `py` launcher or another installed static HTTP server. |
| Data-builder import fails | Confirm the external directory contains `analysis.py` and its dependencies are installed. |
| Checks fail after a data update | Review reference totals and period assumptions against the verified new dataset. |
| PDF differs from filtered metrics | The PDF covers the full broad cohort and is updated separately. |

## License and attribution

Bundled DejaVu fonts have their license in [`dist/fonts/LICENSE.txt`](dist/fonts/LICENSE.txt). No separate application-code license was supplied in the original archive; this repository does not add or imply one.
