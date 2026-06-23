# Knowledge Testing — База знаний по фронтенду

Проект представляет собой статическую базу знаний с интерактивными задачами. Контент (темы, задачи, материалы, тесты) хранится в JSON-файлах, HTML-страницы генерируются из единого Handlebars-шаблона, а логика загрузки и навигации вынесена в ES-модули. Подходит для изучения фронтенда, самопроверки и расширения новыми темами.

## Архитектура

```
JSON (data/tasks)  ──►  Handlebars-шаблон  ──►  Статические HTML
                              │
                    ES-модули (src/scripts/)
                    ├── app.js           — роутер по классу <body>
                    ├── navigation.js    — загрузка секций по клику
                    ├── content-loader.js — рендеринг контента
                    ├── task-viewer.js    — отображение задач
                    └── search.js        — поиск по индексу
```

**Принцип:**
- Все HTML-страницы генерируются скриптом `tools/generate-pages.js`.
- Данные и контент хранятся в JSON (`src/data/`, `src/tasks/`).
- JavaScript-модули загружают JSON и рендерят его в DOM.
- Навигация работает через `data-section` / `data-path` на ссылках.
- Для работы модулей требуется HTTP-сервер (ES-модули не работают из `file://`).

## Развёртывание и использование

### Требования

- Node.js 18+
- npm

### Установка

```bash
npm install
```

### Генерация страниц

```bash
npm run build:pages
```

Скрипт читает `src/templates/page.handlebars` + JSON-данные и записывает HTML-файлы в `pages/`.

### Запуск локального сервера

```bash
npx serve .
# или
python3 -m http.server 8080
```

Открой `http://localhost:3000/app.html` в браузере.

> **Важно:** ES-модули не работают при открытии `file://`. Всегда используйте HTTP-сервер.

## Структура проекта

```
├── src/
│   ├── data/               # Данные тем (html, css, js, tools, projects, materials, tests)
│   ├── tasks/              # Данные задач (qualification-jumps, airline-miles, lunch-menu-manager)
│   ├── scripts/            # ES-модули приложения
│   │   ├── app.js          #   — единая точка входа (роутер по классу <body>)
│   │   ├── navigation.js   #   — обработка кликов по навигации
│   │   ├── content-loader.js # — рендеринг секций и задач из JSON
│   │   ├── task-viewer.js  #   — отображение задачи в two-column layout
│   │   └── search.js       #   — поиск по search-index.json
│   └── templates/          # Handlebars-шаблоны
│       └── page.handlebars #   — единый шаблон для всех страниц
├── pages/                  # Сгенерированные HTML-страницы (7 шт.)
├── tools/
│   └── generate-pages.js   # Генератор страниц из шаблона + JSON
├── styles/
│   └── style.css           # Единственный активный CSS
├── css/
│   └── normalize.css       # Normalize.css
├── fonts/doc_fonts/        # Документация и шпаргалки (22 HTML-файла)
├── docs/
│   └── Normalize.html      # Памятка по Normalize.css
├── tests/                  # HTML-тесты (test-css, test-html)
├── snippets/               # Шпаргалки (bootstrap-cheatsheet)
├── images/                 # Иконки
├── app.html                # Главная страница (карточки тем)
├── index.html              # Редирект на app.html
└── package.json            # npm-скрипты: build:pages, lint:css
```

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
2. Зарегистрировать страницу в `tools/generate-pages.js` (массив `PAGES_CONFIG`).
3. Выполнить `npm run build:pages`.

Каждая секция автоматически станет пунктом навигации. Ключ объекта — значение `data-section`, путь к JSON — значение `data-path` в сгенерированной HTML-ссылке.

**Двухколоночный layout:** если секция должна отображаться в две колонки (как «Задачи» в проектах), добавьте в JSON:
```json
"tasks": {
  "title": "Задачи",
  "layout": "two-column",
  "content": "..."
}
```

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
       { "type": "p", "text": "Описание задачи..." },
       { "type": "code", "text": "const x = 1;", "language": "javascript" },
       { "type": "list", "items": ["пункт 1", "пункт 2"], "ordered": false }
     ]
   }
   ```
2. Добавить ссылку в раздел «Задачи» на странице проектов — обновить `tasks.content` в `src/data/projects.json`:
   ```html
   <li><a href="#" class="task-topic" data-topic="my-task">Моя задача</a></li>
   ```

Поддерживаемые типы блоков контента:

| type     | Поля                          | HTML-результат          |
|----------|-------------------------------|-------------------------|
| `p`      | `text`                        | `<p>`                   |
| `h3`     | `text`                        | `<h3>`                  |
| `code`   | `text`, `language`            | `<pre><code>`           |
| `list`   | `items`, `ordered`            | `<ul>` / `<ol>`         |
| `hr`     | —                             | `<hr>`                  |

## Команды

| Команда | Описание |
|---|---|
| `npm run build:pages` | Сгенерировать все HTML-страницы |
| `npm run lint:css` | Проверить CSS стили |
| `npm run lint:css-fix` | Автоисправление CSS |

## Технические заметки

- Проект сугубо статический — не требует серверного рендеринга или сборщика (Vite/Parcel опционально).
- При добавлении новой задачи проверьте, что `title` и `tags` не пустые — скрипт генерации индекса (`generate-index.js`, Фаза 6) при их отсутствии выведет ошибку, но сборку не сломает.
- Для поддержки CORS при разработке используйте `npx serve .` — он корректно обслуживает `type="module"`.
