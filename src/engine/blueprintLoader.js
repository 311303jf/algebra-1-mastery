import { CURRICULUM_BLUEPRINTS } from "../data/blueprints/index.js";

export function loadCurriculumBlueprints() {
  return CURRICULUM_BLUEPRINTS;
}

export function getAllUnits() {
  return CURRICULUM_BLUEPRINTS.units || [];
}

export function getUnitById(unitId) {
  return getAllUnits().find(unit => unit.id === unitId);
}

export function getAllLessons() {
  return getAllUnits().flatMap(unit =>
    (unit.lessons || []).map(lesson => ({
      ...lesson,
      unitId: unit.id,
      unitTitle: unit.title
    }))
  );
}

export function getLessonById(lessonId) {
  return getAllLessons().find(lesson => lesson.id === lessonId);
}
