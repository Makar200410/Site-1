import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { CODIFIER_TOPICS, EXAM_TASKS_META, EXAM_CONFIG } from '@/config/exam';

const theoryEntries = await getCollection('theory');

type OgPage = { title: string; description: string };
const pages: Record<string, OgPage> = {
  '/': {
    title: 'Подготовка к ОГЭ по химии',
    description: `Теория, тренажёр по всем ${EXAM_CONFIG.totalTasks} заданиям, пробники и справочник — бесплатно.`,
  },
  '/teoriya/': { title: 'Теория по химии', description: 'Все темы кодификатора ОГЭ по химии в одном месте.' },
  '/zadaniya/': { title: `Разбор всех ${EXAM_CONFIG.totalTasks} заданий ОГЭ`, description: 'Что проверяет каждое задание и как его решать.' },
  '/probniki/': { title: 'Пробные варианты ОГЭ по химии', description: 'Полные варианты с таймером 180 минут.' },
  '/trenazher/': { title: 'Тренажёр по химии', description: 'Отработайте любое задание ОГЭ по химии в своём темпе.' },
  '/spravochnik/': { title: 'Справочник по химии', description: 'Таблицы, разрешённые на экзамене ОГЭ по химии.' },
  '/spravochnik/tablitsa-mendeleeva/': {
    title: 'Периодическая таблица Менделеева',
    description: 'Интерактивная таблица элементов с карточками свойств.',
  },
  '/spravochnik/rastvorimost/': {
    title: 'Таблица растворимости',
    description: 'Растворимость кислот, оснований и солей в воде.',
  },
  '/spravochnik/ryad-aktivnosti-metallov/': {
    title: 'Ряд активности металлов',
    description: 'Электрохимический ряд напряжений металлов.',
  },
  '/o-proekte/': { title: 'О проекте «ОГЭ Химия»', description: 'Бесплатный образовательный проект без регистрации.' },
};

for (const topic of CODIFIER_TOPICS) {
  pages[`/teoriya/${topic.id}/`] = { title: topic.title, description: `Теория: ${topic.title}. Раздел кодификатора ОГЭ по химии.` };
}
for (const entry of theoryEntries) {
  pages[`/teoriya/${entry.data.topicId}/${entry.id.split('/').slice(1).join('/')}/`] = {
    title: entry.data.title,
    description: entry.data.description,
  };
}
for (const task of EXAM_TASKS_META) {
  pages[`/zadaniya/${task.number}/`] = {
    title: `Задание ${task.number} ОГЭ по химии`,
    description: task.skillsChecked,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getSlug: (path) => (path.replace(/^\//, '').replace(/\/$/, '') || 'index') + '.png',
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[15, 37, 33]],
    border: { color: [75, 179, 157], width: 12, side: 'block-start' },
    padding: 80,
    fonts: ['./src/assets/fonts/Inter-Regular.ttf', './src/assets/fonts/Inter-Bold.ttf'],
    font: {
      title: { color: [238, 250, 247], size: 62, weight: 'Bold', families: ['Inter'] },
      description: { color: [179, 216, 206], size: 34, families: ['Inter'] },
    },
  }),
});
