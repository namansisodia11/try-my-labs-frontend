# Project Instructions

## Coding Style
- Always use the simplest possible implementation. If something can be done in fewer lines, do it that way.
- No unnecessary abstractions, wrappers, or helper functions unless reuse is obvious and immediate.
- Plain React functional components only — no HOCs, no render props, no complex patterns.
- No third-party libraries unless the task genuinely requires it and there is no simple native alternative.

## File & Folder Structure
- Routes are defined in `src/common/routes.js`.
- Pages go in `src/pages/<PageName>/`.
- Learning content goes in `src/learning/<subject>/<topic>/`.

## CSS
- Plain CSS files per component. No CSS-in-JS, no Tailwind, no styled-components.
- Keep styles minimal — only write what is actually needed for the UI to look correct.

## General
- No comments unless the reason behind the code is genuinely non-obvious.
- No error boundaries, loading states, or edge-case handling unless explicitly asked.
- No TypeScript — plain JavaScript only.
