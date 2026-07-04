# Project Instructions

## Coding Style

- Always use the simplest possible implementation. If something can be done in fewer lines, do it that way.
- No unnecessary abstractions, wrappers, or helper functions unless reuse is obvious and immediate.
- Plain React functional components only — no HOCs, no render props, no complex patterns.
- No third-party libraries unless the task genuinely requires it and there is no simple native alternative.

## File & Folder Structure

- Routes are defined in `src/common/Routes.js`.
- Pages go in `src/pages/<PageName>/`.
- Learning content goes in `src/learning/<subject>/<topic>/`.
- Shared/reusable components go in `src/common/<package>/` (e.g. `src/common/mathbox/`).
- Every new learning file in `src/learning/machine-learning/` must also: (1) have a `<Route>` added in `src/common/Routes.js`, and (2) have a `<Link>` added in the correct section of `src/pages/Home/Home.js`.

## File Naming

- React component files: `PascalCase.js` (e.g. `Home.js`, `CartesianCanvas.js`, `Routes.js`).
- Non-component JS files: `camelCase.js` (e.g. `index.js`, `setupTests.js`).
- CSS files: match the name of the component they style (e.g. `Home.css` for `Home.js`).

## CSS

- Plain CSS files per component. No CSS-in-JS, no Tailwind, no styled-components.
- Keep styles minimal — only write what is actually needed for the UI to look correct.

## Comments

- No comments by default.
- Add a single-line comment only when the reason behind the code is non-obvious (hidden constraint, workaround, subtle invariant).
- Always add a comment describing the props shape on components that accept non-trivial props (e.g. `// vectors: [{ x, y, color }]`).
- Never describe what the code does — only why, when it would surprise a reader.

## General

- No error boundaries, loading states, or edge-case handling unless explicitly asked.
- No TypeScript — plain JavaScript only.

## Verification

- Don't install or launch a browser (Playwright, Puppeteer, chromium-cli, etc.) to visually verify UI changes. The user runs the dev server themselves and checks the UI visually.
- It's fine to confirm the dev server compiles cleanly (no build errors) as a sanity check, but stop there for routine UI work.
- Reserve heavier verification (browser automation, extensive scripted checks, multi-step debugging) for genuinely complex problems you're stuck on, not everyday component/style changes.

## Content Writing

- Never use em dashes (—) in UI-facing text. Use a colon, comma, or period instead.
- Write like a person explaining to a friend, not a language model writing a report. Casual is fine. Funny is fine. Short is better. Avoid stiff, over-formal phrasing — if it sounds like something a textbook would say in a boring lecture, rewrite it.

## Math Notation

- Use step-indexed notation for iterative update formulas: `x_i`, `x_{i+1}`, `v_i`, etc. Never use `x_old` / `x_new` or `x_prev`.

## Teaching Philosophy

- You are an expert teacher. Your job is to make hard things feel obvious, not to sound impressive.
- Always prefer a visual or interactive explanation over a written one. If something can be shown with a canvas, show it. Text is a fallback, not the default.
- Every concept should have at least one interactive element the reader can touch and manipulate. Passive reading does not build intuition.
- Build up from concrete examples. Introduce the abstract definition only after the reader has already seen it work.
- Never assume the reader knows the prerequisites. If a concept needs prior knowledge, explain it inline in one sentence or link to the page that covers it.
- Short paragraphs. One idea per paragraph. If a sentence can be cut without losing meaning, cut it.
