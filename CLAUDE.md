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

## Common Folder Reference

- `src/common/Routes.js`: defines every app route and maps paths to page/learning components.
- `src/common/desmos/useDesmosCalculator.js`: hook that loads the Desmos API script and creates/destroys a calculator instance in a container.
- `src/common/desmos/CurveDesmosGraph.js`: renders a 1D curve with a single draggable point and its trail, backed by Desmos.
- `src/common/desmos/GradientDescentGraph.js`: drives `CurveDesmosGraph` through the plain gradient descent update rule (step/start/stop/reset).
- `src/common/desmos/GradientDescentWithMomentumGraph.js`: drives `CurveDesmosGraph` through the momentum-based gradient descent update rule.
- `src/common/desmos/StochasticGradientDescentGraph.js`: drives `CurveDesmosGraph` through a batch-or-stochastic gradient descent update rule over a fixed set of data points.
- `src/common/hooks/useMathJax.js`: hook that waits for MathJax to finish typesetting before revealing a page.
- `src/common/mathbox/canvasTheme.js`: shared color/width constants for MathBox scenes (background, axes, grid).
- `src/common/mathbox/CartesianCanvas.js`: low-level MathBox canvas that handles camera setup, dragging, and hit-testing for N points.
- `src/common/mathbox/Cartesian1DCanvas.js`: `CartesianCanvas` wrapper constrained to a single draggable point on a number line.
- `src/common/mathbox/Cartesian2DCanvas.js`: `CartesianCanvas` wrapper for one or more draggable points on an xy plane, with an optional custom `draw` hook.
- `src/common/mathbox/Cartesian3DCanvas.js`: `CartesianCanvas` wrapper for a single draggable point in xyz space.
- `src/common/mathbox/VectorAdditionCanvas.js`: 2D scene showing two draggable vectors, their sum, and the parallelogram between them.
- `src/common/mathbox/VectorScalingCanvas.js`: 2D scene showing a draggable vector and its scalar multiples.
- `src/common/mathbox/ScatterFitCanvas.js`: MathBox scene showing a fixed scatter of points, a fitted line `y = m*x`, residual gaps to each point, and a highlight for the point(s) the last gradient descent step used.

## File Naming

- React component files: `PascalCase.js` (e.g. `Home.js`, `CartesianCanvas.js`, `Routes.js`).
- Non-component JS files: `camelCase.js` (e.g. `index.js`, `setupTests.js`).
- CSS files: match the name of the component they style (e.g. `Home.css` for `Home.js`).

## CSS

- Plain CSS files per component. No CSS-in-JS, no Tailwind, no styled-components.
- Keep styles minimal — only write what is actually needed for the UI to look correct.
- Every UI implementation must be mobile responsive. Add the necessary media queries/layout adjustments as part of the same change, not as a follow-up.

## Comments

- No comments by default.
- Add a single-line comment only when the reason behind the code is non-obvious (hidden constraint, workaround, subtle invariant).
- Always add a comment describing the props shape on components that accept non-trivial props (e.g. `// vectors: [{ x, y, color }]`).
- Never describe what the code does — only why, when it would surprise a reader.

## General

- No error boundaries, loading states, or edge-case handling unless explicitly asked.
- No TypeScript — plain JavaScript only.

## Verification

- Don't install or launch a browser (Playwright, Puppeteer, chromium-cli, etc.) to visually verify UI changes by default. The user runs the dev server themselves and checks the UI visually.
- Browser automation is allowed when the user explicitly asks for it in the moment (e.g. "take chromium access and check yourself") — treat that as permission for that task, not a standing change to the default above.
- It's fine to confirm the dev server compiles cleanly (no build errors) as a sanity check, but stop there for routine UI work.
- Reserve heavier verification (browser automation, extensive scripted checks, multi-step debugging) for genuinely complex problems you're stuck on, not everyday component/style changes.

## Content Writing

- Never use em dashes (—) in UI-facing text. Use a colon, comma, or period instead.
- Write in Indian English, in the style of Chetan Bhagat: the way an Indian friend explains something over chai, not the way a textbook or a polished Western blog writes.
- The English should sound Indian, not perfect. Slightly imperfect, conversational grammar is the goal. Do not polish sentences into formal correctness. "Simple only it is" beats "It is quite simple."
- Short, punchy sentences. Sentence fragments are fine. Rhetorical questions are fine ("Why does this work? See.").
- Use everyday Indian references and analogies where they help: chai, cricket, local trains, traffic, bargaining at the market, exam marks, tuition classes.
- Light Hinglish is welcome in moderation: words like "funda", "jugaad", "yaar", "na", "only", "itself", "do the needful" style constructions. Sprinkle, do not flood. Math terms stay in English.
- Talk directly to the reader as "you". Be a little dramatic and filmy when it fits ("The point is stuck in the valley. Poor fellow.").
- Example of the tone. Bad: "Gradient descent is an iterative optimization algorithm." Good: "Gradient descent is simple funda: see which side is downhill, take small step, again check. That's it."

## Math Notation

- Use step-indexed notation for iterative update formulas: `x_i`, `x_{i+1}`, `v_i`, etc. Never use `x_old` / `x_new` or `x_prev`.

## Teaching Philosophy

- You are an expert teacher. Your job is to make hard things feel obvious, not to sound impressive.
- Always prefer a visual or interactive explanation over a written one. If something can be shown with a canvas, show it. Text is a fallback, not the default.
- Every concept should have at least one interactive element the reader can touch and manipulate. Passive reading does not build intuition.
- Build up from concrete examples. Introduce the abstract definition only after the reader has already seen it work.
- Never assume the reader knows the prerequisites. If a concept needs prior knowledge, explain it inline in one sentence or link to the page that covers it.
- Short paragraphs. One idea per paragraph. If a sentence can be cut without losing meaning, cut it.
