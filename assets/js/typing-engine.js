export function compareInput(target, input) {
  const safeTarget = String(target);
  const safeInput = String(input);
  let correctCharacters = 0;
  let errorCharacters = 0;
  let firstErrorIndex = -1;

  for (let index = 0; index < safeInput.length; index += 1) {
    if (safeInput[index] === safeTarget[index]) {
      correctCharacters += 1;
    } else {
      errorCharacters += 1;
      if (firstErrorIndex === -1) firstErrorIndex = index;
    }
  }

  return {
    correctCharacters,
    errorCharacters,
    firstErrorIndex,
    completed: safeInput === safeTarget,
    progress: safeTarget.length === 0
      ? 1
      : Math.min(safeInput.length / safeTarget.length, 1),
  };
}

export function createSession(target) {
  const safeTarget = String(target);

  if (safeTarget.trim() === "") {
    throw new TypeError("Typing target must not be empty.");
  }

  return {
    target: safeTarget,
    input: "",
    correctKeystrokes: 0,
    errorKeystrokes: 0,
  };
}

function changedInsertion(previousValue, nextValue) {
  let prefix = 0;
  const prefixLimit = Math.min(previousValue.length, nextValue.length);

  while (
    prefix < prefixLimit
    && previousValue[prefix] === nextValue[prefix]
  ) {
    prefix += 1;
  }

  let suffix = 0;
  const previousRemaining = previousValue.length - prefix;
  const nextRemaining = nextValue.length - prefix;
  const suffixLimit = Math.min(previousRemaining, nextRemaining);

  while (
    suffix < suffixLimit
    && previousValue[previousValue.length - 1 - suffix]
      === nextValue[nextValue.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  return {
    start: prefix,
    inserted: nextValue.slice(prefix, nextValue.length - suffix),
  };
}

export function applyInput(session, nextValue) {
  const next = String(nextValue).slice(0, session.target.length);
  const change = changedInsertion(session.input, next);

  let correctKeystrokes = session.correctKeystrokes;
  let errorKeystrokes = session.errorKeystrokes;

  for (let offset = 0; offset < change.inserted.length; offset += 1) {
    const index = change.start + offset;

    if (change.inserted[offset] === session.target[index]) {
      correctKeystrokes += 1;
    } else {
      errorKeystrokes += 1;
    }
  }

  return {
    ...session,
    input: next,
    correctKeystrokes,
    errorKeystrokes,
  };
}

export function computeMetrics(session, elapsedMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  const comparison = compareInput(session.target, session.input);
  const attempts = session.correctKeystrokes + session.errorKeystrokes;

  if (elapsed === 0) {
    return {
      elapsedMs: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: attempts === 0 ? 100 : (session.correctKeystrokes / attempts) * 100,
      attempts,
      ...comparison,
    };
  }

  const minutes = elapsed / 60_000;
  const wpm = (comparison.correctCharacters / 5) / minutes;
  const rawWpm = (attempts / 5) / minutes;
  const accuracy = attempts === 0
    ? 100
    : (session.correctKeystrokes / attempts) * 100;

  return {
    elapsedMs: elapsed,
    wpm,
    rawWpm,
    accuracy,
    attempts,
    ...comparison,
  };
}

export function formatElapsed(elapsedMs) {
  const totalTenths = Math.max(0, Math.floor((Number(elapsedMs) || 0) / 100));
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

export function resultSnapshot(metrics) {
  return {
    wpm: Math.round(metrics.wpm * 10) / 10,
    rawWpm: Math.round(metrics.rawWpm * 10) / 10,
    accuracy: Math.round(metrics.accuracy * 10) / 10,
    elapsedMs: Math.round(metrics.elapsedMs),
  };
}

export function isBetterResult(candidate, currentBest) {
  if (!currentBest) return true;

  if (candidate.wpm !== currentBest.wpm) {
    return candidate.wpm > currentBest.wpm;
  }

  if (candidate.accuracy !== currentBest.accuracy) {
    return candidate.accuracy > currentBest.accuracy;
  }

  return candidate.elapsedMs < currentBest.elapsedMs;
}

export function readBest(storage, key = "typebench:best") {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.wpm !== "number"
      || typeof parsed?.accuracy !== "number"
      || typeof parsed?.elapsedMs !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeBest(storage, result, key = "typebench:best") {
  try {
    storage.setItem(key, JSON.stringify(result));
    return true;
  } catch {
    return false;
  }
}
