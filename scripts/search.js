// Данные для поиска по всем страницам
const searchData = [
    // HTML тема
    { id: 'html-basics', title: 'Основы HTML', content: 'HTML (HyperText Markup Language) — это язык гипертекстовой разметки, стандартный для документов, предназначенных для отображения в браузере. HTML описывает структуру веб-страницы с помощью разметки.', category: 'html', url: 'pages/html.html#basics' },
    { id: 'html-tags', title: 'Теги и атрибуты', content: 'HTML-теги — это элементы языка, определяющие структуру и содержание веб-страницы. Атрибуты предоставляют дополнительную информацию об элементе. Например, тег <a> используется для создания ссылок, а атрибут href указывает адрес ссылки.', category: 'html', url: 'pages/html.html#tags' },
    { id: 'html-forms', title: 'Формы', content: 'HTML-формы позволяют пользователям вводить данные, которые затем могут быть отправлены на сервер для обработки. Формы состоят из различных элементов ввода: текстовых полей, флажков, переключателей, кнопок и т.д.', category: 'html', url: 'pages/html.html#forms' },
    { id: 'html-semantics', title: 'Семантика', content: 'Семантическая разметка — это использование HTML-элементов по их прямому назначению, что улучшает доступность и SEO. Примеры семантических тегов: <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>.', category: 'html', url: 'pages/html.html#semantics' },
    { id: 'html-tables', title: 'Таблицы', content: 'HTML-таблицы используются для представления табличных данных. Они состоят из строк и столбцов ячеек. Основные элементы таблицы: <table>, <thead>, <tbody>, <tr>, <th>, <td>.', category: 'html', url: 'pages/html.html#tables' },
    { id: 'html-links', title: 'Ссылки', content: 'Ссылки (гиперссылки) позволяют пользователям перемещаться между страницами. Они создаются с помощью тега <a>. Ссылки могут быть внутренними (на другие страницы сайта) или внешними (на другие сайты).', category: 'html', url: 'pages/html.html#links' },
    { id: 'html-entities', title: 'Сущности', content: 'HTML-сущности — это специальные символы, которые имеют особое значение в HTML и должны быть экранированы. Например, &lt; для символа <, &gt; для символа >, &amp; для символа &.', category: 'html', url: 'pages/html.html#entities' },
    { id: 'html-fundamentals', title: 'HTML основы', content: 'HTML основы - это фундаментальные концепции языка разметки. Структура HTML документа, теги и атрибуты, семантическая разметка, формы и элементы ввода, ссылки и навигация, изображения и медиа.', category: 'html', url: 'fonts/doc_fonts/html_fundamentals.html' },
    { id: 'semantic-images', title: 'Семантика изображений', content: 'Контентное изображение - это изображение, которое является неотъемлемой частью содержимого страницы и несет смысловую нагрузку. В отличие от декоративных изображений, контентные изображения должны быть доступны для пользователей с ограниченными возможностями и иметь альтернативный текст.', category: 'html', url: 'fonts/doc_fonts/semantic-images.html' },
    { id: 'classic-layout', title: 'Классическая схема верстки', content: 'Классическая схема верстки с reset/normalize CSS - это профессиональный стандарт для предсказуемой верстки. Включает сброс или нормализацию стилей браузера по умолчанию, единый подход к отображению элементов в разных браузерах.', category: 'html', url: 'fonts/doc_fonts/classic_layout.html' },
    { id: 'html-resources', title: 'Полезные ресурсы', content: 'MDN Web Docs - HTML, HTML5Book - HTML, Дока - HTML, HTML Academy - Разметка текста', category: 'html', url: 'pages/html.html#resources' },

    // CSS тема
    { id: 'css-basics', title: 'Основы CSS', content: 'CSS (Cascading Style Sheets) — это язык описания внешнего вида документа, написанного на языке разметки. CSS используется для описания внешнего вида элементов веб-страницы: цвета, шрифта, размера, расстояния между элементами и т.д.', category: 'css', url: 'pages/css.html#basics' },
    { id: 'css-selectors', title: 'Селекторы', content: 'Селекторы CSS определяют, к каким элементам HTML применяются стили. Существует множество типов селекторов. Примеры: селекторы по тегу (p), по классу (.class), по ID (#id), псевдоклассы (:hover) и др.', category: 'css', url: 'pages/css.html#selectors' },
    { id: 'css-properties', title: 'Свойства', content: 'CSS-свойства определяют, как именно будут выглядеть элементы. Существует огромное количество свойств. Примеры: color, background-color, font-size, margin, padding, border и многие другие.', category: 'css', url: 'pages/css.html#properties' },
    { id: 'css-flexbox', title: 'Flexbox', content: 'Flexbox — это одномерная система макета, которая позволяет легко распределять пространство между элементами в контейнере. Flexbox особенно полезен для создания адаптивных макетов, которые корректно работают на разных размерах экрана.', category: 'css', url: 'pages/css.html#flexbox' },
    { id: 'css-grid', title: 'Grid', content: 'CSS Grid — это двумерная система макета, которая позволяет создавать сложные макеты с помощью строк и столбцов. Grid идеально подходит для создания сложных макетов, где нужно контролировать как горизонтальное, так и вертикальное расположение элементов.', category: 'css', url: 'pages/css.html#grid' },
    { id: 'css-positioning', title: 'Позиционирование', content: 'Свойство position позволяет контролировать, как элементы располагаются на странице. Значения: static, relative, absolute, fixed, sticky.', category: 'css', url: 'pages/css.html#positioning' },
    { id: 'css-responsive', title: 'Адаптивность', content: 'Адаптивный дизайн позволяет веб-страницам корректно отображаться на устройствах с различными размерами экрана. Используются медиа-запросы, гибкие единицы измерения и адаптивные макеты.', category: 'css', url: 'pages/css.html#responsive' },
    { id: 'css-resources', title: 'Полезные ресурсы', content: 'MDN Web Docs - CSS, Дока - CSS, HTML5Book - CSS, Интерактивный Flexbox справочник, CSS-Tricks', category: 'css', url: 'pages/css.html#resources' },
    { id: 'css-heights-flex-grid', title: 'CSS — высоты, flex, grid и CSS-переменные', content: 'Работа с высотами в CSS, Flexbox, Grid и CSS-переменные - важные концепции для создания современных макетов.', category: 'css', url: 'fonts/doc_fonts/css-heights-flex-grid-vars.html' },
    { id: 'flex-cheatsheet', title: 'Интерактивная шпаргалка по CSS Flex', content: 'Шпаргалка по Flexbox CSS с интерактивными примерами для лучшего понимания.', category: 'css', url: 'fonts/doc_fonts/flex_cheatsheet.html' },
    { id: 'grid-flex-cheatsheet', title: 'Шпаргалка: Grid vs Flex', content: 'Сравнение CSS Grid и Flexbox, когда использовать каждый из них.', category: 'css', url: 'fonts/doc_fonts/grid-flex-cheatsheet.html' },
    { id: 'margin-auto-sticky-footer', title: 'margin: 0 auto; и sticky footer', content: 'Техники центрирования элементов и создания sticky footer с помощью CSS.', category: 'css', url: 'fonts/doc_fonts/margin-auto-sticky-footer.html' },
    { id: 'box-model', title: 'Модель CSS Box', content: 'Понимание модели CSS Box - основы веб-разработки.', category: 'css', url: 'fonts/doc_fonts/box-css.html' },

    // JavaScript тема
    { id: 'js-basics', title: 'Основы JavaScript', content: 'JavaScript — это язык программирования, который позволяет делать веб-сайты интерактивными. JavaScript работает в браузере и может изменять содержимое HTML-страницы, стили и реагировать на действия пользователя.', category: 'js', url: 'pages/js.html#basics' },
    { id: 'js-variables', title: 'Переменные', content: 'В JavaScript переменные объявляются с помощью ключевых слов var, let или const. let и const были добавлены в ES6 и обеспечивают лучшее управление областью видимости.', category: 'js', url: 'pages/js.html#variables' },
    { id: 'js-functions', title: 'Функции', content: 'Функции — это многократно используемые блоки кода, которые выполняют определенную задачу. Функции могут принимать параметры и возвращать значения. Существуют различные способы объявления функций.', category: 'js', url: 'pages/js.html#functions' },
    { id: 'js-objects', title: 'Объекты', content: 'Объекты в JavaScript — это коллекции пар ключ-значение. Они используются для хранения связанных данных и функций. Объекты являются основой объектно-ориентированного программирования в JavaScript.', category: 'js', url: 'pages/js.html#objects' },
    { id: 'js-arrays', title: 'Массивы', content: 'Массивы — это специальные объекты, предназначенные для хранения упорядоченных коллекций данных. Массивы имеют методы для добавления, удаления и изменения элементов.', category: 'js', url: 'pages/js.html#arrays' },
    { id: 'js-dom', title: 'DOM', content: 'DOM (Document Object Model) — это программный интерфейс для веб-документов. Он представляет страницу так, что программа может изменять структуру документа, стиль и содержимое. DOM соединяет веб-страницу с языками сценариев.', category: 'js', url: 'pages/js.html#dom' },
    { id: 'js-events', title: 'События', content: 'События — это сигналы от браузера о том, что что-то произошло. Например, клик мыши, загрузка страницы и т.д. JavaScript может реагировать на события с помощью обработчиков событий.', category: 'js', url: 'pages/js.html#events' },
    { id: 'js-async', title: 'Асинхронность', content: 'Асинхронное программирование позволяет выполнять операции без блокировки выполнения других операций. В JavaScript используются Promise, async/await и callback-функции для работы с асинхронным кодом.', category: 'js', url: 'pages/js.html#async' },
    { id: 'js-resources', title: 'Полезные ресурсы', content: 'Современный учебник JavaScript, MDN Web Docs - JavaScript, Дока - JavaScript, HTML Academy - Основы JS, Примеры проектов', category: 'js', url: 'pages/js.html#resources' },
    { id: 'data-types', title: 'Типы данных в JavaScript', content: 'В JavaScript существует несколько типов данных: примитивные и объектные. Понимание типов данных важно для правильной работы с переменными.', category: 'js', url: 'fonts/doc_fonts/dataTypes.html' },

    // Инструменты
    { id: 'tools-git', title: 'Git и GitHub', content: 'Git — это распределённая система управления версиями файлов. GitHub — это веб-платформа для хостинга проектов, использующих Git. Git позволяет отслеживать изменения в файлах, работать в команде и управлять версиями кода.', category: 'tools', url: 'pages/tools.html#git' },
    { id: 'tools-vscode', title: 'VS Code', content: 'Visual Studio Code — это мощный редактор кода с поддержкой множества языков программирования. VS Code имеет встроенную поддержку Git, IntelliSense, отладчик и широкие возможности для настройки.', category: 'tools', url: 'pages/tools.html#vscode' },
    { id: 'tools-terminal', title: 'Терминал', content: 'Терминал — это текстовый интерфейс для взаимодействия с операционной системой. Знание командной строки важно для эффективной работы с Git, установки зависимостей и автоматизации задач.', category: 'tools', url: 'pages/tools.html#terminal' },
    { id: 'tools-debug', title: 'Отладка', content: 'Отладка — это процесс поиска и устранения ошибок в коде. Используются инструменты отладки, точки останова, консоль для логирования и анализ проблем.', category: 'tools', url: 'pages/tools.html#debug' },
    { id: 'tools-devtools', title: 'DevTools', content: 'Инструменты разработчика (DevTools) — это набор инструментов для отладки и анализа веб-страниц. DevTools позволяют анализировать DOM, стили, производительность, сеть и многое другое.', category: 'tools', url: 'pages/tools.html#devtools' },
    { id: 'tools-build', title: 'Сборщики', content: 'Сборщики модулей автоматизируют задачи разработки: объединение файлов, минификация, транспиляция и т.д. Популярные сборщики: Webpack, Vite, Parcel, Rollup.', category: 'tools', url: 'pages/tools.html#build' },
    { id: 'tools-testing', title: 'Тестирование', content: 'Тестирование — это процесс проверки корректности работы кода. Существуют различные виды тестирования: модульное, интеграционное, сквозное и др.', category: 'tools', url: 'pages/tools.html#testing' },
    { id: 'tools-resources', title: 'Полезные ресурсы', content: 'Pro Git (русская версия), Документация VS Code, 15 команд Git, DevTools - подробное руководство, Chrome DevTools Documentation', category: 'tools', url: 'pages/tools.html#resources' },
    { id: 'custom-fonts', title: 'Кастомные шрифты', content: 'Подключение и использование кастомных шрифтов на веб-сайте.', category: 'tools', url: 'fonts/doc_fonts/notes_font_AI.html' },
    { id: 'icon-libraries', title: 'Бесплатные библиотеки иконок', content: 'Обзор бесплатных библиотек иконок с открытой лицензией.', category: 'tools', url: 'fonts/doc_fonts/library_icons_AI.html' },
    { id: 'checklist', title: 'Чек-лист', content: 'Полезный чек-лист для проверки веб-страниц.', category: 'tools', url: 'fonts/doc_fonts/checklist.html' },
    { id: 'paths-links', title: 'Пути и ссылки', content: 'Различные типы путей и ссылок в веб-разработке.', category: 'tools', url: 'fonts/doc_fonts/paths_links.html' },

    // Проекты
    { id: 'projects-practice', title: 'Практика', content: 'Практика — важнейшая часть обучения. Реальные проекты позволяют применить теоретические знания на практике. Практика помогает закрепить навыки, выявить пробелы в знаниях и развить уверенность в своих силах.', category: 'projects', url: 'pages/projects.html#practice' },
    { id: 'projects-mentors', title: 'Frontendmentor', content: 'Frontendmentor — это платформа с реальными задачами для практики верстки и разработки. Задачи различаются по уровню сложности и включают в себя макеты, требования и проверку решений.', category: 'projects', url: 'pages/projects.html#mentors' },
    { id: 'projects-examples', title: 'Примеры проектов', content: 'Примеры проектов помогают понять, как различные технологии применяются в реальных условиях. Изучение чужого кода и адаптация под свои нужды — отличный способ учиться.', category: 'projects', url: 'pages/projects.html#examples' },
    { id: 'projects-portfolio', title: 'Портфолио', content: 'Портфолио — это демонстрация ваших навыков и опыта потенциальным работодателям. Хорошее портфолио должно содержать качественные проекты, демонстрирующие разнообразные навыки.', category: 'projects', url: 'pages/projects.html#portfolio' },
    { id: 'projects-tasks', title: 'Задачи', content: 'Решение задач помогает развить логическое мышление и навыки программирования. Платформы с задачами: Codewars, LeetCode, FreeCodeCamp и другие.', category: 'projects', url: 'pages/projects.html#tasks' },
    { id: 'projects-collaboration', title: 'Совместная работа', content: 'Совместная работа над проектами развивает навыки командной разработки и взаимодействия. Использование Git, GitHub Flow, code review и другие практики важны для успешной командной работы.', category: 'projects', url: 'pages/projects.html#collaboration' },
    { id: 'projects-deployment', title: 'Развертывание', content: 'Развертывание — это процесс публикации проекта в интернете для доступа к нему. Популярные платформы для развертывания: Netlify, Vercel, GitHub Pages, Heroku.', category: 'projects', url: 'pages/projects.html#deployment' },
    { id: 'projects-resources', title: 'Полезные ресурсы', content: 'Frontendmentor, Проект Седона, Codewars, GitHub - Frontend Projects, Frontend Roadmap', category: 'projects', url: 'pages/projects.html#resources' },
    
    // Учебные материалы
    { id: 'html-materials', title: 'HTML материалы', content: 'Учебные материалы по HTML: основы, семантика, формы, таблицы, ссылки', category: 'materials', url: 'pages/materials.html' },
    { id: 'css-materials', title: 'CSS материалы', content: 'Учебные материалы по CSS: стили, флексбокс, гриды, адаптивность', category: 'materials', url: 'pages/materials.html' },
    { id: 'js-materials', title: 'JavaScript материалы', content: 'Учебные материалы по JavaScript: основы, функции, объекты, DOM', category: 'materials', url: 'pages/materials.html' },
    { id: 'tools-materials', title: 'Материалы по инструментам', content: 'Учебные материалы по инструментам: Git, VS Code, терминал', category: 'materials', url: 'pages/materials.html' },
    { id: 'project-materials', title: 'Материалы по проектам', content: 'Учебные материалы по проектам: практика, задачи, портфолио', category: 'materials', url: 'pages/materials.html' },

    // Тесты
    { id: 'tests-html', title: 'HTML тесты', content: 'Тест по HTML', category: 'tests', url: 'pages/tests.html#html-tests' },
    { id: 'tests-css', title: 'CSS тесты', content: 'Тест по CSS', category: 'tests', url: 'pages/tests.html#css-tests' }
];

// Функция поиска
function setupSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length === 0) {
            // Если поле поиска пустое, показываем все карточки
            showAllCards();
            return;
        }

        // Поиск по ключевым словам
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );

        // Показываем результаты
        showSearchResults(results);
    });
}

// Показать все карточки
function showAllCards() {
    // На главной странице просто покажем все карточки
    const cards = document.querySelectorAll('.simple-card');
    cards.forEach(card => {
        card.style.display = 'block';
    });
}

// Показать результаты поиска
function showSearchResults(results) {
    // Сначала скрываем все карточки
    const cards = document.querySelectorAll('.simple-card');
    cards.forEach(card => {
        card.style.display = 'none';
    });

    // Если есть результаты, показываем соответствующие карточки
    if (results.length > 0) {
        // Получаем уникальные категории из результатов
        const categories = [...new Set(results.map(result => result.category))];
        
        // Показываем карточки для найденных категорий
        categories.forEach(category => {
            const card = document.querySelector(`.simple-card[href="pages/${category}.html"]`);
            if (card) {
                card.style.display = 'block';
            }
        });
    }
}

// Инициализация поиска при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
});