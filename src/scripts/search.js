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

function showAllCards() {
  const cards = document.querySelectorAll('.simple-card');
  cards.forEach((card) => {
    card.style.display = 'block';
  });
}

function showSearchResults(results) {
  const cards = document.querySelectorAll('.simple-card');
  cards.forEach((card) => {
    card.style.display = 'none';
  });

  if (results.length > 0) {
    const categories = [...new Set(results.map((r) => r.category))];
    categories.forEach((category) => {
      const card = document.querySelector(`.simple-card[href="pages/${category}.html"]`);
      if (card) {
        card.style.display = 'block';
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Инициализация
// ---------------------------------------------------------------------------

let searchData = null;

export async function initSearch() {
  searchData = await loadSearchIndex();
  if (!searchData) {
    console.warn('search.js: поисковый индекс не загружен');
    return;
  }

  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();

    if (query.length === 0) {
      showAllCards();
      return;
    }

    // searchData может быть массивом (если это search-index.json)
    // или массивом из глобальной переменной
    const results = searchData.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(query) ||
        (item.content || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query),
    );

    showSearchResults(results);
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
