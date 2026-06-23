/**
 * task-viewer.js
 * Отображение задач из src/tasks/*.json в двухколоночном layout.
 *
 * Используется на странице projects.html (body class="projects-page").
 *
 * Механизм:
 *   При клике на элемент с классом .task-topic считывает
 *   data-topic → определяет путь к JSON → вызывает loadTaskContent.
 */

import { loadTaskContent } from './content-loader.js';

/**
 * Маппинг data-topic → путь к JSON-файлу задачи.
 * Пополняется при добавлении новых задач.
 */
const TASK_MAP = {
  qualificationJumps: '../src/tasks/qualification-jumps.json',
  airlineMiles: '../src/tasks/airline-miles.json',
  lunchMenuManager: '../src/tasks/lunch-menu-manager.json',
};

/**
 * Инициализирует обработчик кликов по .task-topic
 * (делегирование на document).
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

    // Опционально: подсветить активную ссылку в меню задач
    document.querySelectorAll('.task-topic').forEach((el) => {
      el.classList.remove('active');
    });
    link.classList.add('active');

    // Загружаем и рендерим
    loadTaskContent(filePath, containerId);
  });
}
