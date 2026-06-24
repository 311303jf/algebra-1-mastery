/*
==================================================
 Algebra OS — Teacher Narrator Engine
 Version: 3500

 Purpose:
 - Convert solver steps into a real teacher-style Recovery Tutor.
 - Teach the exact current question.
 - Avoid generic diagnostic wording.
 - Fall back safely when solver cannot solve.
==================================================
*/

import {
  solveQuestion
} from "./solverEngine.js?v=3501";

import {
  buildTransformationVisual
} from "./mathTransformationVisualizer.js?v=3507";


export function buildNarratedRecoveryLesson(
  problemType,
  skillDefinition = {},
  metadata = {},
  currentQuestion = null
) {
   const requestedType = normalizeKey(problemType);
  const actualType = normalizeKey(currentQuestion?.problemType || "");

  if (actualType && requestedType && actualType !== requestedType) {
    console.warn("Teacher Narrator blocked mismatched recovery question.", {
      requestedType,
      actualType,
      currentQuestion
    });

    return null;
  }
  const alignedQuestion = getAlignedQuestionForNarrator(problemType, currentQuestion);

  const solved = solveQuestion({
    ...(alignedQuestion || currentQuestion || {}),
    problemType
  });

  if (!solved || solved.solved !== true || !Array.isArray(solved.steps) || solved.steps.length < 2) {
    return null;
  }
  if (!isSolvedStructureCompatible(problemType, solved)) {
    console.warn("Teacher Narrator blocked incompatible math structure.", {
      requestedProblemType: problemType,
      solvedSubskill: solved.subskill,
      equation: solved.equationBefore
    });

    return null;
  }

  const choices = buildGuidedChoices(solved);

  return {
    title: buildTeacherTitle(solved),
    diagnostic: {
      problemType,
      family: solved.family,
      strategy: solved.strategy,
      subskill: solved.subskill,
      tutorType: "teacher_narrator_v3500",
      equationBefore: solved.equationBefore,
      equationAfter: solved.answer,
      solverSteps: solved.steps
    },
    conceptSummary: buildConceptSummary(solved),
    misconception:
      metadata?.misconception ||
      buildMisconception(solved),
    tutorDialogue: buildTutorDialogue(solved, choices),
    workedExample: buildWorkedExample(solved),
    video: null,
    recoveryPractice: buildRecoveryPractice(solved),
    source: "teacherNarratorEngine_v3500"
  };
}

/* =========================================================
   TEACHER OUTPUT
========================================================= */

function buildTeacherTitle(solved) {
  if (solved.subskill === "one_step_addition") return "AI Algebra Teacher: Addition Equation";
  if (solved.subskill === "one_step_subtraction") return "AI Algebra Teacher: Subtraction Equation";
  if (solved.subskill === "one_step_multiplication") return "AI Algebra Teacher: Multiplication Equation";
  if (solved.subskill === "one_step_division") return "AI Algebra Teacher: Division Equation";
  if (solved.subskill === "combine_like_terms") return "AI Algebra Teacher: Combine Like Terms";
  if (solved.subskill === "distributive_property") return "AI Algebra Teacher: Distributive Property";
  if (solved.subskill === "variables_both_sides") return "AI Algebra Teacher: Variables on Both Sides";
  return "AI Algebra Teacher";
}

function buildConceptSummary(solved) {
  const first = solved.steps[0];

  return [
    `Let's work on the exact problem you missed: ${solved.equationBefore}.`,
    first?.explanation || "We will slow the problem down and understand the structure.",
    "I will show the reason for each step, then you will try a similar check."
  ];
}

function buildMisconception(solved) {
  if (solved.subskill === "one_step_multiplication") {
    return "A common mistake is multiplying again instead of dividing to undo multiplication.";
  }

  if (solved.subskill === "one_step_division") {
    return "A common mistake is dividing again instead of multiplying to undo division.";
  }

  if (solved.subskill === "one_step_addition") {
    return "A common mistake is adding again instead of subtracting to undo addition.";
  }

  if (solved.subskill === "one_step_subtraction") {
    return "A common mistake is subtracting again instead of adding to undo subtraction.";
  }

  if (solved.subskill === "combine_like_terms") {
    return "A common mistake is trying to solve before combining like terms.";
  }

  if (solved.subskill === "distributive_property") {
    return "A common mistake is solving before distributing to remove parentheses.";
  }

  if (solved.subskill === "variables_both_sides") {
    return "A common mistake is moving constants before collecting variable terms.";
  }

  return "A common mistake is trying to answer before understanding the structure of the problem.";
}

function buildTutorDialogue(solved, choices) {
  const steps = solved.steps;

  const dialogue = [];

  dialogue.push({
    id: "teacher_attention",
    tutor:
  `<div><strong>Teacher:</strong> I see where this can get confusing. Let's slow it down and use the exact problem:</div>` +
  `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">${escapeHtml(solved.equationBefore)}</div>` +
  `<div style="margin-top:10px;">${escapeHtml(steps[0]?.explanation || "")}</div>` +
  
  `<div style="margin-top:10px;">${escapeHtml(solved.checkQuestion || "What should we notice first?")}</div>`,
    choices: choices.firstStep,
    expected: [solved.checkAnswer],
    explanation:
      `Correct. ${escapeHtml(steps[0]?.explanation || "You identified the structure of the problem.")}`,
    theory:
      steps[0]?.explanation || "A good first step comes from the structure of the problem."
  });

  for (let i = 1; i < steps.length; i++) {
    const current = steps[i];

    dialogue.push({
      id: `teacher_step_${i}`,
 tutor:
  `<div><strong>Teacher:</strong> Good. Now watch the next math move:</div>` +
  `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">${escapeHtml(current.expression)}</div>` +
  `<div style="margin-top:10px;">${escapeHtml(current.explanation)}</div>` +
  buildTransformationVisual(solved, i) +
  `<div style="margin-top:10px;">What does this step do?</div>`,
       
      choices: buildStepMeaningChoices(current, solved),
      expected: [bestStepMeaning(current, solved)],
      explanation:
        `Correct. ${escapeHtml(current.explanation)}`,
      theory:
        current.explanation
    });
  }

  dialogue.push({
    id: "micro_practice",
    tutor:
      `<div><strong>Teacher:</strong> Now you try a similar one.</div>` +
      `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">${escapeHtml(buildMicroPracticePrompt(solved))}</div>` +
      `<div style="margin-top:10px;">Use the same idea we just practiced.</div>`,
    choices: buildMicroPracticeChoices(solved),
    expected: [buildMicroPracticeAnswer(solved)],
    explanation:
      `Correct. You applied the same structure to a new problem.`,
    theory:
      "Micro-practice checks whether the student can transfer the idea immediately."
  });

  return dialogue;
}

function buildWorkedExample(solved) {
  const lines = [];

  lines.push(`Problem: ${solved.equationBefore}`);

  solved.steps.forEach((step, index) => {
    lines.push(`Step ${index + 1}: ${step.expression}`);
    lines.push(`Why: ${step.explanation}`);
  });

  lines.push(`Final Answer: ${solved.answer}`);

  return lines;
}

function buildRecoveryPractice(solved) {
  return generateDynamicRecoveryPractice(solved, 2);
}

/* =========================================================
   CHOICES
========================================================= */

function buildGuidedChoices(solved) {
  if (solved.subskill === "one_step_addition") {
    return {
      firstStep: ["Subtraction", "Addition", "Multiplication", "Division"]
    };
  }

  if (solved.subskill === "one_step_subtraction") {
    return {
      firstStep: ["Addition", "Subtraction", "Multiplication", "Division"]
    };
  }

  if (solved.subskill === "one_step_multiplication") {
    return {
      firstStep: ["Division", "Multiplication", "Addition", "Subtraction"]
    };
  }

  if (solved.subskill === "one_step_division") {
    return {
      firstStep: ["Multiplication", "Division", "Addition", "Subtraction"]
    };
  }

  if (solved.subskill === "combine_like_terms") {
    return {
      firstStep: ["Combine like terms", "Divide immediately", "Guess x", "Change the equal sign"]
    };
  }

  if (solved.subskill === "distributive_property") {
    return {
      firstStep: ["Use the distributive property", "Divide immediately", "Guess x", "Ignore parentheses"]
    };
  }

  if (solved.subskill === "variables_both_sides") {
    return {
      firstStep: ["Move variable terms", "Move constants first", "Divide immediately", "Change the equal sign"]
    };
  }

  return {
    firstStep: ["Use the structure of the problem", "Guess", "Skip", "Choose the longest answer"]
  };
}

function buildStepMeaningChoices(step, solved) {
  const correct = bestStepMeaning(step, solved);

  const distractors = [
    "It guesses the answer",
    "It changes the problem",
    "It ignores the variable",
    "It removes the equal sign",
    "It chooses the longest option"
  ];

  return uniqueFour([correct, ...distractors]);
}

function bestStepMeaning(step, solved) {
  if (step.id === "undo") return "It uses the inverse operation";
  if (step.id === "simplify") return "It simplifies the result";
  if (step.id === "combine") return "It combines like terms";
  if (step.id === "distribute") return "It removes parentheses";
  if (step.id === "move_constant") return "It moves the constant away from the variable";
  if (step.id === "move_variables") return "It collects variable terms on one side";
  if (step.id === "divide") return "It isolates the variable";
  return "It follows the next correct algebra step";
}

function uniqueFour(list) {
  const out = [];
  const used = new Set();

  for (const item of list) {
    const key = String(item).toLowerCase().trim();
    if (!key || used.has(key)) continue;
    used.add(key);
    out.push(item);
    if (out.length === 4) break;
  }

  while (out.length < 4) {
    out.push(`Choice ${out.length + 1}`);
  }

  return out;
}

/* =========================================================
   MICRO PRACTICE
========================================================= */

function buildMicroPracticePrompt(solved) {
  if (solved.subskill === "one_step_addition") return "Solve: x + 5 = 12";
  if (solved.subskill === "one_step_subtraction") return "Solve: x − 5 = 12";
  if (solved.subskill === "one_step_multiplication") return "Solve: 5x = 30";
  if (solved.subskill === "one_step_division") return "Solve: x ÷ 5 = 6";
  if (solved.subskill === "combine_like_terms") return "Solve: 2x + 3x + 4 = 19";
  if (solved.subskill === "distributive_property") return "Solve: 2(x + 3) = 14";
  if (solved.subskill === "variables_both_sides") return "Solve: 2x + 5 = x + 12";
  return "What is the next correct step?";
}

function buildMicroPracticeAnswer(solved) {
  if (solved.subskill === "one_step_addition") return "x = 7";
  if (solved.subskill === "one_step_subtraction") return "x = 17";
  if (solved.subskill === "one_step_multiplication") return "x = 6";
  if (solved.subskill === "one_step_division") return "x = 30";
  if (solved.subskill === "combine_like_terms") return "x = 3";
  if (solved.subskill === "distributive_property") return "x = 4";
  if (solved.subskill === "variables_both_sides") return "x = 7";
  return "Use the next correct step";
}

function buildMicroPracticeChoices(solved) {
  const answer = buildMicroPracticeAnswer(solved);
  const match = String(answer).match(/^([a-z])\s*=\s*(-?\d+(?:\.\d+)?)$/i);

  if (!match) {
    return [answer, "Guess", "Skip", "Change the problem"];
  }

  const variable = match[1];
  const value = Number(match[2]);

  return [
    `${variable} = ${formatNumber(value)}`,
    `${variable} = ${formatNumber(value + 1)}`,
    `${variable} = ${formatNumber(value - 1)}`,
    `${variable} = ${formatNumber(-value)}`
  ];
}

function buildSecondPractice(solved) {

  if (solved.subskill === "one_step_addition") {
    return {
      prompt: "Solve: x + 8 = 20",
      answer: "x = 12",
      choices: ["x = 12", "x = 28", "x = 8", "x = 20"]
    };
  }

  if (solved.subskill === "one_step_subtraction") {
    return {
      prompt: "Solve: x − 8 = 20",
      answer: "x = 28",
      choices: ["x = 28", "x = 12", "x = 8", "x = 20"]
    };
  }

  if (solved.subskill === "one_step_multiplication") {
    return {
      prompt: "Solve: 3x = 21",
      answer: "x = 7",
      choices: ["x = 7", "x = 18", "x = 24", "x = 3"]
    };
  }

  if (solved.subskill === "one_step_division") {
    return {
      prompt: "Solve: x ÷ 4 = 7",
      answer: "x = 28",
      choices: ["x = 28", "x = 11", "x = 4", "x = 7"]
    };
  }

  if (solved.subskill === "combine_like_terms") {
    return {
      prompt: "Solve: 4x + x + 6 = 21",
      answer: "x = 3",
      choices: ["x = 3", "x = 5", "x = 15", "x = 21"]
    };
  }

  if (solved.subskill === "distributive_property") {
    return {
      prompt: "Solve: 3(x + 2) = 18",
      answer: "x = 4",
      choices: ["x = 4", "x = 6", "x = 12", "x = 3"]
    };
  }

  if (solved.subskill === "variables_both_sides") {
    return {
      prompt: "Solve: 2x + 5 = x + 12",
      answer: "x = 7",
      choices: ["x = 7", "x = 5", "x = 12", "x = 2"]
    };
  }

  // Generic fallback
  return {
    prompt: buildMicroPracticePrompt(solved),
    answer: buildMicroPracticeAnswer(solved),
    choices: buildMicroPracticeChoices(solved)
  };
}

/* =========================================================
   HELPERS
========================================================= */

function getQuestionText(question) {
  if (typeof question === "string") return question;

  return (
    question?.prompt ||
    question?.question ||
    question?.text ||
    question?.equation ||
    ""
  );
}
function generateDynamicRecoveryPractice(solved, count = 2) {
  const items = [];
  const used = new Set([
    normalizePracticeKey(solved?.equationBefore || "")
  ]);

  let safety = 0;

  while (items.length < count && safety < 100) {
    safety++;

    const item = generateOnePracticeItem(solved);

    if (!item) continue;

    const key = normalizePracticeKey(item.prompt);

    if (used.has(key)) continue;

    used.add(key);
    items.push(item);
  }

  return items.length ? items : [
    {
      prompt: buildMicroPracticePrompt(solved),
      answer: buildMicroPracticeAnswer(solved),
      choices: buildMicroPracticeChoices(solved)
    }
  ];
}

function generateOnePracticeItem(solved) {
  const subskill = solved?.subskill || "";

  if (subskill === "one_step_addition") {
    const x = randInt(2, 15);
    const n = randInt(2, 12);
    const right = x + n;

    return makePracticeItem(
      `Solve: x + ${n} = ${right}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "one_step_subtraction") {
    const x = randInt(8, 25);
    const n = randInt(2, 12);
    const right = x - n;

    return makePracticeItem(
      `Solve: x − ${n} = ${right}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "one_step_multiplication") {
    const x = randInt(2, 12);
    const n = randInt(2, 9);
    const right = x * n;

    return makePracticeItem(
      `Solve: ${n}x = ${right}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "one_step_division") {
    const x = randInt(2, 12);
    const n = randInt(2, 9);
    const right = x / n;

    return makePracticeItem(
      `Solve: x ÷ ${n} = ${formatNumber(right)}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "combine_like_terms") {
    const x = randInt(2, 10);
    const a = randInt(2, 6);
    const b = randInt(1, 5);
    const c = randInt(2, 10);
    const right = (a + b) * x + c;

    return makePracticeItem(
      `Solve: ${a}x + ${b}x + ${c} = ${right}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "distributive_property") {
    const x = randInt(2, 10);
    const a = randInt(2, 6);
    const b = randInt(1, 8);
    const right = a * (x + b);

    return makePracticeItem(
      `Solve: ${a}(x + ${b}) = ${right}`,
      `x = ${x}`,
      x
    );
  }

  if (subskill === "variables_both_sides") {
    const x = randInt(2, 10);
    const rightCoeff = randInt(1, 5);
    const leftCoeff = rightCoeff + randInt(1, 5);
    const leftConst = randInt(1, 10);
    const rightConst = (leftCoeff - rightCoeff) * x + leftConst;

    return makePracticeItem(
      `Solve: ${leftCoeff}x + ${leftConst} = ${rightCoeff}x + ${rightConst}`,
      `x = ${x}`,
      x
    );
  }

  return null;
}

function makePracticeItem(prompt, answer, xValue) {
  return {
    prompt,
    answer,
    choices: buildValueChoices(xValue)
  };
}

function buildValueChoices(value) {
  const choices = [
    value,
    value + 1,
    value - 1,
    -value,
    value + 2,
    value - 2
  ];

  const unique = [];
  const used = new Set();

  for (const n of choices) {
    if (!Number.isFinite(n)) continue;
    const key = String(n);
    if (used.has(key)) continue;
    used.add(key);
    unique.push(`x = ${formatNumber(n)}`);
    if (unique.length === 4) break;
  }

  while (unique.length < 4) {
    const extra = randInt(-20, 20);
    const key = String(extra);
    if (used.has(key)) continue;
    used.add(key);
    unique.push(`x = ${formatNumber(extra)}`);
  }

  return unique;
}

function normalizePracticeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAlignedQuestionForNarrator(problemType, currentQuestion = null) {
  const requested = normalizeKey(problemType);
  const text = getQuestionText(currentQuestion);
  const currentSolved = solveQuestion({
    ...(currentQuestion || {}),
    problemType: currentQuestion?.problemType || problemType
  });

  if (currentSolved?.solved && isSolvedStructureCompatible(problemType, currentSolved)) {
    return currentQuestion;
  }

  if (requested.includes("multi_step") || requested.includes("combine_like")) {
    return {
      prompt: "Solve for x: 3x + 2x + 4 = 19",
      answer: "x = 3",
      problemType: requested.includes("combine_like")
        ? "combine_like_terms_equation"
        : "multi_step_equation",
      source: "teacher_narrator_aligned_question"
    };
  }

  if (requested.includes("distributive")) {
    return {
      prompt: "Solve for x: 2(x + 3) = 14",
      answer: "x = 4",
      problemType: "distributive_property_equation",
      source: "teacher_narrator_aligned_question"
    };
  }

  if (requested.includes("variables_both_sides")) {
    return {
      prompt: "Solve for x: 2x + 5 = x + 12",
      answer: "x = 7",
      problemType: "variables_both_sides",
      source: "teacher_narrator_aligned_question"
    };
  }

  return currentQuestion;
}
function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function isSolvedStructureCompatible(problemType, solved) {
  const requested = normalizeKey(problemType);
  const subskill = normalizeKey(solved?.subskill || "");

  if (requested.includes("multi_step")) {
    return (
      subskill === "combine_like_terms" ||
      subskill === "distributive_property"
    );
  }

  if (requested.includes("combine_like")) {
    return subskill === "combine_like_terms";
  }

  if (requested.includes("distributive")) {
    return subskill === "distributive_property";
  }

  if (requested.includes("variables_both_sides")) {
    return subskill === "variables_both_sides";
  }

  if (requested.includes("one_step")) {
    return subskill.startsWith("one_step");
  }

  return true;
}
window.AlgebraTeacherNarratorEngine = {
  buildNarratedRecoveryLesson
};
