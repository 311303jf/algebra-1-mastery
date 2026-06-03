/*
  Algebra OS — Student Session Engine
  Version: 2.2 Mastery v2 + Skill Intervention System

  Mastery v2 unlock rule:
  - Minimum Attempts >= 12
  - Lesson Mastery >= 80
  - Overall Accuracy >= 80
  - Skill Coverage = 100%
  - Every lesson skill mastery >= 80

  Notes:
  - Assisted questions/hints do not count because lesson.html does not call recordAttempt()
    after a hint is used.
  - skillProgress is tracked by question.problemType.
*/

const AlgebraStudentSessionEngine = (() => {

  const MIN_ATTEMPTS_FOR_UNLOCK = 12;
  const MASTERY_CAP_BEFORE_MIN_ATTEMPTS = 79;
  const DEFAULT_UNLOCK_MASTERY = 80;
  const DEFAULT_UNLOCK_ACCURACY = 80;
  const DEFAULT_SKILL_MASTERY = 80;

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
    masteryGateActive: true,

    masteryV2: {
      enabled: true,
      canUnlock: false,
      coveragePercent: 0,
      requiredSkillMastery: DEFAULT_SKILL_MASTERY,
      requiredLessonMastery: DEFAULT_UNLOCK_MASTERY,
      requiredAccuracy: DEFAULT_UNLOCK_ACCURACY,
      blockers: []
    }
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

    /*
      Skill confidence:
      - 1 attempt: max 33%
      - 2 attempts: max 67%
      - 3+ attempts: full confidence
      This prevents a skill from reaching 100% after only one correct answer.
    */
    const confidence =
      attempted >= 3
        ? 1
        : attempted / 3;

    return Math.round(
      Math.max(0, Math.min(100, accuracy * confidence))
    );
  }


  function getInterventionLevel(consecutiveErrors) {
    const errors = Number(consecutiveErrors || 0);

    if (errors >= 8) return "recovery";
    if (errors >= 5) return "learning";
    if (errors >= 3) return "recommendation";

    return "none";
  }

  function getInterventionMessage(problemType, level) {
    if (level === "recovery") {
      return `Skill Recovery Required: review the lesson and complete guided practice for ${problemType} before continuing independent mastery.`;
    }

    if (level === "learning") {
      return `Learning Mode Activated: study the worked example for ${problemType}, then try a guided practice question.`;
    }

    if (level === "recommendation") {
      return `Recommendation: you have missed this skill several times. Review the lesson example for ${problemType} before continuing.`;
    }

    return "";
  }

  function getSkillIntervention(lessonId = "1.1", problemType = null) {
    const state = loadSession(lessonId);

    if (!problemType || !state.skillProgress || !state.skillProgress[problemType]) {
      return {
        problemType,
        level: "none",
        consecutiveErrors: 0,
        message: ""
      };
    }

    const skill = state.skillProgress[problemType];
    const consecutiveErrors = Number(skill.consecutiveErrors || 0);
    const level = getInterventionLevel(consecutiveErrors);

    return {
      problemType,
      level,
      consecutiveErrors,
      message: getInterventionMessage(problemType, level)
    };
  }

  function getActiveInterventions(lessonId = "1.1", requiredProblemTypes = []) {
    const state = loadSession(lessonId);
    const progress = state.skillProgress || {};
    const types =
      Array.isArray(requiredProblemTypes) && requiredProblemTypes.length
        ? requiredProblemTypes
        : Object.keys(progress);

    return types
      .map(problemType => getSkillIntervention(lessonId, problemType))
      .filter(item => item.level !== "none")
      .sort((a, b) => {
        const order = { recovery: 3, learning: 2, recommendation: 1, none: 0 };
        return order[b.level] - order[a.level] ||
          Number(b.consecutiveErrors || 0) - Number(a.consecutiveErrors || 0);
      });
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
        consecutiveErrors: 0,
        interventionLevel: "none",
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
      skill.consecutiveErrors = 0;
    } else {
      skill.wrong += 1;
      skill.consecutiveErrors = Number(skill.consecutiveErrors || 0) + 1;
    }

    skill.accuracy = calculateSkillAccuracy(skill);
    skill.mastery = calculateSkillMastery(skill);
    skill.interventionLevel = getInterventionLevel(skill.consecutiveErrors);
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
      mastery: Number(data.mastery || 0),
      consecutiveErrors: Number(data.consecutiveErrors || 0),
      interventionLevel: data.interventionLevel || getInterventionLevel(data.consecutiveErrors)
    }));
  }

  function getSkillSummaryForRequiredTypes(lessonId = "1.1", requiredProblemTypes = []) {
    const progress = getSkillProgress(lessonId);

    return requiredProblemTypes.map(problemType => {
      const data = progress[problemType] || {};

      return {
        problemType,
        attempted: Number(data.attempted || 0),
        correct: Number(data.correct || 0),
        wrong: Number(data.wrong || 0),
        accuracy: Number(data.accuracy || 0),
        mastery: Number(data.mastery || 0)
      };
    });
  }

  function getWeakestSkills(lessonId = "1.1", limit = 3, requiredProblemTypes = []) {
    const summary =
      Array.isArray(requiredProblemTypes) && requiredProblemTypes.length
        ? getSkillSummaryForRequiredTypes(lessonId, requiredProblemTypes)
        : getSkillSummary(lessonId);

    return summary
      .filter(skill => skill.attempted > 0)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, limit);
  }

  function getStrongestSkills(lessonId = "1.1", limit = 3, requiredProblemTypes = []) {
    const summary =
      Array.isArray(requiredProblemTypes) && requiredProblemTypes.length
        ? getSkillSummaryForRequiredTypes(lessonId, requiredProblemTypes)
        : getSkillSummary(lessonId);

    return summary
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

  function getSkillMasteryStatus(
    lessonId = "1.1",
    requiredProblemTypes = [],
    requiredSkillMastery = DEFAULT_SKILL_MASTERY
  ) {
    const summary = getSkillSummaryForRequiredTypes(lessonId, requiredProblemTypes);

    const belowTarget = summary.filter(skill => {
      return Number(skill.mastery || 0) < requiredSkillMastery;
    });

    const mastered = summary.filter(skill => {
      return Number(skill.mastery || 0) >= requiredSkillMastery;
    });

    const perfect = summary.filter(skill => {
      return Number(skill.mastery || 0) >= 100;
    });

    return {
      requiredSkillMastery,
      totalSkills: summary.length,
      masteredSkills: mastered.length,
      perfectSkills: perfect.length,
      belowTarget,
      mastered,
      summary
    };
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

  function evaluateMasteryV2(
    lessonId = "1.1",
    requiredProblemTypes = [],
    options = {}
  ) {
    const state = loadSession(lessonId);

    const requiredAttempts =
      Number(options.minAttempts || MIN_ATTEMPTS_FOR_UNLOCK);

    const requiredLessonMastery =
      Number(options.lessonMastery || DEFAULT_UNLOCK_MASTERY);

    const requiredAccuracy =
      Number(options.accuracy || DEFAULT_UNLOCK_ACCURACY);

    const requiredSkillMastery =
      Number(options.skillMastery || DEFAULT_SKILL_MASTERY);

    const coveragePercent =
      calculateCoveragePercent(lessonId, requiredProblemTypes);

    const skillStatus =
      getSkillMasteryStatus(
        lessonId,
        requiredProblemTypes,
        requiredSkillMastery
      );

    const blockers = [];

    if (Number(state.attempted || 0) < requiredAttempts) {
      blockers.push({
        type: "attempts",
        message: `Complete at least ${requiredAttempts} independent attempts.`,
        current: Number(state.attempted || 0),
        required: requiredAttempts
      });
    }

    if (Number(state.accuracy || 0) < requiredAccuracy) {
      blockers.push({
        type: "accuracy",
        message: `Raise overall accuracy to at least ${requiredAccuracy}%.`,
        current: Number(state.accuracy || 0),
        required: requiredAccuracy
      });
    }

    if (Number(state.mastery || 0) < requiredLessonMastery) {
      blockers.push({
        type: "lesson_mastery",
        message: `Raise lesson mastery to at least ${requiredLessonMastery}%.`,
        current: Number(state.mastery || 0),
        required: requiredLessonMastery
      });
    }

    if (
      Array.isArray(requiredProblemTypes) &&
      requiredProblemTypes.length > 0 &&
      coveragePercent < 100
    ) {
      blockers.push({
        type: "coverage",
        message: "Practice every lesson skill at least once.",
        current: coveragePercent,
        required: 100
      });
    }

    if (skillStatus.belowTarget.length > 0) {
      blockers.push({
        type: "skill_mastery",
        message: `Every skill must reach at least ${requiredSkillMastery}%.`,
        current: skillStatus.masteredSkills,
        required: skillStatus.totalSkills,
        skills: skillStatus.belowTarget
      });
    }

    const result = {
      enabled: true,
      canUnlock: blockers.length === 0,
      blockers,
      coveragePercent,
      requiredAttempts,
      requiredLessonMastery,
      requiredAccuracy,
      requiredSkillMastery,
      skillStatus
    };

    state.masteryV2 = result;
    saveSession(lessonId, state);

    return result;
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

  /*
    Backward compatible unlock.
    If requiredProblemTypes are provided, uses Mastery v2.
    If no requiredProblemTypes are provided, keeps the old rule.
  */
  function canUnlockLesson(
    lessonId = "1.1",
    targetMastery = DEFAULT_UNLOCK_MASTERY,
    requiredProblemTypes = [],
    options = {}
  ) {
    if (Array.isArray(requiredProblemTypes) && requiredProblemTypes.length > 0) {
      return evaluateMasteryV2(
        lessonId,
        requiredProblemTypes,
        {
          lessonMastery: targetMastery,
          ...options
        }
      ).canUnlock;
    }

    const state = loadSession(lessonId);

    return (
      state.attempted >= MIN_ATTEMPTS_FOR_UNLOCK &&
      state.mastery >= targetMastery
    );
  }

  function canUnlockLessonV2(
    lessonId = "1.1",
    requiredProblemTypes = [],
    options = {}
  ) {
    return evaluateMasteryV2(
      lessonId,
      requiredProblemTypes,
      options
    ).canUnlock;
  }

  function getLessonStatus(lessonId = "1.1", requiredProblemTypes = []) {
    const state = loadSession(lessonId);

    if (Array.isArray(requiredProblemTypes) && requiredProblemTypes.length > 0) {
      const masteryV2 = evaluateMasteryV2(lessonId, requiredProblemTypes);

      if (masteryV2.canUnlock) {
        return "mastered";
      }
    }

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

  function getCoachMessage(lessonId = "1.1", requiredProblemTypes = []) {
    const state = loadSession(lessonId);

    if (Array.isArray(requiredProblemTypes) && requiredProblemTypes.length > 0) {
      const masteryV2 = evaluateMasteryV2(lessonId, requiredProblemTypes);

      if (masteryV2.canUnlock) {
        return "Excellent. You have mastered every required skill and are ready for the next lesson.";
      }

      const firstBlocker = masteryV2.blockers[0];

      if (firstBlocker) {
        return firstBlocker.message;
      }
    }

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
    const masteryV2 =
      Array.isArray(requiredProblemTypes) && requiredProblemTypes.length > 0
        ? evaluateMasteryV2(lessonId, requiredProblemTypes)
        : state.masteryV2;

    return {
      lessonId,
      status: getLessonStatus(lessonId, requiredProblemTypes),
      canUnlock: canUnlockLesson(lessonId, DEFAULT_UNLOCK_MASTERY, requiredProblemTypes),
      coachMessage: getCoachMessage(lessonId, requiredProblemTypes),
      coveragePercent: calculateCoveragePercent(lessonId, requiredProblemTypes),
      skillSummary: getSkillSummaryForRequiredTypes(lessonId, requiredProblemTypes),
      weakestSkills: getWeakestSkills(lessonId, 3, requiredProblemTypes),
      strongestSkills: getStrongestSkills(lessonId, 3, requiredProblemTypes),
      activeInterventions: getActiveInterventions(lessonId, requiredProblemTypes),
      masteryV2,
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
    getSkillSummaryForRequiredTypes,
    getWeakestSkills,
    getStrongestSkills,
    calculateCoveragePercent,
    getSkillMasteryStatus,
    getSkillIntervention,
    getActiveInterventions,
    getInterventionLevel,

    evaluateMasteryV2,
    canUnlockLesson,
    canUnlockLessonV2,

    MIN_ATTEMPTS_FOR_UNLOCK,
    DEFAULT_UNLOCK_MASTERY,
    DEFAULT_UNLOCK_ACCURACY,
    DEFAULT_SKILL_MASTERY
  };

})();

window.AlgebraStudentSessionEngine = AlgebraStudentSessionEngine;
