import { useEffect, useState, type ReactNode } from "react";
import "./chrome.css";
import { LANGS, langMeta, type Lang } from "./data";

export type View = "screen" | "inventory";

/** English is the default. The switcher is the capability demonstration, not the default state. */
export function useHostState() {
  const [lang, setLang] = useState<Lang>(() => {
    const q = new URLSearchParams(location.search).get("lang");
    return LANGS.some(l => l.code === q) ? (q as Lang) : "en";
  });
  const [view, setView] = useState<View>(() =>
    location.hash.replace("#", "") === "inventory" ? "inventory" : "screen");
  const meta = langMeta(lang);
  const dir = meta.dir;
  useEffect(() => {
    document.documentElement.lang = meta.bcp47;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    try {
      const u = new URL(location.href);
      lang === "en" ? u.searchParams.delete("lang") : u.searchParams.set("lang", lang);
      history.replaceState(null, "", u);
    } catch { /* file:// disallows replaceState; harmless */ }
  }, [lang, dir, meta.bcp47]);
  useEffect(() => { location.hash = view === "inventory" ? "inventory" : ""; }, [view]);
  return { lang, setLang, dir, meta, view, setView } as const;
}

export function HostBar(p: {
  candidate: string; lang: Lang; setLang: (l: Lang) => void;
  view: View; setView: (v: View) => void; note: ReactNode;
  /** Which of the seven languages this library localises its OWN internals for. */
  localePacks: Lang[] | "none";
}) {
  const covered = !p.localePacks || p.localePacks === "none" ? [] : p.localePacks;
  const n = covered.length;
  const badge = n === 7 ? "ok" : n === 0 ? "bad" : "part";
  return (
    <>
      <div className="hc-bar" dir="ltr">
        <strong>DELTA UI evaluation</strong>
        <span style={{ opacity: .6 }}>·</span>
        <span>{p.candidate}</span>
        <span className="hc-spacer" />
        <div className="hc-seg" role="group" aria-label="View">
          <button aria-pressed={p.view === "screen"} onClick={() => p.setView("screen")}>DELTA screen</button>
          <button aria-pressed={p.view === "inventory"} onClick={() => p.setView("inventory")}>Inventory</button>
        </div>
        <label className="hc-lang">
          <span>Language</span>
          <select value={p.lang} onChange={(e) => p.setLang(e.target.value as Lang)}>
            {LANGS.map(l => (
              <option key={l.code} value={l.code}>
                {l.label}{l.code === "en" ? " (default)" : ` — ${l.native}`}{l.dir === "rtl" ? " · RTL" : ""}
              </option>))}
          </select>
        </label>
        <span className={`hc-badge ${badge}`} title="Languages for which this library localises its own internal strings — pagination, empty states, select-all, date pickers.">
          library locales {n}/7
        </span>
        <a href="../index.html">← All candidates</a>
      </div>
      <div className="hc-note" dir="ltr">{p.note}</div>
    </>
  );
}

export function Cell({ title, children }: { title: string; children: ReactNode }) {
  return <div className="hc-cell"><h4>{title}</h4><div className="hc-row">{children}</div></div>;
}

export const fmt = (n: number, lang: Lang) =>
  new Intl.NumberFormat(langMeta(lang).bcp47).format(n);
export const fmtDate = (iso: string, lang: Lang) =>
  new Intl.DateTimeFormat(langMeta(lang).bcp47,
    { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
