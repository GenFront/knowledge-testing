#!/usr/bin/env node

/**
 * generate-index.js
 * Генератор поискового индекса.
 *
 * Сканирует src/data/*.json и src/tasks/*.json, извлекает
 * заголовки, описания, теги и ссылки, собирает в один массив
 * и сохраняет в src/data/search-index.json.
 *
 * Использование:
 *   node tools/generate-index.js
 *   npm run build:index
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Маппинг JSON -> HTML-страница для построения ссылок
const PAGE_MAP = {
  'html.json': 'html.html',
  'css.json': 'css.html',
  'js.json': 'js.html',
  'tools.json': 'tools.html',
  'projects.json': 'projects.html',
  'materials.json': 'materials.html',
  'tests.json': 'tests.html',
};

// Максимальная длина описания (символов)
const MAX_DESC_LENGTH = 200;

// ────────────────────────────────────────────────────
// Вспомогательные функции
// ────────────────────────────────────────────────────

/** Извлекает чистый текст из HTML-строки */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ') // удаляем теги
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Обрезает текст до MAX_DESC_LENGTH,
 * стараясь не разорвать слово на середине.
 */
function truncate(text, maxLen = MAX_DESC_LENGTH) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.7 ? cut.slice(0, lastSpace) : cut) + '…';
}

/** Извлекает первый абзац из HTML-контента */
function extractFirstParagraph(html) {
  const match = html.match(/<p>(.*?)<\/p>/);
  return match ? stripHtml(match[1]) : '';
}

/**
 * Извлекает описание из контента задачи (массив блоков).
 * Берёт первый блок с type === 'paragraph'.
 */
function extractTaskDescription(blocks) {
  const firstP = Array.isArray(blocks) && blocks.find((b) => b.type === 'paragraph');
  return firstP ? firstP.text : '';
}

/** Проверяет, что значение не пустое (для title, tags) */
function isValid(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

// ────────────────────────────────────────────────────
// Сбор индекса
// ────────────────────────────────────────────────────

const index = [];
let warnings = [];

// --- 1. Сканируем src/data/*.json ---
const dataDir = path.join(ROOT, 'src/data');
const taskDir = path.join(ROOT, 'src/tasks');
const outputFile = path.join(ROOT, 'src/data/search-index.json');

let dataFiles;
try {
  dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json') && f !== 'search-index.json');
} catch (err) {
  console.error(`[ERROR] Не удалось прочитать директорию ${dataDir}: ${err.message}`);
  process.exit(1);
}

for (const filename of dataFiles) {
  const pageName = PAGE_MAP[filename];
  if (!pageName) {
    warnings.push(`[WARN] ${filename}: нет маппинга в PAGE_MAP — пропускаю`);
    continue;
  }

  const category = path.basename(filename, '.json');
  const filePath = path.join(dataDir, filename);

  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    warnings.push(`[WARN] ${filename}: ошибка парсинга — ${err.message}`);
    continue;
  }

  for (const [sectionKey, section] of Object.entries(json)) {
    if (!section || typeof section !== 'object') continue;
    if (!section.title) {
      warnings.push(`[WARN] ${filename} → "${sectionKey}": отсутствует title — помечен как «Без названия»`);
    }

    const title = section.title || 'Без названия';
    const htmlContent = section.content || '';
    const descText =
      (section.description && stripHtml(section.description)) ||
      extractFirstParagraph(htmlContent) ||
      stripHtml(htmlContent).slice(0, MAX_DESC_LENGTH);

    const description = truncate(descText);
    const tags = isValid(section.tags) ? section.tags : [];
    const pathStr = `${pageName}#${sectionKey}`;

    index.push({
      title,
      content: description,
      category,
      tags,
      path: pathStr,
      type: 'topic',
    });
  }
}

// --- 2. Сканируем src/tasks/*.json ---
let taskFiles;
try {
  taskFiles = fs.readdirSync(taskDir).filter((f) => f.endsWith('.json'));
} catch (err) {
  console.error(`[ERROR] Не удалось прочитать директорию ${taskDir}: ${err.message}`);
  process.exit(1);
}

for (const filename of taskFiles) {
  const filePath = path.join(taskDir, filename);

  let task;
  try {
    task = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    warnings.push(`[WARN] ${filename}: ошибка парсинга — ${err.message}`);
    continue;
  }

  if (!task.id) {
    warnings.push(`[WARN] ${filename}: отсутствует id — пропускаю`);
    continue;
  }

  if (!task.title) {
    warnings.push(`[WARN] ${filename}: отсутствует title`);
  }

  const title = task.title || 'Без названия';
  const description = truncate(extractTaskDescription(task.content));
  const tags = isValid(task.tags) ? task.tags : [];

  if (!task.tags) {
    warnings.push(`[WARN] ${filename}: отсутствуют tags — поиск по тегам будет недоступен`);
  }

  index.push({
    title,
    content: description,
    category: 'projects',
    tags,
    path: `projects.html#${task.id}`,
    type: 'task',
  });
}

// ────────────────────────────────────────────────────
// Запись результата
// ────────────────────────────────────────────────────

index.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

try {
  fs.writeFileSync(outputFile, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`[OK] search-index.json (${index.length} записей, ${outputFile})`);
} catch (err) {
  console.error(`[ERROR] Не удалось записать ${outputFile}: ${err.message}`);
  process.exit(1);
}

// Вывод предупреждений
if (warnings.length > 0) {
  console.log('────────────────────────────────────────');
  warnings.forEach((w) => console.log(w));
}

console.log('────────────────────────────────────────');
console.log(`Готово: ${index.length} записей, предупреждений: ${warnings.length}`);
