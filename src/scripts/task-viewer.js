/**
 * task-viewer.js
 * Отображение задач из src/tasks/*.json в двухколоночном layout.
 *
 * Используется на странице projects.html (body class="projects-page").
 *
 * Механизм:
 *   При клике на элемент с классом .task-topic считывает
 *   data-topic → определяет путь к JSON → вызывает loadTaskContent.
 *
 *   При загрузке страницы с хэшем (напр. #lunch-menu-manager):
 *   открывает соответствующую задачу и подсвечивает её в меню.
 *
 *   Если в sessionStorage сохранён searchQuery, подсвечивает
 *   все найденные вхождения в содержимом задачи.
 */

import { loadSectionContent, loadTaskContent } from './content-loader.js';

const SEARCH_QUERY_KEY = 'searchQuery';

/**
 * Маппинг data-topic → путь к JSON-файлу задачи.
 * Пополняется при добавлении новых задач.
 */
const TASK_MAP = {
  qualificationJumps: '../src/tasks/qualification-jumps.json',
  airlineMiles: '../src/tasks/airline-miles.json',
  lunchMenuManager: '../src/tasks/lunch-menu-manager.json',
};

// ────────────────────────────────────────────────────
// Подсветка активной задачи
// ────────────────────────────────────────────────────

/**
 * Удаляет класс .active у всех .task-topic и добавляет
 * его к элементу с указанным data-topic.
 */
function highlightTaskTopic(topic) {
  document.querySelectorAll('.task-topic').forEach((el) => {
    el.classList.remove('active');
  });
  const target = document.querySelector(`.task-topic[data-topic="${topic}"]`);
  if (target) {
    target.classList.add('active');
  }
}

// ────────────────────────────────────────────────────
// Подсветка поискового запроса
// ────────────────────────────────────────────────────

/**
 * Подсвечивает все вхождения searchQuery внутри контейнера.
 * Обходит текстовые узлы и оборачивает совпадения в <mark>.
 */
function highlightSearchTerm(containerId) {
  const query = sessionStorage.getItem(SEARCH_QUERY_KEY);
  console.log(`🎯 task-viewer: highlightSearchTerm вызван для #${containerId}, запрос из storage:`, query);
  if (!query || query.length === 0) {
    console.log('🎯 task-viewer: запрос пустой или отсутствует — выхожу');
    return;
  }

  // Удаляем из storage сразу — повторные обновления не нужны
  sessionStorage.removeItem(SEARCH_QUERY_KEY);
  console.log(`🎯 task-viewer: ключ ${SEARCH_QUERY_KEY} удалён из sessionStorage`);

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`🎯 task-viewer: контейнер #${containerId} НЕ НАЙДЕН в DOM`);
    return;
  }
  console.log(`🎯 task-viewer: контейнер #${containerId} найден, ищу "${query}" (lower: "${query.toLowerCase()}")`);

  const lowerQuery = query.toLowerCase();
  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  // Собираем все текстовые узлы
  while (treeWalker.nextNode()) {
    textNodes.push(treeWalker.currentNode);
  }
  console.log(`🎯 task-viewer: найдено ${textNodes.length} текстовых узлов`);

  let matchCount = 0;

  // Обрабатываем каждый узел
  for (const textNode of textNodes) {
    const originalText = textNode.nodeValue;
    const lowerText = originalText.toLowerCase();

    if (!lowerText.includes(lowerQuery)) continue;

    matchCount++;
    if (matchCount === 1) {
      console.log(`🎯 task-viewer: первое совпадение в узле: "${originalText.slice(0, 80)}..."`);
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    let index = lowerText.indexOf(lowerQuery, lastIndex);
    while (index !== -1) {
      // Текст до совпадения
      if (index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(originalText.slice(lastIndex, index)),
        );
      }

      // Само совпадение (оригинальный регистр) — обёрнуто в <mark>
      const mark = document.createElement('mark');
      mark.style.background = 'yellow';
      mark.style.color = 'black';
      mark.textContent = originalText.slice(index, index + query.length);
      fragment.appendChild(mark);

      lastIndex = index + query.length;
      index = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // Остаток текста после последнего совпадения
    if (lastIndex < originalText.length) {
      fragment.appendChild(
        document.createTextNode(originalText.slice(lastIndex)),
      );
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  if (matchCount > 0) {
    console.log(`🎯 task-viewer: подсветка завершена — обработано ${matchCount} узлов с совпадениями`);
  } else {
    console.log(`🎯 task-viewer: совпадений для "${query}" не найдено в тексте`);
  }
}

// ────────────────────────────────────────────────────
// Открытие задачи из хэша URL
// ────────────────────────────────────────────────────

/**
 * Преобразует kebab-case в camelCase.
 *   "lunch-menu-manager" → "lunchMenuManager"
 */
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Преобразует camelCase в kebab-case.
 *   "lunchMenuManager" → "lunch-menu-manager"
 */
function camelToKebab(str) {
  return str.replace(/([A-Z])/g, (_, c) => '-' + c.toLowerCase());
}

/**
 * Ищет ключ TASK_MAP, соответствующий хэшу,
 * независимо от стиля (camelCase / kebab-case).
 */
function findTopicByHash(hash) {
  // Прямое совпадение
  if (TASK_MAP[hash]) return hash;

  // hash в kebab → попробовать camelCase
  const camel = kebabToCamel(hash);
  if (TASK_MAP[camel]) return camel;

  // hash в camel → попробовать kebab
  const kebab = camelToKebab(hash);
  if (TASK_MAP[kebab]) return kebab;

  return null;
}

/**
 * Читает window.location.hash, находит задачу и открывает её.
 * При необходимости предварительно загружает секцию «Задачи».
 */
async function loadTaskFromHash() {
  if (!window.location.hash) return;

  const hash = window.location.hash.slice(1);
  console.log(`🔍 task-viewer: пытаюсь открыть задачу из хэша "${hash}"`);

  const topic = findTopicByHash(hash);
  if (!topic) {
    console.log(`🔍 task-viewer: хэш "${hash}" не соответствует ни одной задаче — пропускаю`);
    return;
  }

  const filePath = TASK_MAP[topic];
  if (!filePath) {
    console.warn(`task-viewer: нет маппинга для хэша "${hash}" → topic "${topic}"`);
    return;
  }

  // Убедиться, что секция «Задачи» загружена (создаёт two-column layout)
  const tasksContainer = document.getElementById('task-topic-content');
  if (!tasksContainer) {
    await loadSectionContent('../src/data/projects.json', 'tasks', 'content-container');
  }

  await loadTaskContent(filePath, 'task-topic-content');
  console.log(`🔍 task-viewer: контент задачи "${topic}" загружен в #task-topic-content`);

  highlightTaskTopic(topic);

  console.log('🔍 task-viewer: вызываю highlightSearchTerm, sessionStorage содержит:', sessionStorage.getItem(SEARCH_QUERY_KEY));
  highlightSearchTerm('task-topic-content');
}

// ────────────────────────────────────────────────────
// Инициализация
// ────────────────────────────────────────────────────

/**
 * Инициализирует обработчик кликов по .task-topic
 * (делегирование на document) и открывает задачу из хэша.
 */
export function initTaskViewer() {
  document.addEventListener('click', function (event) {
    const link = event.target.closest('.task-topic');
    if (!link) return;

    event.preventDefault();

    const topic = link.dataset.topic;
    const filePath = TASK_MAP[topic];

    console.log('task-viewer: открываю задачу', topic);

    if (!filePath) {
      console.warn(`task-viewer: неизвестная задача "${topic}"`);
      return;
    }

    const containerId = 'task-topic-content';
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`task-viewer: контейнер #${containerId} не найден`);
      return;
    }

    // Подсветить активную ссылку
    highlightTaskTopic(topic);

    // Загружаем, рендерим, затем подсвечиваем поисковый запрос
    loadTaskContent(filePath, containerId).then(() => {
      console.log(`task-viewer: контент загружен через клик, вызываю highlightSearchTerm`);
      highlightSearchTerm(containerId);
    });
  });

  // Открыть задачу из хэша URL, если есть
  loadTaskFromHash();
}
