/* ============================================================
   Algebra OS — Coverage Engine 2.0
   File: engine/coverageEngine.js
   ============================================================ */

import { loadCurriculum } from "./curriculumEngine.js";
import { generateQuestionForLesson } from "./questionFactory.js?v=2110";

const DEFAULT_SAMPLE_SIZE = 100;

function validateQuestion(q) {
  const errors = [];
  if (!q) errors.push("Question is null");
  if (!q?.prompt) errors.push("Missing prompt");
  if (!q?.answer) errors.push("Missing answer");
  if (!Array.isArray(q?.choices)) {
    errors.push("Choices missing");
  } else {
    if (q.choices.length !== 4) errors.push("Choices must be exactly 4");
    if (!q.choices.includes(q.answer)) errors.push("Answer missing from choices");
    if (new Set(q.choices).size !== q.choices.length) errors.push("Duplicate choices");
  }
  if (!Array.isArray(q?.hintSteps) || q.hintSteps.length === 0) errors.push("Missing hintSteps");
  if (!Array.isArray(q?.solutionSteps) || q.solutionSteps.length === 0) errors.push("Missing solutionSteps");
  if (!q?.misconception || String(q.misconception).trim().length < 5) errors.push("Missing misconception");
  return { valid: errors.length === 0, errors };
}

function certifyStatus(passRate, missingCount) {
  if (missingCount > 0) return "MISSING";
  if (passRate >= 100) return "CERTIFIED";
  if (passRate >= 95) return "REVIEW";
  return "FAIL";
}

export async function buildCoverageReport(sampleSize = DEFAULT_SAMPLE_SIZE) {
  const curriculum = await loadCurriculum();
  const rows = [];
  const units = curriculum.units || [];

  units.forEach(unit => {
    const lessons = unit.lessons || [];
    lessons.forEach(lesson => {
      const problemTypes = lesson.problemTypes || lesson.allowedProblemTypes || lesson.problem_types || [];
      const typeReports = [];
      let totalGenerated = 0;
      let totalPassed = 0;
      let totalFailed = 0;
      const missing = [];

      problemTypes.forEach(type => {
        let passed = 0;
        let failed = 0;
        const sampleErrors = [];
        const samplePrompts = [];

        for (let i = 0; i < sampleSize; i++) {
          try {
            const testLesson = { ...lesson, problemTypes: [type] };
            const q = generateQuestionForLesson(testLesson);
            const result = validateQuestion(q);
            if (samplePrompts.length < 3 && q?.prompt) samplePrompts.push(q.prompt);
            if (result.valid) passed++;
            else {
              failed++;
              if (sampleErrors.length < 5) sampleErrors.push({ prompt: q?.prompt || "No prompt", errors: result.errors });
            }
          } catch (err) {
            failed++;
            if (sampleErrors.length < 5) sampleErrors.push({ prompt: "Generator error", errors: [err.message || String(err)] });
          }
        }

        const generated = passed + failed;
        const passRate = generated > 0 ? Math.round((passed / generated) * 100) : 0;
        if (passed === 0) missing.push(type);

        typeReports.push({ problemType: type, generated, passed, failed, passRate, samplePrompts, sampleErrors, status: passed > 0 && passRate >= 95 ? "READY" : "MISSING" });
        totalGenerated += generated;
        totalPassed += passed;
        totalFailed += failed;
      });

      const lessonPassRate = totalGenerated > 0 ? Math.round((totalPassed / totalGenerated) * 100) : 0;
      rows.push({
        unitId: unit.id,
        unitTitle: unit.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        standard: lesson.standard || "",
        problemTypes,
        typeReports,
        generated: totalGenerated,
        passed: totalPassed,
        failed: totalFailed,
        passRate: lessonPassRate,
        missing,
        status: certifyStatus(lessonPassRate, missing.length)
      });
    });
  });
  return rows;
}

export function summarizeCoverage(rows) {
  const totalLessons = rows.length;
  const certifiedLessons = rows.filter(r => r.status === "CERTIFIED").length;
  const reviewLessons = rows.filter(r => r.status === "REVIEW").length;
  const failedLessons = rows.filter(r => r.status === "FAIL").length;
  const missingLessons = rows.filter(r => r.status === "MISSING").length;
  const allTypes = new Set();
  const missingTypes = new Set();
  let totalGenerated = 0, totalPassed = 0, totalFailed = 0;

  rows.forEach(row => {
    row.problemTypes.forEach(type => allTypes.add(type));
    row.missing.forEach(type => missingTypes.add(type));
    totalGenerated += row.generated;
    totalPassed += row.passed;
    totalFailed += row.failed;
  });

  const overallPassRate = totalGenerated > 0 ? Math.round((totalPassed / totalGenerated) * 100) : 0;
  return { totalLessons, certifiedLessons, reviewLessons, failedLessons, missingLessons, totalProblemTypes: allTypes.size, missingProblemTypes: Array.from(missingTypes).sort(), totalGenerated, totalPassed, totalFailed, overallPassRate };
}

export async function logCoverageReport(sampleSize = DEFAULT_SAMPLE_SIZE) {
  const rows = await buildCoverageReport(sampleSize);
  const summary = summarizeCoverage(rows);
  console.log("===== ALGEBRA OS QA COVERAGE SUMMARY =====");
  console.table(summary);
  console.log("===== LESSON QA COVERAGE REPORT =====");
  console.table(rows.map(row => ({ lesson: row.lessonId, title: row.lessonTitle, problemTypes: row.problemTypes.join(", "), generated: row.generated, passed: row.passed, failed: row.failed, passRate: row.passRate + "%", status: row.status, missing: row.missing.join(", ") })));
  return { summary, rows };
}

window.AlgebraCoverageEngine = { buildCoverageReport, summarizeCoverage, logCoverageReport };
