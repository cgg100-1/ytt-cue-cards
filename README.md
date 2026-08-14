# YTT Cue Cards

A small mobile-first web app for learning yoga teaching cues from a Yoga Teacher Training session transcript.

## What it contains

The session is represented as three node types:

- **Pose** — cueing for a pose or movement.
- **Link** — the spoken transition between poses.
- **Context** — centring or teacher-training commentary.

The current cue text deliberately preserves the grouped transcript wording for validation.

## Project structure

```text
.
├── index.html
├── ARCHITECTURE.md
├── css/
│   └── app.css
├── data/
│   └── seq01.js ... seq11.js
├── js/
│   ├── app.js
│   ├── data.js
│   └── render.js
├── scripts/
│   └── validate_data.py
└── .github/
    └── workflows/
        └── validate.yml
```

## Run locally

The current app can be served with any static HTTP server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Data validation

Run:

```bash
python scripts/validate_data.py
```

GitHub Actions runs the same integrity check automatically on pushes and pull requests.

## Deployment

GitHub Pages deploys from the `main` branch and repository root.

## Engineering principles

See [ARCHITECTURE.md](ARCHITECTURE.md). The app intentionally stays framework-free while the product remains small. The current JavaScript-wrapped source data is documented migration debt rather than an accidental dependency.
