#!/usr/bin/env node

/**
 * generate-pages.js
 * Генератор статических HTML-страниц из Handlebars-шаблона + JSON-данных.
 *
 * Использование:
 *   node tools/generate-pages.js
 *   npm run build:pages
 *
 * Читает:  src/templates/page.handlebars
 *           src/data/*.json
 * Пишет:   pages/*.html
 */

const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// ────────────────────────────────────────────────────
// Конфигурация страниц
// ────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

const PAGES_CONFIG = [
  {
    id: 'html',
    title: 'HTML',
    navTitle: 'HTML',
    jsonFile: 'src/data/html.json',
    pageType: 'topic-page',
  },
  {
    id: 'css',
    title: 'CSS',
    navTitle: 'CSS',
    jsonFile: 'src/data/css.json',
    pageType: 'topic-page',
  },
  {
    id: 'js',
    title: 'JavaScript',
    navTitle: 'JavaScript',
    jsonFile: 'src/data/js.json',
    pageType: 'topic-page',
  },
  {
    id: 'tools',
    title: 'Инструменты',
    navTitle: 'Инструменты',
    jsonFile: 'src/data/tools.json',
    pageType: 'topic-page',
  },
  {
    id: 'projects',
    title: 'Проекты',
    navTitle: 'Проекты',
    jsonFile: 'src/data/projects.json',
    pageType: 'projects-page',
  },
  {
    id: 'materials',
    title: 'Учебные материалы',
    navTitle: 'Темы',
    jsonFile: 'src/data/materials.json',
    pageType: 'materials-page',
  },
  {
    id: 'tests',
    title: 'Тесты',
    navTitle: 'Темы',
    jsonFile: 'src/data/tests.json',
    pageType: 'tests-page',
  },
];

/** Ссылки, которые добавляются в конец навигации на каждой странице */
const EXTRA_NAV = [
  { label: 'Учебные материалы', href: 'materials.html' },
  { label: 'Тесты', href: 'tests.html' },
];

/** Идентификаторы страниц, которые сами являются EXTRA_NAV — не ссылаются сами на себя */
const SELF_PAGES = new Set(['materials', 'tests']);

// ────────────────────────────────────────────────────
// Пути
// ────────────────────────────────────────────────────

const TEMPLATE_PATH = path.join(ROOT, 'src/templates/page.handlebars');
const OUTPUT_DIR = path.join(ROOT, 'pages');

// ────────────────────────────────────────────────────
// Вспомогательные функции
// ────────────────────────────────────────────────────

/**
 * Создаёт navItems из JSON-данных.
 * Каждый ключ верхнего уровня — секция.
 * Если секция содержит `title` — добавляется пункт меню.
 */
function buildNavItems(jsonData, jsonRelativePath) {
  const items = [];

  for (const [key, value] of Object.entries(jsonData)) {
    if (value && typeof value === 'object' && value.title) {
      items.push({
        label: value.title,
        section: key,
        path: jsonRelativePath,
      });
    }
  }

  return items;
}

/**
 * Формирует placeholder-контент для пустой страницы.
 */
function placeholderContent() {
  return (
    '<p class="placeholder-text">' +
    'Выберите раздел из навигации слева, чтобы увидеть соответствующую информацию' +
    '</p>'
  );
}

// ────────────────────────────────────────────────────
// Основной процесс
// ────────────────────────────────────────────────────

function main() {
  // 1. Читаем шаблон
  let templateSource;
  try {
    templateSource = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch (err) {
    console.error(`[ERROR] Не удалось прочитать шаблон: ${TEMPLATE_PATH}`);
    console.error(err.message);
    process.exit(1);
  }

  const compileTemplate = Handlebars.compile(templateSource);

  // 2. Создаём output-директорию (если нет)
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let generated = 0;
  let errors = 0;

  for (const page of PAGES_CONFIG) {
    const jsonPath = path.join(ROOT, page.jsonFile);
    const outputFile = path.join(OUTPUT_DIR, `${page.id}.html`);

    // Относительный путь от pages/ к JSON (для data-path в nav-ссылках)
    const jsonRelativePath = `../${page.jsonFile}`;

    let jsonData;
    try {
      const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
      jsonData = JSON.parse(jsonContent);
    } catch (err) {
      console.error(
        `[ERROR] Не удалось прочитать/распарсить ${page.jsonFile}: ${err.message}`,
      );
      errors++;
      continue;
    }

    // Собираем navItems
    const navItems = buildNavItems(jsonData, jsonRelativePath);

    // Добавляем общие ссылки (материалы, тесты), кроме ссылок на саму себя
    const filteredExtra = EXTRA_NAV.filter(
      (item) => !SELF_PAGES.has(page.id) || !item.href.includes(page.id),
    );
    navItems.push(...filteredExtra);

    // Рендерим
    const html = compileTemplate({
      title: page.title,
      navTitle: page.navTitle,
      pageType: page.pageType,
      navItems,
      content: placeholderContent(),
    });

    // Пишем файл
    try {
      fs.writeFileSync(outputFile, html, 'utf-8');
      console.log(`[OK] ${page.id}.html (${html.length} bytes)`);
      generated++;
    } catch (err) {
      console.error(`[ERROR] Не удалось записать ${outputFile}: ${err.message}`);
      errors++;
    }
  }

  console.log('────────────────────────────────────────');
  console.log(`Готово: ${generated} страниц(ы), ошибок: ${errors}`);
}

main();
