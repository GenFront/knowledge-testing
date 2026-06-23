/**
 * navigation.js
 * Обработка кликов по навигационным ссылкам (.nav-link).
 *
 * Каждая ссылка должна содержать:
 *   data-section — ключ секции внутри JSON (напр. 'basics')
 *   data-path    — путь к JSON-файлу (напр. '../src/data/html.json')
 *
 * Если ссылка ведёт на другую страницу (materials.html, tests.html) —
 * происходит обычный переход, без перехвата.
 */

import { loadSectionContent, loadTaskContent } from './content-loader.js';

/**
 * Инициализирует навигацию: вешает делегированный обработчик
 * на клики по элементам с классом .nav-link.
 */
export function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const contentContainer = document.getElementById('content-container');

  if (!navLinks.length) {
    console.warn('navigation: нет элементов .nav-link на странице');
    return;
  }

  // -----------------------------------------------------------------------
  // Обработчик клика по отдельной ссылке
  // -----------------------------------------------------------------------
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      // Ссылки на другие страницы — не перехватываем
      const href = this.getAttribute('href');
      if (
        href &&
        (href.endsWith('materials.html') || href.endsWith('tests.html'))
      ) {
        window.location.href = href;
        return;
      }

      // Если нет data-section — возможно, это просто ссылка на другую страницу
      const sectionKey = this.getAttribute('data-section');
      if (!sectionKey) return;

      e.preventDefault();

      // Обновляем active-класс
      navLinks.forEach((l) => l.classList.remove('active'));
      this.classList.add('active');

      // Обновляем URL hash для возможности поделиться ссылкой
      if (window.history && window.history.replaceState) {
        const hash = sectionKey.replace(/\s+/g, '-');
        window.history.replaceState(null, '', `#${hash}`);
      }

      // Загружаем контент
      const jsonPath = this.getAttribute('data-path');
      if (!jsonPath) {
        console.warn(
          `navigation: у .nav-link отсутствует data-path для секции "${sectionKey}"`,
        );
        if (contentContainer) {
          contentContainer.innerHTML =
            `<p class="placeholder-text">Выберите раздел из навигации слева</p>`;
        }
        return;
      }

      loadSectionContent(jsonPath, sectionKey, 'content-container');
    });
  });

  // -----------------------------------------------------------------------
  // Авто-открытие секции из hash при загрузке страницы
  // -----------------------------------------------------------------------
  openSectionFromHash(navLinks);
}

/**
 * Проверяет window.location.hash при загрузке страницы.
 * Если хэш соответствует секции — открывает её (без задержки).
 * Если хэша нет — открывает первый пункт меню.
 */
function openSectionFromHash(navLinks) {
  if (window.location.hash) {
    const hash = window.location.hash.slice(1);
    const targetLink = Array.from(navLinks).find(
      (link) =>
        link.getAttribute('data-section') === hash ||
        link.getAttribute('data-section') === hash.replace(/-/g, ''),
    );
    if (targetLink) {
      targetLink.click();
      return;
    }
    // Если хэш не соответствует ни одной секции (например, это хэш задачи) —
    // ничего не делаем, task-viewer.js обработает сам
  } else {
    // Открываем первый пункт меню по умолчанию
    const firstLink = Array.from(navLinks).find(
      (link) => link.getAttribute('data-section') && link.getAttribute('data-path'),
    );
    if (firstLink) {
      firstLink.click();
    }
  }
}
