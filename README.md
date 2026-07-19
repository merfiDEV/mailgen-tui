<div align="center">

# 📧 LuaGen TUI

**Консольный генератор одноразовых email-аккаунтов с интерфейсом в терминале**

[![Release](https://img.shields.io/github/v/release/merfiDEV/luagen?style=flat-square&color=cyan)](https://github.com/merfiDEV/luagen/releases)
[![License](https://img.shields.io/github/license/merfiDEV/luagen?style=flat-square&color=green)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/merfiDEV/luagen/release.yml?style=flat-square&label=build)](https://github.com/merfiDEV/luagen/actions)

```
┌──────────────────────────────────────────────┐
│  Генератор Email Аккаунтов                   │
│                                              │
│  Префикс: mybot    Кол-во: 10    [mailtm]   │
│                                              │
│  ✅ 10/10 — 100%                             │
│  ████████████████████████████████████████    │
└──────────────────────────────────────────────┘
```

</div>

---

## ✨ Возможности

- 🔄 **Генерация email-аккаунтов** через встроенные провайдеры (mail.tm, Guerrilla Mail)
- 📦 **Массовое создание** с настраиваемым префиксом, количеством и провайдером
- 🌐 **Автоматическая регистрация** на сайтах с подтверждением email
- 💾 **Хранение и экспорт** аккаунтов в JSON
- 📋 **Встроенный лог** всех операций в реальном времени
- 🧵 **Многопоточность** с настраиваемым количеством потоков
- 🔀 **Fallback между провайдерами** — автоматический переключение при ошибках
- 🔍 **Поиск и фильтрация** аккаунтов по email

---

## 📦 Провайдеры

| Провайдер | Сервис | Описание | Статус |
|-----------|--------|----------|--------|
| `mailtm` | [Mail.tm](https://mail.tm) | Бесплатные почтовые ящики с API | ✅ |
| `tempmail` | [Guerrilla Mail](https://www.guerrillamail.com) | Одноразовая почта | ✅ |

---

## 🚀 Быстрый старт

### Предварительные требования

- [Bun](https://bun.sh) >= 1.0 (для сборки) или [Node.js](https://nodejs.org) >= 18
- Windows / macOS / Linux

### Скачать готовый exe

Зайди в [Releases](https://github.com/merfiDEV/luagen/releases) и скачай `luagen.exe` для Windows.

### Собрать самому

```bash
# Клонируем репозиторий
git clone https://github.com/merfiDEV/luagen.git
cd luagen

# Устанавливаем зависимости
bun install

# Запуск в dev-режиме (с горячей перезагрузкой)
bun run dev

# Сборка TypeScript
bun run build

# Сборка standalone exe (требует Bun)
bun run build:exe
```

### Запуск

```bash
# Через Bun
bun run dev

# Через Node (после сборки)
node dist/src/index.js

# Или запусти собранный exe
./dist/luagen.exe
```

---

## 🖥️ Интерфейс

### Вкладки

| # | Вкладка | Описание |
|---|---------|----------|
| 1 | **Генератор** | Создание email-аккаунтов с настройкой префикса, количества и провайдера |
| 2 | **Аккаунты** | Просмотр, поиск, удаление и экспорт аккаунтов |
| 3 | **Регистрация** | Автоматическая регистрация на сайтах через URL |
| 4 | **Настройки** | Конфигурация браузера, потоков, прокси и путей |

### Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `1` — `4` | Переключение вкладок |
| `Enter` | Выбор / подтверждение |
| `Space` | Включение / отключение чекбокса |
| `Tab` | Переход к следующему элементу |
| `↑` / `↓` | Навигация по списку |
| `q` / `Esc` | Выход из приложения |

---

## ⚙️ Конфигурация

Приложение создаёт файл `config.json` при первом запуске:

```json
{
  "browserType": "chromium",
  "browserPath": "",
  "maxThreads": 3,
  "warnOnGenerate": 50,
  "dbPath": "data/accounts.json",
  "proxyEnabled": false,
  "checkIntervalHours": 24,
  "emailProviderPriority": ["mailtm", "tempmail"]
}
```

| Параметр | Тип | Описание |
|----------|-----|----------|
| `browserType` | `string` | Тип браузера: `chromium`, `firefox`, `webkit` |
| `browserPath` | `string` | Путь к браузеру (пусто = авто) |
| `maxThreads` | `number` | Максимальное количество потоков |
| `warnOnGenerate` | `number` | Предупреждать при количестве > N |
| `dbPath` | `string` | Путь к файлу базы данных аккаунтов |
| `proxyEnabled` | `boolean` | Включить подключение через прокси |
| `checkIntervalHours` | `number` | Интервал проверки email (в часах) |
| `emailProviderPriority` | `string[]` | Приоритет провайдеров (fallback) |

---

## 🏗️ Структура проекта

```
luagen/
├── core/                  # Бизнес-логика
│   ├── models/            # Модели данных (Account, Registration, Database)
│   ├── providers/         # Провайдеры email (mailtm, tempmail)
│   ├── utils/             # Утилиты (логгер, валидаторы)
│   ├── browser.ts         # Управление браузером
│   ├── register.ts        # Логика регистрации на сайтах
│   └── scheduler.ts       # Планировщик задач
├── tui/                   # Терминальный интерфейс
│   ├── screens/           # Экраны (Генератор, Аккаунты, Регистрация, Настройки)
│   ├── components/        # Компоненты (таблицы, прогресс-бар, вкладки)
│   └── App.tsx            # Корневой компонент
├── src/                   # Точка входа
│   └── index.tsx          # Главный файл
├── data/                  # Данные
│   └── accounts.json      # Хранилище аккаунтов
└── .github/workflows/     # CI/CD
    └── release.yml        # Автосборка exe при теге
```

---

## 🛠️ Стек технологий

| Технология | Назначение |
|------------|------------|
| [React](https://react.dev) | UI-компоненты |
| [Glyph](https://www.npmjs.com/package/@semos-labs/glyph) | React для терминала (Ink-based) |
| [TypeScript](https://www.typescriptlang.org) | Строгая типизация |
| [Bun](https://bun.sh) | Рантайм, сборка и bundling в exe |
| [tsx](https://www.npmjs.com/package/tsx) | Dev-режим с hot-reload |

---

## 📄 Лицензия

[MIT](LICENSE) — используй свободно.

---

<div align="center">

**⭐ Если проект полезен — поставь звёздку! ⭐**

</div>
