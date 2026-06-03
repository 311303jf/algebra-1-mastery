/*
  Algebra OS — Student Session Engine
  Version: 1.1 Minimum Questions Gate

  New mastery rule:
  - A student cannot unlock full mastery before 12 independent attempts.
  - Before 12 attempts, mastery is capped at 79%.
  - Assisted questions/hints do not count as independent attempts because lesson.html
    already prevents hinted questions from calling recordAttempt().
*/

const AlgebraStudentSessionEngine = (() => {

  const MIN_ATTEMPTS_FOR_UNLOCK = 12;
  const MASTERY_CAP_BEFORE_MIN_ATTEMPTS = 79;

  const DEFAULT_STATE = {
    attempted: 0,
    correct: 0,
    wrong: 0,
    hintsUsed: 0,
    currentStreak: 0,
    bestStreak: 0,
    mastery: 0,
    accuracy: 0,
    difficulty: "core",
    lastActivity: null,

    // Added for transparency/debugging
    minAttemptsForUnlock: MIN_ATTEMPTS_FOR_UNLOCK,
    attemptsRemainingForUnlock: MIN_ATTEMPTS_FOR_UNLOCK,
    masteryGateActive: true
  };

  function storageKey(lessonId) {
    return `algebra_session_${lessonId}`;
  }

  function loadSession(lessonId = "1.1") {
    const saved = localStorage.getItem(storageKey(lessonId));

    if (!saved) {
      return { ...DEFAULT_STATE };
    }

    try {
      const loaded = {
        ...DEFAULT_STATE,
        ...JSON.parse(saved)
      };

      // Keep old saved sessions compatible with the new gate.
      loaded.minAttemptsForUnlock = MIN_ATTEMPTS_FOR_UNLOCK;
      loaded.attemptsRemainingForUnlock = Math.max(
        0,
        MIN_ATTEMPTS_FOR_UNLOCK - Number(loaded.attempted || 0)
      );
      loaded.masteryGateActive =
        Number(loaded.attempted || 0) < MIN_ATTEMPTS_FOR_UNLOCK;

      // Recalculate mastery using the new rule so old sessions do not bypass the gate.
      loaded.accuracy = calculateAccuracy(
        Number(loaded.correct || 0),
        Number(loaded.attempted || 0)
      );

      loaded.mastery = calculateMastery(loaded);

      return loaded;
    } catch (error) {
      return { ...DEFAULT_STATE };
    }
  }

  function saveSession(lessonId = "1.1", state) {
    localStorage.setItem(
      storageKey(lessonId),
      JSON.stringify(state)
    );
  }

  function calculateAccuracy(correct, attempted) {
    if (attempted <= 0) {
      return 0;
    }

    return Math.round((correct / attempted) * 100);
  }

  function applyMinimumAttemptGate(rawMastery, state) {
    const attempted = Number(state.attempted || 0);

    if (attempted < MIN_ATTEMPTS_FOR_UNLOCK) {
      return Math.min(rawMastery, MASTERY_CAP_BEFORE_MIN_ATTEMPTS);
    }

    return rawMastery;
  }

  function updateGateFields(state) {
    const attempted = Number(state.attempted || 0);

    state.minAttemptsForUnlock = MIN_ATTEMPTS_FOR_UNLOCK;
    state.attemptsRemainingForUnlock = Math.max(
      0,
      MIN_ATTEMPTS_FOR_UNLOCK - attempted
    );
    state.masteryGateActive = attempted < MIN_ATTEMPTS_FOR_UNLOCK;

    return state;
  }

  function calculateMastery(state) {
    if (state.attempted <= 0) {
      return 0;
    }

    const accuracyScore = calculateAccuracy(
      state.correct,
      state.attempted
    );

    const hintPenalty = Math.min(
      state.hintsUsed * 4,
      20
    );

    const streakBonus = Math.min(
      state.bestStreak * 3,
      15
    );

    /*
      Previous version reached full confidence after 5 attempts.
      New version builds confidence toward 12 attempts.
      This prevents fast unlocking after only 4–6 correct questions.
    */
    const attemptConfidence =
      state.attempted >= MIN_ATTEMPTS_FOR_UNLOCK
        ? 1
        : state.attempted / MIN_ATTEMPTS_FOR_UNLOCK;

    let mastery =
      (accuracyScore - hintPenalty + streakBonus) *
      attemptConfidence;

    mastery = Math.max(0, Math.min(100, mastery));
    mastery = Math.round(mastery);

    mastery = applyMinimumAttemptGate(mastery, state);

    return mastery;
  }

  function recordAttempt(
    lessonId = "1.1",
    isCorrect = false,
    difficulty = "core"
  ) {
    const state = loadSession(lessonId);

    state.attempted += 1;
    state.difficulty = difficulty;
    state.lastActivity = new Date().toISOString();

    if (isCorrect) {
      state.correct += 1;
      state.currentStreak += 1;
      state.bestStreak = Math.max(
        state.bestStreak,
        state.currentStreak
      );
    } else {
      state.wrong += 1;
      state.currentStreak = 0;
    }

    state.accuracy = calculateAccuracy(
      state.correct,
      state.attempted
    );

    updateGateFields(state);

    state.mastery = calculateMastery(state);

    saveSession(lessonId, state);

    return state;
  }

  function recordHint(lessonId = "1.1") {
    const state = loadSession(lessonId);

    state.hintsUsed += 1;
    state.lastActivity = new Date().toISOString();

    updateGateFields(state);

    state.mastery = calculateMastery(state);

    saveSession(lessonId, state);

    return state;
  }

  function resetSession(lessonId = "1.1") {
    const fresh = { ...DEFAULT_STATE };
    saveSession(lessonId, fresh);
    return fresh;
  }

  function canUnlockLesson(lessonId = "1.1", targetMastery = 80) {
    const state = loadSession(lessonId);

    return (
      state.attempted >= MIN_ATTEMPTS_FOR_UNLOCK &&
      state.mastery >= targetMastery
    );
  }

  function getLessonStatus(lessonId = "1.1") {
    const state = loadSession(lessonId);

    if (
      state.attempted >= MIN_ATTEMPTS_FOR_UNLOCK &&
      state.mastery >= 85
    ) {
      return "mastered";
    }

    if (
      state.attempted >= MIN_ATTEMPTS_FOR_UNLOCK &&
      state.mastery >= 70
    ) {
      return "proficient";
    }

    if (state.attempted > 0) {
      return "in_progress";
    }

    return "not_started";
  }

  function getCoachMessage(lessonId = "1.1") {
    const state = loadSession(lessonId);
    const status = getLessonStatus(lessonId);

    if (state.attempted > 0 && state.attempted < MIN_ATTEMPTS_FOR_UNLOCK) {
      return `Good start. Complete at least ${MIN_ATTEMPTS_FOR_UNLOCK} independent questions before mastery can unlock the next lesson.`;
    }

    if (status === "mastered") {
      return "Excellent. You have demonstrated strong mastery across enough practice. You are ready for the next lesson.";
    }

    if (status === "proficient") {
      return "Good progress. A few more accurate responses will move you into mastery.";
    }

    if (state.hintsUsed >= 3 && state.accuracy < 60) {
      return "Let's slow down. Use the inverse operation and check each step carefully.";
    }

    if (state.currentStreak >= 3) {
      return "Great streak. Keep your focus and continue solving carefully.";
    }

    if (state.attempted === 0) {
      return `Start with one question. You need at least ${MIN_ATTEMPTS_FOR_UNLOCK} independent attempts before mastery can unlock the next lesson.`;
    }

    return "Keep practicing. Accuracy, coverage, and consistency will build mastery.";
  }

  function exportSessionSummary(lessonId = "1.1") {
    const state = loadSession(lessonId);

    return {
      lessonId,
      status: getLessonStatus(lessonId),
      canUnlock: canUnlockLesson(lessonId),
      coachMessage: getCoachMessage(lessonId),
      ...state
    };
  }

  return {
    loadSession,
    saveSession,
    recordAttempt,
    recordHint,
    resetSession,
    getLessonStatus,
    getCoachMessage,
    exportSessionSummary,
    calculateAccuracy,
    calculateMastery,

    // New exports
    canUnlockLesson,
    MIN_ATTEMPTS_FOR_UNLOCK
  };

})();

window.AlgebraStudentSessionEngine = AlgebraStudentSessionEngine;
