/**
 * Единый конфиг структуры ОГЭ по химии.
 * Перед каждым учебным годом сверять с демоверсией и кодификатором ФИПИ
 * и менять параметры только здесь — нигде в коде и контенте числа не хардкодятся.
 */

export const EXAM_YEAR = 2026;

/**
 * С 2025 года структура экзамена изменилась: число заданий уменьшено
 * с 24 до 23 (убрано отдельное задание 24), максимальный балл — с 40 до 38.
 * Задание 23 объединило практический эксперимент (бывшее задание 24) и
 * распознавание веществ; из задания 21 убрана часть про ионное уравнение —
 * теперь оно проверяется новым заданием 23. Сверено с демоверсией и
 * методическими рекомендациями ФИПИ на 2025/2026 год.
 */
export const EXAM_CONFIG = {
  year: EXAM_YEAR,
  totalTasks: 23,
  part1Tasks: 19, // задания с кратким ответом
  part2Tasks: 4, // задания с развёрнутым ответом (20–23)
  part2StartsAt: 20,
  maxPrimaryScore: 38,
  durationMinutes: 180,
  experimentTaskNumber: 23,
  timerWarningsAtMinutesLeft: [30, 5] as const,
  autosaveIntervalSeconds: 15,
} as const;

export interface GradeBand {
  grade: 2 | 3 | 4 | 5;
  minScore: number;
  maxScore: number;
  label: string;
}

/** Шкала перевода первичного балла в отметку. */
export const GRADE_SCALE: GradeBand[] = [
  { grade: 2, minScore: 0, maxScore: 9, label: '«2»' },
  { grade: 3, minScore: 10, maxScore: 20, label: '«3»' },
  { grade: 4, minScore: 21, maxScore: 30, label: '«4»' },
  { grade: 5, minScore: 31, maxScore: EXAM_CONFIG.maxPrimaryScore, label: '«5»' },
];

export function scoreToGrade(score: number): GradeBand {
  const band = GRADE_SCALE.find((b) => score >= b.minScore && score <= b.maxScore);
  return band ?? GRADE_SCALE[0];
}

export type Difficulty = 'base' | 'advanced' | 'high';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  base: 'Базовый',
  advanced: 'Повышенный',
  high: 'Высокий',
};

/**
 * Раздел кодификатора ФИПИ. id используется как topicId в заданиях и теории.
 */
export interface CodifierTopic {
  id: string;
  title: string;
  section: string;
}

export const CODIFIER_SECTIONS = [
  'Химический элемент',
  'Вещество',
  'Химическая реакция',
  'Элементарные основы неорганической химии',
  'Первоначальные представления об органических веществах',
  'Методы познания веществ и химических явлений. Экспериментальные основы химии',
  'Расчёты по химическим формулам и уравнениям реакций',
] as const;

export const CODIFIER_TOPICS: CodifierTopic[] = [
  { id: 'stroenie-atoma', title: 'Строение атома', section: CODIFIER_SECTIONS[0] },
  { id: 'periodicheskiy-zakon', title: 'Периодический закон и система Д. И. Менделеева', section: CODIFIER_SECTIONS[0] },
  { id: 'stroenie-molekul-vidy-svyazi', title: 'Строение молекул. Виды химической связи', section: CODIFIER_SECTIONS[0] },
  { id: 'valentnost-stepen-okisleniya', title: 'Валентность и степень окисления', section: CODIFIER_SECTIONS[0] },
  { id: 'prostye-slozhnye-veshestva', title: 'Простые и сложные вещества', section: CODIFIER_SECTIONS[1] },
  { id: 'klassifikatsiya-neorganicheskih-veshestv', title: 'Классификация неорганических веществ', section: CODIFIER_SECTIONS[1] },
  { id: 'chistye-veshestva-smesi', title: 'Чистые вещества и смеси', section: CODIFIER_SECTIONS[1] },
  { id: 'himicheskie-reaktsii-klassifikatsiya', title: 'Классификация химических реакций', section: CODIFIER_SECTIONS[2] },
  { id: 'kachestvennye-reaktsii', title: 'Качественные реакции на ионы и вещества', section: CODIFIER_SECTIONS[2] },
  { id: 'elektroliticheskaya-dissotsiatsiya', title: 'Электролитическая диссоциация. Ионные уравнения', section: CODIFIER_SECTIONS[2] },
  { id: 'okislitelno-vosstanovitelnye-reaktsii', title: 'Окислительно-восстановительные реакции', section: CODIFIER_SECTIONS[2] },
  { id: 'skorost-himicheskoy-reaktsii', title: 'Скорость химической реакции', section: CODIFIER_SECTIONS[2] },
  { id: 'metally', title: 'Металлы и их соединения', section: CODIFIER_SECTIONS[3] },
  { id: 'nemetally', title: 'Неметаллы и их соединения', section: CODIFIER_SECTIONS[3] },
  { id: 'oksidy', title: 'Оксиды: классификация и свойства', section: CODIFIER_SECTIONS[3] },
  { id: 'osnovaniya', title: 'Основания: классификация и свойства', section: CODIFIER_SECTIONS[3] },
  { id: 'kisloty', title: 'Кислоты: классификация и свойства', section: CODIFIER_SECTIONS[3] },
  { id: 'soli', title: 'Соли: классификация и свойства', section: CODIFIER_SECTIONS[3] },
  { id: 'genetichesk-svyaz-neorg', title: 'Генетическая связь между классами неорганических веществ', section: CODIFIER_SECTIONS[3] },
  { id: 'organicheskie-veshestva-vvedenie', title: 'Первоначальные представления об органических веществах', section: CODIFIER_SECTIONS[4] },
  { id: 'himicheskiy-eksperiment', title: 'Правила безопасной работы в лаборатории. Химический эксперимент', section: CODIFIER_SECTIONS[5] },
  { id: 'raschety-massovaya-dolya', title: 'Массовая доля вещества в растворе', section: CODIFIER_SECTIONS[6] },
  { id: 'raschety-po-uravneniyam', title: 'Расчёты по уравнениям реакций', section: CODIFIER_SECTIONS[6] },
];

export function getCodifierTopic(id: string): CodifierTopic | undefined {
  return CODIFIER_TOPICS.find((t) => t.id === id);
}

/** Краткое описание того, что проверяет каждый номер задания ОГЭ (используется на /zadaniya/[n]/). */
export interface ExamTaskMeta {
  number: number;
  title: string;
  skillsChecked: string;
  answerType: 'single' | 'multiple' | 'matching' | 'numeric' | 'sequence' | 'extended';
  maxScore: number;
  part: 1 | 2;
}

/**
 * Соответствие номер → тема сверено с демоверсией/спецификацией/кодификатором
 * ФИПИ ОГЭ по химии 2025/2026 (см. комментарий у EXAM_CONFIG про смену
 * структуры) и уточнено вручную по актуальной демоверсии. Задания 12 и 17 —
 * два задания на качественные реакции: 12 просит определить признак
 * (наблюдение) реакции, 17 — выбрать реактив для различения двух веществ.
 */
export const EXAM_TASKS_META: ExamTaskMeta[] = [
  { number: 1, title: 'Простое вещество и химический элемент', skillsChecked: 'Различать, в каком значении употреблено название/символ элемента в тексте — как химический элемент (входит в состав) или как простое вещество (обладает физическими свойствами, участвует в реакции в свободном виде).', answerType: 'single', maxScore: 1, part: 1 },
  { number: 2, title: 'Периодический закон', skillsChecked: 'Сравнивать свойства элементов и их соединений по положению в периодической системе.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 3, title: 'Строение электронных оболочек атомов', skillsChecked: 'Определять число протонов, нейтронов и электронов в атоме по положению элемента в периодической системе.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 4, title: 'Валентность и степень окисления', skillsChecked: 'Определять валентность и степень окисления элементов по формуле вещества.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 5, title: 'Классификация неорганических веществ', skillsChecked: 'Относить вещество к оксидам, основаниям, кислотам или солям и определять его состав.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 6, title: 'Химические свойства простых веществ', skillsChecked: 'Определять, с какими веществами реагируют металлы и неметаллы.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 7, title: 'Химические свойства оксидов', skillsChecked: 'Определять, с какими веществами реагируют основные, кислотные и амфотерные оксиды.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 8, title: 'Химические свойства оснований', skillsChecked: 'Определять, с какими веществами реагируют щёлочи и нерастворимые основания.', answerType: 'multiple', maxScore: 1, part: 1 },
  { number: 9, title: 'Химические свойства кислот', skillsChecked: 'Определять, с какими веществами реагируют кислоты.', answerType: 'multiple', maxScore: 1, part: 1 },
  { number: 10, title: 'Химические свойства солей', skillsChecked: 'Определять, с какими веществами реагируют соли.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 11, title: 'Классификация химических реакций', skillsChecked: 'Определять тип реакции (соединения, разложения, замещения, обмена).', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 12, title: 'Качественные реакции: признак реакции', skillsChecked: 'Определять признак (наблюдение) характерной качественной реакции — осадок, газ, изменение цвета — для данной пары веществ.', answerType: 'single', maxScore: 2, part: 1 },
  { number: 13, title: 'Электролитическая диссоциация', skillsChecked: 'Определять, какие вещества являются сильными и слабыми электролитами.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 14, title: 'Реакции ионного обмена', skillsChecked: 'Определять условия протекания реакций ионного обмена до конца.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 15, title: 'Окислитель и восстановитель', skillsChecked: 'Определять окислитель и восстановитель в конкретной реакции по изменению степеней окисления.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 16, title: 'Правила безопасной работы в лаборатории', skillsChecked: 'Определять правила обращения с лабораторным оборудованием и реактивами, первую помощь при ожогах.', answerType: 'multiple', maxScore: 1, part: 1 },
  { number: 17, title: 'Качественные реакции: распознавание веществ', skillsChecked: 'Выбирать реактив, с помощью которого можно различить два данных вещества по разным признакам реакции.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 18, title: 'Расчёт массовой доли элемента в веществе', skillsChecked: 'Вычислять массовую долю химического элемента в веществе по формуле.', answerType: 'numeric', maxScore: 1, part: 1 },
  { number: 19, title: 'Расчёт массовой доли вещества в растворе', skillsChecked: 'Вычислять массовую долю растворённого вещества в растворе.', answerType: 'numeric', maxScore: 1, part: 1 },
  { number: 20, title: 'Расчётная задача (развёрнутый ответ)', skillsChecked: 'Проводить расчёты по уравнениям химических реакций (в т.ч. с использованием массовой доли раствора).', answerType: 'extended', maxScore: 3, part: 2 },
  { number: 21, title: 'Генетическая связь между классами неорганических веществ', skillsChecked: 'Составлять уравнения реакций, реализующих цепочку превращений между классами неорганических веществ.', answerType: 'extended', maxScore: 3, part: 2 },
  { number: 22, title: 'Расчётная задача с уравнением реакции', skillsChecked: 'Составлять уравнение реакции и проводить по нему стехиометрический расчёт (масса, объём, количество вещества).', answerType: 'extended', maxScore: 3, part: 2 },
  { number: 23, title: 'Практический эксперимент: распознавание веществ', skillsChecked: 'Планировать и проводить реальный химический эксперимент по распознаванию веществ в двух пробирках, фиксировать наблюдения, составлять молекулярные и ионные уравнения.', answerType: 'extended', maxScore: 5, part: 2 },
];

export function getExamTaskMeta(n: number): ExamTaskMeta | undefined {
  return EXAM_TASKS_META.find((t) => t.number === n);
}
