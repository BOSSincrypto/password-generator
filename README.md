![Password Generator](https://capsule-render.vercel.app/api?type=waving&color=0:10b981,1:06b6d4&height=250&section=header&text=Password%20Generator&fontSize=60&fontColor=ffffff&desc=Cryptographically%20secure%20passwords%20%26%20passphrases&descSize=20&descAlignY=65)

<div align="center">

[![Stars](https://img.shields.io/github/stars/BOSSincrypto/password-generator?style=for-the-badge&color=10b981)](https://github.com/BOSSincrypto/password-generator/stargazers)
[![Forks](https://img.shields.io/github/forks/BOSSincrypto/password-generator?style=for-the-badge&color=06b6d4)](https://github.com/BOSSincrypto/password-generator/network/members)
[![License](https://img.shields.io/github/license/BOSSincrypto/password-generator?style=for-the-badge&color=f59e0b)](./LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/BOSSincrypto/password-generator?style=for-the-badge&color=8b5cf6)](https://github.com/BOSSincrypto/password-generator/commits/main)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-10b981?style=for-the-badge&logo=githubpages)](https://bossincrypto.github.io/password-generator/)
[![EN/RU](https://img.shields.io/badge/i18n-EN%20%7C%20RU-06b6d4?style=for-the-badge)](https://bossincrypto.github.io/password-generator/)

</div>

<p align="center">
  <img src="https://socialify.git.ci/BOSSincrypto/password-generator/image?description=1&font=Source%20Code%20Pro&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Dark" alt="Password Generator social preview" width="640" />
</p>

**[Live Demo](https://bossincrypto.github.io/password-generator/)** • **[Report Bug](https://github.com/BOSSincrypto/password-generator/issues)** • **[Request Feature](https://github.com/BOSSincrypto/password-generator/issues)**

---

## 📋 Table of Contents / Содержание

- [Features / Особенности](#features--особенности)
- [Quick Start / Быстрый старт](#quick-start--быстрый-старт)
- [Tech Stack / Технологии](#tech-stack--технологии)
- [Project Structure / Структура проекта](#project-structure--структура-проекта)
- [Configuration / Конфигурация](#configuration--конфигурация)
- [Contributing / Участие](#contributing--участие)
- [License / Лицензия](#license--лицензия)

---

## Features / Особенности

**EN:**
- 🔐 **Cryptographically secure** random password generation using `window.crypto.getRandomValues()`.
- 📝 **Diceware passphrases** based on the EFF wordlist (7776 words).
- 🎚️ Fully configurable length, character sets, word count, and separators.
- 🌐 **Bilingual UI**: English (default) and Russian, with persistent language selection.
- 📋 One-click copy for single passwords or the entire generated list.
- 🛡️ Real-time strength estimation via [`zxcvbn-ts`](https://github.com/zxcvbn-ts/zxcvbn).
- 🚫 **Zero telemetry**: everything runs in the browser, nothing is sent to a server.
- ⚡ Built with Vite + React + TypeScript + Tailwind CSS.
- 🔍 SEO-ready: Open Graph, Twitter Cards, JSON-LD, sitemap, and `robots.txt`.

**RU:**
- 🔐 **Криптографически стойкая** генерация случайных паролей на основе `window.crypto.getRandomValues()`.
- 📝 **Парольные фразы Diceware** со списком слов EFF (7776 слов).
- 🎚️ Полная настройка длины, наборов символов, количества слов и разделителей.
- 🌐 **Двуязычный интерфейс**: английский (по умолчанию) и русский с сохранением выбора.
- 📋 Копирование одного пароля или всего списка в один клик.
- 🛡️ Оценка сложности пароля в реальном времени через [`zxcvbn-ts`](https://github.com/zxcvbn-ts/zxcvbn).
- 🚫 **Нулевая телеметрия**: всё работает в браузере, ничего не отправляется на сервер.
- ⚡ Собрано на Vite + React + TypeScript + Tailwind CSS.
- 🔍 SEO-готовность: Open Graph, Twitter Cards, JSON-LD, sitemap и `robots.txt`.

---

## Quick Start / Быстрый старт

```bash
# Clone / Клонировать
gh repo clone BOSSincrypto/password-generator

# Install dependencies / Установить зависимости
npm install

# Run locally / Запустить локально
npm run dev

# Build for production / Собрать для production
npm run build

# Preview production build / Просмотреть production-сборку
npm run preview
```

The production build is emitted to the `dist/` directory.  
Production-сборка помещается в директорию `dist/`.

---

## Tech Stack / Технологии

| Category / Категория | Tools / Инструменты |
|---|---|
| Framework / Фреймворк | [React](https://react.dev/) 18 |
| Language / Язык | [TypeScript](https://www.typescriptlang.org/) |
| Build tool / Сборщик | [Vite](https://vitejs.dev/) |
| Styling / Стили | [Tailwind CSS](https://tailwindcss.com/) |
| UI components / Компоненты | [shadcn/ui](https://ui.shadcn.com/) + Radix UI primitives |
| Icons / Иконки | [Lucide React](https://lucide.dev/) |
| Strength meter / Оценка сложности | [zxcvbn-ts](https://github.com/zxcvbn-ts/zxcvbn) |
| i18n / Интернационализация | Custom React Context (no extra deps) |

---

## Project Structure / Структура проекта

```text
password-generator/
├── .github/workflows/static.yml   # GitHub Pages deployment
├── public/
│   └── favicon.svg
├── src/
│   ├── components/ui/             # shadcn/ui components
│   ├── i18n/
│   │   ├── translations.ts        # EN/RU dictionaries
│   │   ├── LanguageContext.tsx    # Language provider
│   │   └── useLanguage.ts         # Hook for translations
│   ├── App.tsx                    # Main application
│   ├── main.tsx                   # React entry point
│   ├── eff-wordlist.txt           # EFF large wordlist
│   └── index.css                  # Tailwind entry + custom styles
├── index.html                     # SEO-optimized HTML shell
├── robots.txt                     # Search crawler directives
├── sitemap.xml                    # Sitemap for search engines
├── LICENSE                        # MIT License
├── README.md                      # This file
├── package.json
├── tailwind.config.js
├── tsconfig*.json
└── vite.config.ts
```

---

## Configuration / Конфигурация

**EN:**
- `vite.config.ts` — set the base path for GitHub Pages (`/password-generator/`).
- `src/i18n/translations.ts` — add new languages or edit existing UI strings.
- Language preference is stored in `localStorage` under the key `password-generator-lang`.
- GitHub Pages deployment is configured in `.github/workflows/static.yml`.

**RU:**
- `vite.config.ts` — базовый путь для GitHub Pages (`/password-generator/`).
- `src/i18n/translations.ts` — добавляйте новые языки или редактируйте существующие строки интерфейса.
- Выбранный язык сохраняется в `localStorage` по ключу `password-generator-lang`.
- Деплой на GitHub Pages настроен в `.github/workflows/static.yml`.

---

## Contributing / Участие

**EN:**
Contributions are welcome! Please open an issue or pull request in the [repository](https://github.com/BOSSincrypto/password-generator).

**RU:**
Приветствуется любой вклад! Пожалуйста, создавайте issue или pull request в [репозитории](https://github.com/BOSSincrypto/password-generator).

---

## License / Лицензия

This project is licensed under the [MIT License](./LICENSE).  
Этот проект распространяется под [лицензией MIT](./LICENSE).

---

<div align="center">
  <sub>Crafted with 💚 by <a href="https://github.com/BOSSincrypto">BOSSincrypto</a></sub>
</div>
