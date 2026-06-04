/* ============================================================
   Algebra OS Recovery Tutor Framework V2100
   File: engine/recoveryTutorController.js

   Purpose:
   UI-safe controller layer for Recovery Tutor.

   This file will gradually take Recovery workflow logic
   out of lesson.html without breaking the certified system.
   ============================================================ */

import AlgebraRecoveryLessonEngine from "./recoveryLessonEngine.js";
import { RECOVERY_SKILL_REGISTRY } from "./recoverySkillRegistry.js";

function getRegistry(){
  return RECOVERY_SKILL_REGISTRY;
}

function generateTutor(problemType, metadata = {}, currentQuestion = null){
  return AlgebraRecoveryLessonEngine.generateRecoveryLesson(
    problemType,
    metadata,
    currentQuestion
  );
}

function loadState(lessonId, problemType){
  return AlgebraRecoveryLessonEngine.loadRecoveryState(
    lessonId,
    problemType
  );
}

function markOpened(lessonId, problemType){
  return AlgebraRecoveryLessonEngine.markRecoveryOpened(
    lessonId,
    problemType
  );
}

function recordTutorAnswer(lessonId, problemType, isCorrect, totalSteps){
  return AlgebraRecoveryLessonEngine.recordTutorAnswer(
    lessonId,
    problemType,
    isCorrect,
    totalSteps
  );
}

function recordRecoveryPractice(lessonId, problemType, isCorrect){
  return AlgebraRecoveryLessonEngine.recordRecoveryPractice(
    lessonId,
    problemType,
    isCorrect
  );
}

function tutorAnswerMatches(input, expected){
  return AlgebraRecoveryLessonEngine.tutorAnswerMatches(
    input,
    expected
  );
}

const AlgebraRecoveryTutorController = {
  getRegistry,
  generateTutor,
  loadState,
  markOpened,
  recordTutorAnswer,
  recordRecoveryPractice,
  tutorAnswerMatches
};

window.AlgebraRecoveryTutorController = AlgebraRecoveryTutorController;

export {
  getRegistry,
  generateTutor,
  loadState,
  markOpened,
  recordTutorAnswer,
  recordRecoveryPractice,
  tutorAnswerMatches
};

export default AlgebraRecoveryTutorController;
