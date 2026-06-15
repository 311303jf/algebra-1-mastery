/*
==================================================
 Algebra OS — Skill Routing Engine
 Version: 1000
 Purpose:
 - Decide the next problemType for Mastery V2.
 - Repeat missed skills until corrected.
 - Stop routing skills that reached 100%.
 - Prioritize weakest required skill.
==================================================
*/

const AlgebraSkillRoutingEngine = (() => {

  const DEFAULT_SKILL_MASTERY_TARGET = 80;

  function normalizeRequiredTypes(requiredProblemTypes = []) {
    return Array.isArray(requiredProblemTypes)
      ? requiredProblemTypes.filter(Boolean)
      : [];
  }

  function getSkillData(sessionState, problemType) {
    return sessionState?.skillProgress?.[problemType] || {
      attempted: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      mastery: 0,
      consecutiveErrors: 0
    };
  }

  function isSkillPerfect(skillData) {
    return Number(skillData?.mastery || 0) >= 100;
  }

  function getRepeatSkill(requiredProblemTypes, sessionState) {
    for (const problemType of requiredProblemTypes) {
      const skill = getSkillData(sessionState, problemType);

      if (
        Number(skill.consecutiveErrors || 0) > 0 &&
        !isSkillPerfect(skill)
      ) {
        return problemType;
      }
    }

    return null;
  }

  function getUncoveredSkill(requiredProblemTypes, sessionState) {
    return requiredProblemTypes.find(problemType => {
      const skill = getSkillData(sessionState, problemType);
      return Number(skill.attempted || 0) === 0;
    }) || null;
  }

  function getWeakestSkill(requiredProblemTypes, sessionState, target = DEFAULT_SKILL_MASTERY_TARGET) {
    const candidates = requiredProblemTypes
      .map(problemType => {
        const skill = getSkillData(sessionState, problemType);

        return {
          problemType,
          attempted: Number(skill.attempted || 0),
          mastery: Number(skill.mastery || 0),
          accuracy: Number(skill.accuracy || 0),
          consecutiveErrors: Number(skill.consecutiveErrors || 0)
        };
      })
      .filter(skill => skill.mastery < 100)
      .filter(skill => skill.mastery < target);

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      return (
        b.consecutiveErrors - a.consecutiveErrors ||
        a.mastery - b.mastery ||
        a.attempted - b.attempted ||
        a.accuracy - b.accuracy
      );
    });

    return candidates[0].problemType;
  }

  function getNextProblemType({
    lessonId = "1.1",
    requiredProblemTypes = [],
    sessionState = null,
    targetSkillMastery = DEFAULT_SKILL_MASTERY_TARGET
  } = {}) {
    const types = normalizeRequiredTypes(requiredProblemTypes);

    if (types.length === 0) {
      return null;
    }

    const state =
      sessionState ||
      window.AlgebraStudentSessionEngine?.loadSession?.(lessonId) ||
      {};

    const repeatSkill = getRepeatSkill(types, state);
    if (repeatSkill) return repeatSkill;

    const uncoveredSkill = getUncoveredSkill(types, state);
    if (uncoveredSkill) return uncoveredSkill;

    const weakestSkill = getWeakestSkill(types, state, targetSkillMastery);
    if (weakestSkill) return weakestSkill;

    const notPerfect = types.find(problemType => {
      const skill = getSkillData(state, problemType);
      return !isSkillPerfect(skill);
    });

    return notPerfect || types[0];
  }

  function getRoutingSnapshot({
    lessonId = "1.1",
    requiredProblemTypes = [],
    sessionState = null,
    targetSkillMastery = DEFAULT_SKILL_MASTERY_TARGET
  } = {}) {
    const types = normalizeRequiredTypes(requiredProblemTypes);

    const state =
      sessionState ||
      window.AlgebraStudentSessionEngine?.loadSession?.(lessonId) ||
      {};

    const nextProblemType = getNextProblemType({
      lessonId,
      requiredProblemTypes: types,
      sessionState: state,
      targetSkillMastery
    });

    return {
      lessonId,
      nextProblemType,
      targetSkillMastery,
      skills: types.map(problemType => {
        const skill = getSkillData(state, problemType);

        return {
          problemType,
          attempted: Number(skill.attempted || 0),
          correct: Number(skill.correct || 0),
          wrong: Number(skill.wrong || 0),
          accuracy: Number(skill.accuracy || 0),
          mastery: Number(skill.mastery || 0),
          consecutiveErrors: Number(skill.consecutiveErrors || 0),
          perfect: isSkillPerfect(skill)
        };
      })
    };
  }

  return {
    getNextProblemType,
    getRoutingSnapshot,
    getRepeatSkill,
    getUncoveredSkill,
    getWeakestSkill,
    DEFAULT_SKILL_MASTERY_TARGET
  };

})();

window.AlgebraSkillRoutingEngine = AlgebraSkillRoutingEngine;
