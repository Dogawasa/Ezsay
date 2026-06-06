# EssayWise Academy

A static website app for practicing essay writing with topic generation, writing modes, examiner-style review, per-user writing history, and a practice calendar.

## Open Locally

Use the local server URL:

```text
http://127.0.0.1:4173
```

Or open `index.html` directly in a browser.

## Login

Create one local account with a unique username, email, and password, or log in with an existing username/email and password. Accounts are stored locally in the browser for this static version.

## Design

`design-upgrade.css` and `design-upgrade.js` add the login review protocol, practice-room mentor status, and refined visual styling.

`practice-upgrade.css` and `practice-upgrade.js` add the live Practice Room readiness board with word-target progress and thesis, evidence, structure, and closing checks.

`correction-upgrade.js` improves the live correction mentor with a stronger spelling dictionary, typo inference, grammar pattern checks, punctuation alerts, and multi-issue Apply Fix suggestions.

`studio-redesign.css` and `studio-redesign.js` rebuild the visual UI into a modern writing-studio dashboard inspired by education and AI-writing dashboard patterns.

`premium-redesign.css` and `premium-redesign.js` add a more professional product-grade interface with a dark app shell, stronger writing workspace hierarchy, upgraded empty states, and responsive mobile polish.

## Screens

- Login
- Home: public essays area, empty until real shared essays exist
- Practice: choose topic, easy/hard mode, essay editor, word count, live helper
- Review: grammar, spelling, structure, story/director appeal, overall score
- History: previous essays and scores
- Calendar: red dots on practice days

## GitHub Pages Launch

This project is configured for GitHub Pages, not Netlify.

1. Upload the repository contents so `index.html`, `app.js`, `styles.css`, `.nojekyll`, `assets/`, and `.github/workflows/deploy-github-pages.yml` are at the repository root.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Set **Build and deployment** > **Source** to **GitHub Actions**.
5. Push to `main` or `master`, then open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.

After the workflow completes, the site will be available at the Pages URL shown in the deployment summary.
