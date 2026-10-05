# SchröSite — AI web-page generator (frontend)

> *"Did it ever really exist?"*

**SchröSite** is a playful **AI website generator**. Type a phrase ("a retro arcade high-score board", "a cat gallery with search") and the backend asks **OpenAI GPT-4.1** for a complete, standalone HTML page with inline CSS and JS. The page renders live in a sandboxed `<iframe>`. Signed-in users can **save** pages with a screenshot thumbnail, browse everyone's saved pages on a **community blog**, and **rate** them. The site exists in a Schrödinger-ish state until you look at it: hence the name.

This repo is the **React 19 + Vite + Redux Toolkit** frontend. The API is [WP-Proj-Backend](https://github.com/Aashir-Adnan/WP-Proj-Backend).

---

## Table of contents

- [Features](#features)
- [Pages & routes](#pages--routes)
- [How generation works](#how-generation-works)
- [Saving a page](#saving-a-page)
- [State management](#state-management)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Backend endpoints used](#backend-endpoints-used)
- [Project structure](#project-structure)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)

---

## Features

- ✨ **Prompt → page.** Generate a full web page from a phrase, or press **Random** for a surprise.
- 🌀 **Quirky loading messages** that rotate every 3 s while you wait ("Herding pixels…", "Aligning CSS unicorns…", "Have You Watched Arcane Yet?").
- 🖼️ **Live preview** at `/schro`. The HTML is injected into an `<iframe srcDoc>`, so the generated code can't touch the host app.
- 💾 **Save** the page with a title and a thumbnail (paste a screenshot from the clipboard). The thumbnail is uploaded through the backend's signed-URL file flow.
- 📚 **Community blog**: browse saved pages sorted by cumulative rating, filter by page name or author, expand a card, open it in the viewer, and rate it once per user.
- 👤 **Profile**: Google sign-in (Firebase popup, or Google Identity Services one-tap). Your account is created or looked up on the backend, and you can edit your display name and see your pages.
- 📂 **"Your Pages" dropdown** in the header loads any of your saved pages straight into the viewer.
- 🎬 Full-screen looping **background video** (`public/bg.mp4`) and an animated typewriter title that alternates between *SchröSite* and *Did it ever really exist?*

---

## Pages & routes

Defined in `src/main.jsx` with `createBrowserRouter`. Every page shares `Layout`, which has the background video, `Header` and `Footer`.

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Prompt box, Generate / Random, status messages, Save modal, login prompt |
| `/schro` | `Schro` | Renders the current generated page (`generatedPage.code`) in an iframe, with a **Share This Page!** footer |
| `/blog` | `Blog` | Community gallery: filters, cards with thumbnails, ratings |
| `/profile` | `Profile` | Google login, editable name, saved pages |

---

## How generation works

```
Home ──writeCode(phrase)──► generateHTMLPage(phrase)
                              POST {VITE_API_URL}/api/gen/code  { phrase }
                                         │
                       backend: GenCode_object → OpenAI gpt-4.1
                       "Create a complete standalone HTML page with inline JS and CSS …
                        use only free, key-less APIs, no emojis, made-up chart data"
                                         │
                       ◄── { payload: { return: { success, html } } }
strip ```html fences ─► store.dispatch(setCode({ code: html, title: phrase }))
                                         │
                      navigate('/schro') → <iframe srcDoc={html}>
```

---

## Saving a page

1. **Request an upload slot:** `GET /api/get/file/url/local` returns `payload.uploadUrl`, a URL with an attachment token.
2. **Upload the thumbnail:** `POST <uploadUrl>` (multipart) returns `payload.attachment_id`.
3. **Create the record:** `POST /api/crud/saved_site` with:

   ```json
   {
     "savedSite_pageName": "…",
     "savedSite_reactContent": "<html…>",
     "savedSite_ownerId": 12,
     "savedSite_cumulativeRating": 5,
     "savedSite_ratingCount": 1,
     "savedSite_attachmentId": 34
   }
   ```

4. **Refresh "Your Pages":** `GET /api/crud/saved_site?id=<userId>` and update the Redux user.

Thumbnails are shown with `GET /api/get/file?step=1&attachmentId=<id>`.

---

## State management

Redux Toolkit store (`src/helpers/store/store.js`):

| Slice | State | Actions |
|-------|-------|---------|
| `generatedPage` | `{ code, title }` | `setCode`, `clearCode` |
| `user` | `{ email, name, photoURL, token, userid, saved_sites[] }` | `setUser`, `clearUser` |

---

## Tech stack

| Concern | Library |
|---------|---------|
| UI | React 19, React Router 7 |
| State | Redux Toolkit 2, React-Redux 9 |
| Build | Vite 7, `@vitejs/plugin-react` |
| Auth | Firebase 12 (`signInWithPopup` + `GoogleAuthProvider`), Google Identity Services |
| HTTP | axios |
| Screenshots | `html2canvas` + clipboard paste |
| Images | `pexels` client (stock imagery helper) |
| Lint | ESLint 9 |

---

## Getting started

```bash
git clone https://github.com/Aashir-Adnan/WP-Proj-Frontend.git
cd WP-Proj-Frontend
npm install
cp .env.example .env     # create it, see below
npm run dev              # http://localhost:5173
```

Run [WP-Proj-Backend](https://github.com/Aashir-Adnan/WP-Proj-Backend) with `OPENAI_API_KEY` set.

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the build |
| `npm run lint` | ESLint |

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:3000` |
| `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_APP_ID` | Firebase web config. Enable the Google provider. |
| `VITE_GOOGLE_CLIENT_ID` | OAuth client ID for Google Identity Services one-tap |
| `PUBLIC_KEY` / `PRIVATE_KEY` | Platform keys for the optional encrypted-request helper (`helpers/api/processor.js`). Vite only exposes `VITE_*` variables by default, so add a `VITE_` prefix if you use this. |

---

## Backend endpoints used

| Method | Path | Used for |
|--------|------|----------|
| `POST` | `/api/gen/code` | Generate HTML from `{ phrase }` |
| `POST` | `/api/ext/sign/up` | Create or look up the user after Google login |
| `GET` | `/api/crud/saved_site` | List saved sites (paging, sorting, `filter_*_and` JSON filters) or one user's sites (`?id=`) |
| `POST` | `/api/crud/saved_site` | Save a page |
| `PUT` | `/api/crud/saved_site` | Update a page's rating totals |
| `GET` | `/api/crud/rating/logs?site_id=&user_id=` | Has this user rated this site? |
| `POST` | `/api/crud/rating/logs` | Record a rating |
| `GET` | `/api/get/file/url/local` | Get a signed upload URL |
| `GET` | `/api/get/file?step=1&attachmentId=` | Fetch a thumbnail |

The URL scheme is explained in the [backend README](https://github.com/Aashir-Adnan/WP-Proj-Backend#how-a-request-is-routed).

---

## Project structure

```
WP-Proj-Frontend/
├── index.html
├── public/bg.mp4                  # Background video
└── src/
    ├── main.jsx                   # Router + Redux Provider
    ├── index.css / App.css
    ├── pages/
    │   ├── Layout.jsx             # Video bg + Header + Outlet + Footer
    │   ├── Header.jsx             # Nav, profile avatar, "Your Pages" dropdown
    │   ├── Title.jsx / Title.css  # Typewriter title
    │   ├── Footer.jsx             # "Share This Page!" (only on /schro)
    │   ├── Home.jsx               # Prompt, generate, save, screenshot upload
    │   ├── Schro.jsx              # iframe viewer
    │   ├── Blog.jsx               # Community gallery + ratings
    │   └── Profile.jsx            # Google auth + profile
    └── helpers/
        ├── code/genCode.js        # POST /api/gen/code
        ├── code/writeCode.js      # generate → Redux
        ├── code/genCodeSlice.js
        ├── user/userSlice.js
        ├── user/firebaseAuth.js
        ├── store/store.js
        ├── api/processor.js       # Optional encrypted API call helper
        └── auth.js                # Pexels client
```

---

## Security notes

- The generated HTML comes from an LLM and runs in an `<iframe srcDoc>`. For stronger isolation, add `sandbox="allow-scripts"` so the page gets an opaque origin.
- Third-party API keys don't belong in client code. Keep keys such as Pexels on the backend or in a `VITE_` env variable, and **rotate any key that has been committed**.
- `user.userid` from the client is trusted when saving and rating. The backend should derive the user from a verified token instead.

---

## Known limitations

- `src/App.jsx` is the unused Vite starter component. Routing lives in `main.jsx`.
- Ratings are checked per user on the client, so one user can rate the same site more than once by calling the API directly.
- The **Share This Page!** button has no handler yet.
