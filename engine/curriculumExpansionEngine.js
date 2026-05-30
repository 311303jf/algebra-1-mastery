/* ============================================================
   Algebra OS — Curriculum Expansion Engine 1.0
   File: engine/curriculumExpansionEngine.js
   ============================================================ */

import { loadCurriculum } from "./curriculumEngine.js";
import { generateQuestionForLesson } from "./questionFactory.js?v=2111";
import { expandCurriculum } from "./curriculumExpander.js";

export async function auditEntireCurriculum() {
  const baseCurriculum = await loadCurriculum();
const curriculum = expandCurriculum(baseCurriculum);
  const units = curriculum.units || [];

  const roadmap = [];
  const missingProblemTypes = new Set();
  const missingGenerators = new Set();
  const supportedProblemTypes = getSupportedProblemTypes();

  units.forEach(unit => {
    const lessons = unit.lessons || [];

    lessons.forEach(lesson => {
      const problemTypes =
        lesson.problemTypes ||
        lesson.allowedProblemTypes ||
        lesson.problem_types ||
        [];

      const lessonReport = {
        unitId: unit.id,
        unitTitle: unit.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        standard: lesson.standard || "",
        problemTypes,
        supported: [],
        missingGenerators: [],
        status: "READY"
      };

      if (!problemTypes.length) {
        lessonReport.status = "NO_PROBLEM_TYPES";
        roadmap.push(lessonReport);
        return;
      }

      problemTypes.forEach(type => {
        if (supportedProblemTypes.includes(type)) {
          lessonReport.supported.push(type);
        } else {
          lessonReport.missingGenerators.push(type);
          missingProblemTypes.add(type);
          missingGenerators.add(type);
        }
      });

      if (lessonReport.missingGenerators.length > 0) {
        lessonReport.status = "MISSING_GENERATORS";
      }

      roadmap.push(lessonReport);
    });
  });

  return {
    totalUnits: units.length,
    totalLessons: roadmap.length,
    readyLessons: roadmap.filter(r => r.status === "READY").length,
    missingGeneratorLessons: roadmap.filter(r => r.status === "MISSING_GENERATORS").length,
    noProblemTypeLessons: roadmap.filter(r => r.status === "NO_PROBLEM_TYPES").length,
    missingProblemTypes: Array.from(missingProblemTypes).sort(),
    missingGenerators: Array.from(missingGenerators).sort(),
    roadmap
  };
}

export async function generateCoverageRoadmap() {
  return auditEntireCurriculum();
}

export async function findMissingProblemTypes() {
  const audit = await auditEntireCurriculum();
  return audit.missingProblemTypes;
}

export async function findMissingGenerators() {
  const audit = await auditEntireCurriculum();
  return audit.missingGenerators;
}

export async function findUncertifiedLessons() {
  const audit = await auditEntireCurriculum();
  return audit.roadmap.filter(r => r.status !== "READY");
}

export async function estimateCompletionPercent() {
  const audit = await auditEntireCurriculum();

  if (audit.totalLessons === 0) return 0;

  return Math.round((audit.readyLessons / audit.totalLessons) * 100);
}

function getSupportedProblemTypes() {
  return [
    "one_step_equation",
    "one_step_addition_equation",
    "one_step_subtraction_equation",
    "one_step_multiplication_equation",
    "one_step_division_equation",

    "two_step_equation",
    "multi_step_equation",
    "variables_both_sides",
    "distributive_property",
    "distributive_property_equation",

    "combine_like_terms",
    "combine_like_terms_equation",

    "inequality",
    "inequalities",
    "one_step_inequality",
    "one_step_inequalities",
    "multi_step_inequality",
    "multi_step_inequalities",
    "compound_inequality",
    "compound_inequalities",

    "absolute_value_equation",
    "absolute_value_equations",
     "absolute_value_functions",

    "function_evaluation",
    "functions",
    "relations_functions",
    "function_notation",
    "domain_range",
    "multiple_representations",
    "rate_of_change",

    "slope",
    "slope_from_graph",
    "slope_from_table",
    "slope_intercept",
    "graph_linear_function",

    "systems",
    "scatter_plots",
    "exponent_rules",
    "factoring",
    "quadratics"
  ];
}

export async function testGenerators(sampleSize = 20) {
  const audit = await auditEntireCurriculum();
  const results = [];

  for (const lesson of audit.roadmap) {
    if (lesson.status !== "READY") {
      results.push({
        ...lesson,
        generated: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
        qaStatus: lesson.status
      });
      continue;
    }

    let passed = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < sampleSize; i++) {
      try {
        const q = generateQuestionForLesson({
          id: lesson.lessonId,
          title: lesson.lessonTitle,
          problemTypes: lesson.problemTypes
        });

        if (
          q &&
          q.prompt &&
          q.answer &&
          Array.isArray(q.choices) &&
          q.choices.length === 4 &&
          new Set(q.choices).size === q.choices.length &&
          q.choices.includes(q.answer) &&
          Array.isArray(q.hintSteps) &&
          q.hintSteps.length > 0 &&
          Array.isArray(q.solutionSteps) &&
          q.solutionSteps.length > 0 &&
          q.misconception
        ) {
          passed++;
        } else {
          failed++;
          if (errors.length < 5) {
            errors.push(q?.prompt || "Invalid question object");
          }
        }
      } catch (err) {
        failed++;
        if (errors.length < 5) {
          errors.push(err.message || String(err));
        }
      }
    }

    const generated = passed + failed;
    const passRate = generated > 0 ? Math.round((passed / generated) * 100) : 0;

    results.push({
      ...lesson,
      generated,
      passed,
      failed,
      passRate,
      errors,
      qaStatus: passRate === 100 ? "CERTIFIED" : "REVIEW"
    });
  }

  return results;
}

window.AlgebraCurriculumExpansionEngine = {
  auditEntireCurriculum,
  generateCoverageRoadmap,
  findMissingProblemTypes,
  findMissingGenerators,
  findUncertifiedLessons,
  estimateCompletionPercent,
  testGenerators
};
