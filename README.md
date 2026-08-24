# Aletheia

Aletheia (working name "The Archive") is a research intelligence workspace for
reading, organizing, and cross-checking academic papers. It's built around a
few core ideas: a library of uploaded papers, a distraction-free reader with
an extraction panel for figures/tables/equations/citations, semantic search,
cross-paper claim comparison, per-claim verification against linked evidence,
and a reproducibility checklist tied to a paper's code repo.

Right now this is a frontend build against mock data — there's no backend or
persistence layer wired up yet. Every page renders from fixtures in
`lib/mock-data.ts` so the UI and interactions can be reviewed end to end
before any of it talks to a real API.

## Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4, theme tokens defined as CSS variables in `app/globals.css`
  and mapped in `tailwind.config.ts`
- Fraunces, Source Serif 4, Inter, and JetBrains Mono via `next/font/google`

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. It redirects straight to `/library`.

## Layout

```
app/
  (app)/          authenticated shell: sidebar + topbar, one folder per page
    library/
    search/
    upload/
    paper/[id]/   the reader
    cross-paper/
    claim-verification/
    reproducibility/
    settings/
  (auth)/
    sign-in/
components/       shared UI pieces (cards, badges, tables, the sidebar/topbar)
lib/
  mock-data.ts    every fixture the pages render from
```

The two route groups exist because they need different chrome: `(app)` renders
the sidebar and topbar around every page, `(auth)` just centers its content
with no navigation.

## Notes

- Search filtering, the upload dropzone's drag state, tab switching in the
  reader's extraction panel, and the settings provider picker are all real
  client-side interactions — they just don't persist anywhere yet.
- The status/badge patterns (paper status, claim agreement, claim
  verification, reproducibility checks) share a small set of primitives in
  `components/Badge.tsx` rather than each being a one-off.
