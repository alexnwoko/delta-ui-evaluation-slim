export type Status = "Draft" | "Submitted" | "Approved";
export type Rec = {
  id: string; event: string; country: string; hazard: string;
  date: string; deaths: number; affected: number; damages: number; status: Status;
};

/* Hazard keys are code-list values, not display strings — they stay stable across
   languages and are translated only at render time, the way DELTA's taxonomy works. */
export const HAZARDS = ["flood", "earthquake", "drought", "cyclone", "landslide", "wildfire"] as const;
const countries = ["Kenya", "Peru", "Nepal", "Serbia", "Jordan", "Philippines"];
const statuses: Status[] = ["Draft", "Submitted", "Approved"];

export const records: Rec[] = Array.from({ length: 120 }, (_, i) => ({
  id: `DR-${1000 + i}`,
  event: `${countries[i % 6]} ${2020 + (i % 6)}`,
  country: countries[i % 6],
  hazard: HAZARDS[i % 6],
  date: `${2020 + (i % 6)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 27) + 1).padStart(2, "0")}`,
  deaths: (i * 7) % 340,
  affected: ((i * 1373) % 90000) + 500,
  damages: ((i * 91_337) % 12_000_000) + 25_000,
  status: statuses[i % 3],
}));

/* The six official UN languages plus Portuguese. English is the default: the showcase is
   presented in English, and the switcher exists to prove the design supports the rest. */
export const LANGS = [
  { code: "en", label: "English",    native: "English",  bcp47: "en-GB", dir: "ltr" },
  { code: "fr", label: "French",     native: "Français", bcp47: "fr-FR", dir: "ltr" },
  { code: "es", label: "Spanish",    native: "Español",  bcp47: "es-ES", dir: "ltr" },
  { code: "ru", label: "Russian",    native: "Русский",  bcp47: "ru-RU", dir: "ltr" },
  { code: "zh", label: "Chinese",    native: "中文",      bcp47: "zh-CN", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", bcp47: "pt-BR", dir: "ltr" },
  { code: "ar", label: "Arabic",     native: "العربية",   bcp47: "ar-EG", dir: "rtl" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];
export const langMeta = (l: Lang) => LANGS.find(x => x.code === l)!;

type Dict = {
  title: string; sub: string; search: string; hazard: string; allHazards: string; add: string;
  id: string; event: string; country: string; date: string; deaths: string; affected: string;
  damages: string; status: string; actions: string; edit: string; del: string; cancel: string;
  confirm: string; confirmBody: string; reason: string; deleted: string; deletedBody: string;
  draft: string; submitted: string; approved: string; of: string; noData: string;
  haz: Record<(typeof HAZARDS)[number], string>;
};

export const STR: Record<Lang, Dict> = {
  en: {
    title: "Disaster records",
    sub: "National disaster loss database — records pending validation are excluded from official Sendai reporting.",
    search: "Search records", hazard: "Hazard", allHazards: "All hazards", add: "Add record",
    id: "ID", event: "Event", country: "Country", date: "Date", deaths: "Deaths",
    affected: "Affected", damages: "Damages (USD)", status: "Status", actions: "Actions",
    edit: "Edit", del: "Delete", cancel: "Cancel", confirm: "Confirm deletion",
    confirmBody: "Delete record {id}? This cannot be undone.", reason: "Reason for deletion",
    deleted: "Record deleted", deletedBody: "{id} was removed from the national database.",
    draft: "Draft", submitted: "Submitted", approved: "Approved",
    of: "records", noData: "No records found",
    haz: { flood: "Flood", earthquake: "Earthquake", drought: "Drought",
           cyclone: "Tropical cyclone", landslide: "Landslide", wildfire: "Wildfire" },
  },
  fr: {
    title: "Registres de catastrophes",
    sub: "Base de données nationale des pertes — les enregistrements en attente de validation sont exclus des rapports officiels de Sendai.",
    search: "Rechercher des enregistrements", hazard: "Aléa", allHazards: "Tous les aléas", add: "Ajouter un enregistrement",
    id: "Identifiant", event: "Événement", country: "Pays", date: "Date", deaths: "Décès",
    affected: "Personnes affectées", damages: "Dommages (USD)", status: "Statut", actions: "Actions",
    edit: "Modifier", del: "Supprimer", cancel: "Annuler", confirm: "Confirmer la suppression",
    confirmBody: "Supprimer l'enregistrement {id} ? Cette action est irréversible.", reason: "Motif de la suppression",
    deleted: "Enregistrement supprimé", deletedBody: "{id} a été retiré de la base de données nationale.",
    draft: "Brouillon", submitted: "Soumis", approved: "Approuvé",
    of: "enregistrements", noData: "Aucun enregistrement trouvé",
    haz: { flood: "Inondation", earthquake: "Séisme", drought: "Sécheresse",
           cyclone: "Cyclone tropical", landslide: "Glissement de terrain", wildfire: "Feu de forêt" },
  },
  es: {
    title: "Registros de desastres",
    sub: "Base de datos nacional de pérdidas — los registros pendientes de validación quedan excluidos de los informes oficiales de Sendai.",
    search: "Buscar registros", hazard: "Amenaza", allHazards: "Todas las amenazas", add: "Añadir registro",
    id: "Identificador", event: "Evento", country: "País", date: "Fecha", deaths: "Fallecidos",
    affected: "Afectados", damages: "Daños (USD)", status: "Estado", actions: "Acciones",
    edit: "Editar", del: "Eliminar", cancel: "Cancelar", confirm: "Confirmar eliminación",
    confirmBody: "¿Eliminar el registro {id}? Esta acción no se puede deshacer.", reason: "Motivo de la eliminación",
    deleted: "Registro eliminado", deletedBody: "{id} se eliminó de la base de datos nacional.",
    draft: "Borrador", submitted: "Enviado", approved: "Aprobado",
    of: "registros", noData: "No se encontraron registros",
    haz: { flood: "Inundación", earthquake: "Terremoto", drought: "Sequía",
           cyclone: "Ciclón tropical", landslide: "Deslizamiento de tierra", wildfire: "Incendio forestal" },
  },
  ru: {
    title: "Записи о бедствиях",
    sub: "Национальная база данных о потерях — записи, ожидающие проверки, не включаются в официальную отчётность по Сендайской рамочной программе.",
    search: "Поиск записей", hazard: "Опасное явление", allHazards: "Все опасные явления", add: "Добавить запись",
    id: "Идентификатор", event: "Событие", country: "Страна", date: "Дата", deaths: "Погибшие",
    affected: "Пострадавшие", damages: "Ущерб (долл. США)", status: "Статус", actions: "Действия",
    edit: "Изменить", del: "Удалить", cancel: "Отмена", confirm: "Подтвердите удаление",
    confirmBody: "Удалить запись {id}? Это действие необратимо.", reason: "Причина удаления",
    deleted: "Запись удалена", deletedBody: "Запись {id} удалена из национальной базы данных.",
    draft: "Черновик", submitted: "Отправлено", approved: "Утверждено",
    of: "записей", noData: "Записи не найдены",
    haz: { flood: "Наводнение", earthquake: "Землетрясение", drought: "Засуха",
           cyclone: "Тропический циклон", landslide: "Оползень", wildfire: "Природный пожар" },
  },
  zh: {
    title: "灾害记录",
    sub: "国家灾害损失数据库 — 待核验的记录不计入仙台框架正式报告。",
    search: "搜索记录", hazard: "灾害类型", allHazards: "所有灾害类型", add: "新增记录",
    id: "编号", event: "事件", country: "国家", date: "日期", deaths: "死亡人数",
    affected: "受灾人数", damages: "损失（美元）", status: "状态", actions: "操作",
    edit: "编辑", del: "删除", cancel: "取消", confirm: "确认删除",
    confirmBody: "确定删除记录 {id} 吗？此操作无法撤销。", reason: "删除原因",
    deleted: "记录已删除", deletedBody: "{id} 已从国家数据库中移除。",
    draft: "草稿", submitted: "已提交", approved: "已批准",
    of: "条记录", noData: "未找到记录",
    haz: { flood: "洪水", earthquake: "地震", drought: "干旱",
           cyclone: "热带气旋", landslide: "滑坡", wildfire: "野火" },
  },
  pt: {
    title: "Registros de desastres",
    sub: "Base de dados nacional de perdas — os registros pendentes de validação são excluídos dos relatórios oficiais de Sendai.",
    search: "Pesquisar registros", hazard: "Ameaça", allHazards: "Todas as ameaças", add: "Adicionar registro",
    id: "Identificador", event: "Evento", country: "País", date: "Data", deaths: "Mortes",
    affected: "Afetados", damages: "Danos (USD)", status: "Situação", actions: "Ações",
    edit: "Editar", del: "Excluir", cancel: "Cancelar", confirm: "Confirmar exclusão",
    confirmBody: "Excluir o registro {id}? Esta ação não pode ser desfeita.", reason: "Motivo da exclusão",
    deleted: "Registro excluído", deletedBody: "{id} foi removido da base de dados nacional.",
    draft: "Rascunho", submitted: "Enviado", approved: "Aprovado",
    of: "registros", noData: "Nenhum registro encontrado",
    haz: { flood: "Inundação", earthquake: "Terremoto", drought: "Seca",
           cyclone: "Ciclone tropical", landslide: "Deslizamento de terra", wildfire: "Incêndio florestal" },
  },
  ar: {
    title: "سجلات الكوارث",
    sub: "قاعدة بيانات الخسائر الوطنية — السجلات قيد التحقق مستثناة من تقارير سينداي الرسمية.",
    search: "البحث في السجلات", hazard: "الخطر", allHazards: "كل الأخطار", add: "إضافة سجل",
    id: "المعرّف", event: "الحدث", country: "البلد", date: "التاريخ", deaths: "الوفيات",
    affected: "المتضررون", damages: "الأضرار (دولار)", status: "الحالة", actions: "إجراءات",
    edit: "تحرير", del: "حذف", cancel: "إلغاء", confirm: "تأكيد الحذف",
    confirmBody: "حذف السجل {id}؟ لا يمكن التراجع عن هذا الإجراء.", reason: "سبب الحذف",
    deleted: "تم حذف السجل", deletedBody: "تمت إزالة {id} من قاعدة البيانات الوطنية.",
    draft: "مسودة", submitted: "مُقدَّم", approved: "معتمد",
    of: "سجل", noData: "لا توجد سجلات",
    haz: { flood: "فيضان", earthquake: "زلزال", drought: "جفاف",
           cyclone: "إعصار مداري", landslide: "انزلاق أرضي", wildfire: "حريق غابات" },
  },
};
