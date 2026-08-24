import { useMemo, useState } from "react";
import {
  ConfigProvider, App as AntApp, Table, Button, Input, Select, Modal, Tag, Card, Alert, Space,
  Tabs, Checkbox, Radio, Switch, Slider, DatePicker, Breadcrumb, Menu, Tree, Pagination,
  Tooltip, Avatar, Divider, Progress, Steps, Form, InputNumber, Upload, Badge, Descriptions,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SearchOutlined } from "@ant-design/icons";
import enUS from "antd/locale/en_US";
import frFR from "antd/locale/fr_FR";
import esES from "antd/locale/es_ES";
import ruRU from "antd/locale/ru_RU";
import zhCN from "antd/locale/zh_CN";
import ptBR from "antd/locale/pt_BR";
import arEG from "antd/locale/ar_EG";
import { records, STR, HAZARDS, type Rec, type Lang } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";

/* antd ships 76 locale packs; all seven DELTA languages are covered by the library itself. */
const ANTD_LOCALE: Record<Lang, any> = { en: enUS, fr: frFR, es: esES, ru: ruRU, zh: zhCN, pt: ptBR, ar: arEG };

function Screen({ lang }: any) {
  const t = STR[lang];
  const { message } = AntApp.useApp();
  const [q, setQ] = useState("");
  const [hz, setHz] = useState<string | undefined>();
  const [target, setTarget] = useState<Rec | null>(null);

  const data = useMemo(() => records.filter(r =>
    (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
    (!hz || r.hazard === hz)), [q, hz]);

  const tone = (s: Rec["status"]) => s === "Approved" ? "success" : s === "Submitted" ? "processing" : "warning";
  const label = (s: Rec["status"]) => s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <Alert type="info" showIcon message={t.sub} style={{ marginBottom: 16 }} />
      <Card>
        <Space wrap style={{ marginBottom: 14 }}>
          <Input prefix={<SearchOutlined />} value={q} onChange={e => setQ(e.target.value)}
                 placeholder={t.search} allowClear style={{ width: 240 }} />
          <Select value={hz} onChange={setHz} allowClear showSearch style={{ width: 200 }}
                  placeholder={t.allHazards} options={HAZARDS.map(h => ({ value: h, label: t.haz[h] }))} />
          <DatePicker.RangePicker />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setTarget(records[0])}>{t.add}</Button>
        </Space>
        <Table<Rec>
          dataSource={data} rowKey="id" size="small" scroll={{ x: 900 }}
          rowSelection={{ type: "checkbox" }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 25, 50], showTotal: (n) => `${fmt(n, lang)} ${t.of}` }}
          columns={[
            { title: t.id, dataIndex: "id", sorter: (a, b) => a.id.localeCompare(b.id), fixed: "left", width: 110 },
            { title: t.event, dataIndex: "event", render: (_: any, r: Rec) => `${t.haz[r.hazard as keyof typeof t.haz]} — ${r.event}` },
            { title: t.country, dataIndex: "country", filters: [...new Set(records.map(r => r.country))].map(c => ({ text: c, value: c })), onFilter: (v, r) => r.country === v },
            { title: t.date, dataIndex: "date", render: (d) => fmtDate(d, lang), sorter: (a, b) => a.date.localeCompare(b.date) },
            { title: t.deaths, dataIndex: "deaths", align: "end", render: (n) => fmt(n, lang), sorter: (a, b) => a.deaths - b.deaths },
            { title: t.affected, dataIndex: "affected", align: "end", render: (n) => fmt(n, lang) },
            { title: t.damages, dataIndex: "damages", align: "end", render: (n) => fmt(n, lang) },
            { title: t.status, dataIndex: "status", render: (s: Rec["status"]) => <Tag color={tone(s)}>{label(s)}</Tag> },
            {
              title: t.actions, fixed: "right", width: 96, render: (_, r) => (
                <Space>
                  <Tooltip title={t.edit}><Button type="text" size="small" icon={<EditOutlined />} aria-label={t.edit} onClick={() => setTarget(r)} /></Tooltip>
                  <Tooltip title={t.del}><Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={t.del} onClick={() => setTarget(r)} /></Tooltip>
                </Space>),
            },
          ]}
        />
      </Card>
      <Modal title={t.confirm} open={!!target} onCancel={() => setTarget(null)}
             okText={t.del} cancelText={t.cancel} okButtonProps={{ danger: true }}
             onOk={() => { message.success(`${t.deleted} — ${target?.id}`); setTarget(null); }}>
        <p>{t.confirmBody.replace("{id}", target?.id ?? "")}</p>
        <Form layout="vertical">
          <Form.Item label={t.reason} required><Input.TextArea rows={3} /></Form.Item>
        </Form>
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
        <Cell title="Button"><Button type="primary">Primary</Button><Button>Default</Button>
          <Button danger>Danger</Button><Button type="text">Text</Button><Button loading>Loading</Button></Cell>
        <Cell title="Text input"><Input placeholder={t.search} /><Input.Password placeholder="Password" /></Cell>
        <Cell title="Number / Select"><InputNumber defaultValue={1200} style={{ width: 110 }} />
          <Select style={{ width: 130 }} defaultValue="flood" options={HAZARDS.map(h => ({ value: h, label: t.haz[h] }))} /></Cell>
        <Cell title="Choice"><Checkbox>Validated</Checkbox><Radio>Areal</Radio><Switch defaultChecked /></Cell>
        <Cell title="Date"><DatePicker /></Cell>
        <Cell title="Range"><Slider defaultValue={40} style={{ width: 160 }} /></Cell>
        <Cell title="Upload"><Upload><Button icon={<UploadOutlined />}>CSV</Button></Upload></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Tag / Badge"><Tag color="success">{t.approved}</Tag><Tag color="processing">{t.submitted}</Tag>
          <Tag color="warning">{t.draft}</Tag><Badge count={12} /></Cell>
        <Cell title="Avatar / Divider"><Avatar>AN</Avatar><Divider type="vertical" /><Avatar style={{ background: "#0b5cad" }}>UN</Avatar></Cell>
        <Cell title="Progress"><Progress percent={62} style={{ width: 180 }} /></Cell>
        <Cell title="Alert"><Alert type="warning" message="Grade D excluded" showIcon /></Cell>
        <Cell title="Descriptions"><Descriptions size="small" column={1} items={[{ key: "1", label: t.country, children: "Kenya" }, { key: "2", label: t.hazard, children: "Flood" }]} /></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumb"><Breadcrumb items={[{ title: "DELTA" }, { title: "Records" }, { title: "DR-1000" }]} /></Cell>
        <Cell title="Tabs"><Tabs style={{ width: "100%" }} items={[{ key: "1", label: "Human effects" }, { key: "2", label: "Damages" }, { key: "3", label: "Losses" }]} /></Cell>
        <Cell title="Steps"><Steps size="small" current={1} items={[{ title: "Draft" }, { title: "Review" }, { title: "Approved" }]} /></Cell>
        <Cell title="Menu"><Menu style={{ width: "100%" }} mode="vertical" items={[{ key: "a", label: "Hazardous events" }, { key: "b", label: "Disaster records" }]} /></Cell>
        <Cell title="Tree"><Tree defaultExpandAll treeData={[{ title: "Kenya", key: "k", children: [{ title: "Nairobi", key: "n" }, { title: "Mombasa", key: "m" }] }]} /></Cell>
        <Cell title="Pagination"><Pagination defaultCurrent={2} total={120} showSizeChanger={false} /></Cell>
      </div>
    </>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  return (
    <ConfigProvider locale={ANTD_LOCALE[lang]} direction={dir}>
      <AntApp>
        <HostBar candidate="Ant Design 6.6.0" lang={lang} setLang={setLang} view={view} setView={setView}
          localePacks={["en","fr","es","ru","zh","pt","ar"]}
        note={<><b>What to look at:</b> change <b>Language</b> and watch the parts DELTA never wrote — the pagination
            summary, "select all", the column filter menu, the empty state, the date picker. antd ships 76 locale packs,
            so all seven DELTA languages are covered by the library itself. Arabic additionally flips the whole layout
            from one prop, <code>ConfigProvider direction="rtl"</code>. This is the strongest built-in i18n story here.
            The cost sits elsewhere: the build emits no stylesheet at all, so SSR needs hand-wired per-request style extraction.</>} />
        <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
      </AntApp>
    </ConfigProvider>
  );
}
