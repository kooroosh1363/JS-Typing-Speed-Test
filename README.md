# TypeBench — Deterministic JavaScript Typing Benchmark

[![Quality](https://github.com/kooroosh1363/JS-Typing-Speed-Test/actions/workflows/quality.yml/badge.svg)](https://github.com/kooroosh1363/JS-Typing-Speed-Test/actions/workflows/quality.yml)

TypeBench modernizes the original 2023 JavaScript typing-speed exercise into a deterministic, testable benchmark.

## What changed

The original implementation:

- used a fixed `setInterval(..., 10)` counter as its source of elapsed time
- had a reset bug caused by shadowing the timer state
- exposed no WPM or accuracy metrics
- relied on `keypress` / `keyup`
- only compared the current text against one fixed sentence
- removed visible focus outlines
- loaded a large external Google Fonts bundle
- had no automated tests or CI
- contained an untouched GitHub security-policy template with fictional version support

The maintained version introduces:

- monotonic timing with `performance.now()`
- net WPM
- raw WPM
- keystroke accuracy
- persistent mistake counting even after correction
- live positional error highlighting
- exact completion detection
- passage bank
- restart and next-passage controls
- local personal-best persistence
- paste/drop protection for a fair benchmark
- responsive light/dark UI
- keyboard-visible focus states
- reduced-motion support
- zero runtime dependencies
- pure benchmark-engine tests
- static accessibility/hygiene checks
- deterministic static build
- GitHub Actions quality gate

## Metric definitions

### Net WPM

```text
currently correct characters / 5 / elapsed minutes
```

### Raw WPM

```text
all inserted keystrokes / 5 / elapsed minutes
```

### Accuracy

```text
correct inserted keystrokes / all inserted keystrokes × 100
```

A corrected mistake still remains part of the keystroke-accuracy history. This prevents a final perfect string from falsely reporting 100% accuracy after mistakes were made and corrected.

## Why `performance.now()`?

A repeating timer callback is not a reliable clock. Browser scheduling may delay callbacks when the main thread is busy or the tab is throttled.

TypeBench stores a start timestamp and calculates elapsed time from a monotonic high-resolution clock. Animation frames only refresh the display; they do not define the measured duration.

## Architecture

```text
passages.js
    │
    ▼
typing-engine.js
    ├── createSession()
    ├── applyInput()
    ├── compareInput()
    ├── computeMetrics()
    ├── formatElapsed()
    └── personal-best utilities
    │
    ▼
main.js
    │
    ▼
accessible benchmark UI
```

The measurement functions are isolated from the DOM so they can be tested deterministically.

## Local run

Because the app uses ES modules, serve the repository over HTTP:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Quality checks

No package installation is required because there are no npm dependencies.

```bash
npm run check
```

This runs:

- JavaScript syntax validation
- Node built-in unit tests
- static accessibility/hygiene checks
- production static build

## Tests

```bash
npm test
```

The suite covers:

- positional text comparison
- completion detection
- mistake persistence after correction
- net/raw WPM math
- accuracy math
- zero-time behavior
- elapsed-time formatting
- result rounding
- personal-best ranking
- local-storage failure handling

## Accessibility

The maintained UI includes:

- a skip link and semantic landmarks
- an explicitly labelled typing area
- live benchmark status
- visible keyboard focus
- native progress semantics
- color plus text/numeric feedback
- reduced-motion support

## Fairness boundary

Paste and drag/drop into the typing field are blocked. This is a browser-side benchmark, not an anti-cheat system; scripted input or developer-tools manipulation is outside scope.

## GitHub Pages

A deployment workflow is included, but GitHub Pages must first be enabled once at repository level:

1. Open **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Open **Actions → Deploy Pages**
4. Run the workflow manually

## License

No license is currently granted by this repository.
