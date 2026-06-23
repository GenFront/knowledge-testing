/**
 * app.js — единая точка входа.
 *
 * Определяет тип страницы по классу <body> и подключает
 * соответствующие модули. Ничего не знает о данных.
 *
 * Классы <body>:
 *   homepage      — главная страница (карточки + поиск)
 *   topic-page    — тематическая страница (html, css, js, tools)
 *   projects-page — страница проектов (секции + задачи)
 *   materials-page — учебные материалы
 *
 * Использование в HTML:
 *   <script type="module" src="../src/scripts/app.js"></script>
 */

// ---------------------------------------------------------------------------
// Определение типа страницы
// ---------------------------------------------------------------------------

const pageType = document.body.className.trim();
const pageName = document.body.getAttribute('data-page') || '';

document.addEventListener('DOMContentLoaded', async () => {
  switch (pageType) {
    // ====================================================================
    // Главная страница — карточки и поиск
    // ====================================================================
    case 'homepage': {
      const { initSearch } = await import('./search.js');
      initSearch();
      break;
    }

    // ====================================================================
    // Тематические страницы (html, css, js, tools)
    // ====================================================================
    case 'topic-page': {
      const { initNavigation } = await import('./navigation.js');
      initNavigation();
      break;
    }

    // ====================================================================
    // Страница проектов (секции + задачи)
    // ====================================================================
    case 'projects-page': {
      const { initNavigation } = await import('./navigation.js');
      const { initTaskViewer } = await import('./task-viewer.js');
      initNavigation();
      initTaskViewer();
      break;
    }

    // ====================================================================
    // Страница материалов
    // ====================================================================
    case 'materials-page': {
      const { initNavigation } = await import('./navigation.js');
      initNavigation();
      break;
    }

    // ====================================================================
    // Страница тестов
    // ====================================================================
    case 'tests-page': {
      const { initNavigation } = await import('./navigation.js');
      initNavigation();
      break;
    }

    // ====================================================================
    // Неизвестный тип или страница без динамики
    // ====================================================================
    default:
      if (pageType) {
        console.log(`app.js: неизвестный тип страницы "${pageType}" — модули не подключены`);
      } else {
        console.log('app.js: <body> без класса — страница без динамического контента');
      }
  }
});
