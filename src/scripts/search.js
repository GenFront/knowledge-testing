/**
 * search.js — движок поиска.
 *
 * Загружает поисковый индекс из src/data/search-index.json.
 * Если файл не найден (Фаза 1 совместимости), падает на данные из
 * глобальной переменной searchData, определённой в scripts/search.js.
 *
 * Экспортирует:
 *   initSearch() — инициализация поиска на странице
 */

const FALLBACK_DATA = typeof window.searchData !== 'undefined' ? window.searchData : null;
const SEARCH_QUERY_KEY = 'searchQuery';

// ---------------------------------------------------------------------------
// Загрузка индекса
// ---------------------------------------------------------------------------

async function loadSearchIndex() {
  try {
    const res = await fetch('./src/data/search-index.json');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // файл ещё не создан — используем fallback
  }
  return FALLBACK_DATA;
}

// ---------------------------------------------------------------------------
// UI-функции
// ---------------------------------------------------------------------------

const NOTHING_FOUND_HTML = '<p class="search-nothing">Ничего не найдено</p>';

function showAllCards() {
  const cards = document.querySelectorAll('.simple-card');
  cards.forEach((card) => {
    card.style.display = 'block';
  });
  // Скрываем результаты поиска и сообщение
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }
}

function showSearchResults(results) {
  const cards = document.querySelectorAll('.simple-card');
  cards.forEach((card) => {
    card.style.display = 'none';
  });

  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  // Разделяем результаты на категории и задачи
  const taskResults = results.filter((r) => r.type === 'task');
  const categoryResults = results.filter((r) => r.type !== 'task');

  // Показываем карточки категорий (для тем)
  if (categoryResults.length > 0) {
    const categories = [...new Set(categoryResults.map((r) => r.category))];
    categories.forEach((category) => {
      const card = document.querySelector(`.simple-card[href="pages/${category}.html"]`);
      if (card) {
        card.style.display = 'block';
      }
    });
  }

  // Показываем результаты задач как ссылки
  if (taskResults.length > 0) {
    resultsContainer.innerHTML = `
      <h3 class="search-results-title">Задачи</h3>
      <ul class="search-results-list">
        ${taskResults
          .map(
            (task) =>
              `<li><a href="pages/${task.path}" class="search-result-link">${escapeHtml(task.title)}</a></li>`,
          )
          .join('')}
      </ul>
    `;
    resultsContainer.style.display = 'block';
  } else if (categoryResults.length === 0) {
    // Нет ни задач, ни тем — пустой результат
    resultsContainer.innerHTML = NOTHING_FOUND_HTML;
    resultsContainer.style.display = 'block';
  } else {
    // Есть темы, но нет задач — скрываем блок результатов
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }
}

/**
 * Открывает первый результат поиска.
 * Вызывается при нажатии Enter.
 */
function openFirstResult() {
  if (!currentResults || currentResults.length === 0) return;

  // Сохраняем поисковый запрос для подсветки на странице задачи
  if (currentQuery) {
    console.log(`🔎 search: сохраняю запрос "${currentQuery}" в sessionStorage.${SEARCH_QUERY_KEY}`);
    sessionStorage.setItem(SEARCH_QUERY_KEY, currentQuery);
  } else {
    console.warn('🔎 search: currentQuery пустой, ничего не сохраняю');
  }

  const first = currentResults[0];
  // first.path = "html.html#basics" или "projects.html#lunch-menu-manager"
  window.location.href = `pages/${first.path}`;
}

/**
 * Простейшее экранирование HTML для безопасной вставки user-контента
 * (на случай, если в названии задачи есть < > &).
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// Инициализация
// ---------------------------------------------------------------------------

let searchData = null;
let currentResults = null; // последние результаты для обработки Enter
let currentQuery = ''; // текущий поисковый запрос (оригинальный регистр)

export async function initSearch() {
  searchData = await loadSearchIndex();
  if (!searchData) {
    console.warn('search.js: поисковый индекс не загружен');
    return;
  }

  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  // Обновление результатов при вводе текста
  searchInput.addEventListener('input', function () {
    const query = this.value.trim();
    currentQuery = query;
    const lowerQuery = query.toLowerCase();

    if (query.length === 0) {
      currentResults = null;
      currentQuery = '';
      showAllCards();
      return;
    }

    currentResults = searchData.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(lowerQuery) ||
        (item.content || '').toLowerCase().includes(lowerQuery) ||
        (item.category || '').toLowerCase().includes(lowerQuery),
    );

    showSearchResults(currentResults);
  });

  // Клик по результату поиска → сохранить запрос перед переходом
  const resultsContainer = document.getElementById('search-results');
  if (resultsContainer) {
    resultsContainer.addEventListener('click', function (event) {
      const link = event.target.closest('.search-result-link');
      if (!link) return;
      if (currentQuery) {
        console.log(`🔎 search: клик по ссылке, сохраняю запрос "${currentQuery}" в sessionStorage.${SEARCH_QUERY_KEY}`);
        sessionStorage.setItem(SEARCH_QUERY_KEY, currentQuery);
      }
    });
  }

  // Enter → открыть первый результат
  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      openFirstResult();
    }
  });
}

// Авто-инициализация, если app.js не загружен (резервная совместимость)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('homepage')) {
      initSearch();
    }
  });
} else if (document.body.classList.contains('homepage')) {
  initSearch();
}
