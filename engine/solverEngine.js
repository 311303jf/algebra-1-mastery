/*
==================================================
 Algebra OS — Solver Engine
 Version: 3500

 Purpose:
 - Produce real mathematical solution steps.
 - Use currentQuestion.problemType and prompt.
 - Feed Teacher Narrator V3500.
 - No lesson-by-lesson hardcoding.
==================================================
*/

export function solveQuestion(question = {}) {
  const problemType = normalizeKey(question.problemType || question.type || "");
  const prompt = getQuestionText(question);
  const answer = question.answer || question.correctAnswer || "";
  const equation = extractEquation(prompt);

  const oneStep = solveOneStepEquation(equation, answer, problemType);
  if (oneStep) return oneStep;

  const multiStep = solveMultiStepEquation(equation, answer, problemType);
  if (multiStep) return multiStep;

  const variablesBothSides = solveVariablesBothSides(equation, answer, problemType);
  if (variablesBothSides) return variablesBothSides;

  return {
    solved: false,
    problemType,
    prompt,
    equation,
    answer,
    family: "unknown",
    strategy: "unsupported",
    steps: [],
    teacherNotes: [
      "The solver does not yet support this exact structure.",
      "The recovery system should fall back to the existing practical tutor."
    ]
  };
}

/* =========================================================
   ONE-STEP EQUATIONS
========================================================= */

function solveOneStepEquation(equation, answer, problemType) {
  if (!equation) return null;

  const compact = normalizeEquation(equation);
  let match;

  match = compact.match(/^([a-z])\+(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const n = Number(match[2]);
    const right = Number(match[3]);
    const solution = right - n;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "inverse_operation",
      subskill: "one_step_addition",
      equationBefore: `${variable} + ${n} = ${right}`,
      answer: `${variable} = ${formatNumber(solution)}`,
      steps: [
        step("read", `${variable} + ${n} = ${right}`, `The number ${n} is being added to ${variable}.`),
        step("undo", `${variable} + ${n} − ${n} = ${right} − ${n}`, `Subtract ${n} from both sides because subtraction undoes addition.`),
        step("simplify", `${variable} = ${formatNumber(solution)}`, `${right} − ${n} = ${formatNumber(solution)}.`)
      ],
      checkQuestion: `What operation undoes addition by ${n}?`,
      checkAnswer: "Subtraction"
    });
  }

  match = compact.match(/^([a-z])-(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const n = Number(match[2]);
    const right = Number(match[3]);
    const solution = right + n;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "inverse_operation",
      subskill: "one_step_subtraction",
      equationBefore: `${variable} − ${n} = ${right}`,
      answer: `${variable} = ${formatNumber(solution)}`,
      steps: [
        step("read", `${variable} − ${n} = ${right}`, `The number ${n} is being subtracted from ${variable}.`),
        step("undo", `${variable} − ${n} + ${n} = ${right} + ${n}`, `Add ${n} to both sides because addition undoes subtraction.`),
        step("simplify", `${variable} = ${formatNumber(solution)}`, `${right} + ${n} = ${formatNumber(solution)}.`)
      ],
      checkQuestion: `What operation undoes subtraction by ${n}?`,
      checkAnswer: "Addition"
    });
  }

  match = compact.match(/^(-?\d+)\*?([a-z])=(-?\d+)$/i);
  if (match) {
    const n = Number(match[1]);
    const variable = match[2];
    const right = Number(match[3]);
    const solution = right / n;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "inverse_operation",
      subskill: "one_step_multiplication",
      equationBefore: `${n}${variable} = ${right}`,
      answer: `${variable} = ${formatNumber(solution)}`,
      steps: [
        step("read", `${n}${variable} = ${right}`, `The number ${n} is multiplying ${variable}.`),
        step("undo", `${n}${variable} ÷ ${n} = ${right} ÷ ${n}`, `Divide both sides by ${n} because division undoes multiplication.`),
        step("simplify", `${variable} = ${formatNumber(solution)}`, `${right} ÷ ${n} = ${formatNumber(solution)}.`)
      ],
      checkQuestion: `What operation undoes multiplication by ${n}?`,
      checkAnswer: "Division"
    });
  }

  match = compact.match(/^([a-z])\/(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const n = Number(match[2]);
    const right = Number(match[3]);
    const solution = right * n;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "inverse_operation",
      subskill: "one_step_division",
      equationBefore: `${variable} ÷ ${n} = ${right}`,
      answer: `${variable} = ${formatNumber(solution)}`,
      steps: [
        step("read", `${variable} ÷ ${n} = ${right}`, `${variable} is being divided by ${n}.`),
        step("undo", `${variable} ÷ ${n} × ${n} = ${right} × ${n}`, `Multiply both sides by ${n} because multiplication undoes division.`),
        step("simplify", `${variable} = ${formatNumber(solution)}`, `${right} × ${n} = ${formatNumber(solution)}.`)
      ],
      checkQuestion: `What operation undoes division by ${n}?`,
      checkAnswer: "Multiplication"
    });
  }

  return null;
}

/* =========================================================
   MULTI-STEP EQUATIONS
========================================================= */

function solveMultiStepEquation(equation, answer, problemType) {
  if (!equation) return null;

  const compact = normalizeEquation(equation);
  let match;

  match = compact.match(/^(-?\d*)x([+\-]-?\d+)([+\-]-?\d*)x=(-?\d+)$/i);
  if (match) {
    const a = coefficientValue(match[1]);
    const b = Number(match[2]);
    const c = coefficientValue(match[3]);
    const right = Number(match[4]);
    const combined = a + c;
    if (combined === 0) return null;

    const afterCombine = `${formatCoefficient(combined)}x ${signedNumber(b)} = ${right}`;
    const afterConstant = `${formatCoefficient(combined)}x = ${formatNumber(right - b)}`;
    const solution = (right - b) / combined;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "simplify_then_solve",
      subskill: "combine_like_terms",
      equationBefore: normalizeDisplayEquation(equation),
      answer: `x = ${formatNumber(solution)}`,
      steps: [
        step("read", normalizeDisplayEquation(equation), `${formatCoefficient(a)}x and ${formatCoefficient(c)}x are like terms because both contain x.`),
        step("combine", afterCombine, `Combine like terms: ${formatCoefficient(a)}x + ${formatCoefficient(c)}x = ${formatCoefficient(combined)}x.`),
        step("move_constant", afterConstant, `Move the constant by using the inverse operation.`),
        step("divide", `x = ${formatNumber(solution)}`, `Divide by ${formatNumber(combined)} to isolate x.`)
      ],
      checkQuestion: "What must be done before solving this equation?",
      checkAnswer: "Combine like terms"
    });
  }

  match = compact.match(/^(-?\d+)\(([a-z])([+\-]-?\d+)\)=(-?\d+)$/i);
  if (match) {
    const a = Number(match[1]);
    const variable = match[2];
    const b = Number(match[3]);
    const right = Number(match[4]);
    const distributedConstant = a * b;
    const afterDistribute = `${formatCoefficient(a)}${variable} ${signedNumber(distributedConstant)} = ${right}`;
    const afterConstant = `${formatCoefficient(a)}${variable} = ${formatNumber(right - distributedConstant)}`;
    const solution = (right - distributedConstant) / a;

    return buildSolvedLesson({
      problemType,
      family: "linear_equation",
      strategy: "simplify_then_solve",
      subskill: "distributive_property",
      equationBefore: normalizeDisplayEquation(equation),
      answer: `${variable} = ${formatNumber(solution)}`,
      steps: [
        step("read", normalizeDisplayEquation(equation), `There are parentheses, so we cannot solve directly yet.`),
        step("distribute", afterDistribute, `Distribute ${a} to each term inside the parentheses.`),
        step("move_constant", afterConstant, `Move the constant by using the inverse operation.`),
        step("divide", `${variable} = ${formatNumber(solution)}`, `Divide by ${a} to isolate ${variable}.`)
      ],
      checkQuestion: "What should be done first when an equation has parentheses?",
      checkAnswer: "Use the distributive property"
    });
  }

  return null;
}

/* =========================================================
   VARIABLES BOTH SIDES
========================================================= */

function solveVariablesBothSides(equation, answer, problemType) {
  if (!equation) return null;

  const compact = normalizeEquation(equation);
  const match = compact.match(/^(-?\d*)x([+\-]-?\d+)=(-?\d*)x([+\-]-?\d+)$/i);
  if (!match) return null;

  const leftCoeff = coefficientValue(match[1]);
  const leftConst = Number(match[2]);
  const rightCoeff = coefficientValue(match[3]);
  const rightConst = Number(match[4]);

  const newCoeff = leftCoeff - rightCoeff;
  if (newCoeff === 0) return null;

  const afterVariables = `${formatCoefficient(newCoeff)}x ${signedNumber(leftConst)} = ${rightConst}`;
  const afterConstant = `${formatCoefficient(newCoeff)}x = ${formatNumber(rightConst - leftConst)}`;
  const solution = (rightConst - leftConst) / newCoeff;

  return buildSolvedLesson({
    problemType,
    family: "linear_equation",
    strategy: "move_variables_first",
    subskill: "variables_both_sides",
    equationBefore: normalizeDisplayEquation(equation),
    answer: `x = ${formatNumber(solution)}`,
    steps: [
      step("read", normalizeDisplayEquation(equation), "There are variable terms on both sides of the equation."),
      step("move_variables", afterVariables, "Move variable terms to one side first."),
      step("move_constant", afterConstant, "Then move constants to the other side."),
      step("divide", `x = ${formatNumber(solution)}`, `Divide by ${formatNumber(newCoeff)} to isolate x.`)
    ],
    checkQuestion: "What should be moved first when variables are on both sides?",
    checkAnswer: "Move variable terms"
  });
}

/* =========================================================
   BUILDERS
========================================================= */

function buildSolvedLesson(data) {
  return {
    solved: true,
    problemType: data.problemType,
    family: data.family,
    strategy: data.strategy,
    subskill: data.subskill,
    equationBefore: data.equationBefore,
    answer: data.answer,
    steps: data.steps,
    checkQuestion: data.checkQuestion,
    checkAnswer: data.checkAnswer
  };
}

function step(id, expression, explanation) {
  return { id, expression, explanation };
}

/* =========================================================
   EXTRACTION
========================================================= */

function getQuestionText(question) {
  if (typeof question === "string") return question;
  return question?.prompt || question?.question || question?.text || question?.equation || "";
}

function extractEquation(text) {
  const source = String(text || "")
    .replace(/Solve\s+for\s+x\.?/i, "")
    .replace(/Solve:/i, "")
    .trim();

  const patterns = [
    /-?\d+\s*\(\s*[a-z]\s*[+\-−]\s*-?\d+\s*\)\s*=\s*-?\d+/i,
    /-?\d*\s*[a-z]\s*[+\-−]\s*-?\d+\s*[+\-−]\s*-?\d*\s*[a-z]\s*=\s*-?\d+/i,
    /-?\d*\s*[a-z]\s*[+\-−]\s*-?\d+\s*=\s*-?\d*\s*[a-z]\s*[+\-−]\s*-?\d+/i,
    /[a-z]\s*\+\s*-?\d+\s*=\s*-?\d+/i,
    /[a-z]\s*[-−]\s*-?\d+\s*=\s*-?\d+/i,
    /-?\d+\s*[×*]?\s*[a-z]\s*=\s*-?\d+/i,
    /[a-z]\s*[÷/]\s*-?\d+\s*=\s*-?\d+/i,
    /[^=]+=[^=]+/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[0].trim();
  }

  return "";
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function normalizeEquation(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
}

function normalizeDisplayEquation(value) {
  return String(value || "")
    .replace(/-/g, "−")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\s+/g, " ")
    .trim();
}

function coefficientValue(raw) {
  if (raw === "" || raw === "+" || raw === undefined) return 1;
  if (raw === "-") return -1;
  return Number(raw);
}

function formatCoefficient(value) {
  if (value === 1) return "";
  if (value === -1) return "−";
  return String(value).replace("-", "−");
}

function signedNumber(value) {
  if (value < 0) return `− ${Math.abs(value)}`;
  return `+ ${value}`;
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

window.AlgebraSolverEngine = {
  solveQuestion
};
