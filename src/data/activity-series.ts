export interface ActivityMetal {
  symbol: string;
  name: string;
}

/** Электрохимический ряд напряжений металлов, от самых активных к самым малоактивным. */
export const ACTIVITY_SERIES: ActivityMetal[] = [
  { symbol: 'Li', name: 'Литий' },
  { symbol: 'K', name: 'Калий' },
  { symbol: 'Ba', name: 'Барий' },
  { symbol: 'Ca', name: 'Кальций' },
  { symbol: 'Na', name: 'Натрий' },
  { symbol: 'Mg', name: 'Магний' },
  { symbol: 'Al', name: 'Алюминий' },
  { symbol: 'Mn', name: 'Марганец' },
  { symbol: 'Zn', name: 'Цинк' },
  { symbol: 'Cr', name: 'Хром' },
  { symbol: 'Fe', name: 'Железо' },
  { symbol: 'Cd', name: 'Кадмий' },
  { symbol: 'Co', name: 'Кобальт' },
  { symbol: 'Ni', name: 'Никель' },
  { symbol: 'Sn', name: 'Олово' },
  { symbol: 'Pb', name: 'Свинец' },
  { symbol: 'H', name: 'Водород' },
  { symbol: 'Cu', name: 'Медь' },
  { symbol: 'Hg', name: 'Ртуть' },
  { symbol: 'Ag', name: 'Серебро' },
  { symbol: 'Pt', name: 'Платина' },
  { symbol: 'Au', name: 'Золото' },
];
