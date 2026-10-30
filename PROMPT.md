# PROMPT.md — промпт для реализации текущей задачи

> Рабочий файл тимлида (qwen3.8:27b-mlx). В нём — промпт для **текущей** задачи.
> Алгоритм: запускаете блок для реализатора в Pi/OpenCode → когда задача сделана,
> приходите к тимлиду: **«задача N.M выполнена»** → он делает приёмку (чекбокс +
> `PROGRESS.md`) и **переписывает этот файл** под следующую задачу (commit в
> feature-ветку). Ветка переписывания: `feat/rewrite-angular-signals`.
>
> **Текущая задача: 0.1 — Зафиксировать целевой стек и поднять PWA-оболочку.**
> Статус в `TASKS.md`: `[ ]` (не начата).

---

## 1) Промпт для реализатора — Recursive Flint (Pi или OpenCode)

> Скопируйте весь блок ниже и вставьте в сессию реализации.

```text
Ты — реализатор (Recursive Flint) в проекте BeClocked (переписывание на Angular 19+ / Taiga UI v5),
ветка git: `feat/rewrite-angular-signals`.

## Задача 0.1 — «Зафиксировать целевой стек и поднять PWA-оболочку»

### Что реализовывать (бюджет чита — НЕ читай остальное)
- `openspec/config.yaml`, `openspec/README.md`, `openspec/specs/offline-pwa/spec.md`
  (только раздел Purpose), `package.json`, `angular.json`, `src/index.html`,
  `src/app/app.component.ts` — только как контекст «что заменяем».
- НЕ читай весь `src/app/**` — legacy нужен только как эталон логики в
  последующих задачах, здесь только имена/иконки/тема из текущей оболочки.

### Стек (решён, зафиксировано в DECISIONS.md)
- Angular 19+, standalone-компоненты (без NgModule), signals (`signal` / `computed` /
  `linkedSignal` / `resource`), DI через `inject()`, `provideExperimentalZonelessChangeDetection`
  по умолчанию в providers, PWA через `ng g @angular/pwa` +
  `@angular/service-worker` (НЕ Vite/CRA), UI-кит — Taiga UI v5.
- Taiga UI API бери по актуальному: сначала по MCP `@taiga-ui/mcp`
  (`npx @taiga-ui/mcp init --client opencode --version latest` при OpenCode, либо
  `llms.txt`: https://taiga-ui.dev/llms.txt), потом только по памяти, если нет доступа.
- Для UI-задач используй только компоненты Taiga UI v5 (например `TuiPage`,
  `TuiLayout`, `TuiButton`), не оставляй legacy-импорты Taiga 3.x.

### Что сделать
1. Инициализируй/обнови каркас: standalone `AppComponent`, `main.ts` с
   `bootstrapApplication`, `app.config.ts` / providers с zoneless change detection,
   `index.html` с `<title>` и `<meta name="theme-color">`, иконки приложения.
2. Введи имя приложения `BeClocked` и тему оформления (светлая/тёмная на выбор,
   через CSS custom properties Taiga UI).
3. Подключи PWA: `ng g @angular/pwa` (или ручной `ngsw-config.json` +
   `manifest.webmanifest` + иконки 72/96/128/152/192/384/512 px + apple-touch-icon),
   service worker зарегистрирован.
4. Зафиксируй финальный выбор стека в `DECISIONS.md` (заполни таблицу «Стек»).
5. Проверь критерий «готово»:
   - `ng build` (production) успешен;
   - пустой UI показывает имя `BeClocked` и один Taiga-компонент;
   - `angular.json` содержит service-worker конфиг;
   - есть `manifest.webmanifest`, иконки, SW зарегистрирован.
6. НЕ реализуй ничего, кроме оболочки: не добавляй модели участников, не тяни логику
   гонки — только каркас.

### Правила
- 1 commit = 1 задача, ветка `feat/rewrite-angular-signals`, conventional-сообщение:
  `feat(scaffold): init Angular 19 PWA shell (Angular 19 + Taiga UI v5 + zoneless)`
- Не читай за рамками бюджета; не переноси смежную логику.
- Вставь под критерий «готово» в `TASKS.md` заготовку блока:
  `> **Выполнено:**` (поля «Ревьюер» и «Вердикт» НЕ заполняй — их заполнит тимлид).
- Если что-то неясно — спрашивай у тимлида (qwen3.8:27b-mlx), не догадывайся.
```

---

## 2) Промпт для ревьюера — nemotron-3.5-lightning:30b-mlx (опционально, Pi или OpenCode)

> Запустите после того, как реализатор отдал commit для задачи 0.1.
> В `COMMIT_SHA` подставьте sha commit-а из `git log --oneline -1`.

```text
Ты — ревьюер (nemotron-3.5-lightning:30b-mlx) проекта BeClocked.
Проверь commit {{COMMIT_SHA}} (ветка `feat/rewrite-angular-signals`), задача 0.1
«Зафиксировать целевой стек и поднять PWA-оболочку».

Сравни diff с 5 критериями из `DECISIONS.md` → «Критерии ревью»:
1. Все пункты чек-листа приёмки задачи 0.1 выполнены
   (`ng build` ok, UI показывает `BeClocked`, `angular.json` с service-worker,
   `manifest.webmanifest` + иконки + SW).
2. Изменения строго в рамках задачи 0.1: только каркас + PWA, без логики гонки/участников.
3. Нет RxJS-паттернов (`.subscribe`, `BehaviorSubject`, `combineLatest`, `asyncPipe`,
   `NgModule`): реализация на signals/standalone.
4. Taiga UI: только актуальные компоненты v5 (нет импортов Taiga 3.x, например
   `@taiga-ui/legacy`, `@taiga-ui/style/index.css` — только `@taiga-ui/style` и v5-
   компоненты).
5. 1 commit = 1 задача, conventional-сообщение, ветка `feat/rewrite-angular-signals`.

Выдай вердикт: `Approved` или `changes requested` (со списком конкретных замечаний
в формате `файл:строка — что заменить`).
```

---

## 3) После выполнения задачи 0.1

Когда реализатор (и, при необходимости, ревьюер) закончат — вернитесь к тимлиду
(qwen3.8:27b-mlx) и напишите: **«задача 0.1 выполнена»** (или с приложением
`changes requested` / commit sha). Тимлид:

1. Сверит commit с критериями,
2. При подтверждении переведёт `[ ] 0.1` → `[x]` в `TASKS.md` и заполнит блок
   `> **Выполнено:**`,
3. допишет строку в `PROGRESS.md`,
4. переписывает **этот файл `PROMPT.md`** под задачу **0.2** и закоммитит
   (`chore: next-task-prompts: task 0.2 ready`).

> Комит на `feat/rewrite-angular-signals`: после подготовки —
> `chore(task): prompts ready for task 0.1 — {implementer, reviewer}`.
