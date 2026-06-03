/*
  Algebra OS — Student Session Engine
  Version: 2.0 Skill Tracking Foundation

  Purpose:
  - Keeps existing mastery gate stable.
  - Adds skill/problemType tracking for Mastery v2.
  - Does NOT change unlock rules yet.
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

    skillProgress: {},

    minAttemptsForUnlock: MIN_ATTEMPTS_FOR_UNLOCK,
    attemptsRemainingForUnlock: MIN_ATTEMPTS_FOR_UNLOCK,
    masteryGateActive: true
  };

  function storageKey(lessonId) {
    return `algebra_session_${lessonId}`;
  }

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function loadSession(lessonId = "1.1") {
    const saved = localStorage.getItem(storageKey(lessonId));

    if (!saved) {
      return cloneDefaultState();
    }

    try {
      const loaded = {
        ...cloneDefaultState(),
        ...JSON.parse(saved)
      };

      if (!loaded.skillProgress || typeof loaded.skillProgress !== "object") {
        loaded.skillProgress = {};
      }

      loaded.accuracy = calculateAccuracy(
        Number(loaded.correct || 0),
        Number(loaded.attempted || 0)
      );

      updateGateFields(loaded);
      loaded.mastery = calculateMastery(loaded);

      return loaded;
    } catch (error) {
      return cloneDefaultState();
    }
  }

  function saveSession(lessonId = "1.1", state) {
    localStorage.setItem(storageKey(lessonId), JSON.stringify(state));
  }

  function calculateAccuracy(correct, attempted) {
    if (attempted <= 0) return 0;
    return Math.round((correct / attempted) * 100);
  }

  function calculateSkillAccuracy(skill) {
    if (!skill || Number(skill.attempted || 0) <= 0) return 0;

    return calculateAccuracy(
      Number(skill.correct || 0),
      Number(skill.attempted || 0)
    );
  }

  function calculateSkillMastery(skill) {
    const attempted = Number(skill?.attempted || 0);

    if (attempted <= 0) return 0;

    const accuracy = calculateSkillAccuracy(skill);

    const confidence =
      attempted >= 3
        ? 1
        : attempted / 3;

    return Math.round(
      Math.max(0, Math.min(100, accuracy * confidence))
    );
  }

  function ensureSkillProgress(state, problemType) {
    if (!problemType) return null;

    if (!state.skillProgress) {
      state.skillProgress = {};
    }

    if (!state.skillProgress[problemType]) {
      state.skillProgress[problemType] = {
        attempted: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        mastery: 0,
        lastActivity: null
      };
    }

    return state.skillProgress[problemType];
  }

  function updateSkillProgress(state, problemType, isCorrect) {
    const skill = ensureSkillProgress(state, problemType);

    if (!skill) return state;

    skill.attempted += 1;

    if (isCorrect) {
      skill.correct += 1;
    } else {
      skill.wrong += 1;
    }

    skill.accuracy = calculateSkillAccuracy(skill);
    skill.mastery = calculateSkillMastery(skill);
    skill.lastActivity = new Date().toISOString();

    return state;
  }

  function getSkillProgress(lessonId = "1.1") {
    const state = loadSession(lessonId);
    return state.skillProgress || {};
  }

  function getSkillSummary(lessonId = "1.1") {
    const progress = getSkillProgress(lessonId);

    return Object.entries(progress).map(([problemType, data]) => ({
      problemType,
      attempted: Number(data.attempted || 0),
      correct: Number(data.correct || 0),
      wrong: Number(data.wrong || 0),
      accuracy: Number(data.accuracy || 0),
      mastery: Number(data.mastery || 0)
    }));
  }

  function getWeakestSkills(lessonId = "1.1", limit = 3) {
    return getSkillSummary(lessonId)
      .filter(skill => skill.attempted > 0)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, limit);
  }

  function getStrongestSkills(lessonId = "1.1", limit = 3) {
    return getSkillSummary(lessonId)
      .filter(skill => skill.attempted > 0)
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, limit);
  }

  function calculateCoveragePercent(lessonId = "1.1", requiredProblemTypes = []) {
    const progress = getSkillProgress(lessonId);

    if (!Array.isArray(requiredProblemTypes) || requiredProblemTypes.length === 0) {
      return 0;
    }

    const covered = requiredProblemTypes.filter(type => {
      return Number(progress?.[type]?.attempted || 0) > 0;
    }).length;

    return Math.round((covered / requiredProblemTypes.length) * 100);
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
    if (Number(state.attempted || 0) <= 0) return 0;

    const accuracyScore = calculateAccuracy(
      Number(state.correct || 0),
      Number(state.attempted || 0)
    );

    const hintPenalty = Math.min(
      Number(state.hintsUsed || 0) * 4,
      20
    );

    const streakBonus = Math.min(
      Number(state.bestStreak || 0) * 3,
      15
    );

    const attemptConfidence =
      Number(state.attempted || 0) >= MIN_ATTEMPTS_FOR_UNLOCK
        ? 1
        : Number(state.attempted || 0) / MIN_ATTEMPTS_FOR_UNLOCK;

    let mastery =
      (accuracyScore - hintPenalty + streakBonus) *
      attemptConfidence;

    mastery = Math.max(0, Math.min(100, mastery));
    mastery = Math.round(mastery);

    return applyMinimumAttemptGate(mastery, state);
  }

  function recordAttempt(
    lessonId = "1.1",
    isCorrect = false,
    difficulty = "core",
    problemType = null
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

    updateSkillProgress(state, problemType, isCorrect);

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
    const fresh = cloneDefaultState();
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

  function exportSessionSummary(lessonId = "1.1", requiredProblemTypes = []) {
    const state = loadSession(lessonId);

    return {
      lessonId,
      status: getLessonStatus(lessonId),
      canUnlock: canUnlockLesson(lessonId),
      coachMessage: getCoachMessage(lessonId),
      coveragePercent: calculateCoveragePercent(lessonId, requiredProblemTypes),
      skillSummary: getSkillSummary(lessonId),
      weakestSkills: getWeakestSkills(lessonId),
      strongestSkills: getStrongestSkills(lessonId),
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

    getSkillProgress,
    getSkillSummary,
    getWeakestSkills,
    getStrongestSkills,
    calculateCoveragePercent,

    canUnlockLesson,
    MIN_ATTEMPTS_FOR_UNLOCK
  };

})();

window.AlgebraStudentSessionEngine = AlgebraStudentSessionEngine;
