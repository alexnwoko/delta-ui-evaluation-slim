import { useMemo, useState } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Chip, Card, CardContent, Alert, Stack,
  Snackbar, Typography, Tabs, Tab, Checkbox, Radio, Switch, Slider, Breadcrumbs, Link, Avatar,
  Divider, LinearProgress, Stepper, Step, StepLabel, Badge, Tooltip, IconButton, Pagination,
  List, ListItemButton, ListItemText, FormControlLabel, Autocomplete, InputAdornment,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { arSD as gAr, enUS as gEn, frFR as gFr, esES as gEs, ruRU as gRu, zhCN as gZh, ptBR as gPt } from "@mui/x-data-grid/locales";
import { arEG as cAr, enUS as cEn, frFR as cFr, esES as cEs, ruRU as cRu, zhCN as cZh, ptBR as cPt } from "@mui/material/locale";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { prefixer } from "stylis";
import { records, STR, HAZARDS, type Rec, type Lang } from "./shared/data";
import { HostBar, useHostState, Cell, fmt, fmtDate } from "./shared/chrome";

/* MUI core ships 57 locales and the data grid 41 — all seven DELTA languages are covered by both.
   The gap is @mui/x-date-pickers, which ships NO Arabic locale at all, so the date filter is omitted. */
const CORE: Record<Lang, any> = { en: cEn, fr: cFr, es: cEs, ru: cRu, zh: cZh, pt: cPt, ar: cAr };
const GRID: Record<Lang, any> = { en: gEn, fr: gFr, es: gEs, ru: gRu, zh: gZh, pt: gPt, ar: gAr };

const ltrCache = createCache({ key: "mui", stylisPlugins: [prefixer] });
const rtlCache = createCache({ key: "muirtl", stylisPlugins: [prefixer, rtlPlugin as any] });

function Screen({ lang }: any) {
  const t = STR[lang];
  const [q, setQ] = useState("");
  const [hz, setHz] = useState("");
  const [target, setTarget] = useState<Rec | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => records.filter(r =>
    (!q || r.event.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase())) &&
    (!hz || r.hazard === hz)), [q, hz]);

  const tone = (s: Rec["status"]) => s === "Approved" ? "success" : s === "Submitted" ? "info" : "warning";
  const label = (s: Rec["status"]) => s === "Approved" ? t.approved : s === "Submitted" ? t.submitted : t.draft;

  const cols: GridColDef<Rec>[] = [
    { field: "id", headerName: t.id, width: 110 },
    { field: "event", headerName: t.event, flex: 1, minWidth: 220, valueGetter: (_v: any, r: Rec) => `${t.haz[r.hazard as keyof typeof t.haz]} — ${r.event}` },
    { field: "country", headerName: t.country, width: 130 },
    { field: "date", headerName: t.date, width: 140, valueFormatter: (v: string) => fmtDate(v, lang) },
    { field: "deaths", headerName: t.deaths, width: 110, type: "number", valueFormatter: (v: number) => fmt(v, lang) },
    { field: "affected", headerName: t.affected, width: 130, type: "number", valueFormatter: (v: number) => fmt(v, lang) },
    { field: "damages", headerName: t.damages, width: 150, type: "number", valueFormatter: (v: number) => fmt(v, lang) },
    {
      field: "status", headerName: t.status, width: 140, sortable: false,
      renderCell: (p) => <Chip size="small" color={tone(p.value) as any} label={label(p.value)} />,
    },
    {
      field: "actions", headerName: t.actions, width: 110, sortable: false, filterable: false,
      renderCell: (p) => (<>
        <Tooltip title={t.edit}><IconButton size="small" aria-label={t.edit} onClick={() => setTarget(p.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={t.del}><IconButton size="small" color="error" aria-label={t.del} onClick={() => setTarget(p.row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </>),
    },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>{t.title}</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>{t.sub}</Alert>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <TextField size="small" value={q} onChange={e => setQ(e.target.value)} label={t.search}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
            <TextField size="small" select value={hz} onChange={e => setHz(e.target.value)} label={t.hazard} sx={{ minWidth: 190 }}>
              <MenuItem value="">{t.allHazards}</MenuItem>
              {HAZARDS.map(h => <MenuItem key={h} value={h}>{t.haz[h]}</MenuItem>)}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTarget(records[0])}>{t.add}</Button>
          </Stack>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={cols} checkboxSelection density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick />
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!target} onClose={() => setTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t.confirm}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t.confirmBody.replace("{id}", target?.id ?? "")}</DialogContentText>
          <TextField autoFocus fullWidth multiline rows={3} label={t.reason} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTarget(null)}>{t.cancel}</Button>
          <Button color="error" variant="contained"
            onClick={() => { setToast(`${t.deleted} — ${target?.id}`); setTarget(null); }}>{t.del}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </>
  );
}

function Inventory({ lang }: any) {
  const t = STR[lang];
  return (
    <>
      <div className="hc-h">Inputs</div>
      <div className="hc-grid">
        <Cell title="Button"><Button variant="contained">Primary</Button><Button variant="outlined">Outlined</Button>
          <Button color="error" variant="contained">Danger</Button><Button>Text</Button></Cell>
        <Cell title="Text input"><TextField size="small" label={t.search} /><TextField size="small" type="password" label="Password" /></Cell>
        <Cell title="Autocomplete"><Autocomplete size="small" sx={{ width: 200 }} options={HAZARDS.map(h => t.haz[h])} renderInput={(p) => <TextField {...p} label={t.hazard} />} /></Cell>
        <Cell title="Choice"><FormControlLabel control={<Checkbox defaultChecked />} label="Validated" />
          <FormControlLabel control={<Radio />} label="Areal" /><Switch defaultChecked /></Cell>
        <Cell title="Range"><Slider defaultValue={40} sx={{ width: 160 }} /></Cell>
      </div>
      <div className="hc-h">Display</div>
      <div className="hc-grid">
        <Cell title="Chip"><Chip color="success" label={t.approved} /><Chip color="info" label={t.submitted} /><Chip color="warning" label={t.draft} /></Cell>
        <Cell title="Avatar / Badge"><Avatar>AN</Avatar><Badge badgeContent={12} color="primary"><Avatar sx={{ bgcolor: "#0b5cad" }}>UN</Avatar></Badge></Cell>
        <Cell title="Progress"><LinearProgress variant="determinate" value={62} sx={{ width: 180 }} /></Cell>
        <Cell title="Alert"><Alert severity="warning">Grade D excluded</Alert></Cell>
        <Cell title="Divider"><Divider flexItem sx={{ width: "100%" }} /></Cell>
      </div>
      <div className="hc-h">Navigation & structure</div>
      <div className="hc-grid">
        <Cell title="Breadcrumbs"><Breadcrumbs><Link href="#">DELTA</Link><Link href="#">Records</Link><Typography>DR-1000</Typography></Breadcrumbs></Cell>
        <Cell title="Tabs"><Tabs value={0} sx={{ width: "100%" }}><Tab label="Human effects" /><Tab label="Damages" /><Tab label="Losses" /></Tabs></Cell>
        <Cell title="Stepper"><Stepper activeStep={1} sx={{ width: "100%" }}><Step><StepLabel>Draft</StepLabel></Step><Step><StepLabel>Review</StepLabel></Step><Step><StepLabel>Approved</StepLabel></Step></Stepper></Cell>
        <Cell title="List"><List dense sx={{ width: "100%" }}><ListItemButton><ListItemText primary="Hazardous events" /></ListItemButton><ListItemButton><ListItemText primary="Disaster records" /></ListItemButton></List></Cell>
        <Cell title="Pagination"><Pagination count={12} page={2} size="small" /></Cell>
      </div>
    </>
  );
}

export default function App() {
  const { lang, setLang, dir, view, setView } = useHostState();
  const theme = useMemo(() => createTheme(
    { direction: dir, cssVariables: true, palette: { primary: { main: "#0b5cad" } } },
    CORE[lang], GRID[lang],
  ), [dir, lang]);
  return (
    <CacheProvider value={dir === "rtl" ? rtlCache : ltrCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HostBar candidate="MUI (Material UI) 9.3.1 — community/MIT only" lang={lang} setLang={setLang} view={view} setView={setView}
          localePacks={["en","fr","es","ru","zh","pt","ar"]}
        note={<><b>What to look at:</b> this is Material UI — <code>@mui/material</code> 9.3.1 — on its
            <b> community MIT tier only</b>; nothing here needs MUI X Pro. The grid is the free MIT
            <code> @mui/x-data-grid</code>: sorting, filtering, column resize, selection, density and CSV export all
            included. Core MUI ships 57 locales and the grid 41, so all seven DELTA languages localise.
            Two costs to see: Arabic needs three moving parts (theme <code>direction</code>, a second Emotion cache and
            <code>@mui/stylis-plugin-rtl</code>) and portalled overlays do not inherit <code>dir</code>; and
            <code>@mui/x-date-pickers</code> ships <b>no Arabic locale at all</b>, so the date filter is omitted
            here rather than faked.</>} />
        <div className="stage">{view === "screen" ? <Screen lang={lang} /> : <Inventory lang={lang} />}</div>
      </ThemeProvider>
    </CacheProvider>
  );
}
