/* ============================================================
   Algebra OS — Question Factory 2.0
   File: engine/questionFactory.js

   PURPOSE:
   - Dynamic question generation from curriculum/algebra1.json
   - NO hardcoded lessons
   - Every question returns:
     {
       id, prompt, choices, answer,
       problemType, difficulty,
       hintSteps, solutionSteps, misconception
     }

   IMPORTANT:
   - lesson.html should pass lesson.problemTypes or allowedProblemTypes
   - This factory does NOT depend on lesson numbers like 1.1, 1.2, 1.3
   ============================================================ */


/* ============================================================
   PUBLIC API
   ============================================================ */

export function generateQuestionForLesson(lesson, options = {}) {
  const problemTypes =
    lesson.problemTypes ||
    lesson.allowedProblemTypes ||
    lesson.problem_types ||
    [];

  if (!Array.isArray(problemTypes) || problemTypes.length === 0) {
    throw new Error(
      "QuestionFactory 2.0: This lesson has no problemTypes/allowedProblemTypes in algebra1.json"
    );
  }

  const difficulty = Number(options.difficulty || lesson.difficulty || 1);

  const availableTypes = problemTypes.filter(type => GENERATORS[type]);

  if (availableTypes.length === 0) {
    throw new Error(
      "QuestionFactory 2.0: No supported generators found for this lesson. Add generators for: " +
      problemTypes.join(", ")
    );
  }

  const type = pickRandom(availableTypes);
  const question = GENERATORS[type](difficulty);

  return normalizeQuestion(question, type, difficulty);
}


export function generateQuestionsForLesson(lesson, count = 10, options = {}) {
  const questions = [];
  const seenPrompts = new Set();

  let safety = 0;

  while (questions.length < count && safety < count * 50) {
    safety++;

    const q = generateQuestionForLesson(lesson, options);

    if (seenPrompts.has(q.prompt)) continue;
    if (!isQualityQuestion(q)) continue;

    seenPrompts.add(q.prompt);
    questions.push(q);
  }

  if (questions.length < count) {
    throw new Error(
      "QuestionFactory 2.0: Could not generate enough unique quality questions. Generated " +
      questions.length +
      " of " +
      count +
      ". Add more variation to the relevant generators."
    );
  }

  return questions;
}


/* ============================================================
   GENERATOR REGISTRY
   Add new problem types here.
   These names must match algebra1.json problemTypes.
   ============================================================ */

const GENERATORS = {
  one_step_equation: generateOneStepEquation,
  one_step_addition_equation: generateOneStepEquation,
  one_step_subtraction_equation: generateOneStepEquation,
  one_step_multiplication_equation: generateOneStepEquation,
  one_step_division_equation: generateOneStepEquation,

  two_step_equation: generateTwoStepEquation,
  multi_step_equation: generateMultiStepEquation,
  variables_both_sides: generateVariablesBothSides,
  distributive_property: generateDistributivePropertyEquation,
  combine_like_terms: generateCombineLikeTermsEquation,

  inequality: generateOneStepInequality,
  inequalities: generateOneStepInequality,
  multi_step_inequality: generateMultiStepInequality,
  multi_step_inequalities: generateMultiStepInequality,

  function_evaluation: generateFunctionEvaluation,
  functions: generateFunctionEvaluation,

  slope: generateSlope,
  slope_intercept: generateSlopeIntercept,

  systems: generateSystems,
  scatter_plots: generateScatterPlot,
  exponent_rules: generateExponentRules,
  factoring: generateFactoring,
  quadratics: generateQuadraticRoots
};


/* ============================================================
   QUESTION METADATA
   Reusable instructional language for Help Panel.
   ============================================================ */

const METADATA = {
  one_step_equation: {
    hintSteps: [
      "Identify the operation being done to the variable.",
      "Use the inverse operation on both sides.",
      "Check that the variable is isolated."
    ],
    misconception:
      "Students often use the same operation instead of the inverse operation."
  },

  two_step_equation: {
    hintSteps: [
      "Undo addition or subtraction first.",
      "Then undo multiplication or division.",
      "Keep the equation balanced by doing the same operation to both sides."
    ],
    misconception:
      "Students often reverse the order of inverse operations."
  },

  multi_step_equation: {
    hintSteps: [
      "Simplify both sides if needed.",
      "Move constants away from the variable term.",
      "Divide by the coefficient of the variable."
    ],
    misconception:
      "Students often skip the simplification step before solving."
    },

  variables_both_sides: {
    hintSteps: [
      "Move all variable terms to one side.",
      "Move all constants to the other side.",
      "Divide by the remaining coefficient."
    ],
    misconception:
      "Students often move constants before combining variable terms, which can cause sign errors."
  },

  distributive_property: {
    hintSteps: [
      "Distribute the number outside the parentheses.",
      "Combine like terms if needed.",
      "Use inverse operations to isolate the variable."
    ],
    misconception:
      "Students often distribute to the first term only and forget the second term."
  },

  combine_like_terms: {
    hintSteps: [
      "Combine variable terms with variable terms.",
      "Combine constants with constants.",
      "Then solve the simplified equation."
    ],
    misconception:
      "Students often combine unlike terms, such as variable terms and constants."
  },

  inequalities: {
    hintSteps: [
      "Solve the inequality like an equation.",
      "Use inverse operations on both sides.",
      "If you multiply or divide by a negative number, reverse the inequality symbol."
    ],
    misconception:
      "Students often forget to reverse the inequality symbol when multiplying or dividing by a negative number."
  },

  functions: {
    hintSteps: [
      "Replace the input variable with the given value.",
      "Simplify using the order of operations.",
      "The final value is the output."
    ],
    misconception:
      "Students often confuse the input value with the output value."
  },

  slope: {
    hintSteps: [
      "Use the slope formula.",
      "Subtract the y-values.",
      "Subtract the x-values in the same order.",
      "Simplify the ratio."
    ],
    misconception:
      "Students often subtract coordinates in different orders, which changes the sign of the slope."
  },

  slope_intercept: {
    hintSteps: [
      "Identify the slope m.",
      "Identify the y-intercept b.",
      "Write the equation in the form y = mx + b."
    ],
    misconception:
      "Students often confuse the slope with the y-intercept."
  },

  systems: {
    hintSteps: [
      "Look for a variable that can be eliminated or substituted.",
      "Solve for one variable.",
      "Substitute that value to find the other variable."
    ],
    misconception:
      "Students often solve for only one variable and forget that the solution is an ordered pair."
  },

  scatter_plots: {
    hintSteps: [
      "Look at the overall direction of the data.",
      "Decide whether the association is positive, negative, or no association.",
      "Use the pattern of points to interpret the relationship."
    ],
    misconception:
      "Students often focus on one point instead of the overall trend."
  },

  exponent_rules: {
    hintSteps: [
      "Identify whether the expression uses multiplication, division, or a power of a power.",
      "Apply the matching exponent rule.",
      "Simplify the exponent."
    ],
    misconception:
      "Students often multiply exponents when they should add them, or add when they should multiply."
  },

  factoring: {
    hintSteps: [
      "Look for the greatest common factor first.",
      "For trinomials, find two numbers that multiply to c and add to b.",
      "Write the expression as a product of factors."
    ],
    misconception:
      "Students often choose factors that multiply correctly but do not add to the middle coefficient."
  },

  quadratics: {
    hintSteps: [
      "Set the quadratic equal to zero.",
      "Factor if possible.",
      "Use the zero product property to solve."
    ],
    misconception:
      "Students often factor correctly but forget to set each factor equal to zero."
  }
};


/* ============================================================
   GENERATORS — EQUATIONS
   ============================================================ */

function generateOneStepEquation(difficulty = 1) {
  const x = randInt(-10, 10, [0]);
  const a = randInt(2, 12);
  const useAdd = Math.random() < 0.5;

  let prompt;
  let solutionSteps;

  if (useAdd) {
    const b = randInt(-15, 15, [0]);
    const result = x + b;

    prompt = `Solve for x: x ${formatSigned(b)} = ${result}`;
    solutionSteps = [
      `Original equation: x ${formatSigned(b)} = ${result}`,
      `Use the inverse operation of ${formatSigned(b)}.`,
      `x = ${result - b}`
    ];
  } else {
    const result = a * x;

    prompt = `Solve for x: ${a}x = ${result}`;
    solutionSteps = [
      `Original equation: ${a}x = ${result}`,
      `Divide both sides by ${a}.`,
      `x = ${x}`
    ];
  }

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "one_step_equation",
    difficulty,
    solutionSteps
  });
}


function generateTwoStepEquation(difficulty = 1) {
  const x = randInt(-8, 8, [0]);
  const a = randInt(2, 9);
  const b = randInt(-12, 12, [0]);
  const result = a * x + b;

  const prompt = `Solve for x: ${a}x ${formatSigned(b)} = ${result}`;

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "two_step_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${a}x ${formatSigned(b)} = ${result}`,
      `Subtract ${b} from both sides.`,
      `${a}x = ${result - b}`,
      `Divide both sides by ${a}.`,
      `x = ${x}`
    ]
  });
}


function generateMultiStepEquation(difficulty = 1) {
  const x = randInt(-8, 8, [0]);
  const a = randInt(2, 7);
  const b = randInt(-10, 10, [0]);
  const c = randInt(-8, 8, [0]);
  const result = a * x + b + c;

  const prompt = `Solve for x: ${a}x ${formatSigned(b)} ${formatSigned(c)} = ${result}`;

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "multi_step_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${a}x ${formatSigned(b)} ${formatSigned(c)} = ${result}`,
      `Combine constants: ${b} ${formatSigned(c)} = ${b + c}`,
      `${a}x ${formatSigned(b + c)} = ${result}`,
      `Subtract ${b + c} from both sides.`,
      `${a}x = ${result - (b + c)}`,
      `Divide both sides by ${a}.`,
      `x = ${x}`
    ]
  });
}


function generateVariablesBothSides(difficulty = 1) {
  const x = randInt(-8, 8, [0]);
  const a = randInt(4, 10);
  const c = randInt(1, a - 1);
  const b = randInt(-12, 12, [0]);
  const d = a * x + b - c * x;

  const prompt = `Solve for x: ${a}x ${formatSigned(b)} = ${c}x ${formatSigned(d)}`;

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "variables_both_sides",
    difficulty,
    solutionSteps: [
      `Original equation: ${a}x ${formatSigned(b)} = ${c}x ${formatSigned(d)}`,
      `Subtract ${c}x from both sides.`,
      `${a - c}x ${formatSigned(b)} = ${d}`,
      `Subtract ${b} from both sides.`,
      `${a - c}x = ${d - b}`,
      `Divide both sides by ${a - c}.`,
      `x = ${x}`
    ]
  });
}


function generateDistributivePropertyEquation(difficulty = 1) {
  const x = randInt(-6, 6, [0]);
  const a = randInt(2, 6);
  const b = randInt(-8, 8, [0]);
  const c = randInt(-10, 10, [0]);
  const result = a * (x + b) + c;

  const prompt = `Solve for x: ${a}(x ${formatSigned(b)}) ${formatSigned(c)} = ${result}`;

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "distributive_property",
    difficulty,
    solutionSteps: [
      `Original equation: ${a}(x ${formatSigned(b)}) ${formatSigned(c)} = ${result}`,
      `Distribute ${a}: ${a}x ${formatSigned(a * b)} ${formatSigned(c)} = ${result}`,
      `Combine constants: ${a}x ${formatSigned(a * b + c)} = ${result}`,
      `Subtract ${a * b + c} from both sides.`,
      `${a}x = ${result - (a * b + c)}`,
      `Divide both sides by ${a}.`,
      `x = ${x}`
    ]
  });
}


function generateCombineLikeTermsEquation(difficulty = 1) {
  const x = randInt(-7, 7, [0]);
  const a = randInt(2, 8);
  const b = randInt(1, 7);
  const c = randInt(-10, 10, [0]);
  const result = (a + b) * x + c;

  const prompt = `Solve for x: ${a}x + ${b}x ${formatSigned(c)} = ${result}`;

  return buildQuestion({
    prompt,
    answer: `x = ${x}`,
    problemType: "combine_like_terms",
    difficulty,
    solutionSteps: [
      `Original equation: ${a}x + ${b}x ${formatSigned(c)} = ${result}`,
      `Combine like terms: ${a}x + ${b}x = ${a + b}x`,
      `${a + b}x ${formatSigned(c)} = ${result}`,
      `Subtract ${c} from both sides.`,
      `${a + b}x = ${result - c}`,
      `Divide both sides by ${a + b}.`,
      `x = ${x}`
    ]
  });
}


/* ============================================================
   GENERATORS — INEQUALITIES
   ============================================================ */

function generateOneStepInequality(difficulty = 1) {
  const x = randInt(-10, 10, [0]);
  const a = randInt(2, 8);
  const symbol = pickRandom([">", "<", "≥", "≤"]);
  const result = a * x;

  const prompt = `Solve the inequality: ${a}x ${symbol} ${result}`;

  return buildQuestion({
    prompt,
    answer: `x ${symbol} ${x}`,
    problemType: "inequalities",
    difficulty,
    solutionSteps: [
      `Original inequality: ${a}x ${symbol} ${result}`,
      `Divide both sides by ${a}.`,
      `Because ${a} is positive, keep the inequality symbol the same.`,
      `x ${symbol} ${x}`
    ]
  });
}


function generateMultiStepInequality(difficulty = 1) {
  const x = randInt(-8, 8, [0]);
  const a = randInt(2, 7);
  const b = randInt(-10, 10, [0]);
  const symbol = pickRandom([">", "<", "≥", "≤"]);
  const result = a * x + b;

  const prompt = `Solve the inequality: ${a}x ${formatSigned(b)} ${symbol} ${result}`;

  return buildQuestion({
    prompt,
    answer: `x ${symbol} ${x}`,
    problemType: "inequalities",
    difficulty,
    solutionSteps: [
      `Original inequality: ${a}x ${formatSigned(b)} ${symbol} ${result}`,
      `Subtract ${b} from both sides.`,
      `${a}x ${symbol} ${result - b}`,
      `Divide both sides by ${a}.`,
      `x ${symbol} ${x}`
    ]
  });
}


/* ============================================================
   GENERATORS — FUNCTIONS, SLOPE, SYSTEMS
   ============================================================ */

function generateFunctionEvaluation(difficulty = 1) {
  const m = randInt(-5, 5, [0]);
  const b = randInt(-10, 10);
  const x = randInt(-6, 6);
  const y = m * x + b;

  const prompt = `If f(x) = ${m}x ${formatSigned(b)}, find f(${x}).`;

  return buildQuestion({
    prompt,
    answer: `${y}`,
    problemType: "functions",
    difficulty,
    solutionSteps: [
      `Replace x with ${x}.`,
      `f(${x}) = ${m}(${x}) ${formatSigned(b)}`,
      `f(${x}) = ${m * x} ${formatSigned(b)}`,
      `f(${x}) = ${y}`
    ]
  });
}


function generateSlope(difficulty = 1) {
  let x1 = randInt(-8, 8);
  let x2 = randInt(-8, 8, [x1]);
  let y1 = randInt(-8, 8);
  let slope = randInt(-5, 5, [0]);
  let y2 = y1 + slope * (x2 - x1);

  const prompt = `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`;

  return buildQuestion({
    prompt,
    answer: `${slope}`,
    problemType: "slope",
    difficulty,
    solutionSteps: [
      `Use slope = (y₂ - y₁) ÷ (x₂ - x₁).`,
      `slope = (${y2} - ${y1}) ÷ (${x2} - ${x1})`,
      `slope = ${y2 - y1} ÷ ${x2 - x1}`,
      `slope = ${slope}`
    ]
  });
}


function generateSlopeIntercept(difficulty = 1) {
  const m = randInt(-6, 6, [0]);
  const b = randInt(-10, 10);

  const prompt = `Write the equation of a line with slope ${m} and y-intercept ${b}.`;

  return buildQuestion({
    prompt,
    answer: `y = ${m}x ${formatSigned(b)}`,
    problemType: "slope_intercept",
    difficulty,
    solutionSteps: [
      `Slope-intercept form is y = mx + b.`,
      `m = ${m}`,
      `b = ${b}`,
      `Substitute into y = mx + b.`,
      `y = ${m}x ${formatSigned(b)}`
    ]
  });
}


function generateSystems(difficulty = 1) {
  const x = randInt(-5, 5, [0]);
  const y = randInt(-5, 5, [0]);

  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 5);
  const d = randInt(1, 5);

  const r1 = a * x + b * y;
  const r2 = c * x + d * y;

  const prompt =
    `Solve the system: ${a}x + ${b}y = ${r1}; ${c}x + ${d}y = ${r2}`;

  return buildQuestion({
    prompt,
    answer: `(${x}, ${y})`,
    problemType: "systems",
    difficulty,
    solutionSteps: [
      `The solution is the ordered pair that satisfies both equations.`,
      `Test x = ${x} and y = ${y}.`,
      `${a}(${x}) + ${b}(${y}) = ${r1}`,
      `${c}(${x}) + ${d}(${y}) = ${r2}`,
      `Both equations are true, so the solution is (${x}, ${y}).`
    ]
  });
}


/* ============================================================
   GENERATORS — LATER CURRICULUM
   ============================================================ */

function generateScatterPlot(difficulty = 1) {
  const type = pickRandom(["positive association", "negative association", "no association"]);

  const prompt =
    `A scatter plot shows data points that generally form a ${type}. What type of association is shown?`;

  return buildQuestion({
    prompt,
    answer: type,
    problemType: "scatter_plots",
    difficulty,
    solutionSteps: [
      `Look at the overall direction of the points.`,
      `The data pattern shows ${type}.`,
      `Therefore, the association is ${type}.`
    ]
  });
}


function generateExponentRules(difficulty = 1) {
  const base = pickRandom(["x", "a", "m"]);
  const p = randInt(2, 6);
  const q = randInt(2, 6);
  const prompt = `Simplify: ${base}^${p} × ${base}^${q}`;

  return buildQuestion({
    prompt,
    answer: `${base}^${p + q}`,
    problemType: "exponent_rules",
    difficulty,
    solutionSteps: [
      `When multiplying powers with the same base, add the exponents.`,
      `${base}^${p} × ${base}^${q} = ${base}^(${p} + ${q})`,
      `${base}^${p + q}`
    ]
  });
}


function generateFactoring(difficulty = 1) {
  const r = randInt(1, 8);
  const s = randInt(1, 8);
  const b = r + s;
  const c = r * s;

  const prompt = `Factor: x² + ${b}x + ${c}`;

  return buildQuestion({
    prompt,
    answer: `(x + ${r})(x + ${s})`,
    problemType: "factoring",
    difficulty,
    solutionSteps: [
      `Find two numbers that multiply to ${c} and add to ${b}.`,
      `${r} × ${s} = ${c}`,
      `${r} + ${s} = ${b}`,
      `x² + ${b}x + ${c} = (x + ${r})(x + ${s})`
    ]
  });
}


function generateQuadraticRoots(difficulty = 1) {
  const r = randInt(-8, 8, [0]);
  const s = randInt(-8, 8, [0, r]);
  const b = -(r + s);
  const c = r * s;

  const prompt = `Solve: x² ${formatSigned(b)}x ${formatSigned(c)} = 0`;

  return buildQuestion({
    prompt,
    answer: `x = ${r}, x = ${s}`,
    problemType: "quadratics",
    difficulty,
    solutionSteps: [
      `Factor the quadratic.`,
      `x² ${formatSigned(b)}x ${formatSigned(c)} = (x ${formatSigned(-r)})(x ${formatSigned(-s)})`,
      `Set each factor equal to zero.`,
      `x ${formatSigned(-r)} = 0 or x ${formatSigned(-s)} = 0`,
      `x = ${r} or x = ${s}`
    ]
  });
}


/* ============================================================
   QUALITY CONTROL
   ============================================================ */

function buildQuestion({ prompt, answer, problemType, difficulty, solutionSteps }) {
  const meta = METADATA[problemType] || METADATA[normalizeMetaType(problemType)] || {};

  const choices = generateChoices(answer, problemType);

  return {
    id: createId(),
    prompt,
    choices,
    answer,
    problemType,
    difficulty,
    hintSteps: meta.hintSteps || [
      "Read the question carefully.",
      "Identify what the problem is asking.",
      "Use the correct algebraic procedure."
    ],
    solutionSteps: solutionSteps || [],
    misconception: meta.misconception || "Students often rush and skip the setup step."
  };
}


function normalizeQuestion(q, problemType, difficulty) {
  return {
    id: q.id || createId(),
    prompt: q.prompt,
    choices: q.choices,
    answer: q.answer,
    problemType: q.problemType || problemType,
    difficulty: q.difficulty || difficulty,
    hintSteps: Array.isArray(q.hintSteps) ? q.hintSteps : [],
    solutionSteps: Array.isArray(q.solutionSteps) ? q.solutionSteps : [],
    misconception: q.misconception || ""
  };
}


function isQualityQuestion(q) {
  if (!q) return false;
  if (!q.prompt || !q.answer) return false;
  if (!Array.isArray(q.choices)) return false;
  if (q.choices.length !== 4) return false;

  const uniqueChoices = new Set(q.choices);
  if (uniqueChoices.size !== q.choices.length) return false;

  if (!q.choices.includes(q.answer)) return false;

  if (!Array.isArray(q.hintSteps) || q.hintSteps.length === 0) return false;
  if (!Array.isArray(q.solutionSteps) || q.solutionSteps.length === 0) return false;
  if (!q.misconception || q.misconception.trim().length < 5) return false;

  return true;
}


function generateChoices(answer, problemType) {
  if (typeof answer !== "string") answer = String(answer);

  const distractors = new Set();

  if (answer.startsWith("x = ")) {
    const value = Number(answer.replace("x = ", ""));

    if (!Number.isNaN(value)) {
      const candidates = [
        value + 1,
        value - 1,
        -value,
        value + 2,
        value - 2,
        value + 3,
        value - 3
      ];

      candidates.forEach(n => {
        const choice = `x = ${n}`;
        if (choice !== answer) distractors.add(choice);
      });
    }
  } else if (!Number.isNaN(Number(answer))) {
    const value = Number(answer);

    [value + 1, value - 1, -value, value + 2, value - 2].forEach(n => {
      const choice = String(n);
      if (choice !== answer) distractors.add(choice);
    });
  } else {
    [
      "positive association",
      "negative association",
      "no association",
      "linear relationship",
      "No solution",
      "Infinitely many solutions"
    ].forEach(choice => {
      if (choice !== answer) distractors.add(choice);
    });
  }

  while (distractors.size < 3) {
    const randomChoice = `x = ${randInt(-12, 12)}`;
    if (randomChoice !== answer) distractors.add(randomChoice);
  }

  const finalChoices = [
    answer,
    ...shuffle(Array.from(distractors)).slice(0, 3)
  ];

  return shuffle(finalChoices);
}


/* ============================================================
   UTILITIES
   ============================================================ */

function randInt(min, max, exclude = []) {
  let n;
  let safety = 0;

  do {
    n = Math.floor(Math.random() * (max - min + 1)) + min;
    safety++;
  } while (exclude.includes(n) && safety < 100);

  return n;
}


function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}


function formatSigned(n) {
  if (n < 0) return `- ${Math.abs(n)}`;
  return `+ ${n}`;
}


function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "q_" + Math.random().toString(36).slice(2, 10);
}


function normalizeMetaType(type) {
  if (type === "multi_step_inequality") return "inequalities";
  if (type === "multi_step_inequalities") return "inequalities";
  if (type === "inequality") return "inequalities";
  if (type === "function_evaluation") return "functions";
  return type;
}


/* ============================================================
   OPTIONAL DEBUG TEST
   You can run this from browser console if imported:
   generateQuestionsForLesson({
     title: "Test Lesson",
     problemTypes: ["variables_both_sides"]
   }, 5)
   ============================================================ */
