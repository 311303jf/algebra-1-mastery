/* =========================================================
   ALGEBRA OS — recoveryTutorQAGate.js
   Version: 1000

   PURPOSE:
   Certifies Recovery Tutor logic before trusting it.

   TESTS:
   1. Attached operation
   2. Inverse operation
   3. Simplified equation
   4. Button answer validation
   5. Recovery Practice is not original
   6. Recovery Practice checks are not duplicates

   HOW TO USE IN qa.html OR CONSOLE:
   import { runRecoveryTutorCertification } from "./engine/recoveryTutorQAGate.js";
   runRecoveryTutorCertification();

   Or in browser console after page load:
   AlgebraRecoveryTutorQAGate.runRecoveryTutorCertification()
========================================================= */

import {
  generateRecoveryLesson,
  tutorAnswerMatches
} from "./recoveryLessonEngine.js?v=1600";

function normalizeEquationKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/solve:/g, "")
    .replace(/solveforx\.?/g, "")
    .replace(/\s+/g, "")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

export function runRecoveryTutorCertification() {
  const testCases = [
    {
      name: "Addition one-step equation",
      problemType: "one_step_addition_equation",
      question: { prompt: "Solve for x. x + 8 = 18", answer: "x = 10" },
      expectedAttached: "Addition",
      expectedInverse: "Subtraction",
      expectedSimplified: "x = 10"
    },
    {
      name: "Subtraction one-step equation",
      problemType: "one_step_subtraction_equation",
      question: { prompt: "Solve for x. x - 8 = 10", answer: "x = 18" },
      expectedAttached: "Subtraction",
      expectedInverse: "Addition",
      expectedSimplified: "x = 18"
    },
    {
      name: "Multiplication one-step equation",
      problemType: "one_step_multiplication_equation",
      question: { prompt: "Solve for x. 3x = 21", answer: "x = 7" },
      expectedAttached: "Multiplication",
      expectedInverse: "Division",
      expectedSimplified: "x = 7"
    },
    {
      name: "Division one-step equation",
      problemType: "one_step_division_equation",
      question: { prompt: "Solve for x. x ÷ 7 = 1", answer: "x = 7" },
      expectedAttached: "Division",
      expectedInverse: "Multiplication",
      expectedSimplified: "x = 7"
    }
  ];

  const failures = [];
  const results = [];

  for (const test of testCases) {
    const lesson = generateRecoveryLesson(test.problemType, {}, test.question);
    const attachedStep = lesson.tutorDialogue?.[0];
    const inverseStep = lesson.tutorDialogue?.[1];
    const simplifiedStep = lesson.tutorDialogue?.[2];

    const attachedOK = tutorAnswerMatches(test.expectedAttached, attachedStep?.expected);
    const inverseOK = tutorAnswerMatches(test.expectedInverse, inverseStep?.expected);
    const simplifiedOK = tutorAnswerMatches(test.expectedSimplified, simplifiedStep?.expected);

    const originalKey = normalizeEquationKey(lesson.diagnostic?.equationBefore);
    const recoveryKeys = (lesson.recoveryPractice || []).map(item =>
      normalizeEquationKey(item.equation || item.prompt)
    );

    const repeatsOriginal = recoveryKeys.some(key => key === originalKey || key.includes(originalKey));
    const duplicateRecovery = new Set(recoveryKeys).size !== recoveryKeys.length;

    const caseFailures = [];

    if (!attachedOK) caseFailures.push("Attached operation failed.");
    if (!inverseOK) caseFailures.push("Inverse operation failed.");
    if (!simplifiedOK) caseFailures.push("Simplified equation failed.");
    if (repeatsOriginal) caseFailures.push("Recovery practice repeats original.");
    if (duplicateRecovery) caseFailures.push("Recovery practice has duplicates.");

    if (caseFailures.length) {
      failures.push({
        name: test.name,
        failures: caseFailures,
        lesson
      });
    }

    results.push({
      name: test.name,
      attachedOK,
      inverseOK,
      simplifiedOK,
      repeatsOriginal,
      duplicateRecovery
    });
  }

  const report = {
    passed: failures.length === 0,
    tested: testCases.length,
    failures,
    results,
    message: failures.length === 0
      ? "Recovery Tutor Certification PASS"
      : "Recovery Tutor Certification FAIL"
  };

  if (report.passed) {
    console.log("✅", report.message, report);
  } else {
    console.error("❌", report.message, report);
  }

  return report;
}

window.AlgebraRecoveryTutorQAGate = {
  runRecoveryTutorCertification
};

export default {
  runRecoveryTutorCertification
};
