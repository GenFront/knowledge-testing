# Knowledge Testing — База знаний по фронтенду

![Static Pages](https://img.shields.io/badge/Pages-7-success)
![Validation](https://img.shields.io/badge/Validation-94%2F94-success)

Проект представляет собой статическую базу знаний с интерактивными задачами. Контент (темы, задачи, материалы, тесты) хранится в JSON-файлах, HTML-страницы генерируются из единого Handlebars-шаблона, а логика загрузки и навигации вынесена в ES-модули.

---

## Философия проекта

**Data-driven, статика, без фреймворков.**

Проект построен на трёх принципах:

1. **Контент — это данные.** Все темы, задачи, материалы и тесты живут в JSON. HTML — лишь представление. Это позволяет менять структуру страниц (шаблон) независимо от содержимого, а содержимое — независимо от вёрстки.

2. **Статическая генерация.** Страницы собираются один раз — при `npm run build`. На сервере не нужно Node.js, базы данных или рантайма. Достаточно любого HTTP-сервера (`serve`, `python3 -m http.server`, nginx). Это даёт максимальную скорость загрузки, минимальные требования к хостингу и отсутствие точек отказа.

3. **Только vanilla JS.** Никаких React, Vue, SPA-роутеров или сборщиков. Навигация и поиск реализованы на чистом DOM API через ES-модули. Проект не требует `npm run dev` для разработки — достаточно открыть страницу через localhost после сборки. Фреймворк можно добавить позже (например, Vite для HMR), но сейчас в нём нет необходимости.

---

## Архитектура

Проект построен по принципу **data-driven генерации**:

```
src/templates/page.handlebars     # Единый шаблон
         │
tools/generate-pages.js           # Генератор HTML
         │
         ▼
pages/*.html  ────────           # Статические страницы
                            │
src/data/*.json              │    # Данные тем (content, title)
src/tasks/*.json              │   # Данные задач
                            │
         ▼                  ▼
src/scripts/app.js  ───  src/scripts/navigation.js
src/scripts/content-loader.js ─ src/scripts/task-viewer.js
src/scripts/search.js
```

**Схема работы:**

1. **Данные** — JSON-файлы в `src/data/` (секции тем) и `src/tasks/` (структурированные задачи).
2. **Генерация** — `tools/generate-pages.js` читает шаблон `page.handlebars` + JSON и создаёт статические HTML-страницы в `pages/`.
3. **Роутинг** — `app.js` определяет тип страницы по классу `<body>` и подключает нужные модули.
4. **Навигация** — клик по ссылке с `data-section`/`data-path` загружает JSON-секцию и рендерит в DOM.
5. **Поиск** — `generate-index.js` строит `search-index.json` из всех JSON-файлов.

**Важно:** ES-модули (`type="module"`) не работают при открытии через `file://` (CORS). Используйте HTTP-сервер как для разработки, так и для локального использования. После `npm run build` страницы готовы — просто откройте их через `localhost`.

---

## Команды

| Команда | Описание |
|---|---|
| `npm run build` | **Полная сборка:** страницы + поисковый индекс |
| `npm run build:pages` | Генерация HTML-страниц из шаблона + JSON |
| `npm run build:index` | Генерация поискового индекса `search-index.json` |
| `npm run dev` | Запуск локального HTTP-сервера (`npx serve .`) |
| `npm run validate` | Проверка проекта: JSON, поля, ссылки |
| `npm run lint:css` | Проверка CSS-стилей |
| `npm run lint:css-fix` | Автоисправление CSS-стилей |

---

## Развёртывание и использование

### Требования

- Node.js 18+
- npm

### Установка

```bash
npm install
```

### Полная сборка

```bash
npm run build
```

Эквивалентно последовательному запуску:

```bash
npm run build:pages    # генерирует HTML в pages/
npm run build:index    # генерирует src/data/search-index.json
```

### Локальный сервер

```bash
npm run dev
# или вручную:
npx serve .
# или:
python3 -m http.server 8080
```

Открой `http://localhost:3000/app.html` в браузере.

### Валидация

```bash
npm run validate
```

Проверяет:
- Синтаксис всех JSON-файлов в `src/data/` и `src/tasks/`.
- Наличие обязательных полей (`title`, `content` для секций; `id`, `title`, `difficulty`, `tags`, `date`, `content` для задач).
- Теги задач — массив непустых строк.
- Даты задач — формат `YYYY-MM-DD`.
- Навигационные ссылки — все `href` указывают на существующие файлы.

Завершается с `exit code 1` при любой ошибке (можно использовать в CI).

---

## Структура проекта

```
├── src/
│   ├── data/                          # Данные тем (7 JSON-файлов)
│   │   ├── html.json                  #   — 8 секций (basics, tags, forms, ...)
│   │   ├── css.json                   #   — 9 секций
│   │   ├── js.json                    #   — 9 секций
│   │   ├── tools.json                 #   — 8 секций
│   │   ├── projects.json              #   — 8 секций (включая задачи)
│   │   ├── materials.json             #   — 5 секций (учебные материалы)
│   │   ├── tests.json                 #   — 5 секций (тесты)
│   │   └── search-index.json          #   — поисковый индекс (авто-генерация)
│   ├── tasks/                         # Данные задач (3 JSON-файла)
│   │   ├── qualification-jumps.json
│   │   ├── airline-miles.json
│   │   └── lunch-menu-manager.json
│   ├── scripts/                       # ES-модули приложения
│   │   ├── app.js                     #   — единая точка входа
│   │   ├── navigation.js              #   — навигация (data-section/data-path)
│   │   ├── content-loader.js          #   — рендеринг из JSON в DOM
│   │   ├── task-viewer.js             #   — two-column layout для задач
│   │   └── search.js                  #   — поиск по search-index.json
│   └── templates/
│       └── page.handlebars            # Единый Handlebars-шаблон
├── pages/                             # Сгенерированные HTML (7 файлов)
├── tools/                             # Скрипты и утилиты
│   ├── generate-pages.js              # Генератор страниц
│   ├── generate-index.js              # Генератор поискового индекса
│   └── validate.js                    # Валидация проекта
├── styles/
│   └── style.css                      # Единственный активный CSS
├── css/
│   └── normalize.css                  # Normalize.css
├── images/                            # Иконки
├── app.html                           # Главная страница (карточки тем)
├── index.html                         # Редирект на app.html
└── package.json                       # npm-скрипты
```

---

## Как добавить новую тему

1. Создать JSON-файл в `src/data/<тема>.json`:
   ```json
   {
     "basics": {
       "title": "Основы",
       "content": "<p>Текст раздела</p>"
     },
     "advanced": {
       "title": "Продвинутое",
       "content": "<p>Другой раздел</p>"
     }
   }
   ```
2. Зарегистрировать страницу в `tools/generate-pages.js` (массив `PAGES_CONFIG`):
   ```js
   {
     id: 'my-topic',
     title: 'Моя тема',
     navTitle: 'Моя тема',
     jsonFile: 'src/data/my-topic.json',
     pageType: 'topic-page',
   },
   ```
3. Выполнить `npm run build`.

Каждая секция автоматически станет пунктом навигации. **Ключ объекта в JSON (например, `"basics"`) становится значением `data-section` в навигационной ссылке.** Название пункта меню берётся из поля `title`. Путь к JSON-файлу записывается в `data-path`. Благодаря этому навигация работает без единой строчки кода при добавлении новых разделов.

**Двухколоночный layout:** если секция должна отображаться в две колонки (как «Задачи» в проектах), добавьте в JSON:
```json
"tasks": {
  "title": "Задачи",
  "layout": "two-column",
  "content": "<h3>Список задач</h3><ul>...</ul>"
}
```

---

## Как добавить новую задачу

1. Создать JSON-файл в `src/tasks/<id>.json` по схеме:
   ```json
   {
     "id": "my-task",
     "title": "Моя задача",
     "difficulty": "medium",
     "tags": ["arrays", "loops"],
     "date": "2026-06-23",
     "content": [
       { "type": "paragraph", "text": "Описание задачи..." },
       { "type": "code", "text": "const x = 1;" },
       { "type": "list", "items": ["пункт 1", "пункт 2"], "ordered": false }
     ]
   }
   ```
2. Добавить ссылку в раздел «Задачи» на странице проектов — обновить `tasks.content` в `src/data/projects.json`:
   ```html
   <li><a href="#" class="task-topic" data-topic="my-task">Моя задача</a></li>
   ```
3. Выполнить `npm run build` (перегенерирует страницы и поисковый индекс).

Поддерживаемые типы блоков контента:

| type | Поля | HTML-результат |
|---|---|---|
| `paragraph` | `text` | `<p>` |
| `heading` | `text`, `level` (по умолч. 3) | `<h2>` — `<h6>` |
| `code` | `text`, `language` (опционально) | `<pre><code>` — без класса языка, если `language` не указан |
| `list` | `items`, `ordered` | `<ul>` / `<ol>` |
| `hr` | — | `<hr>` |

> Поле `language` у блока `code` опционально. Если его нет, код выводится как `<pre><code>` без класса языка — подсветка синтаксиса не применяется. Если указано (например, `"language": "javascript"`), класс `language-javascript` добавляется для использования с Prism.js или аналогичными библиотеками.

---

## Технические заметки

- Проект сугубо статический — не требует серверного рендеринга или сборщика. Vite/Parcel можно добавить опционально для HMR.
- Все JSON-файлы проходят валидацию при `npm run validate`. При добавлении данных убедитесь, что все обязательные поля заполнены.
- `search-index.json` автоматически перестраивается при `npm run build`. При отсутствии `title` или `tags` задача попадает в индекс, но валидатор выдаст предупреждение.
- Для поддержки CORS при разработке используйте `npm run dev` (или `npx serve .`) — он корректно обслуживает `type="module"`.
- Handlebars-шаблон `page.handlebars` используется для генерации всех страниц. Изменение шаблона требует перезапуска `npm run build:pages`.
