export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemElement {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  period: number;
  group: number; // 1..18; 0 для лантаноидов/актиноидов (отдельный ряд)
  category: ElementCategory;
  /** Для f-блока: позиция в дополнительном ряду (1..15). */
  fBlockIndex?: number;
}

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  'alkali-metal': 'Щелочной металл',
  'alkaline-earth': 'Щёлочноземельный металл',
  'transition-metal': 'Переходный металл',
  'post-transition-metal': 'Постпереходный металл',
  metalloid: 'Металлоид',
  nonmetal: 'Неметалл',
  halogen: 'Галоген',
  'noble-gas': 'Благородный газ',
  lanthanide: 'Лантаноид',
  actinide: 'Актиноид',
};

export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali-metal': '#e8998d',
  'alkaline-earth': '#eab676',
  'transition-metal': '#f0d675',
  'post-transition-metal': '#a3c9a8',
  metalloid: '#7fc8c0',
  nonmetal: '#7ea6d4',
  halogen: '#8fa6e8',
  'noble-gas': '#b79fd1',
  lanthanide: '#d19fc9',
  actinide: '#c98fae',
};

// number, symbol, name, mass, period, group, category, fBlockIndex
const raw: [number, string, string, number, number, number, ElementCategory, number?][] = [
  [1, 'H', 'Водород', 1.008, 1, 1, 'nonmetal'],
  [2, 'He', 'Гелий', 4.003, 1, 18, 'noble-gas'],
  [3, 'Li', 'Литий', 6.941, 2, 1, 'alkali-metal'],
  [4, 'Be', 'Бериллий', 9.012, 2, 2, 'alkaline-earth'],
  [5, 'B', 'Бор', 10.811, 2, 13, 'metalloid'],
  [6, 'C', 'Углерод', 12.011, 2, 14, 'nonmetal'],
  [7, 'N', 'Азот', 14.007, 2, 15, 'nonmetal'],
  [8, 'O', 'Кислород', 15.999, 2, 16, 'nonmetal'],
  [9, 'F', 'Фтор', 18.998, 2, 17, 'halogen'],
  [10, 'Ne', 'Неон', 20.18, 2, 18, 'noble-gas'],
  [11, 'Na', 'Натрий', 22.99, 3, 1, 'alkali-metal'],
  [12, 'Mg', 'Магний', 24.305, 3, 2, 'alkaline-earth'],
  [13, 'Al', 'Алюминий', 26.982, 3, 13, 'post-transition-metal'],
  [14, 'Si', 'Кремний', 28.086, 3, 14, 'metalloid'],
  [15, 'P', 'Фосфор', 30.974, 3, 15, 'nonmetal'],
  [16, 'S', 'Сера', 32.065, 3, 16, 'nonmetal'],
  [17, 'Cl', 'Хлор', 35.453, 3, 17, 'halogen'],
  [18, 'Ar', 'Аргон', 39.948, 3, 18, 'noble-gas'],
  [19, 'K', 'Калий', 39.098, 4, 1, 'alkali-metal'],
  [20, 'Ca', 'Кальций', 40.078, 4, 2, 'alkaline-earth'],
  [21, 'Sc', 'Скандий', 44.956, 4, 3, 'transition-metal'],
  [22, 'Ti', 'Титан', 47.867, 4, 4, 'transition-metal'],
  [23, 'V', 'Ванадий', 50.942, 4, 5, 'transition-metal'],
  [24, 'Cr', 'Хром', 51.996, 4, 6, 'transition-metal'],
  [25, 'Mn', 'Марганец', 54.938, 4, 7, 'transition-metal'],
  [26, 'Fe', 'Железо', 55.845, 4, 8, 'transition-metal'],
  [27, 'Co', 'Кобальт', 58.933, 4, 9, 'transition-metal'],
  [28, 'Ni', 'Никель', 58.693, 4, 10, 'transition-metal'],
  [29, 'Cu', 'Медь', 63.546, 4, 11, 'transition-metal'],
  [30, 'Zn', 'Цинк', 65.38, 4, 12, 'transition-metal'],
  [31, 'Ga', 'Галлий', 69.723, 4, 13, 'post-transition-metal'],
  [32, 'Ge', 'Германий', 72.64, 4, 14, 'metalloid'],
  [33, 'As', 'Мышьяк', 74.922, 4, 15, 'metalloid'],
  [34, 'Se', 'Селен', 78.96, 4, 16, 'nonmetal'],
  [35, 'Br', 'Бром', 79.904, 4, 17, 'halogen'],
  [36, 'Kr', 'Криптон', 83.798, 4, 18, 'noble-gas'],
  [37, 'Rb', 'Рубидий', 85.468, 5, 1, 'alkali-metal'],
  [38, 'Sr', 'Стронций', 87.62, 5, 2, 'alkaline-earth'],
  [39, 'Y', 'Иттрий', 88.906, 5, 3, 'transition-metal'],
  [40, 'Zr', 'Цирконий', 91.224, 5, 4, 'transition-metal'],
  [41, 'Nb', 'Ниобий', 92.906, 5, 5, 'transition-metal'],
  [42, 'Mo', 'Молибден', 95.96, 5, 6, 'transition-metal'],
  [43, 'Tc', 'Технеций', 98, 5, 7, 'transition-metal'],
  [44, 'Ru', 'Рутений', 101.07, 5, 8, 'transition-metal'],
  [45, 'Rh', 'Родий', 102.906, 5, 9, 'transition-metal'],
  [46, 'Pd', 'Палладий', 106.42, 5, 10, 'transition-metal'],
  [47, 'Ag', 'Серебро', 107.868, 5, 11, 'transition-metal'],
  [48, 'Cd', 'Кадмий', 112.411, 5, 12, 'transition-metal'],
  [49, 'In', 'Индий', 114.818, 5, 13, 'post-transition-metal'],
  [50, 'Sn', 'Олово', 118.71, 5, 14, 'post-transition-metal'],
  [51, 'Sb', 'Сурьма', 121.76, 5, 15, 'metalloid'],
  [52, 'Te', 'Теллур', 127.6, 5, 16, 'metalloid'],
  [53, 'I', 'Йод', 126.904, 5, 17, 'halogen'],
  [54, 'Xe', 'Ксенон', 131.293, 5, 18, 'noble-gas'],
  [55, 'Cs', 'Цезий', 132.905, 6, 1, 'alkali-metal'],
  [56, 'Ba', 'Барий', 137.327, 6, 2, 'alkaline-earth'],
  [57, 'La', 'Лантан', 138.905, 6, 0, 'lanthanide', 1],
  [58, 'Ce', 'Церий', 140.116, 6, 0, 'lanthanide', 2],
  [59, 'Pr', 'Празеодим', 140.908, 6, 0, 'lanthanide', 3],
  [60, 'Nd', 'Неодим', 144.242, 6, 0, 'lanthanide', 4],
  [61, 'Pm', 'Прометий', 145, 6, 0, 'lanthanide', 5],
  [62, 'Sm', 'Самарий', 150.36, 6, 0, 'lanthanide', 6],
  [63, 'Eu', 'Европий', 151.964, 6, 0, 'lanthanide', 7],
  [64, 'Gd', 'Гадолиний', 157.25, 6, 0, 'lanthanide', 8],
  [65, 'Tb', 'Тербий', 158.925, 6, 0, 'lanthanide', 9],
  [66, 'Dy', 'Диспрозий', 162.5, 6, 0, 'lanthanide', 10],
  [67, 'Ho', 'Гольмий', 164.93, 6, 0, 'lanthanide', 11],
  [68, 'Er', 'Эрбий', 167.259, 6, 0, 'lanthanide', 12],
  [69, 'Tm', 'Тулий', 168.934, 6, 0, 'lanthanide', 13],
  [70, 'Yb', 'Иттербий', 173.054, 6, 0, 'lanthanide', 14],
  [71, 'Lu', 'Лютеций', 174.967, 6, 0, 'lanthanide', 15],
  [72, 'Hf', 'Гафний', 178.49, 6, 4, 'transition-metal'],
  [73, 'Ta', 'Тантал', 180.948, 6, 5, 'transition-metal'],
  [74, 'W', 'Вольфрам', 183.84, 6, 6, 'transition-metal'],
  [75, 'Re', 'Рений', 186.207, 6, 7, 'transition-metal'],
  [76, 'Os', 'Осмий', 190.23, 6, 8, 'transition-metal'],
  [77, 'Ir', 'Иридий', 192.217, 6, 9, 'transition-metal'],
  [78, 'Pt', 'Платина', 195.084, 6, 10, 'transition-metal'],
  [79, 'Au', 'Золото', 196.967, 6, 11, 'transition-metal'],
  [80, 'Hg', 'Ртуть', 200.59, 6, 12, 'transition-metal'],
  [81, 'Tl', 'Таллий', 204.383, 6, 13, 'post-transition-metal'],
  [82, 'Pb', 'Свинец', 207.2, 6, 14, 'post-transition-metal'],
  [83, 'Bi', 'Висмут', 208.98, 6, 15, 'post-transition-metal'],
  [84, 'Po', 'Полоний', 209, 6, 16, 'post-transition-metal'],
  [85, 'At', 'Астат', 210, 6, 17, 'halogen'],
  [86, 'Rn', 'Радон', 222, 6, 18, 'noble-gas'],
  [87, 'Fr', 'Франций', 223, 7, 1, 'alkali-metal'],
  [88, 'Ra', 'Радий', 226, 7, 2, 'alkaline-earth'],
  [89, 'Ac', 'Актиний', 227, 7, 0, 'actinide', 1],
  [90, 'Th', 'Торий', 232.038, 7, 0, 'actinide', 2],
  [91, 'Pa', 'Протактиний', 231.036, 7, 0, 'actinide', 3],
  [92, 'U', 'Уран', 238.029, 7, 0, 'actinide', 4],
  [93, 'Np', 'Нептуний', 237, 7, 0, 'actinide', 5],
  [94, 'Pu', 'Плутоний', 244, 7, 0, 'actinide', 6],
  [95, 'Am', 'Америций', 243, 7, 0, 'actinide', 7],
  [96, 'Cm', 'Кюрий', 247, 7, 0, 'actinide', 8],
  [97, 'Bk', 'Берклий', 247, 7, 0, 'actinide', 9],
  [98, 'Cf', 'Калифорний', 251, 7, 0, 'actinide', 10],
  [99, 'Es', 'Эйнштейний', 252, 7, 0, 'actinide', 11],
  [100, 'Fm', 'Фермий', 257, 7, 0, 'actinide', 12],
  [101, 'Md', 'Менделевий', 258, 7, 0, 'actinide', 13],
  [102, 'No', 'Нобелий', 259, 7, 0, 'actinide', 14],
  [103, 'Lr', 'Лоуренсий', 262, 7, 0, 'actinide', 15],
  [104, 'Rf', 'Резерфордий', 267, 7, 4, 'transition-metal'],
  [105, 'Db', 'Дубний', 268, 7, 5, 'transition-metal'],
  [106, 'Sg', 'Сиборгий', 271, 7, 6, 'transition-metal'],
  [107, 'Bh', 'Борий', 272, 7, 7, 'transition-metal'],
  [108, 'Hs', 'Хассий', 270, 7, 8, 'transition-metal'],
  [109, 'Mt', 'Мейтнерий', 276, 7, 9, 'transition-metal'],
  [110, 'Ds', 'Дармштадтий', 281, 7, 10, 'transition-metal'],
  [111, 'Rg', 'Рентгений', 280, 7, 11, 'transition-metal'],
  [112, 'Cn', 'Коперниций', 285, 7, 12, 'transition-metal'],
  [113, 'Nh', 'Нихоний', 284, 7, 13, 'post-transition-metal'],
  [114, 'Fl', 'Флеровий', 289, 7, 14, 'post-transition-metal'],
  [115, 'Mc', 'Московий', 288, 7, 15, 'post-transition-metal'],
  [116, 'Lv', 'Ливерморий', 293, 7, 16, 'post-transition-metal'],
  [117, 'Ts', 'Теннессин', 294, 7, 17, 'halogen'],
  [118, 'Og', 'Оганесон', 294, 7, 18, 'noble-gas'],
];

export const ELEMENTS: ChemElement[] = raw.map(([number, symbol, name, mass, period, group, category, fBlockIndex]) => ({
  number,
  symbol,
  name,
  mass,
  period,
  group,
  category,
  fBlockIndex,
}));

export const ELEMENT_BY_NUMBER = new Map(ELEMENTS.map((e) => [e.number, e]));
