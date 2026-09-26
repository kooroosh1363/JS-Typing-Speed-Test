import {
  applyInput,
  compareInput,
  computeMetrics,
  createSession,
  formatElapsed,
  isBetterResult,
  readBest,
  resultSnapshot,
  writeBest,
} from "./typing-engine.js";
import { passages } from "./passages.js";

const elements = {
  passage: document.querySelector("[data-passage]"),
  passageLabel: document.querySelector("[data-passage-label]"),
  input: document.querySelector("[data-input]"),
  timer: document.querySelector("[data-timer]"),
  wpm: document.querySelector("[data-wpm]"),
  rawWpm: document.querySelector("[data-raw-wpm]"),
  accuracy: document.querySelector("[data-accuracy]"),
  errors: document.querySelector("[data-errors]"),
  progress: document.querySelector("[data-progress]"),
  status: document.querySelector("[data-status]"),
  best: document.querySelector("[data-best]"),
  reset: document.querySelector("[data-reset]"),
  next: document.querySelector("[data-next]"),
};

if (Object.values(elements).some((element) => !element)) {
  throw new Error("TypeBench could not find its required interface elements.");
}

let passageIndex = 0;
let session = createSession(passages[passageIndex].text);
let startAt = null;
let finishAt = null;
let animationFrame = 0;
let bestResult = readBest(window.localStorage);

function elapsedNow() {
  if (startAt === null) return 0;
  return (finishAt ?? performance.now()) - startAt;
}

function setStatus(message) {
  elements.status.textContent = message;
}

function renderPassage() {
  const fragment = document.createDocumentFragment();
  const comparison = compareInput(session.target, session.input);

  [...session.target].forEach((character, index) => {
    const span = document.createElement("span");
    span.textContent = character;

    if (index < session.input.length) {
      span.className = session.input[index] === character
        ? "char char--correct"
        : "char char--error";
    } else if (index === session.input.length && !comparison.completed) {
      span.className = "char char--current";
    } else {
      span.className = "char";
    }

    fragment.append(span);
  });

  elements.passage.replaceChildren(fragment);
}

function renderBest() {
  elements.best.textContent = bestResult
    ? `${bestResult.wpm.toFixed(1)} WPM · ${bestResult.accuracy.toFixed(1)}%`
    : "No completed run yet";
}

function renderMetrics() {
  const metrics = computeMetrics(session, elapsedNow());

  elements.timer.textContent = formatElapsed(metrics.elapsedMs);
  elements.wpm.textContent = metrics.wpm.toFixed(1);
  elements.rawWpm.textContent = metrics.rawWpm.toFixed(1);
  elements.accuracy.textContent = `${metrics.accuracy.toFixed(1)}%`;
  elements.errors.textContent = String(metrics.errorKeystrokes ?? session.errorKeystrokes);
  elements.progress.value = Math.round(metrics.progress * 100);

  return metrics;
}

function stopAnimation() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function tick() {
  renderMetrics();

  if (startAt !== null && finishAt === null) {
    animationFrame = requestAnimationFrame(tick);
  }
}

function finishRun(metrics) {
  finishAt = performance.now();
  stopAnimation();

  const finalMetrics = computeMetrics(session, elapsedNow());
  const snapshot = resultSnapshot(finalMetrics);

  if (isBetterResult(snapshot, bestResult)) {
    bestResult = snapshot;
    writeBest(window.localStorage, snapshot);
    renderBest();
    setStatus(`Completed at ${snapshot.wpm.toFixed(1)} WPM — new personal best.`);
  } else {
    setStatus(`Completed at ${snapshot.wpm.toFixed(1)} WPM with ${snapshot.accuracy.toFixed(1)}% keystroke accuracy.`);
  }

  elements.input.setAttribute("aria-invalid", "false");
  renderMetrics();
}

function resetRun({ focus = true } = {}) {
  stopAnimation();
  session = createSession(passages[passageIndex].text);
  startAt = null;
  finishAt = null;

  elements.input.value = "";
  elements.input.maxLength = session.target.length;
  elements.input.removeAttribute("aria-invalid");
  elements.passageLabel.textContent = passages[passageIndex].label;
  elements.progress.value = 0;

  renderPassage();
  renderMetrics();
  setStatus("Ready. The timer starts with your first character.");

  if (focus) elements.input.focus();
}

elements.input.addEventListener("paste", (event) => {
  event.preventDefault();
  setStatus("Paste is disabled so the benchmark measures typing.");
});

elements.input.addEventListener("drop", (event) => {
  event.preventDefault();
  setStatus("Drag-and-drop input is disabled for a fair benchmark.");
});

elements.input.addEventListener("input", () => {
  if (finishAt !== null) return;

  if (startAt === null && elements.input.value.length > 0) {
    startAt = performance.now();
    animationFrame = requestAnimationFrame(tick);
    setStatus("Running. Correct mistakes as you type.");
  }

  session = applyInput(session, elements.input.value);

  if (elements.input.value !== session.input) {
    elements.input.value = session.input;
  }

  const comparison = compareInput(session.target, session.input);
  elements.input.setAttribute(
    "aria-invalid",
    comparison.errorCharacters > 0 ? "true" : "false",
  );

  renderPassage();
  const metrics = renderMetrics();

  if (comparison.completed) {
    finishRun(metrics);
  }
});

elements.reset.addEventListener("click", () => resetRun());

elements.next.addEventListener("click", () => {
  passageIndex = (passageIndex + 1) % passages.length;
  resetRun();
  setStatus(`Loaded passage: ${passages[passageIndex].label}.`);
});

window.addEventListener("pagehide", stopAnimation);

renderBest();
resetRun({ focus: false });
