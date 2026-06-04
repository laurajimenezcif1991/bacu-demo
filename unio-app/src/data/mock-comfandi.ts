import type {
  Candidate, Vacante, PipelineStage, PsychTestResult,
  SalaryRange, StageStatus, EvalRow,
} from './mock';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const _p = (n: number, g: 'men' | 'women') => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const COLS = ['#8750F6', '#27BE69', '#295BFF', '#F6A350', '#F65078'];
const _c = (i: number) => COLS[i % COLS.length];
const PRE_HI = [2, 5, 4, 7];
const PRE_LO = [10, 12, 11, 14];

// ─── Config type ─────────────────────────────────────────────────────────────
interface VConfig {
  role: string;
  sector: string;
  budget: string;
  bio: string;
  superpoder: string;
  noNegS: { label: string; threshold: number }[];
  logrosHi: string[];
  logrosMd: string[];
  logrosLo: string;
  senalesHi: string[];
  senalesMd: string[];
  senalesLo: string[];
  jobs: { c: string; r: string; d: string }[];
  resumenPreHi: string;
  resumenPreLo: string;
  noNegP: { label: string; evHi: string; evLo: string }[];
  plusHi: string[];
  plusLo: string[];
  insightHi: string;
  insightLo: string;
  axes: { axis: string; ideal: number; off: number; sum: string; det: string }[];
  radar: { lbl: string; off: number }[];
  v: { title: string; body: string }[];
  q: { tag: string; question: string; validates: string }[];
}

// ─── Parametric generator ────────────────────────────────────────────────────
type Stage = 'scoring' | 'prescreening' | 'entrevistas' | 'evaluaciones';

function _gen(
  cfg: VConfig,
  id: string, name: string, score: number, photo: string,
  init: string, color: string, city: string, years: string,
  asp: string, sr: SalaryRange,
  stage: Stage = 'scoring',
): Candidate {
  const hi = score >= 78, md = score >= 60;
  const n = parseInt(id.split('-').pop()!);
  const j = cfg.jobs[(n - 1) % cfg.jobs.length];

  const prescreeningAI: Candidate['prescreeningAI'] = stage !== 'scoring' ? {
    score: score + 1,
    status: 'continua',
    resumen: hi ? cfg.resumenPreHi.replace('{name}', name) : cfg.resumenPreLo.replace('{name}', name),
    noNegociables: cfg.noNegP.map((nn, i) => ({
      label: nn.label,
      score: hi ? score - PRE_HI[i] : score - PRE_LO[i],
      evidencia: hi ? nn.evHi : nn.evLo,
    }) as unknown as EvalRow),
    plusDetectados: hi ? cfg.plusHi : cfg.plusLo,
    senales: hi ? cfg.senalesHi : cfg.senalesMd,
  } : undefined;

  const psychTest: PsychTestResult | undefined = stage === 'evaluaciones' ? {
    score: score - 4,
    insight: `${name} ${hi ? cfg.insightHi : cfg.insightLo}`,
    fitCards: cfg.axes.map(a => ({
      axis: a.axis,
      idealScore: a.ideal,
      candidateScore: Math.min(99, Math.max(20, score + a.off)),
      summary: a.sum,
      detail: a.det,
    })),
    radarPoints: cfg.radar.map(r => ({ label: r.lbl, value: Math.min(99, Math.max(20, score + r.off)) })),
    veredicto: cfg.v,
    preguntas: cfg.q,
  } : undefined;

  return {
    id, name,
    role: cfg.role,
    sector: cfg.sector,
    years,
    location: `${city}, Colombia`,
    bio: cfg.bio,
    score, photo,
    avatarInitials: init,
    avatarColor: color,
    hasCurrentJob: score > 60,
    ...(score > 60
      ? { currentCompany: j.c, currentRole: j.r }
      : { lastCompany: j.c, lastRole: j.r, lastDate: j.d }),
    superpoder: cfg.superpoder,
    aspiration: asp,
    budget: cfg.budget,
    salaryRange: sr,
    currentStage: stage,
    scoringAI: {
      score: Math.round(score * 0.94),
      status: score >= 58 ? 'continua' : 'pendiente',
      resumen: hi
        ? `${name} presenta perfil sólido para ${cfg.role} en Bacu. Cumple los requisitos clave y tiene experiencia verificable en el sector.`
        : md
        ? `${name} tiene formación y experiencia básica. Requiere mayor desarrollo en los requisitos críticos del cargo.`
        : `${name} presenta perfil insuficiente: experiencia y formación por debajo del umbral mínimo requerido.`,
      noNegociables: cfg.noNegS.map(nn => ({ label: nn.label, cumple: score >= nn.threshold })),
      logros: hi ? cfg.logrosHi : md ? cfg.logrosMd : [cfg.logrosLo],
      senales: hi ? cfg.senalesHi : md ? cfg.senalesMd : cfg.senalesLo,
    },
    ...(prescreeningAI ? { prescreeningAI } : {}),
    ...(psychTest ? { psychTest } : {}),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 1 — GESTOR(A) COMERCIAL CONVENIOS Y ALIANZAS CRÉDITO
// Bacu | Medellín | Pipeline: Entrevistas (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgGCA: VConfig = {
  role: 'Gestor(a) Comercial Convenios y Alianzas Crédito',
  sector: 'Crédito / Libranza',
  budget: "$6'000.000",
  bio: 'Perfil comercial con mínimo 3 años en crédito de libranza. Experiencia en vinculación de empresas con convenio, legalización de documentos y gestión de alianzas comerciales. Manejo de SAP, CORE y Salesforce.',
  superpoder: '"Convierte empresas en aliadas de libranza mediante relacionamiento estratégico y seguimiento comercial"',
  noNegS: [
    { label: 'Mín. VIII semestre en Administración, Mercadeo o tecnólogo afín', threshold: 78 },
    { label: 'Mínimo 3 años en crédito de libranza en sector financiero o cooperativo', threshold: 72 },
    { label: 'Experiencia en vinculación y legalización de convenios empresariales', threshold: 66 },
    { label: 'Disponibilidad presencial en Medellín con visitas externas', threshold: 60 },
  ],
  logrosHi: [
    'Vinculó 18 empresas nuevas con convenio de libranza en 6 meses, superando meta en 120%',
    'Legalizó y documentó convenios empresariales con 0 devoluciones por documentación en 12 meses',
    'Creció colocación de libranza en 28% mediante alianzas con concesionarios y comercios de la zona',
  ],
  logrosMd: [
    'Cumplió meta de vinculación mensual de empresas con convenio de libranza en promedio del 90%',
    'Gestionó relaciones con 30+ empresas afiliadas con seguimiento activo de indicadores de convenio',
  ],
  logrosLo: 'Gestión comercial básica en crédito sin foco específico en libranza ni convenios empresariales formalizados.',
  senalesHi: ['Confirmar conocimiento de normatividad aplicable a libranza y convenios empresariales', 'Validar red activa de contactos con áreas de RRHH de empresas en Medellín'],
  senalesMd: ['Confirmar experiencia real en legalización de convenios vs. solo prospección', 'Validar dominio de SAP y Salesforce con uso cotidiano en cargo anterior'],
  senalesLo: ['Sin experiencia específica en libranza: perfil fuera del requisito mínimo', 'Gestión comercial en productos tangibles sin transferibilidad validada a servicios de libranza'],
  jobs: [
    { c: 'Bancoomeva Medellín', r: 'Ejecutiva Comercial de Libranza', d: '02/2025' },
    { c: 'Confiar Cooperativa Financiera', r: 'Gestora de Convenios Empresariales', d: '08/2024' },
    { c: 'Comfenalco Antioquia', r: 'Asesora Comercial de Crédito', d: '04/2024' },
    { c: 'Banco Caja Social — Empresas', r: 'Ejecutiva de Libranza Corporativa', d: '10/2023' },
    { c: 'COOPCENTRAL — Antioquia', r: 'Gestora de Alianzas Comerciales', d: '05/2023' },
  ],
  resumenPreHi: '{name} demuestra trayectoria verificable en libranza con convenios legalizados y métricas de colocación documentadas. Relacionamiento activo con empresas afiliadas y conocimiento de la normatividad del sector.',
  resumenPreLo: '{name} presenta orientación comercial básica con menor profundidad en legalización de convenios de libranza y gestión de indicadores específicos del cargo.',
  noNegP: [
    {
      label: 'Experiencia en libranza + legalización de convenios',
      evHi: '4 años en libranza corporativa. Vinculó y legalizó 25+ convenios empresariales con documentación completa en Bancoomeva.',
      evLo: 'Experiencia en crédito de consumo general; no ha gestionado convenios de libranza formales.',
    },
    {
      label: 'Relacionamiento con RRHH y pagadurías de empresas',
      evHi: 'Red activa de 80+ contactos en gerencias de RRHH y pagadurías de empresas del sector productivo antioqueño.',
      evLo: 'Red limitada a contactos personales; sin acceso a decisores de RRHH en empresas afiliadas.',
    },
    {
      label: 'Manejo de SAP, CORE y Salesforce',
      evHi: 'Usuario cotidiano de SAP Crédito, CORE y Salesforce CRM para seguimiento de pipeline y reportes de gestión.',
      evLo: 'Maneja Office y algún CRM básico; no ha usado SAP ni CORE en entorno de caja de compensación.',
    },
    {
      label: 'Cumplimiento de metas de colocación en libranza',
      evHi: 'Cumplimiento promedio 108% en meta de colocación mensual en libranza durante los últimos 18 meses.',
      evLo: 'Sin métricas documentadas de cumplimiento en libranza ni evidencia de seguimiento de indicadores.',
    },
  ],
  plusHi: [
    'Conocimiento de normatividad vigente para operaciones de libranza y cajas de compensación',
    'Red activa de contactos en pagadurías y áreas de RRHH de empresas del sector productivo de Antioquia',
    'Experiencia en diseño de campañas comerciales para ferias y eventos empresariales',
  ],
  plusLo: ['Disposición genuina para el relacionamiento empresarial y habilidad natural para la negociación'],
  insightHi: 'combina rigor en la legalización de convenios con relacionamiento comercial sólido orientado a resultados. Perfil natural para escalar la red de libranza de Bacu en Antioquia.',
  insightLo: 'presenta motivación comercial evidente pero evidencia brechas en el dominio específico de libranza y en la gestión formal de convenios empresariales requeridos para el cargo.',
  axes: [
    {
      axis: 'Orientación al resultado comercial', ideal: 84, off: 0,
      sum: 'Motor interno de prospección y cierre de acuerdos.',
      det: 'La gestión de convenios requiere un perfil que combine persistencia en la prospección con rigurosidad en el cierre. El relacionamiento sin resultados medibles no genera valor en Bacu.',
    },
    {
      axis: 'Relacionamiento empresarial', ideal: 82, off: -4,
      sum: 'Construcción de vínculos con decisores de empresas afiliadas.',
      det: 'Las relaciones con pagadurías y áreas de RRHH son el activo central del cargo. Se construyen con constancia y honestidad técnica, no solo con carisma comercial.',
    },
    {
      axis: 'Rigor en documentación de convenios', ideal: 76, off: -7,
      sum: 'Meticulosidad en legalización y seguimiento de acuerdos.',
      det: 'Un convenio mal documentado genera reprocesos que erosionan la confianza de la empresa afiliada. El rigor administrativo es el respaldo del relacionamiento comercial.',
    },
  ],
  radar: [
    { lbl: 'Iniciativa', off: 3 }, { lbl: 'Agente cambio', off: -2 }, { lbl: 'Proactividad', off: 5 },
    { lbl: 'Inteligencia Social', off: -3 }, { lbl: 'Autonomía', off: 2 }, { lbl: 'Agilidad', off: -1 },
    { lbl: 'Persuasión', off: 6 }, { lbl: 'Negociación', off: 4 }, { lbl: 'Orientación al logro', off: 5 }, { lbl: 'Relacionamiento', off: 7 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta energía comercial y orientación natural al cierre de acuerdos. Combina relacionamiento cálido con rigurosidad en el seguimiento de indicadores. Su motor intrínseco de prospección define su rendimiento más que los incentivos externos.' },
    { title: 'Fit con este rol', body: 'El Gestor Comercial de Convenios en Bacu requiere rigor en documentación + relacionamiento activo + orientación a metas en libranza. El conocimiento del portafolio financiero de la caja es la principal curva de aprendizaje.' },
  ],
  q: [
    { tag: 'Para: Jefe de Ventas Crédito', question: '"Cuéntame el proceso de vinculación de convenio más complejo que hayas liderado. ¿Cuántas personas intervenían en la empresa cliente, cuánto duró el proceso y qué obstáculos tuviste?"', validates: 'Capacidad de gestión comercial en ciclos complejos y legalización de convenios empresariales' },
    { tag: 'Para: RRHH', question: '"¿Cómo organizas tu agenda para combinar visitas comerciales, seguimiento de convenios activos y legalización de documentación en una semana de alta demanda?"', validates: 'Organización, autonomía y disciplina en gestión de portafolio comercial' },
  ],
};

// GCA — 3 candidatos en Entrevistas
// GCA — 3 candidatos en Evaluaciones (con psychTest)
const gcaEval: Candidate[] = [
  _gen(cfgGCA, 'gca-1', 'María Camila Londoño',    89, _p(1,'women'),  'ML', _c(0), 'Medellín', '5 Años',  "$5'800.000", 'en_rango',       'evaluaciones'),
  _gen(cfgGCA, 'gca-2', 'Jorge Andrés Palacio',     85, _p(1,'men'),    'JP', _c(1), 'Medellín', '4 Años',  "$6'000.000", 'en_rango',       'evaluaciones'),
  _gen(cfgGCA, 'gca-3', 'Sandra Milena Echeverri',  81, _p(2,'women'),  'SE', _c(2), 'Medellín', '3 Años',  "$5'500.000", 'en_rango',       'evaluaciones'),
];
// GCA — 5 candidatos en Entrevistas
const gcaEnt: Candidate[] = [
  _gen(cfgGCA, 'gca-4', 'Felipe Montoya Arango',    74, _p(2,'men'),    'FM', _c(3), 'Medellín', '4 Años',  "$5'800.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCA, 'gca-5', 'Claudia Patricia Gómez',   70, _p(3,'women'),  'CG', _c(4), 'Medellín', '3 Años',  "$7'500.000", 'fuera_de_rango', 'entrevistas'),
  _gen(cfgGCA, 'gca-6', 'Andrés Felipe Restrepo',   67, _p(4,'men'),    'AR', _c(0), 'Medellín', '3 Años',  "$5'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCA, 'gca-7', 'Marcela Tobón Giraldo',    64, _p(4,'women'),  'MT', _c(1), 'Medellín', '2 Años',  "$5'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCA, 'gca-8', 'Ricardo Arango Zuluaga',   61, _p(5,'men'),    'RA', _c(2), 'Medellín', '2 Años',  "$5'800.000", 'en_rango',       'entrevistas'),
];
// GCA — 22 shells en Scoring
const gcaScore: Candidate[] = [
  _gen(cfgGCA, 'gca-9',  'Liliana Posada',          57, _p(10,'women'), 'LP', _c(0), 'Medellín',   '2 Años',          "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-10', 'Mauricio Ríos',            55, _p(10,'men'),   'MR', _c(1), 'Medellín',   '2 Años',          "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-11', 'Natalia Rueda',            53, _p(11,'women'), 'NR', _c(2), 'Bogotá',     '2 Años',          "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-12', 'Óscar Giraldo',            51, _p(11,'men'),   'OG', _c(3), 'Medellín',   '1 Año',           "$6'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-13', 'Patricia Villegas',        50, _p(12,'women'), 'PV', _c(4), 'Manizales',  '3 Años',          "$7'000.000", 'fuera_de_rango'),
  _gen(cfgGCA, 'gca-14', 'Quintín López',            48, _p(12,'men'),   'QL', _c(0), 'Medellín',   '1 Año',           "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-15', 'Rosa Agudelo',             47, _p(13,'women'), 'RA', _c(1), 'Medellín',   '2 Años',          "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-16', 'Samuel Betancur',          46, _p(13,'men'),   'SB', _c(2), 'Pereira',    '1 Año',           "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-17', 'Teresa Cano',              44, _p(14,'women'), 'TC', _c(3), 'Medellín',   '1 Año',           "$5'800.000", 'en_rango'),
  _gen(cfgGCA, 'gca-18', 'Ubaldo Molina',            43, _p(14,'men'),   'UM', _c(4), 'Medellín',   '2 Años',          "$6'500.000", 'fuera_de_rango'),
  _gen(cfgGCA, 'gca-19', 'Vanessa Soto',             41, _p(15,'women'), 'VS', _c(0), 'Bogotá',     '1 Año',           "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-20', 'William Gaviria',          40, _p(15,'men'),   'WG', _c(1), 'Medellín',   '1 Año',           "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-21', 'Ximena Alzate',            39, _p(16,'women'), 'XA', _c(2), 'Medellín',   'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-22', 'Yesenia Córdoba',          38, _p(17,'women'), 'YC', _c(3), 'Medellín',   'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-23', 'Zulma Torres',             37, _p(18,'women'), 'ZT', _c(4), 'Pereira',    'Sin experiencia', "$4'800.000", 'en_rango'),
  _gen(cfgGCA, 'gca-24', 'Andrés Naranjo',           36, _p(16,'men'),   'AN', _c(0), 'Medellín',   'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-25', 'Beatriz Gutiérrez',        35, _p(19,'women'), 'BG', _c(1), 'Bogotá',     'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-26', 'César Henao',              33, _p(17,'men'),   'CH', _c(2), 'Medellín',   'Sin experiencia', "$7'500.000", 'fuera_de_rango'),
  _gen(cfgGCA, 'gca-27', 'Doris Marín',              32, _p(20,'women'), 'DM', _c(3), 'Manizales',  'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-28', 'Enrique Castaño',          31, _p(18,'men'),   'EC', _c(4), 'Medellín',   'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgGCA, 'gca-29', 'Fabiola Restrepo',         30, _p(21,'women'), 'FR', _c(0), 'Medellín',   'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgGCA, 'gca-30', 'Germán Upegui',            28, _p(19,'men'),   'GU', _c(1), 'Medellín',   'Sin experiencia', "$5'500.000", 'en_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 2 — GESTOR(A) CALIDAD DE VIDA CRÉDITO
// Bacu | Cali | Pipeline: Pre-screening IA (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgGCV: VConfig = {
  role: 'Gestor(a) Calidad de Vida Crédito',
  sector: 'Crédito / Servicios Financieros',
  budget: "$4'000.000",
  bio: 'Perfil de ventas consultivas con mínimo 1 año en comercialización de intangibles. Técnico(a) o tecnólogo(a) en carreras administrativas. Orientación al cliente y disciplina en seguimiento de metas de colocación.',
  superpoder: '"Profundiza la relación financiera con afiliados mediante venta consultiva de crédito con enfoque de calidad de vida"',
  noNegS: [
    { label: 'Título técnico en carreras administrativas, mercadeo o afines', threshold: 78 },
    { label: 'Mínimo 1 año en comercialización de intangibles (cualquier sector)', threshold: 72 },
    { label: 'Orientación al logro con seguimiento proactivo de metas de colocación', threshold: 66 },
    { label: 'Disponibilidad presencial en Cali (oficina y punto de venta)', threshold: 60 },
  ],
  logrosHi: [
    'Cumplió presupuesto mensual de colocación en 11 de 12 meses con NPS promedio de 72',
    'Fidelizó 45% de su base de clientes con segunda operación de crédito dentro de 12 meses',
    'Redujo tasa de devolución de solicitudes en 20% mediante acompañamiento desde originación hasta desembolso',
  ],
  logrosMd: [
    'Alcanzó meta de ventas de intangibles en promedio del 85% con portafolio de 50+ clientes activos',
    'Gestionó base de clientes preaprobados con tasa de conversión del 30% en líneas de consumo',
  ],
  logrosLo: 'Experiencia en atención al cliente sin evidencia de métricas de venta consultiva ni gestión de portafolio propio.',
  senalesHi: ['Confirmar disponibilidad exclusiva presencial en Cali sin compromisos en otra empresa', 'Validar experiencia en seguimiento activo desde originación hasta desembolso de crédito'],
  senalesMd: ['Confirmar manejo de herramientas de CRM o plataformas de seguimiento comercial', 'Validar experiencia real en venta activa de intangibles vs. atención pasiva al cliente'],
  senalesLo: ['Sin experiencia en venta activa de productos o servicios intangibles: no cumple requisito mínimo', 'Perfil de atención al cliente sin historial de metas de ventas ni portafolio asignado'],
  jobs: [
    { c: 'Claro Colombia — Canal Empresas', r: 'Asesor(a) Comercial de Servicios', d: '01/2025' },
    { c: 'Seguros SURA — Canal Masivo', r: 'Ejecutiva de Ventas de Seguros', d: '07/2024' },
    { c: 'Comfenalco Valle — Crédito', r: 'Asesor(a) de Servicios Financieros', d: '04/2024' },
    { c: 'Movistar Colombia', r: 'Vendedor(a) de Servicios Digitales', d: '10/2023' },
    { c: 'Banco Caja Social — Cali', r: 'Asesor(a) Comercial Junior', d: '06/2023' },
  ],
  resumenPreHi: '{name} demuestra orientación al cliente y disciplina comercial con métricas de venta de intangibles verificables. Seguimiento proactivo de portafolio y disposición confirmada para presencialidad en Cali.',
  resumenPreLo: '{name} presenta habilidades de atención al cliente pero con menor profundidad en venta activa de intangibles y seguimiento autónomo de metas de colocación.',
  noNegP: [
    {
      label: 'Experiencia en venta de intangibles + metas cumplidas',
      evHi: '2 años en ventas de telecomunicaciones. Cumplimiento promedio 95% en meta mensual con 60+ clientes en portafolio activo.',
      evLo: 'Experiencia en atención en punto de venta; sin portafolio de ventas consultivas ni metas individuales.',
    },
    {
      label: 'Seguimiento de portafolio desde originación hasta cierre',
      evHi: 'Gestión completa desde primer contacto hasta firma: 80% de sus ventas vinieron de seguimiento a base de preaprobados y referidos.',
      evLo: 'Atención en punto de venta sin gestión de pipeline ni seguimiento activo de leads asignados.',
    },
    {
      label: 'Orientación al cliente con NPS alto',
      evHi: 'NPS personal de 68 en medición semestral. Cero escalamientos en los últimos 12 meses por insatisfacción de cliente.',
      evLo: 'Sin medición formal de satisfacción ni indicadores de fidelización en cargos anteriores.',
    },
    {
      label: 'Disponibilidad presencial Cali — oficina y punto de venta',
      evHi: 'Vive en Cali. Sin compromisos laborales activos. Disponibilidad inmediata para presencialidad completa.',
      evLo: 'Actualmente empleado(a); requiere preaviso de 30 días y evalúa condiciones de horario flexible.',
    },
  ],
  plusHi: [
    'Conocimiento básico de operación de crédito de libranza o hipotecario (plus diferencial)',
    'Experiencia en visitas externas a empresas para venta de servicios',
    'Habilidad para comunicar beneficios de productos financieros en lenguaje simple y accesible',
  ],
  plusLo: ['Actitud genuina de servicio y disposición para aprender el portafolio financiero de Bacu'],
  insightHi: 'tiene el ritmo comercial y la orientación al cliente necesarios para gestionar el portafolio de crédito de Bacu desde el primer día. Su historial en intangibles reduce significativamente la curva de rampeo.',
  insightLo: 'muestra buena actitud de servicio pero evidencia brechas en la venta consultiva activa y en el seguimiento disciplinado de metas de colocación que el cargo requiere.',
  axes: [
    {
      axis: 'Orientación al cliente', ideal: 84, off: 0,
      sum: 'Empatía genuina y agilidad para superar las expectativas del afiliado.',
      det: 'El Gestor de Calidad de Vida construye relaciones de largo plazo con afiliados. La confianza que genera en la primera interacción define si el cliente regresa y recomienda.',
    },
    {
      axis: 'Disciplina en metas', ideal: 80, off: -5,
      sum: 'Seguimiento constante del presupuesto mensual de colocación.',
      det: 'Sin disciplina en el seguimiento, la orientación al cliente sola no genera resultados. El balance entre calidad de atención y volumen de colocación es la clave del desempeño.',
    },
    {
      axis: 'Autonomía comercial', ideal: 74, off: -7,
      sum: 'Capacidad de gestionar su portafolio con iniciativa propia.',
      det: 'El Gestor ejecuta la estrategia del Coordinador Comercial pero gestiona su portafolio de forma autónoma. La proactividad en la base de preaprobados distingue a los mejores del promedio.',
    },
  ],
  radar: [
    { lbl: 'Iniciativa', off: -2 }, { lbl: 'Proactividad', off: 2 }, { lbl: 'Empatía', off: 7 },
    { lbl: 'Inteligencia Social', off: 5 }, { lbl: 'Autonomía', off: -3 }, { lbl: 'Disciplina', off: 4 },
    { lbl: 'Persuasión', off: 3 }, { lbl: 'Servicio al usuario', off: 8 }, { lbl: 'Orientación al logro', off: 2 }, { lbl: 'Comunicación', off: 6 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta orientación al cliente y buena capacidad de comunicación consultiva. Disciplinado en el seguimiento de su portafolio y motivado por el logro de metas. Genera confianza natural en la primera interacción con el afiliado.' },
    { title: 'Fit con este rol', body: 'El Gestor de Calidad de Vida requiere empatía + disciplina en metas + dominio básico del portafolio financiero. La curva de aprendizaje en crédito hipotecario y libranza es manejable con el onboarding de Bacu si hay base en intangibles.' },
  ],
  q: [
    { tag: 'Para: Coordinador(a) Comercial Crédito', question: '"Cuéntame cómo gestionas un mes donde llevas 3 semanas sin cerrar una venta. ¿Qué revisas, qué cambias y cómo reactivas tu pipeline?"', validates: 'Resiliencia comercial, disciplina en seguimiento y gestión autónoma de portafolio' },
    { tag: 'Para: RRHH', question: '"¿Cuál ha sido el producto o servicio intangible más difícil que hayas vendido? ¿Qué estrategia usaste para convencer al cliente?"', validates: 'Habilidad de venta consultiva de intangibles y manejo de objeciones' },
  ],
};

// GCV — 3 candidatos en Evaluaciones (con psychTest)
const gcvEval: Candidate[] = [
  _gen(cfgGCV, 'gcv-1', 'Valentina Ospina Caicedo', 82, _p(4,'women'),  'VO', _c(0), 'Cali', '2 Años',  "$3'800.000", 'en_rango',       'evaluaciones'),
  _gen(cfgGCV, 'gcv-2', 'Diego Alejandro Caicedo',  78, _p(3,'men'),    'DC', _c(1), 'Cali', '2 Años',  "$4'000.000", 'en_rango',       'evaluaciones'),
  _gen(cfgGCV, 'gcv-3', 'Andrea Carolina Mosquera', 75, _p(5,'women'),  'AM', _c(2), 'Cali', '1 Año',   "$3'500.000", 'en_rango',       'evaluaciones'),
];
// GCV — 5 candidatos en Entrevistas
const gcvEnt: Candidate[] = [
  _gen(cfgGCV, 'gcv-4', 'Carlos Alberto Palacios',  71, _p(4,'men'),    'CP', _c(3), 'Cali', '2 Años',  "$4'500.000", 'fuera_de_rango', 'entrevistas'),
  _gen(cfgGCV, 'gcv-5', 'Laura Daniela Henao',      68, _p(6,'women'),  'LH', _c(4), 'Cali', '1 Año',   "$3'800.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCV, 'gcv-6', 'Lina Riascos',             65, _p(24,'women'), 'LR', _c(0), 'Cali', '1 Año',   "$3'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCV, 'gcv-7', 'Manuel Ortega',            63, _p(21,'men'),   'MO', _c(1), 'Cali', '1 Año',   "$4'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgGCV, 'gcv-8', 'Nathalie Angulo',          60, _p(25,'women'), 'NA', _c(2), 'Cali', '1 Año',   "$3'800.000", 'en_rango',       'entrevistas'),
];
// GCV — 22 shells en Scoring
const gcvScore: Candidate[] = [
  _gen(cfgGCV, 'gcv-9',  'Omar Mina',                 51, _p(22,'men'),   'OM', _c(3), 'Cali',         '1 Año',           "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-10', 'Paula Sánchez',             50, _p(26,'women'), 'PS', _c(4), 'Palmira',      '1 Año',           "$3'800.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-11', 'Rebeca Daza',               48, _p(27,'women'), 'RD', _c(0), 'Cali',         'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-12', 'Sebastián Lucumí',          47, _p(23,'men'),   'SL', _c(1), 'Cali',         'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-13', 'Tatiana Potes',             46, _p(28,'women'), 'TP', _c(2), 'Cali',         'Sin experiencia', "$4'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-14', 'Úrsula Caballero',          44, _p(24,'men'),   'UC', _c(3), 'Buenaventura', 'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-15', 'Verónica Castro',           43, _p(29,'women'), 'VC', _c(4), 'Cali',         'Sin experiencia', "$3'800.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-16', 'William Toro',              41, _p(25,'men'),   'WT', _c(0), 'Cali',         'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-17', 'Ximena Collazos',           40, _p(30,'women'), 'XC', _c(1), 'Bogotá',       'Sin experiencia', "$4'500.000", 'fuera_de_rango'),
  _gen(cfgGCV, 'gcv-18', 'Yackeline Orozco',          39, _p(31,'women'), 'YO', _c(2), 'Cali',         'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-19', 'Zamira Hurtado',            38, _p(26,'men'),   'ZH', _c(3), 'Palmira',      'Sin experiencia', "$3'800.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-20', 'Adriana Vallejo',           37, _p(32,'women'), 'AV', _c(4), 'Cali',         'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-21', 'Bernal Mosquera',           35, _p(27,'men'),   'BM', _c(0), 'Cali',         'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-22', 'Claudia Marmolejo',         34, _p(33,'women'), 'CM', _c(1), 'Cali',         'Sin experiencia', "$4'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-23', 'David Figueroa',            33, _p(28,'men'),   'DF', _c(2), 'Buenaventura', 'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-24', 'Elena Solís',               31, _p(34,'women'), 'ES', _c(3), 'Cali',         'Sin experiencia', "$3'800.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-25', 'Fabián Zapata',             30, _p(29,'men'),   'FZ', _c(4), 'Cali',         'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-26', 'Gladys Arbeláez',           29, _p(35,'women'), 'GA', _c(0), 'Palmira',      'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-27', 'Héctor Giraldo',            27, _p(30,'men'),   'HG', _c(1), 'Cali',         'Sin experiencia', "$4'200.000", 'fuera_de_rango'),
  _gen(cfgGCV, 'gcv-28', 'Irma Bonilla',              26, _p(36,'women'), 'IB', _c(2), 'Cali',         'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-29', 'Javier Salamanca',          25, _p(31,'men'),   'JS', _c(3), 'Bogotá',       'Sin experiencia', "$3'800.000", 'en_rango'),
  _gen(cfgGCV, 'gcv-30', 'Kelly Paredes',             24, _p(37,'women'), 'KP', _c(4), 'Cali',         'Sin experiencia', "$3'000.000", 'en_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 3 — CIENTÍFICO(A) COMPORTAMENTAL
// Bacu | Bogotá | Pipeline: Evaluaciones (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgCB: VConfig = {
  role: 'Científico(a) Comportamental',
  sector: 'Ciencias del Comportamiento / Investigación Aplicada',
  budget: "$6'000.000",
  bio: 'Profesional con más de 3 años en investigación aplicada y experimentación en campo. Dominio de metodologías EAST, 3B o COMB. Manejo de SPSS/R, ATLAS.ti y Power BI. Experiencia en diagnósticos comportamentales y transferencia metodológica a equipos operativos.',
  superpoder: '"Traduce la ciencia del comportamiento en intervenciones que mejoran hábitos y bienestar de los afiliados a lo largo de su vida"',
  noNegS: [
    { label: 'Profesional en ciencias sociales, administrativas, económicas o afines', threshold: 78 },
    { label: 'Más de 3 años en investigación aplicada y experimentación en campo', threshold: 72 },
    { label: 'Dominio de metodologías EAST, 3B o COMB en diseño de intervenciones', threshold: 66 },
    { label: 'Disponibilidad presencial en Bogotá o municipios aledaños', threshold: 60 },
  ],
  logrosHi: [
    'Diseñó e implementó piloto de nudge educativo que incrementó permanencia escolar en 18% en 3 colegios de Bogotá',
    'Publicó 2 artículos en revistas indexadas sobre economía comportamental aplicada al sector social colombiano',
    'Transfirió metodología EAST a equipo de 12 orientadores con 85% de tasa de adopción en 6 meses',
  ],
  logrosMd: [
    'Condujo 4 diagnósticos comportamentales con metodología mixta en proyectos de empleabilidad juvenil',
    'Diseñó cuestionarios psicotécnicos validados para medición de competencias en población de primera infancia',
  ],
  logrosLo: 'Investigación académica básica sin experiencia en intervenciones de campo ni transferencia metodológica a equipos no especializados.',
  senalesHi: ['Confirmar producción de reportes técnicos para audiencias no académicas (gobierno, gerencia)', 'Validar dominio de SPSS o R con análisis de regresión aplicado a comportamiento'],
  senalesMd: ['Validar experiencia real en diseño de pilotos iterativos vs. solo revisión teórica', 'Confirmar manejo de ATLAS.ti o NVivo para análisis cualitativo'],
  senalesLo: ['Sin dominio de EAST, 3B o COMB: no cumple el requisito metodológico central del cargo', 'Perfil exclusivamente académico sin experiencia en intervenciones de campo ni entregables para tomadores de decisión'],
  jobs: [
    { c: 'IPA — Innovations for Poverty Action Colombia', r: 'Research Manager', d: '02/2025' },
    { c: 'DNP — Departamento Nacional de Planeación', r: 'Especialista en Economía Comportamental', d: '08/2024' },
    { c: 'Universidad de los Andes — CEDE', r: 'Investigador(a) Asociado(a)', d: '04/2024' },
    { c: 'Fundación Corona — Social Lab', r: 'Analista de Innovación Social', d: '10/2023' },
    { c: 'PNUD Colombia — Lab de Innovación', r: 'Consultor(a) Comportamental', d: '05/2023' },
  ],
  resumenPreHi: '{name} demuestra dominio riguroso de metodologías comportamentales con intervenciones de campo verificables y producción académica documentada. Comunicación efectiva de hallazgos complejos a audiencias no especializadas.',
  resumenPreLo: '{name} presenta formación sólida en ciencias del comportamiento pero con menor profundidad en intervenciones de campo y en la transferencia metodológica a equipos operativos.',
  noNegP: [
    {
      label: 'Dominio de EAST/3B/COMB + intervenciones de campo',
      evHi: '4 años aplicando metodología EAST en proyectos de empleabilidad. Diseñó 6 pilotos iterativos con grupos de control y medición de impacto.',
      evLo: 'Conoce los frameworks teóricos pero sin experiencia en implementación de pilotos ni medición de resultados en campo.',
    },
    {
      label: 'Manejo de SPSS/R + análisis cuantitativo aplicado',
      evHi: 'R avanzado (tidyverse, lme4). Análisis de datos de panel en 3 estudios con más de 2.000 observaciones cada uno.',
      evLo: 'Manejo básico de SPSS para estadística descriptiva; sin experiencia en modelos de regresión ni análisis longitudinal.',
    },
    {
      label: 'Diagnósticos comportamentales y reportes técnicos',
      evHi: 'Entregó 5 reportes técnicos a entidades de gobierno con recomendaciones accionables. Uno derivó en política pública adoptada por el Ministerio de Educación.',
      evLo: 'Producción de reportes académicos para revista científica; sin experiencia en reportes ejecutivos para tomadores de decisión.',
    },
    {
      label: 'Transferencia metodológica a equipos no especializados',
      evHi: 'Capacitó a 15 orientadores escolares en herramientas de economía conductual con medición de adopción y seguimiento a 3 meses.',
      evLo: 'Experiencia de docencia universitaria; sin transferencia metodológica a equipos operativos en campo.',
    },
  ],
  plusHi: [
    'Experiencia en el sector social o de bienestar familiar con poblaciones en ciclos educativos',
    'Producción académica indexada o publicaciones de divulgación sobre ciencias del comportamiento en Colombia',
    'Inglés avanzado para acceso directo a literatura científica y colaboración con aliados internacionales',
  ],
  plusLo: ['Curiosidad intelectual genuina y rigor metodológico como activos para el aprendizaje en el cargo'],
  insightHi: 'combina el rigor científico con la capacidad de aterrizar hallazgos complejos a lenguaje operacional. Su experiencia en intervenciones de campo lo posiciona para escalar el modelo de acompañamiento de Bacu.',
  insightLo: 'presenta sólida formación teórica pero evidencia brechas en el diseño de pilotos en campo y en la comunicación de hallazgos a audiencias no académicas que el cargo requiere.',
  axes: [
    {
      axis: 'Rigor científico aplicado', ideal: 88, off: 0,
      sum: 'Diseño y evaluación de intervenciones con estándares científicos en contexto operativo.',
      det: 'El Científico Comportamental en Bacu no opera en un laboratorio académico. Aplica metodología rigurosa en contextos de alta variabilidad operativa, con recursos limitados y plazos institucionales.',
    },
    {
      axis: 'Comunicación de hallazgos', ideal: 82, off: -4,
      sum: 'Traducción de resultados complejos a lenguaje accionable para equipos operativos.',
      det: 'La investigación sin comunicación efectiva no cambia comportamientos. El valor del cargo depende de que orientadores, psicólogos y gerentes entiendan y adopten los hallazgos.',
    },
    {
      axis: 'Trabajo interdisciplinario', ideal: 78, off: -6,
      sum: 'Articulación efectiva con equipos de educación, empleabilidad y orientadores.',
      det: 'El cargo opera en intersección de múltiples equipos. La capacidad de construir confianza con especialistas de otras disciplinas define la velocidad de implementación de las intervenciones.',
    },
  ],
  radar: [
    { lbl: 'Rigor analítico', off: 7 }, { lbl: 'P. Crítico', off: 6 }, { lbl: 'Curiosidad', off: 5 },
    { lbl: 'Comunicación', off: -2 }, { lbl: 'Autonomía', off: 3 }, { lbl: 'Colaboración', off: -3 },
    { lbl: 'Innovación', off: 4 }, { lbl: 'Ética', off: 8 }, { lbl: 'Meticulosidad', off: 6 }, { lbl: 'Visión sistémica', off: 2 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con rigor analítico elevado y fuerte vocación por la investigación aplicada al cambio social. Comunica con claridad y trabaja con disciplina metodológica. Su curiosidad intelectual y ética en investigación son activos centrales para el modelo de Bacu.' },
    { title: 'Fit con este rol', body: 'El Científico Comportamental necesita rigor + comunicación + trabajo colaborativo con equipos operativos. La experiencia en el sector social o de bienestar reduce significativamente la curva de adaptación al contexto de caja de compensación.' },
  ],
  q: [
    { tag: 'Para: Coordinador(a) Acompañamiento a lo Largo de la Vida', question: '"Descríbeme una intervención que diseñaste basada en ciencias del comportamiento. ¿Qué metodología usaste, cómo mediste el impacto y qué encontraste?"', validates: 'Dominio metodológico (EAST/3B/COMB), diseño experimental y capacidad de medición de impacto' },
    { tag: 'Para: RRHH', question: '"¿Cómo comunicarías los resultados de un diagnóstico comportamental complejo a un grupo de orientadores sin formación en estadística?"', validates: 'Comunicación de hallazgos científicos a audiencias no especializadas y transferencia metodológica' },
  ],
};

// CB — 3 candidatos en Evaluaciones (con psychTest)
const cbEval: Candidate[] = [
  _gen(cfgCB, 'cb-1', 'Rodrigo Sánchez Martínez',  90, _p(5,'men'),    'RS', _c(0), 'Bogotá', '6 Años', "$5'800.000", 'en_rango',       'evaluaciones'),
  _gen(cfgCB, 'cb-2', 'Paola Andrea Jiménez',       87, _p(7,'women'),  'PJ', _c(1), 'Bogotá', '5 Años', "$6'000.000", 'en_rango',       'evaluaciones'),
  _gen(cfgCB, 'cb-3', 'Sebastián Mora García',      84, _p(6,'men'),    'SM', _c(2), 'Bogotá', '4 Años', "$5'500.000", 'en_rango',       'evaluaciones'),
];
// CB — 5 candidatos en Entrevistas (con prescreeningAI, sin psychTest)
const cbEnt: Candidate[] = [
  _gen(cfgCB, 'cb-4', 'Camila Torres Díaz',         79, _p(8,'women'),  'CT', _c(3), 'Bogotá', '4 Años', "$5'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgCB, 'cb-5', 'Juan Pablo Martínez Rojas',  76, _p(7,'men'),    'JM', _c(4), 'Bogotá', '3 Años', "$7'500.000", 'fuera_de_rango', 'entrevistas'),
  _gen(cfgCB, 'cb-6', 'Laura Forero Vargas',         73, _p(38,'women'), 'LF', _c(0), 'Bogotá', '3 Años', "$5'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgCB, 'cb-7', 'Miguel Vargas Peña',          70, _p(32,'men'),   'MV', _c(1), 'Bogotá', '2 Años', "$5'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgCB, 'cb-8', 'Natalia Espinosa Ruiz',       67, _p(39,'women'), 'NE', _c(2), 'Bogotá', '2 Años', "$5'000.000", 'en_rango',       'entrevistas'),
];
// CB — 22 shells en Scoring
const cbScore: Candidate[] = [
  _gen(cfgCB, 'cb-9',  'Oskar Heredia',              52, _p(33,'men'),   'OH', _c(3), 'Bogotá',      '2 Años',          "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-10', 'Paola Sáenz',                50, _p(40,'women'), 'PS', _c(4), 'Bogotá',      '1 Año',           "$7'500.000", 'fuera_de_rango'),
  _gen(cfgCB, 'cb-11', 'Rebeca Morales',             49, _p(41,'women'), 'RM', _c(0), 'Cali',        '2 Años',          "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-12', 'Santiago Bernal',            47, _p(34,'men'),   'SB', _c(1), 'Bogotá',      '2 Años',          "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-13', 'Teresa Muñoz',               46, _p(42,'women'), 'TM', _c(2), 'Bogotá',      '1 Año',           "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-14', 'Ulises Rodríguez',           44, _p(35,'men'),   'UR', _c(3), 'Bogotá',      '1 Año',           "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-15', 'Valeria Romero',             43, _p(43,'women'), 'VR', _c(4), 'Medellín',    '1 Año',           "$6'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-16', 'William Peñaloza',           41, _p(36,'men'),   'WP', _c(0), 'Bogotá',      'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-17', 'Ximena Guerrero',            40, _p(44,'women'), 'XG', _c(1), 'Bogotá',      'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-18', 'Yennifer Garzón',            39, _p(45,'women'), 'YG', _c(2), 'Bogotá',      'Sin experiencia', "$7'500.000", 'fuera_de_rango'),
  _gen(cfgCB, 'cb-19', 'Zulma Barón',                37, _p(37,'men'),   'ZB', _c(3), 'Bogotá',      'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-20', 'Andrés Pulido',              36, _p(46,'women'), 'AP', _c(4), 'Barranquilla', 'Sin experiencia',"$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-21', 'Blanca Niño',                35, _p(38,'men'),   'BN', _c(0), 'Bogotá',      'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-22', 'Carlos Reyes',               33, _p(47,'women'), 'CR', _c(1), 'Bogotá',      'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-23', 'Diana Mora',                 32, _p(39,'men'),   'DM', _c(2), 'Medellín',    'Sin experiencia', "$6'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-24', 'Ernesto Cárdenas',           31, _p(48,'women'), 'EC', _c(3), 'Bogotá',      'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-25', 'Fernanda Ramírez',           30, _p(40,'men'),   'FR', _c(4), 'Bogotá',      'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-26', 'Guillermo Suárez',           28, _p(49,'women'), 'GS', _c(0), 'Bogotá',      'Sin experiencia', "$7'500.000", 'fuera_de_rango'),
  _gen(cfgCB, 'cb-27', 'Helena Vega',                27, _p(41,'men'),   'HV', _c(1), 'Cali',        'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-28', 'Isabela Cruz',               26, _p(50,'women'), 'IC', _c(2), 'Bogotá',      'Sin experiencia', "$5'500.000", 'en_rango'),
  _gen(cfgCB, 'cb-29', 'Jorge Pineda',               25, _p(42,'men'),   'JP', _c(3), 'Bogotá',      'Sin experiencia', "$5'000.000", 'en_rango'),
  _gen(cfgCB, 'cb-30', 'Karen Pachón',               24, _p(51,'women'), 'KP', _c(4), 'Bogotá',      'Sin experiencia', "$5'500.000", 'en_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export const COMFANDI_VACANTES: import('./mock').Vacante[] = [
  {
    id: 'mock-comf-gca', jobId: 'mock-comf-gca', status: 'activa',
    title: 'Gestor(a) Comercial Convenios y Alianzas Crédito',
    area: ['Crédito', 'Comercial'], priority: 'alta',
    progressLabel: 'Pruebas', progressPct: 60,
    total: 30, activos: 3, fecha: '15 Ene 2025',
  },
  {
    id: 'mock-comf-gcv', jobId: 'mock-comf-gcv', status: 'activa',
    title: 'Gestor(a) Calidad de Vida Crédito',
    area: ['Crédito', 'Servicios Financieros'], priority: 'alta',
    progressLabel: 'Pruebas', progressPct: 60,
    total: 30, activos: 3, fecha: '20 Ene 2025',
  },
  {
    id: 'mock-comf-cb', jobId: 'mock-comf-cb', status: 'activa',
    title: 'Científico(a) Comportamental',
    area: ['Investigación', 'Comportamiento'], priority: 'alta',
    progressLabel: 'Pruebas', progressPct: 60,
    total: 30, activos: 3, fecha: '25 Ene 2025',
  },
];

export const COMFANDI_DESCRIPTIONS: Record<string, string> = {
  'mock-comf-gca':
    'Bacu busca un(a) Gestor(a) Comercial de Convenios y Alianzas Crédito para gestionar el proceso comercial y administrativo de vinculación de empresas con convenio de libranza en Medellín. El cargo combina visitas comerciales a empresas potenciales, legalización y firma de convenios, profundización del portafolio financiero y monitoreo de indicadores de colocación bajo la Gerencia de Crédito de Bacu.',
  'mock-comf-gcv':
    'Bacu requiere un(a) Gestor(a) Calidad de Vida Crédito para ofrecer y gestionar el portafolio de servicios financieros de la UES en Cali mediante venta consultiva. El cargo abarca líneas de crédito libranza, hipotecario y consumo, con visitas diarias a empresas afiliadas, radicación y seguimiento de créditos, gestión de base de preaprobados y cumplimiento de metas de colocación y calidad de cartera.',
  'mock-comf-cb':
    'Bacu busca un(a) Científico(a) Comportamental para diseñar, implementar y evaluar estrategias basadas en ciencias del comportamiento en Bogotá. El cargo fortalece el modelo de acompañamiento a lo largo de la vida mediante diagnósticos comportamentales, pilotos iterativos basados en evidencia, transferencia metodológica a orientadores y psicólogos, y reportes técnicos para la toma de decisiones en educación, empleabilidad y desarrollo empresarial.',
};

export function getBacuPipelineStages(jobId: string): import('./mock').PipelineStage[] | null {
  const s = (id: string, label: string, badge: string, status: StageStatus, count: number, isAI: boolean): PipelineStage =>
    ({ id, label, stageBadge: badge, status, candidateCount: count, isAI, route: `/pipeline/${jobId}/${id}` });

  switch (jobId) {
    case 'mock-comf-gca':
      return [
        s('scoring',      'Scoring IA',        'Scoring',       'completed',   30, true),
        s('prescreening', 'Pre-entrevista IA',  'Pre screening', 'completed',    8, true),
        s('entrevistas',  'Entrevistas',         'Entrevistas',   'completed',    5, false),
        s('evaluaciones', 'Pruebas',             'Pruebas',       'in_progress',  3, false),
        s('finalistas',   'Finalistas',          'Finalistas',    'not_started',  2, false),
      ];
    case 'mock-comf-gcv':
      return [
        s('scoring',      'Scoring IA',        'Scoring',       'completed',   30, true),
        s('prescreening', 'Pre-entrevista IA',  'Pre screening', 'completed',    8, true),
        s('entrevistas',  'Entrevistas',         'Entrevistas',   'completed',    5, false),
        s('evaluaciones', 'Pruebas',             'Pruebas',       'in_progress',  3, false),
        s('finalistas',   'Finalistas',          'Finalistas',    'not_started',  2, false),
      ];
    case 'mock-comf-cb':
      return [
        s('scoring',      'Scoring IA',        'Scoring',       'completed',   30, true),
        s('prescreening', 'Pre-entrevista IA',  'Pre screening', 'completed',    8, true),
        s('entrevistas',  'Entrevistas',         'Entrevistas',   'completed',    5, false),
        s('evaluaciones', 'Pruebas',             'Pruebas',       'in_progress',  3, false),
        s('finalistas',   'Finalistas',          'Finalistas',    'not_started',  2, false),
      ];
    default:
      return null;
  }
}

export const COMFANDI_CANDIDATES_BY_STAGE: Record<string, Partial<Record<string, Candidate[]>>> = {
  'mock-comf-gca': {
    scoring:      [...gcaEval, ...gcaEnt, ...gcaScore],
    prescreening: [...gcaEval, ...gcaEnt],
    entrevistas:  gcaEnt,
    evaluaciones: gcaEval,
  },
  'mock-comf-gcv': {
    scoring:      [...gcvEval, ...gcvEnt, ...gcvScore],
    prescreening: [...gcvEval, ...gcvEnt],
    entrevistas:  gcvEnt,
    evaluaciones: gcvEval,
  },
  'mock-comf-cb': {
    scoring:      [...cbEval, ...cbEnt, ...cbScore],
    prescreening: [...cbEval, ...cbEnt],
    entrevistas:  cbEnt,
    evaluaciones: cbEval,
  },
};

export { gcaEval, gcvEval, cbEval };

export const COMFANDI_ALL_CANDIDATES: Candidate[] = [
  ...gcaEval, ...gcaEnt, ...gcaScore,
  ...gcvEval, ...gcvEnt, ...gcvScore,
  ...cbEval, ...cbEnt, ...cbScore,
];
