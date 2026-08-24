import { useMemo, useRef, useState } from "react";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Checkbox } from "primereact/checkbox";
import { RadioButton } from "primereact/radiobutton";
import { InputSwitch } from "primereact/inputswitch";
import { Slider } from "primereact/slider";
import { TabView, TabPanel } from "primereact/tabview";
import { BreadCrumb } from "primereact/breadcrumb";
import { Tree } from "primereact/tree";
import { Steps } from "primereact/steps";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { records, STR, HAZARDS, type Rec } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";



function Screen({ lang }: any) {
  const t = STR[lang];
  const toast = useRef<Toast>(null);
  const [q, setQ] = useState("");
  const [hz, setHz] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [target, setTarget] = useState<Rec | null>(null);

  const filtered = useMemo(() => records.filter(r =>
    (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
    (!hz || r.hazard === hz)), [q, hz]);
  const page = filtered.slice(first, first + rows);

  const sev = (s: Rec["status"]) => s === "Approved" ? "success" : s === "Submitted" ? "info" : "warning";
  const label = (s: Rec["status"]) => s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft;

  return (
    <>
      <Toast ref={toast} position={lang === "ar" ? "top-left" : "top-right"} />
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <Message severity="info" text={t.sub} style={{ width: "100%", justifyContent: "flex-start", marginBottom: 16 }} />
      <Card>
        <div className="flex gap-2" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <span className="p-input-icon-left">
            <InputText value={q} onChange={(e) => { setQ(e.target.value); setFirst(0); }} placeholder={t.search} />
          </span>
          <Dropdown value={hz} options={HAZARDS.map(h => ({ value: h, label: t.haz[h] }))} optionLabel="label" optionValue="value" onChange={(e) => { setHz(e.value); setFirst(0); }}
                    placeholder={t.allHazards} showClear filter style={{ minWidth: 200 }} />
          <Calendar placeholder={t.date} showIcon />
          <Button label={t.add} icon="pi pi-plus" onClick={() => setTarget(records[0])} />
        </div>
        <DataTable value={page} dataKey="id" emptyMessage={t.noData} stripedRows size="small" scrollable>
          <Column field="id" header={t.id} sortable />
          <Column header={t.event} sortable body={(r: Rec) => `${t.haz[r.hazard as keyof typeof t.haz]} — ${r.event}`} />
          <Column field="country" header={t.country} />
          <Column header={t.date} body={(r: Rec) => fmtDate(r.date, lang)} />
          <Column header={t.deaths} bodyClassName="text-right" body={(r: Rec) => fmt(r.deaths, lang)} />
          <Column header={t.affected} bodyClassName="text-right" body={(r: Rec) => fmt(r.affected, lang)} />
          <Column header={t.damages} bodyClassName="text-right" body={(r: Rec) => fmt(r.damages, lang)} />
          <Column header={t.status} body={(r: Rec) => <Tag value={label(r.status)} severity={sev(r.status)} />} />
          <Column header={t.actions} body={(r: Rec) => (
            <div style={{ display: "flex", gap: 4 }}>
              <Button icon="pi pi-pencil" text aria-label={t.edit} onClick={() => setTarget(r)} />
              <Button icon="pi pi-trash" text severity="danger" aria-label={t.del} onClick={() => setTarget(r)} />
            </div>)} />
        </DataTable>
        <Paginator first={first} rows={rows} totalRecords={filtered.length} rowsPerPageOptions={[10, 25, 50]}
                   onPageChange={(e) => { setFirst(e.first); setRows(e.rows); }} />
      </Card>
      <Dialog header={t.confirm} visible={!!target} onHide={() => setTarget(null)} style={{ width: "32rem" }}
        footer={<div>
          <Button label={t.cancel} outlined onClick={() => setTarget(null)} />
          <Button label={t.del} severity="danger" onClick={() => {
            toast.current?.show({ severity: "success", summary: t.deleted, detail: t.deletedBody.replace("{id}", target?.id ?? "") });
            setTarget(null);
          }} />
        </div>}>
        <p>{t.confirmBody.replace("{id}", target?.id ?? "")}</p>
        <InputTextarea rows={3} placeholder={t.reason} style={{ width: "100%" }} />
      </Dialog>
    </>
  );
}

function Inventory({ lang }: any) {
  const t = STR[lang];
  return (
    <>
      <div className="hc-h">Inputs</div>
      <div className="hc-grid">
        <Cell title="Button"><Button label="Primary" /><Button label="Outlined" outlined /><Button label="Danger" severity="danger" /><Button label="Text" text /></Cell>
        <Cell title="Text input"><InputText placeholder={t.search} /><Password placeholder="Password" toggleMask feedback={false} /></Cell>
        <Cell title="Number"><InputNumber value={1200} /></Cell>
        <Cell title="Dropdown"><Dropdown options={HAZARDS.map(h => t.haz[h])} placeholder={t.allHazards} style={{ minWidth: 170 }} />
          <MultiSelect options={HAZARDS.map(h => t.haz[h])} placeholder="Multi" display="chip" style={{ minWidth: 170 }} /></Cell>
        <Cell title="Calendar"><Calendar showIcon placeholder={t.date} /></Cell>
        <Cell title="Choice"><Checkbox checked /><RadioButton checked /><InputSwitch checked /></Cell>
        <Cell title="Slider"><div style={{ width: 160 }}><Slider value={40} /></div></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Tag"><Tag value={t.approved} severity="success" /><Tag value={t.submitted} severity="info" /><Tag value={t.draft} severity="warning" /></Cell>
        <Cell title="Avatar / Badge"><Avatar label="AN" /><Divider layout="vertical" /><i className="pi pi-bell p-overlay-badge" style={{ fontSize: 20 }}><Badge value="12" /></i></Cell>
        <Cell title="Progress"><div style={{ width: 180 }}><ProgressBar value={62} /></div></Cell>
        <Cell title="Message"><Message severity="warn" text="Grade D excluded" /></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumb"><BreadCrumb home={{ icon: "pi pi-home" }} model={[{ label: "Records" }, { label: "DR-1000" }]} /></Cell>
        <Cell title="TabView"><div style={{ width: "100%" }}><TabView><TabPanel header="Human effects"><span style={{ fontSize: 13 }}>Deaths, missing, injured.</span></TabPanel>
          <TabPanel header="Damages"><span style={{ fontSize: 13 }}>Asset damage.</span></TabPanel>
          <TabPanel header="Losses"><span style={{ fontSize: 13 }}>Economic losses.</span></TabPanel></TabView></div></Cell>
        <Cell title="Steps"><div style={{ width: "100%" }}><Steps activeIndex={1} model={[{ label: "Draft" }, { label: "Review" }, { label: "Approved" }]} /></div></Cell>
        <Cell title="Tree"><div style={{ width: "100%" }}><Tree value={[{ key: "k", label: "Kenya", children: [{ key: "n", label: "Nairobi" }, { key: "m", label: "Mombasa" }] }]} /></div></Cell>
        <Cell title="Paginator"><div style={{ width: "100%" }}><Paginator first={10} rows={10} totalRecords={120} /></div></Cell>
      </div>
    </>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <HostBar candidate="PrimeReact 10.9.8 — the incumbent (frozen MIT branch)" lang={lang} setLang={setLang} view={view} setView={setView}
        localePacks="none"
        note={<><b>What to look at — this is the control case: DELTA exactly as it is today.</b> Change the language and
          PrimeReact's own strings stay English in all seven — the paginator ("Showing 1 to 10 of 120"), the empty
          state, the calendar month names — because <code>addLocale()</code> is never called. That is not a demo
          shortcut: <code>addLocale</code> and <code>locale()</code> appear <b>zero times</b> in the live DELTA
          codebase. Choose Arabic and nothing mirrors either: PrimeReact 10 has no RTL mode, so icon positions,
          input-group radii, menu alignment and the paginator all stay left-to-right. PrimeReact 11 would fix much of
          this, but it is proprietary.</>} />
      <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
    </PrimeReactProvider>
  );
}
