/* ============================================================
   Algebra OS — Coverage Engine 1.0
   File: engine/coverageEngine.js

   PURPOSE:
   - Scan algebra1.json curriculum
   - Check every lesson problemType
   - Verify whether questionFactory has a generator for each type
   - Produce a Ready / Missing coverage report
   - No hardcoded lessons
   ============================================================ */

import { loadCurriculum } from "./curriculumEngine.js";
import { generateQuestionForLesson } from "./questionFactory.js?v=2110";

export async function buildCoverageReport() {
  const curriculum = await loadCurriculum();
  const rows = [];

  const units = curriculum.units || [];

  units.forEach(unit => {
    const lessons = unit.lessons || [];

    lessons.forEach(lesson => {
      const problemTypes =
        lesson.problemTypes ||
        lesson.allowedProblemTypes ||
        lesson.problem_types ||
        [];

      const missing = [];
      const working = [];

      problemTypes.forEach(type => {
        try {
          const testLesson = {
            ...lesson,
            problemTypes: [type]
          };

          const q = generateQuestionForLesson(testLesson);

          if (
            q &&
            q.prompt &&
            q.answer &&
            Array.isArray(q.choices) &&
            q.choices.includes(q.answer)
          ) {
            working.push(type);
          } else {
            missing.push(type);
          }
        } catch (err) {
          missing.push(type);
        }
      });

      rows.push({
        unitId: unit.id,
        unitTitle: unit.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        standard: lesson.standard || "",
        problemTypes,
        working,
        missing,
        status: missing.length === 0 && problemTypes.length > 0 ? "READY" : "MISSING"
      });
    });
  });

  return rows;
}

export function summarizeCoverage(rows) {
  const totalLessons = rows.length;
  const readyLessons = rows.filter(r => r.status === "READY").length;
  const missingLessons = totalLessons - readyLessons;

  const allTypes = new Set();
  const missingTypes = new Set();

  rows.forEach(row => {
    row.problemTypes.forEach(type => allTypes.add(type));
    row.missing.forEach(type => missingTypes.add(type));
  });

  return {
    totalLessons,
    readyLessons,
    missingLessons,
    totalProblemTypes: allTypes.size,
    missingProblemTypes: Array.from(missingTypes).sort()
  };
}

export async function logCoverageReport() {
  const rows = await buildCoverageReport();
  const summary = summarizeCoverage(rows);

  console.log("===== ALGEBRA OS COVERAGE SUMMARY =====");
  console.table(summary);

  console.log("===== LESSON COVERAGE REPORT =====");
  console.table(rows.map(row => ({
    lesson: row.lessonId,
    title: row.lessonTitle,
    problemTypes: row.problemTypes.join(", "),
    status: row.status,
    missing: row.missing.join(", ")
  })));

  return { summary, rows };
}

window.AlgebraCoverageEngine = {
  buildCoverageReport,
  summarizeCoverage,
  logCoverageReport
};
