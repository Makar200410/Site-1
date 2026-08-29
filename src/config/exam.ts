/**
 * Единый конфиг структуры ОГЭ по химии.
 * Перед каждым учебным годом сверять с демоверсией и кодификатором ФИПИ
 * и менять параметры только здесь — нигде в коде и контенте числа не хардкодятся.
 */

export const EXAM_YEAR = 2027;

export const EXAM_CONFIG = {
  year: EXAM_YEAR,
  totalTasks: 24,
  part1Tasks: 19, // задания с кратким ответом
  part2Tasks: 5, // задания с развёрнутым ответом (20–24)
  part2StartsAt: 20,
  maxPrimaryScore: 40,
  durationMinutes: 180,
  experimentTaskNumber: 24,
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

export const EXAM_TASKS_META: ExamTaskMeta[] = [
  { number: 1, title: 'Строение атома', skillsChecked: 'Определять число протонов, нейтронов и электронов в атоме по положению элемента в периодической системе.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 2, title: 'Периодический закон', skillsChecked: 'Сравнивать свойства элементов и их соединений по положению в периодической системе.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 3, title: 'Строение электронных оболочек атомов', skillsChecked: 'Составлять схему распределения электронов по энергетическим уровням.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 4, title: 'Химическая связь', skillsChecked: 'Определять вид химической связи в веществе по формуле.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 5, title: 'Валентность и степень окисления', skillsChecked: 'Определять валентность и степень окисления элементов по формуле вещества.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 6, title: 'Классификация неорганических веществ', skillsChecked: 'Относить вещество к оксидам, основаниям, кислотам или солям и определять его состав.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 7, title: 'Химические свойства простых веществ', skillsChecked: 'Определять, с какими веществами реагируют металлы и неметаллы.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 8, title: 'Химические свойства оксидов', skillsChecked: 'Определять, с какими веществами реагируют основные, кислотные и амфотерные оксиды.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 9, title: 'Химические свойства кислот и оснований', skillsChecked: 'Определять, с какими веществами реагируют кислоты и основания.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 10, title: 'Химические свойства солей', skillsChecked: 'Определять, с какими веществами реагируют соли.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 11, title: 'Классификация химических реакций', skillsChecked: 'Определять тип реакции (соединения, разложения, замещения, обмена).', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 12, title: 'Электролитическая диссоциация', skillsChecked: 'Определять, какие вещества являются сильными и слабыми электролитами.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 13, title: 'Реакции ионного обмена', skillsChecked: 'Определять условия протекания реакций ионного обмена до конца.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 14, title: 'Окислительно-восстановительные реакции', skillsChecked: 'Определять окислитель и восстановитель, процессы окисления и восстановления.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 15, title: 'Генетическая связь между классами веществ', skillsChecked: 'Устанавливать соответствие между исходными веществами и продуктами реакции.', answerType: 'matching', maxScore: 2, part: 1 },
  { number: 16, title: 'Правила безопасной работы в лаборатории', skillsChecked: 'Определять правила обращения с лабораторным оборудованием и реактивами.', answerType: 'multiple', maxScore: 2, part: 1 },
  { number: 17, title: 'Первоначальные сведения об органических веществах', skillsChecked: 'Определять принадлежность вещества к классу органических соединений.', answerType: 'single', maxScore: 1, part: 1 },
  { number: 18, title: 'Расчёт массовой доли элемента в веществе', skillsChecked: 'Вычислять массовую долю химического элемента в веществе по формуле.', answerType: 'numeric', maxScore: 1, part: 1 },
  { number: 19, title: 'Расчёт массовой доли вещества в растворе', skillsChecked: 'Вычислять массовую долю растворённого вещества в растворе.', answerType: 'numeric', maxScore: 1, part: 1 },
  { number: 20, title: 'Задача на смесь веществ (развёрнутый ответ)', skillsChecked: 'Проводить многоступенчатые расчёты по уравнениям реакций с использованием смеси веществ.', answerType: 'extended', maxScore: 4, part: 2 },
  { number: 21, title: 'Уравнение реакции с указанием сущности процесса', skillsChecked: 'Составлять полное и сокращённое ионное уравнение реакции.', answerType: 'extended', maxScore: 2, part: 2 },
  { number: 22, title: 'Химический эксперимент по описанию', skillsChecked: 'Составлять уравнения реакций по описанию проведённого эксперимента.', answerType: 'extended', maxScore: 4, part: 2 },
  { number: 23, title: 'Задание на определение веществ', skillsChecked: 'Определять неизвестные вещества по описанию признаков реакций.', answerType: 'extended', maxScore: 3, part: 2 },
  { number: 24, title: 'Практический эксперимент', skillsChecked: 'Планировать и проводить реальный химический эксперимент, фиксировать наблюдения.', answerType: 'extended', maxScore: 4, part: 2 },
];

export function getExamTaskMeta(n: number): ExamTaskMeta | undefined {
  return EXAM_TASKS_META.find((t) => t.number === n);
}
