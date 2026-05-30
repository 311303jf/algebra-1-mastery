// engine/curriculumEngine.js

import { expandCurriculum } from "./curriculumExpander.js";

export async function loadCurriculum() {
  const response = await fetch("./curriculum/algebra1.json");

  if (!response.ok) {
    throw new Error("Could not load Algebra 1 curriculum.");
  }

  const baseCurriculum = await response.json();

  return expandCurriculum(baseCurriculum);
}

export function getAllUnits(curriculum) {
  return curriculum.units || [];
}

export function getAllLessons(curriculum) {
  return (curriculum.units || []).flatMap(unit =>
    (unit.lessons || []).map(lesson => ({
      ...lesson,
      unitId: unit.id,
      unitTitle: unit.title,
      quarter: unit.quarter
    }))
  );
}

export function getLessonById(curriculum, lessonId) {
  return getAllLessons(curriculum).find(lesson => lesson.id === lessonId);
}

export function getUnlockedLessons(curriculum, progress = {}) {
  return getAllLessons(curriculum).filter(lesson => {
    if (!lesson.unlockAfter) return true;
    return progress[lesson.unlockAfter]?.mastered === true;
  });
}

export function getCurriculumStats(curriculum) {
  const units = getAllUnits(curriculum);
  const lessons = getAllLessons(curriculum);

  return {
    totalUnits: units.length,
    totalLessons: lessons.length,
    quarters: [...new Set(units.map(unit => unit.quarter))],
    frozenUnits: units.filter(unit => unit.frozen === true).length,
    certifiedUnits: units.filter(unit => unit.status === "certified").length,
    expansionEngine: "active",
    blueprintLoader: "active"
  };
}
