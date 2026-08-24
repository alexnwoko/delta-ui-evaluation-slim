import { useMemo, useState } from "react";
import "./aria.css";
import {
  I18nProvider, Button, TextField, Label, Input, TextArea, Select, SelectValue, ListBox,
  ListBoxItem, Popover, Table, TableHeader, TableBody, Column, Row, Cell as TCell,
  DialogTrigger, ModalOverlay, Modal, Dialog, Heading, Checkbox, Switch, Slider, SliderTrack,
  SliderThumb, Tabs, TabList, Tab, TabPanel, Breadcrumbs, Breadcrumb, DatePicker, Group,
  DateInput, DateSegment, Meter, NumberField, ToggleButton, type SortDescriptor,
} from "react-aria-components";
import { Plus, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { records, STR, HAZARDS, langMeta, type Rec } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";

const PAGE = 10;

function Screen({ lang }: any) {
  const t = STR[lang];
  const [q, setQ] = useState("");
  const [hz, setHz] = useState<string>("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortDescriptor>({ column: "id", direction: "ascending" });
  const [target, setTarget] = useState<Rec | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const f = records.filter(r =>
      (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
      (!hz || r.hazard === hz));
    const k = sort.column as keyof Rec;
    const s = [...f].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0));
    return sort.direction === "descending" ? s.reverse() : s;
  }, [q, hz, sort]);
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const tagCls = (s: Rec["status"]) => s === "Approved" ? "tag ok" : s === "Submitted" ? "tag info" : "tag warn";
  const label = (s: Rec["status"]) => s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft;

  return (
    <div className="ui">
      <h1>{t.title}</h1>
      <div className="alert">{t.sub}</div>
      <div className="card">
        <div className="toolbar">
          <TextField className="field" value={q} onChange={(v) => { setQ(v); setPage(0); }}>
            <Label>{t.search}</Label>
            <Input placeholder="DR-1000" />
          </TextField>
          <Select className="field" selectedKey={hz || "__all"} onSelectionChange={(k) => { setHz(k === "__all" ? "" : String(k)); setPage(0); }}>
            <Label>{t.hazard}</Label>
            <Button className="sel-btn"><SelectValue /><ChevronDown size={15} aria-hidden /></Button>
            <Popover className="popover">
              <ListBox>
                <ListBoxItem className="listitem" id="__all">{t.allHazards}</ListBoxItem>
                {HAZARDS.map(h => <ListBoxItem className="listitem" key={h} id={h}>{t.haz[h]}</ListBoxItem>)}
              </ListBox>
            </Popover>
          </Select>
          <DatePicker className="field">
            <Label>{t.date}</Label>
            <Group className="dateinput"><DateInput>{(seg) => <DateSegment className="dateseg" segment={seg} />}</DateInput></Group>
          </DatePicker>
          <Button className="btn primary" onPress={() => setTarget(records[0])}><Plus size={15} aria-hidden />{t.add}</Button>
        </div>

        <Table className="grid" aria-label={t.title} selectionMode="multiple"
               sortDescriptor={sort} onSortChange={setSort}>
          <TableHeader>
            <Column id="id" isRowHeader allowsSorting>{t.id}</Column>
            <Column id="event" allowsSorting>{t.event}</Column>
            <Column id="country" allowsSorting>{t.country}</Column>
            <Column id="date" allowsSorting>{t.date}</Column>
            <Column id="deaths" allowsSorting>{t.deaths}</Column>
            <Column id="affected">{t.affected}</Column>
            <Column id="damages">{t.damages}</Column>
            <Column id="status">{t.status}</Column>
            <Column id="actions">{t.actions}</Column>
          </TableHeader>
          <TableBody renderEmptyState={() => t.noData}>
            {rows.map(r => (
              <Row key={r.id} id={r.id}>
                <TCell>{r.id}</TCell>
                <TCell>{t.haz[r.hazard as keyof typeof t.haz]} — {r.event}</TCell>
                <TCell>{r.country}</TCell>
                <TCell>{fmtDate(r.date, lang)}</TCell>
                <TCell className="num">{fmt(r.deaths, lang)}</TCell>
                <TCell className="num">{fmt(r.affected, lang)}</TCell>
                <TCell className="num">{fmt(r.damages, lang)}</TCell>
                <TCell><span className={tagCls(r.status)}>{label(r.status)}</span></TCell>
                <TCell>
                  <Button className="btn ghost icon" aria-label={t.edit} onPress={() => setTarget(r)}><Pencil size={15} aria-hidden /></Button>
                  <Button className="btn ghost icon" aria-label={t.del} onPress={() => setTarget(r)}><Trash2 size={15} aria-hidden /></Button>
                </TCell>
              </Row>
            ))}
          </TableBody>
        </Table>

        <div className="pager">
          <Button className="btn" isDisabled={page === 0} onPress={() => setPage(p => p - 1)}>‹</Button>
          <span>{fmt(page + 1, lang)} / {fmt(pages, lang)} — {fmt(filtered.length, lang)} {t.of}</span>
          <Button className="btn" isDisabled={page >= pages - 1} onPress={() => setPage(p => p + 1)}>›</Button>
        </div>
      </div>

      <DialogTrigger isOpen={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <ModalOverlay className="overlay" isDismissable>
          <Modal className="modal">
            <Dialog>
              <Heading slot="title">{t.confirm}</Heading>
              <p>{t.confirmBody.replace("{id}", target?.id ?? "")}</p>
              <TextField className="field" style={{ marginBlockStart: 12 }}>
                <Label>{t.reason}</Label><TextArea rows={3} />
              </TextField>
              <div className="actions">
                <Button className="btn" onPress={() => setTarget(null)}>{t.cancel}</Button>
                <Button className="btn danger" onPress={() => { setToast(`${t.deleted} — ${target?.id}`); setTarget(null); setTimeout(() => setToast(null), 4000); }}>{t.del}</Button>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>

      {toast && <div className="toast" role="status"><strong>{t.deleted}</strong><div style={{ fontSize: 13, color: "#4b5563" }}>{t.deletedBody.replace("{id}", "")}</div></div>}
    </div>
  );
}

function Inventory({ lang }: any) {
  const t = STR[lang];
  return (
    <div className="ui">
      <div className="hc-h">Inputs</div>
      <div className="hc-grid">
        <Cell title="Button"><Button className="btn primary">Primary</Button><Button className="btn">Default</Button>
          <Button className="btn danger">Danger</Button><Button className="btn ghost">Ghost</Button>
          <Button className="btn" isDisabled>Disabled</Button></Cell>
        <Cell title="Text field"><TextField className="field"><Label>{t.search}</Label><Input /></TextField></Cell>
        <Cell title="Number field"><NumberField className="field" defaultValue={1200}><Label>{t.deaths}</Label><Input /></NumberField></Cell>
        <Cell title="Select"><Select className="field" defaultSelectedKey="Flood"><Label>{t.hazard}</Label>
          <Button className="sel-btn"><SelectValue /><ChevronDown size={15} aria-hidden /></Button>
          <Popover className="popover"><ListBox>{HAZARDS.map(h => <ListBoxItem className="listitem" key={h} id={h}>{t.haz[h]}</ListBoxItem>)}</ListBox></Popover></Select></Cell>
        <Cell title="Date picker (Hijri-capable)"><DatePicker className="field"><Label>{t.date}</Label>
          <Group className="dateinput"><DateInput>{(s) => <DateSegment className="dateseg" segment={s} />}</DateInput></Group></DatePicker></Cell>
        <Cell title="Checkbox / Switch"><Checkbox className="checkline"><span className="box" />Validated</Checkbox>
          <Switch className="checkline"><span className="sw"><span className="sw-dot" /></span>Auto-approve</Switch></Cell>
        <Cell title="Toggle"><ToggleButton className="btn">As-recorded</ToggleButton></Cell>
        <Cell title="Slider"><Slider defaultValue={40}><Label style={{ fontSize: 12 }}>Threshold</Label>
          <SliderTrack className="slider-track">{({ state }) => <SliderThumb className="slider-thumb" />}</SliderTrack></Slider></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Status"><span className="tag ok">{t.approved}</span><span className="tag info">{t.submitted}</span><span className="tag warn">{t.draft}</span></Cell>
        <Cell title="Meter"><Meter value={62}><Label style={{ fontSize: 12 }}>Completeness</Label>
          {({ percentage }) => <div className="meter-track"><div className="meter-fill" style={{ width: percentage + "%" }} /></div>}</Meter></Cell>
        <Cell title="Alert"><div className="alert" style={{ margin: 0 }}>Grade D excluded from official reporting</div></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumbs"><Breadcrumbs className="crumbs"><Breadcrumb>DELTA</Breadcrumb><Breadcrumb>Records</Breadcrumb><Breadcrumb>DR-1000</Breadcrumb></Breadcrumbs></Cell>
        <Cell title="Tabs"><Tabs style={{ width: "100%" }}><TabList className="tabs" aria-label="Sections">
          <Tab className="tab" id="h">Human effects</Tab><Tab className="tab" id="d">Damages</Tab><Tab className="tab" id="l">Losses</Tab></TabList>
          <TabPanel id="h" style={{ paddingBlockStart: 10, fontSize: 13 }}>Deaths, missing, injured, affected.</TabPanel>
          <TabPanel id="d" style={{ paddingBlockStart: 10, fontSize: 13 }}>Physical asset damage.</TabPanel>
          <TabPanel id="l" style={{ paddingBlockStart: 10, fontSize: 13 }}>Economic flow losses.</TabPanel></Tabs></Cell>
        <Cell title="Modal"><DialogTrigger><Button className="btn">Open dialog</Button>
          <ModalOverlay className="overlay" isDismissable><Modal className="modal"><Dialog>
            {({ close }) => (<><Heading slot="title">{t.confirm}</Heading><p>Focus is trapped, Escape closes, focus returns to the trigger.</p>
              <div className="actions"><Button className="btn" onPress={close}>{t.cancel}</Button></div></>)}
          </Dialog></Modal></ModalOverlay></DialogTrigger></Cell>
      </div>
    </div>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  return (
    <I18nProvider locale={langMeta(lang).bcp47}>
      <HostBar candidate="Adobe React Aria Components 1.20.0" lang={lang} setLang={setLang} view={view} setView={setView}
        localePacks={["en","fr","es","ru","zh","pt","ar"]}
        note={<><b>What to look at:</b> nothing here is styled by a vendor — every pixel is ~150 lines of hand-written CSS
          using <b>logical properties</b>, which is why Arabic needs no plugin and no second style cache. A single
          <code>I18nProvider locale</code> drives direction, number and date formatting, and React Aria's own internal
          strings across 30+ languages. Try the table with a keyboard in any language: arrow keys, Home/End, type-ahead,
          Shift+click range select — that behaviour is what you are buying. Apache-2.0, the same licence as DELTA.</>} />
      <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
    </I18nProvider>
  );
}
