/* DELTA UI evaluation — data and rendering. All numbers here were measured or counted;
   see the Method tab. */

const CRITERIA = [
  { key:"a11y", name:"Accessibility",
    desc:"Published evidence, an accessible primitive layer underneath, keyboard and screen-reader behaviour you can point a reviewer at — and, where the vendor falls short, whether you are permitted to fix it.", w:35 },
  { key:"style", name:"Styling interoperability",
    desc:"Fits DELTA's existing Tailwind v4 install and React Router v7 SSR without a runtime CSS engine, a per-request style cache, or a specificity war.", w:25 },
  { key:"data", name:"Data functionality",
    desc:"Sorting, filtering, selection, pagination, virtualisation, export — what the grid does out of the box, and what sits behind a paywall.", w:20 },
  { key:"cont", name:"Continuity across UNDRR properties",
    desc:"Can one token set and one component layer serve DELTA, Mangrove and non-React UNDRR properties — and is there UN-system precedent to converge on?", w:20 },
];

const C = [
  { id:"react-aria", name:"Adobe React Aria Components", ver:"1.20.0", lic:"Apache-2.0",
    dir:"delta-react-aria", arch:"Headless behaviour + your CSS",
    s:{ a11y:5, style:4, data:3, cont:3 },
    ev:{
      a11y:"The only candidate publishing a specific screen-reader test matrix — VoiceOver (macOS Safari/Chrome, iOS), JAWS (Win FF/Chrome), NVDA (Win FF/Chrome), TalkBack (Android). WAI-ARIA APG per component. No VPAT (nobody here has one).",
      style:"No styling shipped and no runtime CSS engine, so it cannot conflict with Tailwind and has no SSR style-flash failure mode. The demo's ~150 lines of CSS are all logical properties. Cost: you write them.",
      data:"Ships an accessible Table with sorting, multi-select, drag and resize — real keyboard grid semantics, but not a data grid. Server-side paging and filtering means adding TanStack Table.",
      cont:"Unstyled, so one UNDRR token set can drive it anywhere and it imposes no visual identity. Apache-2.0 matches DELTA's own licence exactly. No UN-system precedent, and no shared component layer to inherit." } },

  { id:"shadcn", name:"Radix + shadcn-style + TanStack", ver:"radix 1.6.7 / table 8.21.3", lic:"MIT (code generated into the repo)",
    dir:"delta-shadcn", arch:"Headless primitives + owned components",
    s:{ a11y:3, style:5, data:4, cont:5 },
    ev:{
      a11y:"Radix implements the WAI-ARIA authoring practices per component and shadcn's generated code is yours, so every defect is remediable in-repo. But there is no vendor conformance claim, and contrast and focus-visible become DELTA's responsibility.",
      style:"Tailwind-native — this is the reference implementation of headless primitives on Tailwind. Nothing to reconcile with DELTA's existing v4 install, no runtime CSS engine, static stylesheet, so SSR is free. Measured lightest by a wide margin.",
      data:"TanStack Table v8 (MIT) gives unlimited rows, server-side everything, and virtualisation via TanStack Virtual — but you assemble the grid rather than importing one.",
      cont:"The decisive score. UNDP's official React design system (@undp/design-system-react, MIT, React 19.2) is built on exactly this stack, and UNDRR's own unisdr/undrr-mangrove states its base configuration was adapted from UNDP's with permission. Tailwind @theme tokens also export as plain CSS variables for non-React properties." } },

  { id:"carbon", name:"IBM Carbon", ver:"1.113.0", lic:"Apache-2.0",
    dir:"delta-carbon", arch:"Full system, Sass",
    s:{ a11y:5, style:3, data:4, cont:2 },
    ev:{
      a11y:"The strongest published evidence in the field: per-component accessibility status across four axes for 100+ components, automated IBM Equal Access checks gating every PR, JAWS/VoiceOver/NVDA named, standards basis stated as WCAG AA + Section 508 + EN 301 549.",
      style:"No CSS-in-JS, so SSR is genuinely easy — but it brings a global Sass reset and its own token system to sit beside Tailwind, and it emitted 87 kB gzip of CSS plus 90 font files in this build.",
      data:"DataTable covers sorting, selection, toolbar search, batch actions and pagination competently. No virtualisation for very large sets.",
      cont:"Carbon self-describes as 'the digital expression of the IBM brand'. Adopting it unthemed makes UNDRR's flagship platform read as an IBM product; retheming is supported but is the work you adopted a design system to avoid. No UN precedent." } },

  { id:"mui", name:"Material UI (MUI) — community tier only", ver:"@mui/material 9.3.1", lic:"MIT core; MUI X Pro/Premium excluded",
    dir:"delta-mui", arch:"Full system, Emotion CSS-in-JS",
    s:{ a11y:2, style:2, data:5, cont:4 },
    ev:{
      a11y:"WCAG 2.2 AA appears as an 'aim' on one docs page. An axe harness exists in CI and currently runs on two Button demos. Material UI v9 is not built on Base UI — verified from its dependency tree — so there is no accessible primitive layer beneath it.",
      style:"Emotion is mandatory and its zero-runtime replacement, Pigment CSS, is marked 'Alpha phase, currently on hold'. Tailwind v4 coexistence is officially solved with cascade layers, which is genuinely good — but there is no React Router / Remix SSR recipe (open since Nov 2023), only @mui/material-nextjs, and RTL needs a second Emotion cache on top of the per-request one.",
      data:"The best free grid here. MIT @mui/x-data-grid gives sorting, filtering, column resize, selection, editing and CSV export. Constraints: page size capped at 100 and multi-column sort/filter forced off in the MIT tier — neither of which DELTA uses today.",
      cont:"Excellent multi-property theming: a serialisable theme object publishable as an internal npm package, and cssVariables:true emits prefixed CSS custom properties a Drupal or static UNDRR property can consume directly. Against it: no permissive UN-family theme to inherit (@unicef/material-ui is GPL-3.0-or-later)." } },

  { id:"antd", name:"Ant Design", ver:"6.6.0", lic:"MIT",
    dir:"delta-antd", arch:"Full system, CSS-in-JS",
    s:{ a11y:1, style:3, data:5, cont:2 },
    ev:{
      a11y:"The weakest, and not by inference. Asked directly about WCAG issues in October 2025, a maintainer replied 'Currently No plans yet. Willing to accept community contributions.' The umbrella accessibility issue has been open since March 2020. A vendor's ARIA is not a defect DELTA can fix downstream.",
      style:"Tailwind v4 coexistence is documented and works (StyleProvider layer plus an @layer order line). But the build emits no stylesheet at all — verified — so DELTA's SSR would need a hand-wired per-request createCache and extractStyle, with no official React Router v7 integration.",
      data:"The most capable grid in the field at zero cost: built-in virtualisation, server-side pagination, column filters, multi-column sort, expandable rows, sticky headers and fixed columns. No paid tier.",
      cont:"76 locale packs and one-prop RTL make it excellent for a single multilingual app, but it carries a strong visual identity, single-company governance with no foundation, and no UN-system precedent or shared token path to other properties." } },

  { id:"primereact", name:"PrimeReact 10 — the incumbent", ver:"10.9.8", lic:"MIT (frozen); v11 is proprietary",
    dir:"delta-primereact", arch:"Full system, vendored theme",
    s:{ a11y:2, style:2, data:3, cont:1 },
    ev:{
      a11y:"DELTA today: no accessibility policy, no axe or pa11y tooling, no CI gate, 0 skip links, ~87 of 162 labels with no htmlFor, 6 keyboard handlers in the whole app, and role=\"grid\" declared on analytics tables with no arrow-key navigation.",
      style:"The vendored theme loads after Tailwind, so theme rules win specificity ties — hence 21 className strings carrying '!' utilities and no cascade-layer isolation anywhere.",
      data:"Adequate, and DELTA uses almost none of it: zero uses of lazy loading, virtualisation, row grouping, expansion, frozen columns, sorting, editing, export or selection across all 10 of its DataTables.",
      cont:"A dead end. PrimeReact 11 is proprietary, so there is no forward path, and nothing here transfers to Mangrove or to a non-React UNDRR property." } },
];

/* Languages for which the library localises its OWN internal strings — pagination, select-all,
   empty states, filter menus, date pickers. DELTA's content translates in every case; this is
   about the furniture the library owns. Counted from the installed packages. */
const LOCALES = {
  "antd":       { n:7, packs:"76 locale packs", note:"All seven covered: en_US, fr_FR, es_ES, ru_RU, zh_CN, pt_BR, ar_EG.", pickers:"Covered by the same packs." },
  "mui":        { n:7, packs:"57 core + 41 grid", note:"All seven covered in @mui/material and @mui/x-data-grid.", pickers:"@mui/x-date-pickers ships NO Arabic locale — 40 locales including Persian, Hebrew and Urdu, but nothing ar*." },
  "react-aria": { n:7, packs:"30+ locales", note:"All seven covered, driven by one I18nProvider locale prop.", pickers:"Includes Hijri and other non-Gregorian calendars, and Arabic-Indic numerals." },
  "carbon":     { n:0, packs:"none", note:"Ships no locale packs at all. Every internal string is a per-component translateWithId callback DELTA writes and maintains.", pickers:"flatpickr needs its own locale wiring per language." },
  "shadcn":     { n:0, packs:"none — by design", note:"Headless primitives render no strings of their own, so there is nothing to inherit and nothing that can be half-translated by an upgrade. Everything you see is DELTA's.", pickers:"Formatting comes from the platform Intl API." },
  "primereact": { n:0, packs:"has addLocale(), ships none", note:"PrimeReact exposes a locale API but ships no packs; DELTA has never called addLocale() — it appears zero times in the codebase, so internals render English in all seven languages.", pickers:"Calendar month and day names stay English." },
};

const MEASURED = {
  "react-aria": { js:193.6, css:2.1,  fonts:0,      nf:0,  mods:3022 },
  "shadcn":     { js:119.3, css:4.7,  fonts:0,      nf:0,  mods:1912 },
  "carbon":     { js:188.3, css:87.1, fonts:1309.0, nf:90, mods:914  },
  "mui":        { js:311.8, css:0.8,  fonts:0,      nf:0,  mods:1529 },
  "antd":       { js:393.3, css:0.8,  fonts:0,      nf:0,  mods:4821 },
  "primereact": { js:240.5, css:22.7, fonts:1327.0, nf:6,  mods:1218 },
};

const GATES = [
  { g:"Licence is OSI-approved (DPG Standard indicator 2)",
    v:{ "react-aria":["p","Apache-2.0"], "shadcn":["p","MIT, generated into the repo"], "carbon":["p","Apache-2.0"],
        "mui":["p","MIT core"], "antd":["p","MIT"], "primereact":["f","v11 proprietary; 10.x is a frozen MIT branch"] } },
  { g:"Redistributable inside the national binary bundle",
    v:{ "react-aria":["p","Yes"], "shadcn":["p","Yes"], "carbon":["p","Yes"], "mui":["p","Yes — community tier"],
        "antd":["p","Yes"], "primereact":["f","v11 requires a separate OEM licence"] } },
  { g:"No install-time call home",
    v:{ "react-aria":["p","None"], "shadcn":["p","None"], "carbon":["f","ibmtelemetry postinstall; opt-out by env var only"],
        "mui":["p","None"], "antd":["p","None"], "primereact":["p","None"] } },
  { g:"Full capability without a paid tier",
    v:{ "react-aria":["p","No paid tier"], "shadcn":["p","No paid tier"], "carbon":["p","No paid tier"],
        "mui":["f","Grid features and date ranges sit in MUI X Pro/Premium"], "antd":["p","No paid tier"],
        "primereact":["f","v11 Community tier excludes an organisation like UNDRR"] } },
];

const FINDINGS = [
  { t:"Ant Design emits no stylesheet at all", sev:"style",
    b:"Verified: <code>dist/assets/</code> contains a single <code>.js</code> file and 0.8 kB of CSS — all of it the host chrome. Every antd style is generated at runtime by a JS engine. Under DELTA's React Router v7 SSR that mandates a per-request <code>createCache()</code> → <code>&lt;StyleProvider&gt;</code> → <code>extractStyle()</code> pipeline hand-wired into <code>root.tsx</code>, which antd does not document for this framework and will not regression-test." },
  { t:"Carbon's RTL provider is still an unstable API", sev:"a11y",
    b:"Importing <code>LayoutDirection</code> from <code>@carbon/react</code> fails the build. The component exists but is exported only as <code>unstable_LayoutDirection</code> and <code>preview_LayoutDirection</code> — four years after Carbon closed its bidirectional-text request as completed. The demo imports the unstable name; you can see it in the source." },
  { t:"Carbon's Sass emits font URLs Vite cannot resolve", sev:"build",
    b:"<code>@carbon/styles</code> writes webpack-style <code>~@ibm/plex/…woff2</code> URLs. Without an explicit alias the build logs dozens of unresolved-asset warnings and ships broken <code>@font-face</code> references — which for an offline national deployment means missing fonts, not a fallback. The fix is three lines of Vite config; finding it is the point." },
  { t:"Carbon ships 90 font files, 1.31 MB, by default", sev:"build",
    b:"Once the alias above resolves them, the build emits the whole IBM Plex family — Sans, Serif, Mono, across Latin and Cyrillic subsets. Suppressible with the <code>$css--font-face: false</code> Sass flag, but it is the default and nothing warns you." },
  { t:"Carbon runs a postinstall that reports to IBM", sev:"gov",
    b:"Verified in the installed tree: <code>\"postinstall\": \"ibmtelemetry --config=telemetry.yml\"</code> with <code>@ibm/telemetry-js</code> as a dependency. On by default, opt-out only via the <code>IBM_TELEMETRY_DISABLED</code> environment variable. It reports a de-identified repository URL, commit hash, project name, dependency list — and which JSX components you import and with what attributes." },
  { t:"MUI's date pickers have no Arabic locale at all", sev:"i18n",
    b:"<code>@mui/x-date-pickers</code> ships 40 locales including Persian, Hebrew and Urdu, but nothing <code>ar*</code>. The demo omits the date filter rather than fake it. Core MUI has three Arabic variants and the data grid has one, so the gap is specifically the pickers." },
  { t:"PrimeReact 11 is proprietary — read in the tarball", sev:"gate",
    b:"<code>primereact@10.9.8</code> is MIT. <code>primereact@11.1.0</code>'s <code>LICENSE.md</code> reads: “A valid license key is required to use this software… You may not reverse-engineer, decompile, or extract its source code, redistribute it as a component library or development tool… Redistributing the software so that third parties can develop with it requires a separate OEM License.” <code>primeicons</code> went the same way at v8. DELTA's caret ranges mean no accidental upgrade — there is a runway, on a branch with no successor." },
];

/* ---------- helpers ---------- */
const el = (t, a = {}, ...k) => { const n = document.createElement(t);
  for (const [p, v] of Object.entries(a)) p === "html" ? n.innerHTML = v : n.setAttribute(p, v);
  k.flat().forEach(c => n.append(c)); return n; };
const weighted = (c) => {
  const tot = CRITERIA.reduce((s, x) => s + x.w, 0) || 1;
  return CRITERIA.reduce((s, x) => s + x.w * c.s[x.key], 0) / tot;
};
const qual = (n) => n >= 4.5 ? "strong" : n >= 3.5 ? "good" : n >= 2.5 ? "workable" : n >= 1.5 ? "weak" : "blocked";

/* ---------- ranking ---------- */
function renderRank() {
  const order = [...C].sort((a, b) => weighted(b) - weighted(a));
  const t = document.getElementById("rankTable");
  t.innerHTML = `<thead><tr><th>Candidate</th><th>Architecture</th><th>Weighted score</th>
    ${CRITERIA.map(c => `<th>${c.name}</th>`).join("")}<th>Payload</th><th>Demo</th></tr></thead>`;
  const tb = el("tbody");
  order.forEach(c => {
    const m = MEASURED[c.id];
    tb.append(el("tr", { html:
      `<td class="cand">${c.name}<small>${c.ver} · ${c.lic}</small></td>
       <td style="font-size:12px;color:var(--ink2)">${c.arch}</td>
       <td class="score">${weighted(c).toFixed(2)}<small> / 5</small></td>
       ${CRITERIA.map(cr => { const v = c.s[cr.key];
         return `<td><span class="q q${v}">${qual(v)}</span></td>`; }).join("")}
       <td style="font-variant-numeric:tabular-nums">${(m.js + m.css).toFixed(0)} kB${m.nf ? `<small style="display:block;color:var(--muted);font-size:11px">+${(m.fonts/1024).toFixed(2)} MB fonts</small>` : ""}</td>
       <td><a class="demo p" href="${c.dir}/index.html">DELTA screen</a>
           <a class="demo" href="${c.dir}/index.html#inventory">Inventory</a></td>` }));
  });
  t.append(tb);
}

/* ---------- gates ---------- */
function renderGates() {
  const t = document.getElementById("gateTable");
  t.innerHTML = `<thead><tr><th>Gate</th>${C.map(c => `<th>${c.name.split(" —")[0].split(" (")[0]}</th>`).join("")}</tr></thead>`;
  const tb = el("tbody");
  GATES.forEach(g => tb.append(el("tr", { html:
    `<td style="font-weight:600">${g.g}</td>` + C.map(c => { const [st, txt] = g.v[c.id];
      return `<td><span class="pill ${st}">${st === "f" ? "✕ FAIL" : "✓ PASS"}</span>
        <div style="font-size:11.5px;color:var(--ink2);margin-top:3px">${txt}</div></td>`; }).join("") })));
  t.append(tb);
}

/* ---------- demos ---------- */
function renderDemos() {
  const t = document.getElementById("demoTable");
  t.innerHTML = `<thead><tr><th>Candidate</th><th>What this demo is for</th><th>Open</th></tr></thead>`;
  const tb = el("tbody");
  const why = {
    "react-aria":"Behaviour and internationalisation with zero vendor styling — the clearest look at what accessibility and Arabic support cost when the library owns them.",
    "shadcn":"The UNDP-aligned stack. Components live in the repo, so read the source: this is what DELTA would own and maintain.",
    "carbon":"A complete IBM design system. Watch what mirrors in RTL and, more importantly, which strings never translate.",
    "mui":"Community tier only. The free MIT data grid is the thing to exercise — sort, filter, resize, select, export.",
    "antd":"The most capable out-of-the-box grid and the best one-prop RTL. Note that it emits no stylesheet.",
    "primereact":"DELTA as it is today. The control case every other demo is measured against.",
  };
  C.forEach(c => tb.append(el("tr", { html:
    `<td class="cand">${c.name}<small>${c.ver} · ${c.lic}</small></td>
     <td style="font-size:13px;color:var(--ink2);max-width:520px">${why[c.id]}</td>
     <td style="min-width:170px"><a class="demo p" href="${c.dir}/index.html">DELTA screen (English)</a>
       <a class="demo" href="${c.dir}/index.html#inventory">Inventory (English)</a>
       <div style="font-size:11px;color:var(--muted);margin:6px 0 3px">Jump to a language:</div>
       <div style="display:flex;flex-wrap:wrap;gap:4px">
       ${[["fr","FR"],["es","ES"],["ru","RU"],["zh","ZH"],["pt","PT"],["ar","AR ↔"]].map(([k, l]) =>
         `<a class="demo" style="margin:0;padding:3px 7px;font-size:11px" href="${c.dir}/index.html?lang=${k}">${l}</a>`).join("")}
       </div></td>` })));
  t.append(tb);
}

/* ---------- weights ---------- */
function renderWeights() {
  const t = document.getElementById("weightTable");
  t.innerHTML = `<thead><tr><th>Criterion</th><th style="width:110px">Weight %</th></tr></thead>`;
  const tb = el("tbody");
  CRITERIA.forEach(c => {
    const tr = el("tr");
    tr.append(el("td", { html: `<b>${c.name}</b><div style="font-size:12.5px;color:var(--ink2);margin-top:3px">${c.desc}</div>` }));
    const td = el("td");
    const inp = el("input", { type: "number", min: "0", max: "100", value: String(c.w) });
    inp.addEventListener("input", () => { c.w = Number(inp.value) || 0; renderAll(); });
    td.append(inp); tr.append(td); tb.append(tr);
  });
  t.append(tb);
  const sum = CRITERIA.reduce((s, x) => s + x.w, 0);
  const s = document.getElementById("weightSum");
  s.textContent = `Total: ${sum}%` + (sum === 100 ? " — balanced." : " — should total 100; scores are normalised meanwhile.");
  s.style.color = sum === 100 ? "var(--ink2)" : "var(--crit)";
}

/* ---------- heatmap ---------- */
function renderHeat() {
  const t = document.getElementById("heatTable");
  const steps = { 1:"var(--q100)", 2:"var(--q200)", 3:"var(--q300)", 4:"var(--q550)", 5:"var(--q650)" };
  t.innerHTML = `<thead><tr><th>Criterion</th><th>wt</th>${C.map(c => `<th style="text-align:center">${c.name.split(" —")[0].split(" (")[0]}</th>`).join("")}</tr></thead>`;
  const tb = el("tbody");
  CRITERIA.forEach(cr => {
    const tr = el("tr");
    tr.append(el("td", { html: `<b>${cr.name}</b>` }), el("td", { html: String(cr.w) }));
    C.forEach(c => {
      const v = c.s[cr.key];
      const td = el("td", { style: `text-align:center;background:${steps[v]};color:${v <= 3 ? "var(--ink)" : "#fff"};font-weight:700;border-radius:4px`,
        title: `${c.name} — ${cr.name} (${v}/5)\n\n${c.ev[cr.key].replace(/<[^>]+>/g, "")}` });
      td.textContent = String(v); tr.append(td);
    });
    tb.append(tr);
  });
  const tot = el("tr", { style: "font-weight:700" });
  tot.append(el("td", { html: "Weighted score" }), el("td"));
  C.forEach(c => tot.append(el("td", { style: "text-align:center;font-variant-numeric:tabular-nums", html: weighted(c).toFixed(2) })));
  tb.append(tot); t.append(tb);
}

/* ---------- measurements ---------- */
function renderMeasure() {
  const rows = [...C].map(c => ({ c, m: MEASURED[c.id], tot: MEASURED[c.id].js + MEASURED[c.id].css }))
                     .sort((a, b) => a.tot - b.tot);
  const max = Math.max(...rows.map(r => r.tot)) * 1.1;
  const host = document.getElementById("payloadBars"); host.innerHTML = "";
  rows.forEach((r, i) => {
    const row = el("div", { class: "brow" });
    row.append(el("div", { class: "blab", html: r.c.name.split(" —")[0].split(" (")[0] }));
    const tr = el("div", { class: "btrack" });
    const bar = el("div", { class: "bar",
      style: `width:${r.tot / max * 100}%;background:${i === 0 ? "var(--s2)" : "var(--s1)"}` });
    bar.append(el("span", { class: "bval", html: `${r.tot.toFixed(0)} kB gzip` + (r.m.nf ? `  ·  +${(r.m.fonts / 1024).toFixed(2)} MB fonts` : "") }));
    tr.append(bar); row.append(tr); host.append(row);
  });

  const t = document.getElementById("measureTable");
  t.innerHTML = `<thead><tr><th>Candidate</th><th>Modules</th><th>JS gzip</th><th>CSS gzip</th>
    <th>Total gzip</th><th>Font files</th><th>Font bytes</th></tr></thead>`;
  const tb = el("tbody");
  rows.forEach(r => tb.append(el("tr", { html:
    `<td class="cand">${r.c.name.split(" —")[0].split(" (")[0]}<small>${r.c.ver}</small></td>
     <td style="font-variant-numeric:tabular-nums">${r.m.mods.toLocaleString("en-GB")}</td>
     <td style="font-variant-numeric:tabular-nums">${r.m.js.toFixed(1)} kB</td>
     <td style="font-variant-numeric:tabular-nums">${r.m.css.toFixed(1)} kB</td>
     <td style="font-variant-numeric:tabular-nums;font-weight:700">${r.tot.toFixed(1)} kB</td>
     <td style="font-variant-numeric:tabular-nums">${r.m.nf || "—"}</td>
     <td style="font-variant-numeric:tabular-nums">${r.m.fonts ? (r.m.fonts / 1024).toFixed(2) + " MB" : "—"}</td>` })));
  t.append(tb);
}

/* ---------- findings ---------- */
function renderFindings() {
  const host = document.getElementById("findingList"); host.innerHTML = "";
  const tone = { style:"var(--s1)", a11y:"var(--warn)", build:"var(--s2)", gov:"var(--crit)", i18n:"var(--warn)", gate:"var(--crit)" };
  FINDINGS.forEach(f => host.append(el("div", {
    style: `border-left:4px solid ${tone[f.sev]};background:var(--plane);border:1px solid var(--line);
            border-left:4px solid ${tone[f.sev]};border-radius:8px;padding:14px 16px;margin-bottom:12px`,
    html: `<div style="font-weight:700;margin-bottom:5px">${f.t}</div>
           <div style="font-size:13.5px;color:var(--ink2);line-height:1.6">${f.b}</div>` })));
}

function renderLang() {
  const t = document.getElementById("langTable"); if (!t) return;
  t.innerHTML = `<thead><tr><th>Candidate</th><th>Library locale packs</th><th>UN languages + PT covered</th>
    <th>What that means for DELTA</th><th>Date pickers</th></tr></thead>`;
  const tb = el("tbody");
  const order = [...C].sort((a, b) => LOCALES[b.id].n - LOCALES[a.id].n);
  order.forEach(c => {
    const L = LOCALES[c.id];
    const cls = L.n === 7 ? "q5" : L.n === 0 ? "q1" : "q3";
    tb.append(el("tr", { html:
      `<td class="cand">${c.name.split(" —")[0].split(" (")[0]}</td>
       <td style="font-size:12.5px">${L.packs}</td>
       <td><span class="q ${cls}">${L.n} / 7</span></td>
       <td style="font-size:12.5px;color:var(--ink2);max-width:420px">${L.note}</td>
       <td style="font-size:12px;color:var(--ink2);max-width:260px">${L.pickers}</td>` }));
  });
  t.append(tb);
}

function renderAll() { renderRank(); renderGates(); renderLang(); renderDemos(); renderWeights(); renderHeat(); renderMeasure(); renderFindings(); }
renderAll();

document.getElementById("foot").innerHTML =
  `Licences verified by reading published npm tarballs. Payload figures are real Vite 7 production builds of the same screen, measured in one harness on 11 August 2026.
   <br>Unverified: no candidate publishes a VPAT or ACR; React 19.2 is not <i>named</i> as supported by Ant Design or Carbon, though both built cleanly here; the SSR costs described for Ant Design and MUI are read from their documentation and issue trackers, not reproduced.
   <br>Baseline <code>DELTA-Learning @ d0ebd47</code> (7 May 2026) — re-baseline against <code>unisdr/DELTA</code> before committing to estimates.`;

/* tabs */
document.getElementById("tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-t]"); if (!b) return;
  document.querySelectorAll("#tabs button[data-t]").forEach(x => x.setAttribute("aria-current", String(x === b)));
  document.querySelectorAll("section[data-p]").forEach(s => s.classList.toggle("hidden", s.dataset.p !== b.dataset.t));
  window.scrollTo({ top: 0 });
});
/* theme */
const tb = document.getElementById("themeBtn");
const cur = () => document.documentElement.dataset.theme ||
  (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
const sync = () => tb.textContent = cur() === "dark" ? "Light" : "Dark";
tb.addEventListener("click", () => { document.documentElement.dataset.theme = cur() === "dark" ? "light" : "dark"; sync(); });
sync();
