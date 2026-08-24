import { useMemo, useState } from "react";
import "./app.scss";
import {
  unstable_LayoutDirection as LayoutDirection, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
  TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, TableSelectRow,
  TableSelectAll, Button, Dropdown, Modal, Tag, Tile, InlineNotification, ToastNotification,
  Pagination, TextArea, TextInput, Checkbox, RadioButton, Toggle, Slider, NumberInput,
  Tabs, TabList, TabPanels, TabPanel, Tab, Breadcrumb, BreadcrumbItem, ProgressBar,
  ProgressIndicator, ProgressStep, TreeView, TreeNode, Search, Link, Loading, DatePicker,
  DatePickerInput,
} from "@carbon/react";
import { Add, Edit, TrashCan } from "@carbon/icons-react";
import { records, STR, HAZARDS, type Rec } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";



function Screen({ lang }: any) {
  const t = STR[lang];
  const [q, setQ] = useState("");
  const [hz, setHz] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [target, setTarget] = useState<Rec | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const headers = [
    { key: "id", header: t.id }, { key: "event", header: t.event }, { key: "country", header: t.country },
    { key: "date", header: t.date }, { key: "deaths", header: t.deaths }, { key: "affected", header: t.affected },
    { key: "damages", header: t.damages }, { key: "status", header: t.status },
  ];

  const filtered = useMemo(() => records.filter(r =>
    (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
    (!hz || r.hazard === hz)), [q, hz]);

  const rows = filtered.slice((page - 1) * size, page * size).map(r => ({
    ...r, event: `${t.haz[r.hazard as keyof typeof t.haz]} — ${r.event}`, date: fmtDate(r.date, lang), deaths: fmt(r.deaths, lang),
    affected: fmt(r.affected, lang), damages: fmt(r.damages, lang),
  }));
  const tone = (s: string) => s === "Approved" ? "green" : s === "Submitted" ? "blue" : "gray";
  const label = (s: string) => s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <InlineNotification kind="info" lowContrast hideCloseButton title="" subtitle={t.sub} style={{ maxWidth: "none", marginBottom: 16 }} />
      {toast && <ToastNotification kind="success" lowContrast title={t.deleted} subtitle={toast} onClose={() => setToast(null)}
        style={{ position: "fixed", insetInlineEnd: 16, insetBlockStart: 90, zIndex: 30 }} />}
      <Tile>
        <DataTable rows={rows as any} headers={headers} isSortable>
          {({ rows: r, headers: h, getHeaderProps, getRowProps, getTableProps, getSelectionProps }: any) => (
            <TableContainer title={t.title} description={`${fmt(filtered.length, lang)} ${t.of}`}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch placeholder={t.search} onChange={(e: any) => { setQ(e?.target?.value ?? ""); setPage(1); }} persistent />
                  <div style={{ inlineSize: 220 }}>
                    <Dropdown id="hz" items={[...HAZARDS]} itemToString={(i: any) => (i ? t.haz[i as keyof typeof t.haz] : "")} selectedItem={hz} titleText="" label={t.allHazards} size="lg"
                      onChange={({ selectedItem }: any) => { setHz(selectedItem); setPage(1); }} />
                  </div>
                  <Button renderIcon={Add} onClick={() => setTarget(records[0])}>{t.add}</Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} size="sm" useZebraStyles>
                <TableHead>
                  <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {h.map((header: any) => <TableHeader key={header.key} {...getHeaderProps({ header })}>{header.header}</TableHeader>)}
                    <TableHeader>{t.actions}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {r.map((row: any) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableSelectRow {...getSelectionProps({ row })} />
                      {row.cells.map((cell: any) => (
                        <TableCell key={cell.id}>
                          {cell.info.header === "status" ? <Tag type={tone(cell.value) as any} size="sm">{label(cell.value)}</Tag> : cell.value}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button kind="ghost" size="sm" hasIconOnly renderIcon={Edit} iconDescription={t.edit}
                          onClick={() => setTarget(records.find(x => x.id === row.id) ?? null)} />
                        <Button kind="ghost" size="sm" hasIconOnly renderIcon={TrashCan} iconDescription={t.del}
                          onClick={() => setTarget(records.find(x => x.id === row.id) ?? null)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <Pagination page={page} pageSize={size} pageSizes={[10, 25, 50]} totalItems={filtered.length}
          onChange={({ page: p, pageSize: ps }: any) => { setPage(p); setSize(ps); }} />
      </Tile>
      <Modal open={!!target} modalHeading={t.confirm} primaryButtonText={t.del} secondaryButtonText={t.cancel} danger
        onRequestClose={() => setTarget(null)}
        onRequestSubmit={() => { setToast(t.deletedBody.replace("{id}", target?.id ?? "")); setTarget(null); }}>
        <p style={{ marginBottom: 12 }}>{t.confirmBody.replace("{id}", target?.id ?? "")}</p>
        <TextArea labelText={t.reason} rows={3} id="reason" />
      </Modal>
    </>
  );
}

function Inventory({ lang }: any) {
  const t = STR[lang];
  return (
    <>
      <div className="hc-h">Inputs</div>
      <div className="hc-grid">
        <Cell title="Button"><Button size="sm">Primary</Button><Button kind="secondary" size="sm">Secondary</Button>
          <Button kind="danger" size="sm">Danger</Button><Button kind="ghost" size="sm">Ghost</Button></Cell>
        <Cell title="Text input"><TextInput id="ti" labelText={t.search} size="sm" /></Cell>
        <Cell title="Number"><NumberInput id="ni" label={t.deaths} value={1200} size="sm" /></Cell>
        <Cell title="Search"><Search size="sm" labelText={t.search} placeholder={t.search} /></Cell>
        <Cell title="Dropdown"><div style={{ inlineSize: "100%" }}><Dropdown id="dd" items={[...HAZARDS]} itemToString={(i: any) => (i ? t.haz[i as keyof typeof t.haz] : "")} label={t.allHazards} titleText="" size="sm" /></div></Cell>
        <Cell title="Date"><DatePicker datePickerType="single"><DatePickerInput id="dp" labelText={t.date} placeholder="dd/mm/yyyy" size="sm" /></DatePicker></Cell>
        <Cell title="Choice"><Checkbox id="cb" labelText="Validated" /><RadioButton id="rb" labelText="Areal" /><Toggle id="tg" labelText="" labelA="Off" labelB="On" size="sm" /></Cell>
        <Cell title="Slider"><Slider id="sl" min={0} max={100} value={40} labelText="" /></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Tag"><Tag type="green">{t.approved}</Tag><Tag type="blue">{t.submitted}</Tag><Tag type="gray">{t.draft}</Tag></Cell>
        <Cell title="Progress"><div style={{ inlineSize: "100%" }}><ProgressBar label="Completeness" value={62} size="small" /></div></Cell>
        <Cell title="Notification"><InlineNotification kind="warning" lowContrast hideCloseButton title="Grade D" subtitle="Excluded" style={{ maxWidth: "none" }} /></Cell>
        <Cell title="Loading"><Loading small withOverlay={false} /></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumb"><Breadcrumb noTrailingSlash><BreadcrumbItem><Link href="#">DELTA</Link></BreadcrumbItem>
          <BreadcrumbItem><Link href="#">Records</Link></BreadcrumbItem><BreadcrumbItem isCurrentPage>DR-1000</BreadcrumbItem></Breadcrumb></Cell>
        <Cell title="Tabs"><div style={{ inlineSize: "100%" }}><Tabs><TabList aria-label="Sections"><Tab>Human effects</Tab><Tab>Damages</Tab><Tab>Losses</Tab></TabList>
          <TabPanels><TabPanel>Deaths, missing, injured.</TabPanel><TabPanel>Asset damage.</TabPanel><TabPanel>Economic losses.</TabPanel></TabPanels></Tabs></div></Cell>
        <Cell title="Progress indicator"><ProgressIndicator currentIndex={1} spaceEqually><ProgressStep label="Draft" /><ProgressStep label="Review" /><ProgressStep label="Approved" /></ProgressIndicator></Cell>
        <Cell title="Tree"><div style={{ inlineSize: "100%" }}><TreeView label="Geography" hideLabel><TreeNode id="k" label="Kenya" isExpanded>
          <TreeNode id="n" label="Nairobi" /><TreeNode id="m" label="Mombasa" /></TreeNode></TreeView></div></Cell>
        <Cell title="Pagination"><div style={{ inlineSize: "100%" }}><Pagination page={2} pageSize={10} pageSizes={[10, 25]} totalItems={120} /></div></Cell>
      </div>
    </>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  return (
    <LayoutDirection dir={dir}>
      <HostBar candidate="IBM Carbon 1.113.0" lang={lang} setLang={setLang} view={view} setView={setView}
        localePacks="none"
        note={<><b>What to look at — change the language, then read the table furniture.</b> The content translates
          because DELTA translated it, but <b>every string Carbon owns stays in English in all seven languages</b>:
          "Items per page", "of 12 pages", "Select all rows", the sort tooltips, the date picker. Carbon ships
          <b> no locale packs at all</b>; each string is a per-component <code>translateWithId</code> callback DELTA
          would write and then maintain across seven languages and every Carbon upgrade. Arabic mirrors the layout
          because Carbon moved to CSS logical properties in 2023 — but note this file's import: the direction provider
          is exported only as <code>unstable_LayoutDirection</code>, still a preview API four years after the RTL
          request was closed as completed. Carbon's compensation is the strongest published accessibility evidence in
          this field — per-component conformance status and automated IBM Equal Access checks on every PR.</>} />
      <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
    </LayoutDirection>
  );
}
