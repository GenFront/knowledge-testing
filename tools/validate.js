#!/usr/bin/env node

/**
 * validate.js
 * Автоматические проверки проекта.
 *
 * Проверяет:
 *   1. Валидность JSON-синтаксиса всех файлов в src/data/ и src/tasks/
 *   2. Наличие обязательных полей (title, content — для секций;
 *      id, title, difficulty, tags, date, content — для задач)
 *   3. tags — массив строк, не пустой
 *   4. date — формат YYYY-MM-DD
 *   5. Ссылки в навигационных элементах указывают на существующие файлы
 *   6. Отчёт с подсчётом ошибок и проходов
 *
 * Использование:
 *   node tools/validate.js
 *   npm run validate
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/data');
const TASK_DIR = path.join(ROOT, 'src/tasks');
const PAGES_DIR = path.join(ROOT, 'pages');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Маппинг JSON → HTML (из generate-pages.js)
const PAGE_MAP = {
  'html.json': 'html.html',
  'css.json': 'css.html',
  'js.json': 'js.html',
  'tools.json': 'tools.html',
  'projects.json': 'projects.html',
  'materials.json': 'materials.html',
  'tests.json': 'tests.html',
};

// Ссылки, которые добавляются в конец навигации на каждой странице
const EXTRA_NAV = ['materials.html', 'tests.html'];

// Обязательные поля для секций данных
const DATA_REQUIRED_FIELDS = ['title', 'content'];

// Обязательные поля для задач
const TASK_REQUIRED_FIELDS = ['id', 'title', 'difficulty', 'tags', 'date', 'content'];

// ────────────────────────────────────────────────────
// Подсчёт результатов
// ────────────────────────────────────────────────────

const results = [];
let passedCount = 0;
let failedCount = 0;

function pass(description) {
  passedCount++;
  results.push(`  [PASS] ${description}`);
}

function fail(description) {
  failedCount++;
  results.push(`  [FAIL] ${description}`);
}

function summaryLine() {
  const total = passedCount + failedCount;
  const ok = failedCount === 0;
  results.push('');
  results.push(`Проверено: ${passedCount + failedCount} | Пройдено: ${passedCount} | Ошибок: ${failedCount}`);
  results.push('');
  if (ok) {
    results.push('  ✓ Все проверки пройдены успешно');
  } else {
    results.push(`  ✗ Обнаружено ${failedCount} ошибок. Исправьте их перед деплоем.`);
  }
}

// ────────────────────────────────────────────────────
// 1. Валидность JSON
// ────────────────────────────────────────────────────

function checkJsonSyntax(dir, label) {
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'search-index.json');
  } catch {
    fail(`${label}: директория не найдена (${dir})`);
    return [];
  }

  const valid = [];

  for (const filename of files) {
    const filePath = path.join(dir, filename);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      JSON.parse(raw);
      pass(`${label}/${filename}: синтаксис корректен`);
      valid.push({ filename, filePath, raw, data: JSON.parse(raw) });
    } catch (err) {
      const msg = err.message.match(/position (\d+)/);
      const pos = msg ? parseInt(msg[1]) : 0;
      const line = raw ? raw.slice(0, pos).split('\n').length : '?';
      fail(`${label}/${filename}: ошибка парсинга JSON (строка ${line}): ${err.message}`);
    }
  }

  return valid;
}

// ────────────────────────────────────────────────────
// 2. Обязательные поля (данные)
// ────────────────────────────────────────────────────

function checkDataFields(entries) {
  for (const { filename, data } of entries) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      fail(`${filename}: файл пуст (нет секций)`);
      continue;
    }

    let sectionCount = 0;
    let sectionErrors = 0;

    for (const [sectionKey, section] of Object.entries(data)) {
      if (!section || typeof section !== 'object') {
        fail(`${filename} → "${sectionKey}": не является объектом`);
        sectionErrors++;
        continue;
      }

      let missing = [];
      for (const field of DATA_REQUIRED_FIELDS) {
        if (!section[field] || (typeof section[field] === 'string' && section[field].trim() === '')) {
          missing.push(field);
        }
      }

      if (missing.length > 0) {
        fail(`${filename} → "${sectionKey}": отсутствуют поля: ${missing.join(', ')}`);
        sectionErrors++;
      } else {
        pass(`${filename} → "${sectionKey}": все обязательные поля присутствуют`);
      }
      sectionCount++;
    }

    if (sectionErrors === 0) {
      pass(`${filename}: все ${sectionCount} секций корректны`);
    }
  }
}

// ────────────────────────────────────────────────────
// 2b. Обязательные поля (задачи)
// ────────────────────────────────────────────────────

function checkTaskFields(entries) {
  for (const { filename, data } of entries) {
    let missing = [];
    for (const field of TASK_REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null) {
        missing.push(field);
      }
      // Строковые поля не должны быть пустыми
      if (typeof data[field] === 'string' && data[field].trim() === '') {
        missing.push(field);
      }
      // Массивы не должны быть пустыми
      if (Array.isArray(data[field]) && data[field].length === 0) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      fail(`${filename}: отсутствуют или пусты поля: ${missing.join(', ')}`);
    } else {
      pass(`${filename}: все обязательные поля присутствуют`);
    }
  }
}

// ────────────────────────────────────────────────────
// 3. Теги (задачи)
// ────────────────────────────────────────────────────

function checkTaskTags(entries) {
  for (const { filename, data } of entries) {
    const tags = data.tags;

    if (!Array.isArray(tags)) {
      fail(`${filename}: tags не является массивом`);
      continue;
    }

    if (tags.length === 0) {
      fail(`${filename}: tags — пустой массив`);
      continue;
    }

    const nonString = tags.filter((t) => typeof t !== 'string');
    if (nonString.length > 0) {
      fail(`${filename}: tags содержит нестроковые элементы: ${JSON.stringify(nonString)}`);
      continue;
    }

    pass(`${filename}: tags — массив из ${tags.length} строк`);
  }
}

// ────────────────────────────────────────────────────
// 4. Дата (задачи)
// ────────────────────────────────────────────────────

function checkTaskDates(entries) {
  for (const { filename, data } of entries) {
    const date = data.date;

    if (!date) {
      fail(`${filename}: date отсутствует`);
      continue;
    }

    if (!DATE_REGEX.test(date)) {
      fail(`${filename}: date "${date}" не соответствует формату YYYY-MM-DD`);
      continue;
    }

    // Проверка, что дата существует (не 32-е января и т.п.)
    const parsed = new Date(date + 'T00:00:00Z');
    const [y, m, d] = date.split('-').map(Number);
    if (
      parsed.getFullYear() !== y ||
      parsed.getMonth() + 1 !== m ||
      parsed.getDate() !== d
    ) {
      fail(`${filename}: date "${date}" невалидна (такой даты не существует)`);
      continue;
    }

    pass(`${filename}: date "${date}" корректна`);
  }
}

// ────────────────────────────────────────────────────
// 5. Ссылки в навигации
// ────────────────────────────────────────────────────

function checkNavLinks() {
  // Проверка EXTRA_NAV — что каждая ссылка указывает на существующий HTML-файл
  for (const href of EXTRA_NAV) {
    const pagePath = path.join(PAGES_DIR, href);
    if (fs.existsSync(pagePath)) {
      pass(`навигационная ссылка "${href}" → файл существует`);
    } else {
      fail(`навигационная ссылка "${href}" → файл НЕ НАЙДЕН (${pagePath})`);
    }
  }

  // Проверка PAGE_MAP — что каждый JSON-файл имеет соответствующий HTML
  for (const [jsonFile, htmlFile] of Object.entries(PAGE_MAP)) {
    const jsonPath = path.join(DATA_DIR, jsonFile);
    const htmlPath = path.join(PAGES_DIR, htmlFile);

    if (!fs.existsSync(jsonPath)) {
      fail(`PAGE_MAP: JSON-файл ${jsonFile} не найден`);
    } else {
      pass(`PAGE_MAP: ${jsonFile} → ${htmlFile} (JSON найден)`);
    }

    if (!fs.existsSync(htmlPath)) {
      fail(`PAGE_MAP: HTML-страница ${htmlFile} не найдена`);
    } else {
      pass(`PAGE_MAP: ${htmlFile} (страница существует)`);
    }
  }

  // Проверка внутренних ссылок в HTML-страницах
  // Ищем все href="./..." или "../..." и проверяем, что файл существует
  let htmlFiles;
  try {
    htmlFiles = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'));
  } catch {
    fail(`pages/: директория не найдена`);
    return;
  }

  for (const filename of htmlFiles) {
    const filePath = path.join(PAGES_DIR, filename);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    // Находим все href в ссылках
    const hrefRegex = /href="([^"]+)"/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      const href = match[1];

      // Пропускаем внешние ссылки, якоря, mailto, data-uri
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('data:') ||
        href.startsWith('//')
      ) {
        continue;
      }

      // Пропускаем data-ссылки (app.js не относится к навигационным ссылкам)
      if (href.startsWith('../src/') || href.startsWith('/css/')) {
        continue;
      }

      // Пропускаем Font Awesome CDN
      if (href.includes('font-awesome') || href.includes('fonts.googleapis')) {
        continue;
      }

      // Вычисляем полный путь
      let targetPath;
      if (href.startsWith('../')) {
        targetPath = path.resolve(PAGES_DIR, href);
      } else {
        targetPath = path.resolve(PAGES_DIR, href);
      }

      if (!fs.existsSync(targetPath)) {
        // Может быть относительная ссылка внутри того же каталога
        const altPath = path.resolve(path.dirname(filePath), href);
        if (!fs.existsSync(altPath)) {
          fail(`${filename}: ссылка "${href}" → файл НЕ НАЙДЕН`);
        }
      }
    }
  }
}

// ────────────────────────────────────────────────────
// Запуск
// ────────────────────────────────────────────────────

console.log('validate.js — проверка проекта');
console.log('═══════════════════════════════\n');

// 1. JSON-синтаксис
console.log('--- 1. Валидность JSON ---');
const dataEntries = checkJsonSyntax(DATA_DIR, 'src/data');
const taskEntries = checkJsonSyntax(TASK_DIR, 'src/tasks');

console.log('');

// 2. Обязательные поля
console.log('--- 2. Обязательные поля ---');
console.log('[Секции данных]');
checkDataFields(dataEntries);
console.log('[Задачи]');
checkTaskFields(taskEntries);

console.log('');

// 3. Теги
console.log('--- 3. Теги задач ---');
checkTaskTags(taskEntries);

console.log('');

// 4. Дата
console.log('--- 4. Дата задач ---');
checkTaskDates(taskEntries);

console.log('');

// 5. Ссылки
console.log('--- 5. Навигационные ссылки ---');
checkNavLinks();

console.log('');

// 6. Отчёт
console.log('--- 6. Отчёт ---');
summaryLine();

// Вывод всех результатов
console.log(results.join('\n'));
console.log('');

process.exit(failedCount > 0 ? 1 : 0);
