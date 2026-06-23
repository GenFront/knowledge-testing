/**
 * content-loader.js
 * Загрузка JSON-данных и рендеринг в DOM-контейнеры.
 *
 * Поддерживает два формата:
 *   1. Секции тем (src/data/*.json)
 *      { "basics": { "title": "...", "content": "<p>...</p>" }, ... }
 *      → рендерит секцию по ключу
 *
 *   2. Задачи (src/tasks/*.json)
 *      { "id": "...", "title": "...", "content": [ {type, text, ...} ] }
 *      → рендерит массив content-блоков
 */

// ---------------------------------------------------------------------------
// Утилиты
// ---------------------------------------------------------------------------

/** Экранирует спецсимволы HTML для вставки в code-блоки */
function escapeHtml(raw) {
  const div = document.createElement('div');
  div.textContent = raw;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Рендеринг структурированного контента задач
// ---------------------------------------------------------------------------

/**
 * Рендерит массив content-блоков задачи в HTML-строку.
 * @param {Array} blocks — [{ type, text?, level?, language?, items?, ordered? }]
 * @returns {string}
 */
function renderTaskBlocks(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.text}</p>`;

        case 'heading': {
          const level = block.level || 3;
          return `<h${level}>${block.text}</h${level}>`;
        }

        case 'code': {
          const lang = block.language ? ` class="language-${block.language}"` : '';
          return `<pre><code${lang}>${escapeHtml(block.text)}</code></pre>`;
        }

        case 'list': {
          const tag = block.ordered ? 'ol' : 'ul';
          const items = block.items.map((item) => `<li>${item}</li>`).join('');
          return `<${tag}>${items}</${tag}>`;
        }

        case 'hr':
          return '<hr>';

        default:
          console.warn(`content-loader: неизвестный тип блока "${block.type}"`);
          return '';
      }
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// Публичные API
// ---------------------------------------------------------------------------

/**
 * Загружает JSON-файл темы и рендерит указанную секцию в контейнер.
 *
 * @param {string} filePath  — путь к JSON (напр. '../src/data/html.json')
 * @param {string} sectionKey — ключ секции (напр. 'basics')
 * @param {string} containerId — id DOM-элемента
 * @returns {Promise<void>}
 */
export async function loadSectionContent(filePath, sectionKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`content-loader: контейнер #${containerId} не найден`);
    return;
  }

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const section = data[sectionKey];

    if (!section) {
      container.innerHTML = `<p class="placeholder-text">Раздел «${sectionKey}» не найден</p>`;
      return;
    }

    // Двухколоночный layout для секции задач
    if (section.layout === 'two-column') {
      container.innerHTML = `
        <h2>${section.title}</h2>
        <div class="arrays-layout">
          <div id="tasks-menu">${section.content}</div>
          <div id="task-topic-content"></div>
        </div>
      `;
      return;
    }

    container.innerHTML = `<h2>${section.title}</h2>\n${section.content}`;
  } catch (err) {
    container.innerHTML = `<p class="placeholder-text">Ошибка загрузки: ${err.message}</p>`;
  }
}

/**
 * Загружает JSON-файл задачи и рендерит структурированный контент.
 *
 * @param {string} filePath   — путь к JSON задачи (напр. '../src/tasks/qualification-jumps.json')
 * @param {string} containerId — id DOM-элемента
 * @returns {Promise<void>}
 */
export async function loadTaskContent(filePath, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`content-loader: контейнер #${containerId} не найден`);
    return;
  }

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const task = await res.json();

    const html = `
      <h2>${task.title}</h2>
      ${renderTaskBlocks(task.content)}
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="placeholder-text">Ошибка загрузки задачи: ${err.message}</p>`;
  }
}
