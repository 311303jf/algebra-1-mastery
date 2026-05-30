/* ============================================================
   Algebra OS — Curriculum Expander 2.0
   File: engine/curriculumExpander.js

   PHASE 2A:
   - Curriculum is now loaded from Blueprint Loader.
   - Unit 1 remains frozen and certified.
   - Future units are added through blueprints.
   - No certified content is duplicated manually here.
   ============================================================ */

import { loadCurriculumBlueprints } from "./blueprintLoader.js";

const BLUEPRINT_DATA = loadCurriculumBlueprints();

export const ALGEBRA_OS_MASTER_UNITS = BLUEPRINT_DATA.units || [];

function safeClone(data) {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data));
}

export function expandCurriculum(existingCurriculum = {}) {
  const curriculum = safeClone(existingCurriculum);

  if (!curriculum.course && BLUEPRINT_DATA.course) {
    curriculum.course = BLUEPRINT_DATA.course;
  }

  if (!curriculum.units) {
    curriculum.units = [];
  }

  ALGEBRA_OS_MASTER_UNITS.forEach(newUnit => {
    const exists = curriculum.units.some(unit => unit.id === newUnit.id);

    if (!exists) {
      curriculum.units.push(newUnit);
      return;
    }

    const existingUnit = curriculum.units.find(unit => unit.id === newUnit.id);

    if (existingUnit?.frozen === true || newUnit?.frozen === true) {
      return;
    }

    if (!existingUnit.lessons) {
      existingUnit.lessons = [];
    }

    (newUnit.lessons || []).forEach(newLesson => {
      const lessonExists = existingUnit.lessons.some(
        lesson => lesson.id === newLesson.id
      );

      if (!lessonExists) {
        existingUnit.lessons.push(newLesson);
      }
    });

    existingUnit.lessons.sort((a, b) =>
      String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
    );
  });

  curriculum.units.sort((a, b) => (a.order || 0) - (b.order || 0));

  return curriculum;
}

export function getExpansionStats(existingCurriculum = {}) {
  const expanded = expandCurriculum(existingCurriculum);

  const totalUnits = expanded.units.length;
  const totalLessons = expanded.units.reduce(
    (sum, unit) => sum + (unit.lessons?.length || 0),
    0
  );

  const frozenUnits = expanded.units.filter(unit => unit.frozen === true).length;
  const certifiedUnits = expanded.units.filter(
    unit => unit.status === "certified"
  ).length;

  return {
    totalUnits,
    totalLessons,
    frozenUnits,
    certifiedUnits,
    expansionEngine: "active",
    blueprintLoader: "active"
  };
}

if (typeof window !== "undefined") {
  window.AlgebraCurriculumExpander = {
    ALGEBRA_OS_MASTER_UNITS,
    expandCurriculum,
    getExpansionStats
  };
}
