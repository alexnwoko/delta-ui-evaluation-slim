# DELTA UI component library evaluation

Six React component libraries, each implementing **the same DELTA screen**, so the comparison is
between the libraries and nothing else. Built for UNDRR's DELTA Resilience platform.

**Why this exists:** in July 2026 PrimeTek relicensed the PrimeUI family. `primereact@10.9.8` is MIT;
`primereact@11.1.0` is proprietary — a licence key is required, the source is unavailable, and
redistribution as a component library is forbidden. DELTA is Apache-2.0, ships to national government
servers as a portable bundle, and is targeting the Digital Public Good registry. That makes the
question *where to land*, not *whether to move*.

## The candidates

| Directory | Library | Version | Licence |
|---|---|---|---|
| `apps/delta-react-aria` | Adobe React Aria Components | 1.20.0 | Apache-2.0 |
| `apps/delta-shadcn` | Radix UI + shadcn-style + TanStack Table | 1.6.7 / 8.21.3 | MIT (generated into the repo) |
| `apps/delta-carbon` | IBM Carbon | 1.113.0 | Apache-2.0 |
| `apps/delta-mui` | Material UI (MUI) — community tier only | `@mui/material` 9.3.1 | MIT core (MUI X Pro/Premium excluded) |
| `apps/delta-antd` | Ant Design | 6.6.0 | MIT |
| `apps/delta-primereact` | PrimeReact — the incumbent, as control | 10.9.8 | MIT (frozen branch) |

## What each demo contains

Two pages, from one shared dataset (`src/shared/data.ts`) and one shared, deliberately
library-neutral host shell (`src/shared/chrome.tsx`):

- **DELTA screen** — the disaster-records list: search, hazard filter, nine columns, status tags,
  row actions, sorting, selection, pagination, a confirm dialog with a reason field, and a toast.
- **Inventory** — the kitchen sink covering everything DELTA's 33 PrimeReact modules touch.

**The showcase is in English.** Every demo opens in English and carries a language switcher covering
the **six official UN languages plus Portuguese** — English, French, Spanish, Russian, Chinese,
Arabic, Portuguese. English is the default state, not a translated one; the switcher exists to prove
the design is built for the rest.

That switcher is the point of the exercise. DELTA's own content translates in every demo. What
differs is whether the **library's own** strings translate — pagination summaries, "select all rows",
empty states, column filter menus, date pickers. Each demo's header carries a
`library locales n/7` badge counting it:

| Candidate | Library locale packs | Covered |
|---|---|---|
| Ant Design | 76 locale packs | **7 / 7** |
| Material UI | 57 core + 41 grid | **7 / 7** (but `@mui/x-date-pickers` ships **no Arabic locale at all**) |
| Adobe React Aria | 30+ locales | **7 / 7** (plus Hijri calendars and Arabic-Indic numerals) |
| IBM Carbon | none | **0 / 7** — every string is a `translateWithId` callback you write and maintain |
| Radix + shadcn | none, by design | **0 / 7** — headless primitives render no strings, so nothing can be half-translated by an upgrade |
| PrimeReact 10 | has `addLocale()`, ships none | **0 / 7** — and DELTA has never called it; `addLocale` appears zero times in the codebase |

Arabic additionally tests direction. Each library uses its own idiomatic mechanism —
`ConfigProvider direction` for Ant Design, an Emotion RTL cache plus `@mui/stylis-plugin-rtl` for
Material UI, `unstable_LayoutDirection` for Carbon, `I18nProvider` for React Aria,
`DirectionProvider` plus Tailwind logical utilities for Radix, and nothing at all for PrimeReact,
which has no RTL mode.

Translations in the demos are illustrative — they show which strings each library owns. They have
not been reviewed by UNDRR translators and should not be reused as copy.

## Build and run

```bash
./build.sh                          # builds all six and assembles ./dist
npx serve dist                      # or any static server — NOT file://
```

`file://` breaks the demos: the host shell calls `history.replaceState`, which browsers block on
local files. Anything serving over HTTP is fine.

To work on one candidate:

```bash
cd apps/delta-react-aria && npm install && npm run dev
```

Set `IBM_TELEMETRY_DISABLED=true` before installing `apps/delta-carbon` — `@carbon/react` runs a
postinstall that reports to IBM (see below).

## Deploying

`.github/workflows/pages.yml` builds everything and publishes to GitHub Pages on push to `main`.
Enable Pages → Source → GitHub Actions in the repository settings. All asset paths are relative,
so it works under any subpath.

## Measured payload

Real `vite build` output, gzip, same screen in every case, 11 August 2026:

| Candidate | JS | CSS | Total | Fonts |
|---|---|---|---|---|
| Radix + shadcn + TanStack | 119.3 kB | 4.7 kB | **124.0 kB** | — |
| Adobe React Aria | 193.6 kB | 2.1 kB | **195.6 kB** | — |
| PrimeReact 10 | 240.5 kB | 22.7 kB | **263.2 kB** | 1.30 MB (6 files) |
| IBM Carbon | 188.3 kB | 87.1 kB | **275.4 kB** | 1.28 MB (90 files) |
| MUI (community) | 311.8 kB | 0.8 kB | **312.6 kB** | — |
| Ant Design | 393.3 kB | 0.8 kB | **394.1 kB** | — |

## Findings that only appeared at build time

None of these are in any candidate's documentation.

1. **Ant Design emits no stylesheet at all.** `dist/assets/` holds a single `.js` file. Every style is
   generated at runtime by a JS engine, so DELTA's React Router v7 SSR would need a hand-wired
   per-request `createCache()` → `extractStyle()` pipeline that Ant Design does not document for
   this framework.
2. **Carbon's RTL provider is still unstable.** Importing `LayoutDirection` from `@carbon/react`
   fails the build; it is exported only as `unstable_LayoutDirection` / `preview_LayoutDirection`,
   four years after Carbon closed its bidirectional-text request as completed.
3. **Carbon's Sass emits font URLs Vite cannot resolve** — webpack-style `~@ibm/plex/…woff2`. Without
   the alias in `apps/delta-carbon/vite.config.ts` the build ships broken `@font-face` references,
   which for an offline national deployment means missing fonts rather than a fallback.
4. **Carbon ships 90 font files, 1.31 MB, by default** — the whole IBM Plex family across Latin and
   Cyrillic subsets. Suppressible with `$css--font-face: false`, but nothing warns you.
5. **Carbon runs a postinstall that reports to IBM.** `"postinstall": "ibmtelemetry --config=telemetry.yml"`.
   On by default; opt-out only via an environment variable. It reports a de-identified repository URL,
   commit hash, dependency list, and which JSX components you import with which attributes.
6. **Material UI's date pickers have no Arabic locale at all.** `@mui/x-date-pickers` ships 40 locales
   including Persian, Hebrew and Urdu, but nothing `ar*`. The MUI demo omits the date filter rather
   than fake it.

## Reading the scores honestly

- **No candidate here publishes a VPAT or ACR.** Accessibility scores rank published *evidence* and
  *remediability*. They are not conformance claims and do not replace an audit with real assistive technology.
- **Continuity is modelled, not measured** — inferred from what UNDP's design system and UNDRR's
  Mangrove are built on, not from a running multi-property deployment.
- **The demos are client-rendered.** DELTA runs SSR. The SSR costs described for Ant Design and MUI
  come from their documentation and issue trackers; they were not reproduced here.
- **Weights are proposed, not ratified.** Edit them on the Criteria tab and the ranking recomputes.
- **Baseline is the learning fork** at `d0ebd47` (7 May 2026). Re-baseline against `unisdr/DELTA`
  before committing to estimates.

## Two naming points

- **"MUI" and "Material UI" are the same product** — `@mui/material`, by MUI (Material-UI SAS).
  `apps/delta-mui` is it, on the community MIT tier only. Note that Material UI v9 is *not* built on
  Base UI (verified from its dependency tree), so MUI's accessible-primitive work is going into a
  different product than the one you would adopt.
- **Google's own `@material/web` is a different thing and is not a candidate.** It implements
  Material Design 3 as web components rather than React, and its README states: *"MWC is in
  maintenance mode pending new maintainers."* Last stable release 2.5.0; everything since is
  nightlies.

## Licence

Demo code in this repository: Apache-2.0, matching DELTA. Each candidate library remains under its
own licence, listed above.
