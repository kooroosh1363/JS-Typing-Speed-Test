import test from "node:test";
import assert from "node:assert/strict";

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
} from "../assets/js/typing-engine.js";

test("compareInput reports positional correctness and completion", () => {
  const partial = compareInput("hello", "hez");
  assert.equal(partial.correctCharacters, 2);
  assert.equal(partial.errorCharacters, 1);
  assert.equal(partial.firstErrorIndex, 2);
  assert.equal(partial.completed, false);

  const complete = compareInput("hello", "hello");
  assert.equal(complete.correctCharacters, 5);
  assert.equal(complete.errorCharacters, 0);
  assert.equal(complete.completed, true);
});

test("applyInput records mistakes even after correction", () => {
  let session = createSession("cat");

  session = applyInput(session, "c");
  session = applyInput(session, "cx");
  session = applyInput(session, "c");
  session = applyInput(session, "ca");
  session = applyInput(session, "cat");

  assert.equal(session.input, "cat");
  assert.equal(session.correctKeystrokes, 3);
  assert.equal(session.errorKeystrokes, 1);

  const metrics = computeMetrics(session, 60_000);
  assert.equal(metrics.completed, true);
  assert.equal(metrics.accuracy, 75);
});

test("computeMetrics calculates net and raw WPM deterministically", () => {
  let session = createSession("hello world");
  session = applyInput(session, "hello world");

  const metrics = computeMetrics(session, 60_000);

  assert.equal(metrics.correctCharacters, 11);
  assert.equal(metrics.wpm, 11 / 5);
  assert.equal(metrics.rawWpm, 11 / 5);
  assert.equal(metrics.accuracy, 100);
});

test("computeMetrics returns stable zero-time values", () => {
  const session = createSession("hello");
  const metrics = computeMetrics(session, 0);

  assert.equal(metrics.wpm, 0);
  assert.equal(metrics.rawWpm, 0);
  assert.equal(metrics.accuracy, 100);
  assert.equal(metrics.elapsedMs, 0);
});

test("formatElapsed produces minute-second-tenth output", () => {
  assert.equal(formatElapsed(0), "00:00.0");
  assert.equal(formatElapsed(999), "00:00.9");
  assert.equal(formatElapsed(61_234), "01:01.2");
});

test("resultSnapshot rounds display values consistently", () => {
  const snapshot = resultSnapshot({
    wpm: 42.345,
    rawWpm: 46.666,
    accuracy: 97.777,
    elapsedMs: 12_345.6,
  });

  assert.deepEqual(snapshot, {
    wpm: 42.3,
    rawWpm: 46.7,
    accuracy: 97.8,
    elapsedMs: 12346,
  });
});

test("personal-best comparison prefers WPM then accuracy then time", () => {
  const current = { wpm: 50, accuracy: 95, elapsedMs: 30_000 };

  assert.equal(isBetterResult({ wpm: 51, accuracy: 80, elapsedMs: 40_000 }, current), true);
  assert.equal(isBetterResult({ wpm: 50, accuracy: 96, elapsedMs: 40_000 }, current), true);
  assert.equal(isBetterResult({ wpm: 50, accuracy: 95, elapsedMs: 29_000 }, current), true);
  assert.equal(isBetterResult({ wpm: 49.9, accuracy: 100, elapsedMs: 20_000 }, current), false);
});

test("best-result storage reads and writes safely", () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  const result = { wpm: 62.4, accuracy: 98.3, elapsedMs: 22_100 };
  assert.equal(writeBest(storage, result), true);
  assert.deepEqual(readBest(storage), result);

  const blocked = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };

  assert.equal(readBest(blocked), null);
  assert.equal(writeBest(blocked, result), false);
});
