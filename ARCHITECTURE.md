# Architecture

## Goal

Keep the application deliberately small while preserving clear boundaries between source data, presentation, and behaviour.

## Responsibilities

- `index.html` — document shell and data-file loading only.
- `css/app.css` — visual presentation and responsive layout.
- `js/app.js` — application entry point.
- `js/data.js` — compatibility mapping, stable IDs, and runtime validation.
- `js/render.js` — DOM rendering only.
- `data/seqXX.js` — current generated source-data files, one sequence per file.
- `scripts/validate_data.py` — repository-level data integrity check.
- `.github/workflows/validate.yml` — runs validation on pushes and pull requests.

## Data provenance

The transcript is the source material. Grouping transcript fragments into pose, link, and context nodes is curated data.

The current cue text intentionally preserves the grouped transcript wording, including transcription artefacts. Future edited or learning-friendly cue text should be stored separately rather than overwriting source-derived wording.

## Node types

- `pose` — a pose or movement component.
- `link` — a spoken transition between poses.
- `context` — centring, teacher-training commentary, or other non-pose material.

The current generated data files use display-case values (`Pose`, `Link`, `Context`). `js/data.js` normalises those into the application model and assigns deterministic IDs before rendering.

## Stability rules

1. Application behaviour must use stable IDs and node types, not display labels.
2. Source-derived cue text must not be silently rewritten.
3. Unknown or uncertain pose names should remain explicit rather than guessed.
4. Rendering, styling, and data validation remain separate concerns.
5. Data validation should fail in CI when the source structure is broken.

## Known migration

The sequence source files are still JavaScript wrappers (`window.YTT_DATA.push(...)`) because they were the original generated format. They are isolated behind `js/data.js`; the next data-layer migration is to replace them with non-executable JSON without changing the application model.

This is deliberate technical debt, documented here rather than hidden inside the implementation.

## Scope

This is a static site. There is currently no need for a framework, package manager, server, or database. Those should only be introduced if product requirements justify them.
