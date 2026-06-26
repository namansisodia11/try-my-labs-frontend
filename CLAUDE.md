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

## Content Writing

- Never use em dashes (—) in UI-facing text. Use a colon, comma, or period instead.
- Avoid AI-sounding phrasing. Write like a textbook, not a language model.
