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
// VACANTE PRINCIPAL — MESERO / POLIFUNCIONAL
// Bacu | Medellín | Pipeline: Pruebas (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgMesero: VConfig = {
  role: 'Mesero / Polifuncional',
  sector: 'Restaurantes / Servicio al Cliente',
  budget: '$1.705.905 + auxilio de transporte + alimentación + bonificaciones',
  bio: 'Perfil de servicio con mínimo 6 meses de experiencia certificada en atención al cliente (con NIT). Edad máx. 33–34 años. Experiencia en cadena deseable pero no obligatoria. Disponibilidad para turnos rotativos en diferentes puntos de Medellín.',
  superpoder: '"Convierte cada visita al restaurante en una experiencia memorable para el cliente"',
  noNegS: [
    { label: 'Mín. 6 meses de experiencia certificada en servicio al cliente (con NIT y certificable es suficiente)', threshold: 78 },
    { label: 'Edad máx. 33–34 años', threshold: 72 },
    { label: 'Experiencia en restaurante de cadena (deseable; no obligatorio si hay actitud y certificación)', threshold: 66 },
    { label: 'Disponibilidad completa para turnos rotativos (lunes a domingo)', threshold: 60 },
  ],
  logrosHi: [
    'Atendió hasta 12 mesas simultáneas en turno de alta demanda con cero quejas registradas',
    'Aprendió operación de barra de café en 2 semanas y alcanzó estándares de calidad del punto',
    'Reconocido por el equipo como el colaborador con mejor NPS de experiencia al cliente en el trimestre',
  ],
  logrosMd: [
    'Trabajó en atención en mesa y caja con buena adaptación a turnos rotativos y alta demanda',
    'Completó la inducción operativa de su restaurante anterior sin errores en el primer mes',
  ],
  logrosLo: 'Experiencia en atención básica sin evidencia de multifuncionalidad ni indicadores de servicio al cliente.',
  senalesHi: [
    'Verificar que la experiencia esté certificada con NIT del empleador (requisito de documentación)',
    'Confirmar edad y disponibilidad total para turnos rotativos incluyendo festivos',
  ],
  senalesMd: [
    'Confirmar que la experiencia previa es certificable con NIT (no aplica trabajo informal)',
    'Validar experiencia en servicio en mesa vs. solo domicilios o caja',
  ],
  senalesLo: [
    'Sin experiencia certificada en atención al cliente: no cumple el requisito mínimo del cargo',
    'Edad fuera del rango o sin disponibilidad para turnos rotativos',
  ],
  jobs: [
    { c: 'El Corral Medellín — Centro Comercial El Tesoro', r: 'Mesero / Cajero', d: '03/2025' },
    { c: 'Juan Valdez Café — Laureles', r: 'Barista / Asesor de Servicio', d: '09/2024' },
    { c: 'Frisby Medellín — Estadio', r: 'Auxiliar de Servicio Polifuncional', d: '05/2024' },
    { c: 'McDonald\'s Colombia — Bello', r: 'Crew Member / Atención al Cliente', d: '11/2023' },
    { c: 'Crepes & Waffles — El Poblado', r: 'Mesero(a) Tiempo Completo', d: '06/2023' },
  ],
  resumenPreHi: '{name} demuestra experiencia verificable en atención en mesa y barra con buena actitud de servicio. Disponibilidad confirmada para turnos rotativos y conocimiento básico de máquina de café.',
  resumenPreLo: '{name} presenta disposición para el servicio pero con menor experiencia en multifuncionalidad y atención bajo alta demanda.',
  noNegP: [
    {
      label: 'Experiencia certificada mín. 6 meses en servicio al cliente (con NIT)',
      evHi: '1 año y 4 meses en atención en mesa, barra y caja en restaurantes de cadena. Experiencia certificable con NIT del empleador anterior.',
      evLo: 'Experiencia de 3 meses en domicilios sin certificación laboral formal; no cuenta como experiencia certificable.',
    },
    {
      label: 'Edad máx. 33–34 años',
      evHi: '28 años. Cumple el rango de edad requerido por el perfil operativo del cargo.',
      evLo: '36 años. Supera el límite de edad máximo definido por el perfil del cargo.',
    },
    {
      label: 'Experiencia en restaurante de cadena (deseable, no obligatorio)',
      evHi: 'Trabajó en El Corral y Juan Valdez — experiencia directa en cadena con estándares definidos y alta demanda.',
      evLo: 'Experiencia únicamente en restaurante familiar sin procesos estandarizados; la curva de adaptación puede ser mayor.',
    },
    {
      label: 'Disponibilidad completa turnos rotativos lunes a domingo',
      evHi: 'Disponibilidad inmediata y total para cualquier turno, incluyendo fines de semana y festivos. Sin compromisos laborales actuales.',
      evLo: 'Solo disponible en horario diurno de lunes a viernes por estudios nocturnos.',
    },
  ],
  plusHi: [
    'Conocimiento de preparación de bebidas calientes y frías (barismo básico)',
    'Experiencia en manejo de domicilios con plataformas como Rappi o iFood',
    'Capacidad de aprendizaje rápido de cartas y protocolos de servicio',
  ],
  plusLo: ['Actitud positiva y genuinas ganas de aprender el ritmo y estándares de Bacu'],
  insightHi: 'tiene el ritmo, la actitud de servicio y la multifuncionalidad para integrarse al equipo de Bacu desde el primer turno. Su experiencia en cadenas de alto volumen reduce la curva de adaptación.',
  insightLo: 'muestra buena disposición pero evidencia brechas en la multifuncionalidad y en la atención bajo alta demanda que el cargo requiere.',
  axes: [
    {
      axis: 'Orientación al cliente', ideal: 86, off: 0,
      sum: 'Calidez genuina y agilidad para superar las expectativas del comensal.',
      det: 'En Bacu, el servicio es el producto. La experiencia del cliente en mesa depende directamente de la energía, actitud y atención del mesero en cada interacción.',
    },
    {
      axis: 'Adaptabilidad y multifuncionalidad', ideal: 80, off: -4,
      sum: 'Capacidad de rotar entre barra, mesa, caja y domicilios según la demanda.',
      det: 'El perfil polifuncional es el core del cargo. La capacidad de aprender rápido y moverse entre estaciones define el valor del colaborador para el equipo.',
    },
    {
      axis: 'Trabajo en equipo bajo presión', ideal: 76, off: -6,
      sum: 'Comunicación fluida y soporte mutuo en turnos de alta demanda.',
      det: 'Los picos de demanda en restaurantes requieren coordinación inmediata entre meseros, barra y cocina. La colaboración en esos momentos diferencia a los equipos de alto rendimiento.',
    },
  ],
  radar: [
    { lbl: 'Calidez', off: 7 }, { lbl: 'Energía', off: 5 }, { lbl: 'Agilidad', off: 4 },
    { lbl: 'Empatía', off: 6 }, { lbl: 'Adaptabilidad', off: -2 }, { lbl: 'Trabajo en equipo', off: 3 },
    { lbl: 'Comunicación', off: 5 }, { lbl: 'Orientación al logro', off: -1 }, { lbl: 'Aprendizaje', off: 4 }, { lbl: 'Resiliencia', off: 2 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta orientación al servicio y energía natural para el trabajo en equipo. Se adapta rápido a entornos de alta demanda y aprende con velocidad los protocolos de cada estación. Su motivación intrínseca por generar experiencias positivas es su principal activo.' },
    { title: 'Fit con este rol', body: 'El Mesero/Polifuncional de Bacu requiere calidez + agilidad + multifuncionalidad. La disponibilidad para turnos rotativos y el aprendizaje rápido de barra y caja son la principal curva de adaptación para perfiles sin experiencia previa en cadena.' },
  ],
  q: [
    { tag: 'Para: Administrador del punto', question: '"Cuéntame cómo manejas un turno donde hay más mesas de las que puedes atender bien. ¿Qué priorizas y cómo lo comunicas al equipo?"', validates: 'Gestión bajo presión, trabajo en equipo y toma de decisiones en alta demanda' },
    { tag: 'Para: RRHH', question: '"¿Cuál ha sido el momento más difícil en atención al cliente que hayas vivido? ¿Cómo lo resolviste?"', validates: 'Resiliencia, orientación al cliente y manejo de situaciones de conflicto' },
  ],
};

// Mesero — 3 candidatos en Evaluaciones (con psychTest)
const mesEval: Candidate[] = [
  _gen(cfgMesero, 'mes-1', 'Valentina Ríos Herrera',   88, _p(1,'women'),  'VR', _c(0), 'Medellín', '1 Año 4 Meses', '$1.800.000', 'en_rango',       'evaluaciones'),
  _gen(cfgMesero, 'mes-2', 'Camilo Andrés Zapata',      84, _p(1,'men'),    'CZ', _c(1), 'Medellín', '1 Año',         '$1.705.905', 'en_rango',       'evaluaciones'),
  _gen(cfgMesero, 'mes-3', 'Daniela Salazar Ospina',    80, _p(2,'women'),  'DS', _c(2), 'Medellín', '8 Meses',       '$1.600.000', 'en_rango',       'evaluaciones'),
];
// Mesero — 5 candidatos en Entrevistas (con prescreeningAI)
const mesEnt: Candidate[] = [
  _gen(cfgMesero, 'mes-4', 'Sebastián Morales Gil',     74, _p(2,'men'),    'SM', _c(3), 'Medellín', '10 Meses',      '$1.705.905', 'en_rango',       'entrevistas'),
  _gen(cfgMesero, 'mes-5', 'Laura Estefanía Cano',      70, _p(3,'women'),  'LC', _c(4), 'Medellín', '6 Meses',       '$2.000.000', 'fuera_de_rango', 'entrevistas'),
  _gen(cfgMesero, 'mes-6', 'Juan David Henao',           67, _p(3,'men'),    'JH', _c(0), 'Medellín', '7 Meses',       '$1.600.000', 'en_rango',       'entrevistas'),
  _gen(cfgMesero, 'mes-7', 'Manuela Tobón Arango',      64, _p(4,'women'),  'MT', _c(1), 'Medellín', '6 Meses',       '$1.705.905', 'en_rango',       'entrevistas'),
  _gen(cfgMesero, 'mes-8', 'Andrés Felipe Cardona',     61, _p(4,'men'),    'AC', _c(2), 'Medellín', '6 Meses',       '$1.705.905', 'en_rango',       'entrevistas'),
];
// Mesero — 22 shells en Scoring
const mesScore: Candidate[] = [
  _gen(cfgMesero, 'mes-9',  'Isabella García',           57, _p(10,'women'), 'IG', _c(0), 'Medellín',    '6 Meses',         '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-10', 'Tomás Restrepo',            55, _p(10,'men'),   'TR', _c(1), 'Medellín',    '6 Meses',         '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-11', 'Natalia Zuluaga',           53, _p(11,'women'), 'NZ', _c(2), 'Bello',       '3 Meses',         '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-12', 'Esteban Giraldo',           51, _p(11,'men'),   'EG', _c(3), 'Medellín',    '4 Meses',         '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-13', 'Sara Milena Pérez',         50, _p(12,'women'), 'SP', _c(4), 'Itagüí',      '3 Meses',         '$2.100.000', 'fuera_de_rango'),
  _gen(cfgMesero, 'mes-14', 'Miguel Ángel Torres',       48, _p(12,'men'),   'MT', _c(0), 'Medellín',    'Sin experiencia', '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-15', 'Juliana Montoya',           47, _p(13,'women'), 'JM', _c(1), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-16', 'Cristian Bedoya',           46, _p(13,'men'),   'CB', _c(2), 'Envigado',    '3 Meses',         '$1.600.000', 'en_rango'),
  _gen(cfgMesero, 'mes-17', 'Valentina Hurtado',         44, _p(14,'women'), 'VH', _c(3), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-18', 'Felipe Agudelo',            43, _p(14,'men'),   'FA', _c(4), 'Medellín',    'Sin experiencia', '$2.200.000', 'fuera_de_rango'),
  _gen(cfgMesero, 'mes-19', 'Daniela Quintero',          41, _p(15,'women'), 'DQ', _c(0), 'Copacabana',  'Sin experiencia', '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-20', 'Santiago Londoño',          40, _p(15,'men'),   'SL', _c(1), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-21', 'Alejandra Cárdenas',        39, _p(16,'women'), 'ALC', _c(2), 'Medellín',   'Sin experiencia', '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-22', 'Nicolás Arango',            38, _p(16,'men'),   'NA', _c(3), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-23', 'Paula Ximena Velásquez',    37, _p(17,'women'), 'PV', _c(4), 'Bello',       'Sin experiencia', '$1.400.000', 'en_rango'),
  _gen(cfgMesero, 'mes-24', 'David Estrada',             36, _p(17,'men'),   'DE', _c(0), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-25', 'Melissa Cano Rueda',        35, _p(18,'women'), 'MCR', _c(1), 'Itagüí',     'Sin experiencia', '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-26', 'Carlos Muñoz',              33, _p(18,'men'),   'CM', _c(2), 'Medellín',    'Sin experiencia', '$2.000.000', 'fuera_de_rango'),
  _gen(cfgMesero, 'mes-27', 'Sofía Marín',               32, _p(19,'women'), 'SM2', _c(3), 'Medellín',   'Sin experiencia', '$1.500.000', 'en_rango'),
  _gen(cfgMesero, 'mes-28', 'Brayan Osorio',             31, _p(19,'men'),   'BO', _c(4), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
  _gen(cfgMesero, 'mes-29', 'Luisa Fernanda Díaz',       30, _p(20,'women'), 'LD', _c(0), 'Sabaneta',    'Sin experiencia', '$1.400.000', 'en_rango'),
  _gen(cfgMesero, 'mes-30', 'Jhon Jairo Ramírez',        28, _p(20,'men'),   'JR', _c(1), 'Medellín',    'Sin experiencia', '$1.705.905', 'en_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export const BACU_VACANTES: import('./mock').Vacante[] = [
  // ── Vacante principal con pipeline completo ───────────────────────────────
  {
    id: 'bacu-mesero-med', jobId: 'bacu-mesero-med', status: 'activa',
    title: 'Mesero / Polifuncional',
    area: ['Servicio', 'Operaciones'], priority: 'alta',
    progressLabel: 'Pruebas', progressPct: 60,
    total: 30, activos: 3, fecha: '01 May 2025',
  },
  // ── Otras vacantes (tabla) ─────────────────────────────────────────────────
  {
    id: 'bacu-expansion', jobId: 'bacu-expansion', status: 'activa',
    title: 'Especialista de Expansión Inmobiliaria',
    area: ['Expansión', 'Inmobiliaria'], priority: 'alta',
    progressLabel: 'Pre-screening IA', progressPct: 20,
    total: 22, activos: 8, fecha: '15 Abr 2025',
  },
  {
    id: 'bacu-mesero-bog', jobId: 'bacu-mesero-bog', status: 'activa',
    title: 'Mesero / Polifuncional',
    area: ['Servicio', 'Operaciones'], priority: 'media',
    progressLabel: 'Scoring IA', progressPct: 10,
    total: 18, activos: 18, fecha: '20 Abr 2025',
  },
  {
    id: 'bacu-aux-cocina-bog', jobId: 'bacu-aux-cocina-bog', status: 'activa',
    title: 'Auxiliar de Cocina',
    area: ['Cocina', 'Operaciones'], priority: 'media',
    progressLabel: 'Scoring IA', progressPct: 10,
    total: 15, activos: 15, fecha: '22 Abr 2025',
  },
  {
    id: 'bacu-mesero-mt', jobId: 'bacu-mesero-mt', status: 'activa',
    title: 'Mesero Medio Tiempo',
    area: ['Servicio', 'Operaciones'], priority: 'media',
    progressLabel: 'Entrevistas', progressPct: 40,
    total: 25, activos: 6, fecha: '10 Abr 2025',
  },
  {
    id: 'bacu-mesero-tc', jobId: 'bacu-mesero-tc', status: 'activa',
    title: 'Mesero Tiempo Completo',
    area: ['Servicio', 'Operaciones'], priority: 'alta',
    progressLabel: 'Pre-screening IA', progressPct: 20,
    total: 20, activos: 9, fecha: '12 Abr 2025',
  },
  {
    id: 'bacu-aux-pasteleria', jobId: 'bacu-aux-pasteleria', status: 'activa',
    title: 'Auxiliar de Cocina — Pastelería y Panadería',
    area: ['Cocina', 'Pastelería'], priority: 'media',
    progressLabel: 'Scoring IA', progressPct: 10,
    total: 12, activos: 12, fecha: '25 Abr 2025',
  },
  {
    id: 'bacu-cocinero-med', jobId: 'bacu-cocinero-med', status: 'activa',
    title: 'Primer Cocinero',
    area: ['Cocina', 'Operaciones'], priority: 'alta',
    progressLabel: 'Entrevistas', progressPct: 40,
    total: 14, activos: 5, fecha: '05 Abr 2025',
  },
  {
    id: 'bacu-mesero-tc-med', jobId: 'bacu-mesero-tc-med', status: 'activa',
    title: 'Mesero Tiempo Completo',
    area: ['Servicio', 'Operaciones'], priority: 'media',
    progressLabel: 'Pre-screening IA', progressPct: 20,
    total: 19, activos: 8, fecha: '18 Abr 2025',
  },
  {
    id: 'bacu-admin-rest', jobId: 'bacu-admin-rest', status: 'activa',
    title: 'Administrador de Restaurante',
    area: ['Administración', 'Operaciones'], priority: 'alta',
    progressLabel: 'Pruebas', progressPct: 60,
    total: 16, activos: 2, fecha: '01 Mar 2025',
  },
];

export const BACU_DESCRIPTIONS: Record<string, string> = {
  'bacu-mesero-med':
    'BACU busca un(a) Mesero/Polifuncional para apoyar los procesos del área operativa en Medellín: barra, atención en mesa, caja y domicilios. Contrato a término indefinido con contratación inmediata al aprobar el proceso. Salario: $1.705.905 + auxilio de transporte + auxilio de alimentación + bonificaciones. Turnos rotativos, de lunes a domingo (sin turno partido).',
  'bacu-expansion':
    'BACU requiere un(a) Especialista de Expansión Inmobiliaria para liderar la búsqueda, evaluación y negociación de nuevos locales comerciales en Bogotá. El cargo combina análisis de mercado, gestión de propietarios y coordinación con el equipo de arquitectura e ingeniería para nuevas aperturas.',
  'bacu-mesero-bog':
    'BACU busca Mesero/Polifuncional para sus puntos en Bogotá. Atención en mesa, barra, caja y domicilios. Turnos rotativos con disponibilidad de lunes a domingo.',
  'bacu-aux-cocina-bog':
    'BACU requiere Auxiliar de Cocina para sus puntos en Bogotá. Apoyo en preparación de alimentos, mantenimiento de estándares de higiene y soporte al equipo de cocina en todos los procesos.',
  'bacu-mesero-mt':
    'BACU busca Mesero Medio Tiempo para Bogotá. Salario: $875.452 mensual. Turnos parciales con disponibilidad para fines de semana y días de alta demanda.',
  'bacu-mesero-tc':
    'BACU requiere Mesero Tiempo Completo para Bogotá. Salario: $1.750.904 mensual. Jornada completa con turnos rotativos de lunes a domingo.',
  'bacu-aux-pasteleria':
    'BACU busca Auxiliar de Cocina especializado en Pastelería y Panadería para sus puntos en Bogotá. Preparación de productos de repostería, mantenimiento de recetas y estándares de calidad.',
  'bacu-cocinero-med':
    'BACU requiere Primer Cocinero para sus puntos en Medellín. Liderazgo de la cocina en turno, elaboración de platos, control de porciones y supervisión del equipo de auxiliares.',
  'bacu-mesero-tc-med':
    'BACU busca Mesero Tiempo Completo para Medellín. Jornada completa con turnos rotativos. Contrato a término indefinido.',
  'bacu-admin-rest':
    'BACU requiere Administrador de Restaurante para Medellín. Salario: $2.500.000 mensual. Responsable de la operación completa del punto: equipo, inventario, indicadores y experiencia del cliente.',
};

export function getBacuPipelineStages(jobId: string): import('./mock').PipelineStage[] | null {
  const s = (id: string, label: string, badge: string, status: StageStatus, count: number, isAI: boolean): PipelineStage =>
    ({ id, label, stageBadge: badge, status, candidateCount: count, isAI, route: `/pipeline/${jobId}/${id}` });

  if (jobId === 'bacu-mesero-med') {
    return [
      s('scoring',      'Scoring IA',       'Scoring',       'completed',   30, true),
      s('prescreening', 'Pre-entrevista IA', 'Pre screening', 'completed',    8, true),
      s('entrevistas',  'Entrevistas',       'Entrevistas',   'completed',    5, false),
      s('evaluaciones', 'Pruebas',           'Pruebas',       'in_progress',  3, false),
      s('finalistas',   'Finalistas',        'Finalistas',    'not_started',  2, false),
    ];
  }
  return null;
}

export const BACU_CANDIDATES_BY_STAGE: Record<string, Partial<Record<string, Candidate[]>>> = {
  'bacu-mesero-med': {
    scoring:      [...mesEval, ...mesEnt, ...mesScore],
    prescreening: [...mesEval, ...mesEnt],
    entrevistas:  mesEnt,
    evaluaciones: mesEval,
  },
};

export { mesEval };

export const BACU_ALL_CANDIDATES: Candidate[] = [
  ...mesEval, ...mesEnt, ...mesScore,
];
