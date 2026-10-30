# DECISIONS.md — ключевые решения проекта

Файл фиксирует архитектурные и процессные решения, которые агент обновляет по мере
выполнения задач. Читаем до начала реализации, дописываем при каждом решении.

## Стек (решение задачи 0.1)

| Параметр           | Выбор                                                        |
|--------------------|-------------------------------------------------------------|
| Фреймворк          | **Angular 19+**, standalone-компоненты                      |
| UI-библиотека      | **Taiga UI v5** (совместимость: Taiga 5.x → Angular `^19 … latest`) |
| Состояние          | **Signals**: `signal`, `computed`, `linkedSignal`, `resource` |
| Зонирование        | **Zoneless** по умолчанию через `provideExperimentalZonelessChangeDetection()` |
| DI                 | `inject()` вместо конструкторного DI                         |
| Пакеты             | `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `@angular/service-worker` |
| PWA                | `ng g @angular/pwa` + `@angular/service-worker` (не Webpack/Vite PWA-плагин) |
| Тесты              | Критерий «готово» = unit (`ng test`) + e2e (`e2e`) |
| Язык               | Русский (spec), технические ключевые слова SHALL/MUST на английском |
| AI-интеграция      | **Taiga UI** через `@taiga-ui/mcp` MCP + `llms.txt` (см. 0.3) |

## Подход к legacy-коду (`src/app/**`)

- `src/app/**` — **эталон логики**, но **не кода для копирования**.
- Алгоритмы/инварианты/порядок статусов/формат времени из legacy читаются и
  воспроизводятся на signal-based API Angular 19+.
- Убираются: `BehaviorSubject`, `Observable`-подписки, `combineLatest`,
  `mergeMap`, `takeUntil`, `ReplaySubject`, `asyncPipe`, `NgModule`-структура.
- Оставляем как есть: `localStorage` persistence (фаза 1.2), формат времени
  `ЧЧ:ММ:СС.ммм`, расчёт кругов/DNS/DNF, порядок переходов статуса гонки.
- **Каждая задача, где читается legacy-файл**, указывает в «бюджете чита» два
  источника: (a) файл спека/`Requirement` — источник истины; (b) legacy-файл —
  только как эталон логики для перевода в signals.

## AI-интеграция (Taiga UI, решение задачи 0.3)

  - Taiga UI предоставляет агентам **актуальный API** через:
  - `llms.txt` / `llms-full.txt` на `taiga-ui.dev` (версионированный контекст).
  - MCP-сервер `@taiga-ui/mcp` с инструментами `get_overview`,
    `get_list_components`, `get_component_example`, `get_migration_guide`.
- Для OpenCode: `npx @taiga-ui/mcp init --client opencode --version latest`
  записывает MCP-конфигурацию в `opencode.json`.
- **Для любой UI-задачи** агент должен запросить актуальный API Taiga UI через
  упомянутые инструменты/файлы, **а не полагаться на память LLM**.

## Открытые вопросы

- Имя ветки: `feat/rewrite-angular-signals` — подтверждено/перезаписано (задача 0.1).
- Стек (Angular 19+, standalone, signals, zoneless, Taiga UI v5, PWA через `@angular/service-worker`) — **подтверждён** и зафиксирован в задаче 0.1.
- AI-интеграция Taiga UI (`@taiga-ui/mcp` + `llms.txt`) — доступна ли в runtimes агентов (Pi/OpenCode). Если нет в OpenCode — 0.3 деградирует до «агент читает `llms.txt` вручную».
- Каждая роль запускаться в **Pi** (qwen 3.8:27b-mlx) или **OpenCode** (Recursive Flint, nemotron), или по ситуации. Формирование `opencode.json` через `npx @taiga-ui/mcp init --client opencode`.

## Роли и конвейер (3 агента)

Все роли могут запускаться как в **Pi**, так и в **OpenCode**. Передача хода между
ролями — за **тимлидом** (человек-координатор запускает следующую роль и обновляет
doc-файлы). Конвейер на каждой задаче:

```
  [Тимлид]              [Реализатор]          [Ревьюер]
   (планирование)   →      (код)     →       (ревью кода)
   (план)        →      (код)     →       (ревью кода)
   декомпозиция/       →  реализует      →    проверяет diff
   контекст бюджета      по заданию         по чек-листу
   (я, qwen3.8)          (Flint)            (nemotron)
      ↕                    ↕                    ↕
  задаёт «что/почему»   пишет код в ветку    выдаёт вердикт:
  и бюджет чита         и 1 commit           approve / changes requested
      ↑                                         │
      └─────── (при «changes requested» ←───────┘  → ре-код)
```

### Роли и модели

| Роль | Задача | Модель (пример) | Где запускается |
|---|---|---|---|
| **Тимлид / оркестратор** | принимает/передаёт задачу, проверяет готовность, обновляет `TASKS.md`/`PROGRESS.md`/`DECISIONS.md`, принимает вердикт | **qwen3.8:27b-mlx** | Pi или OpenCode |
| **Реализатор (код)** | реализует 1 задачу из `TASKS.md`, 1 commit в feature-ветке | **Recursive Flint** | Pi или OpenCode |
| **Ревьюер** | проверяет diff/commit на соответствие чек-листу, спеку, signals/standalone и Taiga UI (через `@taiga-ui/mcp` если доступно), выдаёт **вердикт** | **nemotron-3.5-lightning:30b-mlx** | Pi или OpenCode |

### Правило передачи

- **1 задача = 1 commit = 1 вердикт ревьюера.** Тимлид переводит `<задачу>` → `~` при старте реализатора, и в `x` только после `Approved` вердикта и записи в `PROGRESS.md`.
- При вердикте `changes requested` — реализатор доделывает в **том же** commit (или fix-up), ревьюер снова смотрит до `Approved`.
- **Критерии ревью** (что проверяет ревьюер):
  1. Все пункты чек-листа приёмки задачи выполнены.
  2. Изменения строго укладываются в один `Requirement` из `openspec/specs/**` (нет переноса смежной логики).
  3. RxJS-паттерны (`.subscribe`, `BehaviorSubject`, `combineLatest`, `asyncPipe`, `NgModule`) не появились — реализация на signals/standalone.
  4. Taiga UI-компоненты взяты по актуальному API (`@taiga-ui/mcp`/`llms.txt`), нет legacy-импортов (Taiga 3.x).
  5. 1 commit = 1 задача, conventional-сообщение, ветка `feat/rewrite-angular-signals`.

## Git-процесс

| Параметр            | Решение |
|---|---|
| **Базовая ветка** | `main` — legacy `src/app/**` + `openspec/**` + 4 process-файла (`TASKS.md`, `PROGRESS.md`, `TRACKING.md`, `DECISIONS.md`); используется как reference, **не изменяется** в процессе переписывания. |
| **Ветка переписывания** | **`feat/rewrite-angular-signals`** (или имя из DECISIONS, задача 0.1). Создаётся с `main`; **1 commit на задачу** в этой ветке. |
| **Первый шаг** | Зафиксировать 4 process-файла в `main` (commit `docs(tracking): add task/process files`), **затем** перейти на feature-ветку. |
| **Мерж-стратегия** | PR по фазе (или по завершении всего переписывания) на `main`. `main` после мержа остаётся «legacy + spec». |
| **Cross-branch grep** | `git log --all --oneline --grep='task'` — обзор истории переписывания на всех ветках. |

> Ветка переписывания создаётся **после** коммита 4 process-файлов в `main`.
> Legacy `src/app/**` остаётся в `main` как эталон логики для задач 0.1–8.4.
