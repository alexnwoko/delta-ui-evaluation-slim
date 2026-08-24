import { useMemo, useState } from "react";
import "./index.css";
import { Dialog, Select, Tabs, Checkbox, Switch, Slider, Tooltip, Direction, Separator, Progress } from "radix-ui";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronsUpDown, Info, Check } from "lucide-react";
import { records, STR, HAZARDS, type Rec } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";



/* shadcn-style components: generated INTO the repo, not installed from a vendor.
   Note every class uses logical utilities (ms-/me-/ps-/pe-/start-/end-/text-start),
   which is what makes the RTL switch free. */
const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const Btn = ({ variant = "default", className = "", ...p }: any) => (
  <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-9 px-3 transition-colors disabled:opacity-50 ${ring} ${
    variant === "default" ? "bg-brand-600 text-white hover:bg-brand-500"
    : variant === "danger" ? "bg-red-600 text-white hover:bg-red-500"
    : variant === "ghost" ? "text-gray-700 hover:bg-gray-100"
    : "border border-gray-300 bg-white hover:bg-gray-50"} ${className}`} />
);
const Field = ({ label, children }: any) => (
  <label className="flex flex-col gap-1 text-start"><span className="text-xs font-semibold text-gray-600">{label}</span>{children}</label>
);
const Inp = (p: any) => <input {...p} className={`h-9 rounded-md border border-gray-300 bg-white px-3 text-sm ${ring} ${p.className ?? ""}`} />;
const Badge = ({ tone, children }: any) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
    tone === "ok" ? "bg-green-100 text-green-800" : tone === "info" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{children}</span>
);
function Picker({ value, onChange, placeholder, items }: any) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={`inline-flex h-9 min-w-[190px] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm ${ring}`}>
        <Select.Value placeholder={placeholder} /><ChevronDown size={15} aria-hidden />
      </Select.Trigger>
      <Select.Portal><Select.Content className="z-50 rounded-md border border-gray-200 bg-white shadow-lg" position="popper" sideOffset={4}>
        <Select.Viewport className="p-1">
          {items.map(([v, l]: [string, string]) => (
            <Select.Item key={v} value={v} className="flex cursor-default items-center gap-2 rounded px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-brand-50">
              <Select.ItemIndicator><Check size={14} /></Select.ItemIndicator><Select.ItemText>{l}</Select.ItemText>
            </Select.Item>))}
        </Select.Viewport>
      </Select.Content></Select.Portal>
    </Select.Root>
  );
}

function Screen({ lang }: any) {
  const t = STR[lang];
  const [q, setQ] = useState("");
  const [hz, setHz] = useState("__all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [target, setTarget] = useState<Rec | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const data = useMemo(() => records.filter(r =>
    (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
    (hz === "__all" || r.hazard === hz)), [q, hz]);

  const columns = useMemo<ColumnDef<Rec>[]>(() => [
    { accessorKey: "id", header: t.id },
    { accessorKey: "event", header: t.event, cell: ({ row }) => `${t.haz[row.original.hazard as keyof typeof t.haz]} — ${row.original.event}` },
    { accessorKey: "country", header: t.country },
    { accessorKey: "date", header: t.date, cell: (c) => fmtDate(c.getValue() as string, lang) },
    { accessorKey: "deaths", header: t.deaths, cell: (c) => <span className="tabular-nums">{fmt(c.getValue() as number, lang)}</span> },
    { accessorKey: "affected", header: t.affected, cell: (c) => <span className="tabular-nums">{fmt(c.getValue() as number, lang)}</span> },
    { accessorKey: "damages", header: t.damages, cell: (c) => <span className="tabular-nums">{fmt(c.getValue() as number, lang)}</span> },
    { accessorKey: "status", header: t.status, enableSorting: false, cell: (c) => {
        const s = c.getValue() as Rec["status"];
        return <Badge tone={s === "Approved" ? "ok" : s === "Submitted" ? "info" : "warn"}>
          {s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft}</Badge>; } },
    { id: "actions", header: t.actions, cell: ({ row }) => (
        <div className="flex gap-1">
          <Btn variant="ghost" aria-label={t.edit} onClick={() => setTarget(row.original)}><Pencil size={15} /></Btn>
          <Btn variant="ghost" aria-label={t.del} onClick={() => setTarget(row.original)}><Trash2 size={15} /></Btn>
        </div>) },
  ], [lang, t]);

  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <h1 className="mb-3 text-3xl font-semibold">{t.title}</h1>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden />{t.sub}
      </div>
      <div className="rounded-card border border-gray-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label={t.search}><div className="relative">
            <Search size={15} className="pointer-events-none absolute inset-block-0 my-auto ms-3 text-gray-400" aria-hidden />
            <Inp value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="DR-1000" className="ps-9" />
          </div></Field>
          <Field label={t.hazard}><Picker value={hz} onChange={setHz} placeholder={t.allHazards} items={[["__all", t.allHazards], ...HAZARDS.map(h => [h, t.haz[h]])]} /></Field>
          <Btn onClick={() => setTarget(records[0])}><Plus size={15} aria-hidden />{t.add}</Btn>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>{table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-gray-200">
                {hg.headers.map(h => (
                  <th key={h.id} className="whitespace-nowrap px-3 py-2 text-start font-semibold text-gray-600"
                      aria-sort={h.column.getIsSorted() === "asc" ? "ascending" : h.column.getIsSorted() === "desc" ? "descending" : "none"}>
                    {h.column.getCanSort() ? (
                      <button onClick={h.column.getToggleSortingHandler()} className={`inline-flex items-center gap-1 rounded ${ring}`}>
                        {flexRender(h.column.columnDef.header, h.getContext())}<ChevronsUpDown size={13} className="text-gray-400" aria-hidden />
                      </button>) : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>))}
              </tr>))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/70">
                  {row.getVisibleCells().map(cell => <td key={cell.id} className="px-3 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                </tr>))}
              {!table.getRowModel().rows.length && <tr><td colSpan={9} className="p-8 text-center text-gray-500">{t.noData}</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
          <Btn variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</Btn>
          <span>{fmt(table.getState().pagination.pageIndex + 1, lang)} / {fmt(table.getPageCount(), lang)} — {fmt(data.length, lang)} {t.of}</span>
          <Btn variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</Btn>
        </div>
      </div>

      <Dialog.Root open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45" />
          <Dialog.Content className="fixed start-1/2 top-1/2 z-50 w-[min(32rem,92vw)] -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="text-lg font-semibold">{t.confirm}</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">{t.confirmBody.replace("{id}", target?.id ?? "")}</Dialog.Description>
            <div className="mt-3"><Field label={t.reason}>
              <textarea rows={3} className={`w-full rounded-md border border-gray-300 p-2 text-sm ${ring}`} /></Field></div>
            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild><Btn variant="outline">{t.cancel}</Btn></Dialog.Close>
              <Btn variant="danger" onClick={() => { setToast(t.deletedBody.replace("{id}", target?.id ?? "")); setTarget(null); setTimeout(() => setToast(null), 4000); }}>{t.del}</Btn>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {toast && <div role="status" className="fixed end-4 top-24 z-50 rounded-lg border border-green-300 border-s-4 bg-white p-3 shadow-xl">
        <div className="font-semibold">{t.deleted}</div><div className="text-sm text-gray-600">{toast}</div></div>}
    </Tooltip.Provider>
  );
}

function Inventory({ lang }: any) {
  const t = STR[lang];
  return (
    <Tooltip.Provider>
      <div className="hc-h">Inputs</div>
      <div className="hc-grid">
        <Cell title="Button"><Btn>Primary</Btn><Btn variant="outline">Outline</Btn><Btn variant="danger">Danger</Btn>
          <Btn variant="ghost">Ghost</Btn><Btn disabled>Disabled</Btn></Cell>
        <Cell title="Input"><Inp placeholder={t.search} /><Inp type="password" placeholder="Password" /></Cell>
        <Cell title="Select"><Picker placeholder={t.allHazards} items={HAZARDS.map(h => [h, t.haz[h]])} /></Cell>
        <Cell title="Checkbox / Switch">
          <Checkbox.Root className="flex size-5 items-center justify-center rounded border-2 border-gray-300 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600">
            <Checkbox.Indicator><Check size={13} className="text-white" /></Checkbox.Indicator></Checkbox.Root>
          <Switch.Root className="h-5 w-9 rounded-full bg-gray-300 p-0.5 data-[state=checked]:bg-brand-600">
            <Switch.Thumb className="block size-4 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4" /></Switch.Root></Cell>
        <Cell title="Slider"><Slider.Root className="relative flex h-5 w-40 items-center" defaultValue={[40]}>
          <Slider.Track className="relative h-1.5 grow rounded-full bg-gray-200"><Slider.Range className="absolute h-full rounded-full bg-brand-600" /></Slider.Track>
          <Slider.Thumb className={`block size-4 rounded-full bg-brand-600 ${ring}`} aria-label="Threshold" /></Slider.Root></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Badge"><Badge tone="ok">{t.approved}</Badge><Badge tone="info">{t.submitted}</Badge><Badge tone="warn">{t.draft}</Badge></Cell>
        <Cell title="Progress"><Progress.Root value={62} className="h-2 w-44 overflow-hidden rounded-full bg-gray-200">
          <Progress.Indicator className="h-full bg-brand-600" style={{ width: "62%" }} /></Progress.Root></Cell>
        <Cell title="Tooltip"><Tooltip.Root><Tooltip.Trigger asChild><Btn variant="outline">Hover me</Btn></Tooltip.Trigger>
          <Tooltip.Portal><Tooltip.Content className="rounded bg-gray-900 px-2 py-1 text-xs text-white" sideOffset={5}>Method grade A</Tooltip.Content></Tooltip.Portal></Tooltip.Root></Cell>
        <Cell title="Separator"><Separator.Root className="h-px w-full bg-gray-200" /></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumb"><nav aria-label="Breadcrumb"><ol className="flex gap-2 text-sm text-gray-600">
          <li>DELTA</li><li aria-hidden>/</li><li>Records</li><li aria-hidden>/</li><li className="font-semibold text-gray-900">DR-1000</li></ol></nav></Cell>
        <Cell title="Tabs"><Tabs.Root defaultValue="h" className="w-full"><Tabs.List className="flex gap-1 border-b border-gray-200">
          {[["h", "Human effects"], ["d", "Damages"], ["l", "Losses"]].map(([v, l]) => (
            <Tabs.Trigger key={v} value={v} className={`px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-brand-600 data-[state=active]:font-semibold data-[state=active]:text-brand-700 ${ring}`}>{l}</Tabs.Trigger>))}
          </Tabs.List><Tabs.Content value="h" className="pt-3 text-sm">Deaths, missing, injured, affected.</Tabs.Content>
          <Tabs.Content value="d" className="pt-3 text-sm">Physical asset damage.</Tabs.Content>
          <Tabs.Content value="l" className="pt-3 text-sm">Economic flow losses.</Tabs.Content></Tabs.Root></Cell>
        <Cell title="Dialog"><Dialog.Root><Dialog.Trigger asChild><Btn variant="outline">Open dialog</Btn></Dialog.Trigger>
          <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-black/45" />
            <Dialog.Content className="fixed start-1/2 top-1/2 z-50 w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2 rounded-xl bg-white p-6 shadow-2xl">
              <Dialog.Title className="text-lg font-semibold">{t.confirm}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-600">Focus is trapped and Escape closes.</Dialog.Description>
              <div className="mt-4 flex justify-end"><Dialog.Close asChild><Btn variant="outline">{t.cancel}</Btn></Dialog.Close></div>
            </Dialog.Content></Dialog.Portal></Dialog.Root></Cell>
      </div>
    </Tooltip.Provider>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  return (
    <Direction.Provider dir={dir}>
      <HostBar candidate="Radix UI + shadcn-style + TanStack Table (UNDP-aligned)" lang={lang} setLang={setLang} view={view} setView={setView}
        localePacks="none"
        note={<><b>What to look at:</b> the components are ~90 lines of code <i>in this repo</i>, not a dependency — which is why
          nothing here can be relicensed out from under DELTA. Every class is a Tailwind <b>logical</b> utility
          (<code>ms-</code>, <code>pe-</code>, <code>start-</code>, <code>text-start</code>), so Arabic is a browser behaviour, not a
          build step; Radix's <code>DirectionProvider</code> flips arrow-key and popover behaviour. The grid is TanStack Table v8 (MIT).
          <b> The honest cost is visible in the language switcher:</b> every string you see is one DELTA wrote, because
          there are no vendor locale packs to inherit. Number and date formatting come from the platform
          <code>Intl</code> API, but component chrome is yours to translate — which is also why it can never be
          half-translated by a vendor upgrade. This is the exact stack UNDP's own React design system is built on.</>} />
      <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
    </Direction.Provider>
  );
}
