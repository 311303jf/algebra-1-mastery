/*
  Algebra OS — Student Session Engine
  Version: 1.0
*/

const AlgebraStudentSessionEngine = (() => {

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
    lastActivity: null
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
      return {
        ...DEFAULT_STATE,
        ...JSON.parse(saved)
      };
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

    const attemptConfidence =
      state.attempted >= 5 ? 1 : state.attempted / 5;

    let mastery =
      (accuracyScore - hintPenalty + streakBonus) *
      attemptConfidence;

    mastery = Math.max(0, Math.min(100, mastery));

    return Math.round(mastery);
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

    state.mastery = calculateMastery(state);

    saveSession(lessonId, state);

    return state;
  }

  function recordHint(lessonId = "1.1") {
    const state = loadSession(lessonId);

    state.hintsUsed += 1;
    state.lastActivity = new Date().toISOString();
    state.mastery = calculateMastery(state);

    saveSession(lessonId, state);

    return state;
  }

  function resetSession(lessonId = "1.1") {
    const fresh = { ...DEFAULT_STATE };
    saveSession(lessonId, fresh);
    return fresh;
  }

  function getLessonStatus(lessonId = "1.1") {
    const state = loadSession(lessonId);

    if (state.mastery >= 85) {
      return "mastered";
    }

    if (state.mastery >= 70) {
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

    if (status === "mastered") {
      return "Excellent. You have demonstrated strong mastery. You are ready for the next lesson.";
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
      return "Start with one question. Focus on what operation is attached to x.";
    }

    return "Keep practicing. Accuracy and consistency will build mastery.";
  }

  function exportSessionSummary(lessonId = "1.1") {
    const state = loadSession(lessonId);

    return {
      lessonId,
      status: getLessonStatus(lessonId),
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
    calculateMastery
  };

})();
window.AlgebraStudentSessionEngine = AlgebraStudentSessionEngine;
