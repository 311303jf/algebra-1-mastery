/* ============================================================
   Algebra OS — Question Factory 2.3
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
      "QuestionFactory 2.3: This lesson has no problemTypes/allowedProblemTypes in algebra1.json"
    );
  }

  const difficulty =
  Number(options?.difficulty) ||
  Number(lesson?.difficulty) ||
  (
    lesson?.difficultyRange
      ? randInt(
          lesson.difficultyRange.min || 1,
          lesson.difficultyRange.max || 3
        )
      : 1
  );

  const availableTypes = problemTypes.filter(type => GENERATORS[type]);

  if (availableTypes.length === 0) {
    throw new Error(
      "QuestionFactory 2.3: No supported generators found for this lesson. Add generators for: " +
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
      "QuestionFactory 2.3: Could not generate enough unique quality questions. Generated " +
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
  one_step_addition_equation: generateOneStepAdditionEquation,
  one_step_subtraction_equation: generateOneStepSubtractionEquation,
  one_step_multiplication_equation: generateOneStepMultiplicationEquation,
  one_step_division_equation: generateOneStepDivisionEquation,

  two_step_equation: generateTwoStepEquation,
  multi_step_equation: generateMultiStepEquation,
  variables_both_sides: generateVariablesBothSides,
  distributive_property: generateDistributivePropertyEquation,
  distributive_property_equation: generateDistributivePropertyEquation,

  combine_like_terms: generateCombineLikeTermsEquation,
  combine_like_terms_equation: generateCombineLikeTermsEquation,

  inequality: generateOneStepInequality,
  inequalities: generateOneStepInequality,
  one_step_inequality: generateOneStepInequality,
  one_step_inequalities: generateOneStepInequality,
  multi_step_inequality: generateMultiStepInequality,
  multi_step_inequalities: generateMultiStepInequality,
  compound_inequality: generateCompoundInequality,
  compound_inequalities: generateCompoundInequality,
  absolute_value_equation: generateAbsoluteValueEquation,
  absolute_value_equations: generateAbsoluteValueEquation,

  function_evaluation: generateFunctionEvaluation,
  functions: generateFunctionEvaluation,
  relations_functions: generateRelationsFunctions,
  function_notation: generateFunctionNotation,
  domain_range: generateDomainRange,
  multiple_representations: generateMultipleRepresentations,
  rate_of_change: generateRateOfChange,

  slope: generateSlope,
  slope_from_graph: generateSlopeFromGraph,
  slope_from_table: generateSlopeFromTable,
  slope_intercept: generateSlopeIntercept,
  graph_linear_function: generateGraphLinearFunction,

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

   one_step_addition_equation: {
  hintSteps: [
    "Identify the number being added to x.",
    "Use subtraction to undo addition.",
    "Subtract the same number from both sides."
  ],
  misconception:
    "Students often add again instead of subtracting to undo addition."
},

one_step_subtraction_equation: {
  hintSteps: [
    "Identify the number being subtracted from x.",
    "Use addition to undo subtraction.",
    "Add the same number to both sides."
  ],
  misconception:
    "Students often subtract again instead of adding to undo subtraction."
},

one_step_multiplication_equation: {
  hintSteps: [
    "Identify the coefficient multiplying x.",
    "Use division to undo multiplication.",
    "Divide both sides by the coefficient."
  ],
  misconception:
    "Students often multiply again instead of dividing to isolate x."
},

one_step_division_equation: {
  hintSteps: [
    "Identify the number x is divided by.",
    "Use multiplication to undo division.",
    "Multiply both sides by the divisor."
  ],
  misconception:
    "Students often divide again instead of multiplying to isolate x."
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

  compound_inequalities: {
    hintSteps: [
      "Identify whether the compound inequality uses AND or OR.",
      "Solve each inequality carefully using inverse operations.",
      "For AND, find the overlap. For OR, include either solution region.",
      "Reverse the inequality symbol when multiplying or dividing by a negative number."
    ],
    misconception:
      "Students often confuse AND with OR, or forget to reverse the symbol when dividing by a negative coefficient."
  },

  absolute_value_equations: {
    hintSteps: [
      "Isolate the absolute value expression first.",
      "Set up two equations: one positive case and one negative case.",
      "Solve both equations and check the solutions."
    ],
    misconception:
      "Students often solve only the positive case and forget the second solution."
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

  relations_functions: {
    hintSteps: [
      "Check whether each input has exactly one output.",
      "If an input repeats with different outputs, the relation is not a function.",
      "If every input has only one output, the relation is a function."
    ],
    misconception:
      "Students often think repeated outputs make a relation not a function, but repeated inputs are what matter."
  },

  function_notation: {
    hintSteps: [
      "Identify the input inside the parentheses.",
      "Substitute that value for x.",
      "Simplify to find the output."
    ],
    misconception:
      "Students often treat f(x) as multiplication instead of function notation."
  },

  domain_range: {
    hintSteps: [
      "Domain is the set of input values.",
      "Range is the set of output values.",
      "List each value only once."
    ],
    misconception:
      "Students often switch domain and range."
  },

  multiple_representations: {
    hintSteps: [
      "Identify the rule or pattern.",
      "Match the same input-output pairs across representations.",
      "Check that the table, equation, graph, or description represent the same relationship."
    ],
    misconception:
      "Students often match by appearance instead of checking input-output values."
  },

  rate_of_change: {
    hintSteps: [
      "Find the change in y.",
      "Find the change in x.",
      "Divide change in y by change in x."
    ],
    misconception:
      "Students often reverse the ratio and calculate change in x over change in y."
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
function generateOneStepAdditionEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const b = pickConstant(difficulty);
  const result = x + b;

  return buildQuestion({
    prompt: `Solve for x: x ${formatSigned(b)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_addition_equation",
    difficulty,
    solutionSteps: [
      `Original equation: x ${formatSigned(b)} = ${formatNumber(result)}`,
      b >= 0 ? `Subtract ${formatNumber(b)} from both sides.` : `Add ${formatNumber(Math.abs(b))} to both sides.`,
      `x = ${formatNumber(result - b)}`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateOneStepSubtractionEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const b = pickConstant(difficulty);
  const result = x - b;

  return buildQuestion({
    prompt: `Solve for x: x - ${formatNumber(b)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_subtraction_equation",
    difficulty,
    solutionSteps: [
      `Original equation: x - ${formatNumber(b)} = ${formatNumber(result)}`,
      `Add ${formatNumber(b)} to both sides.`,
      `x = ${formatNumber(result + b)}`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateOneStepMultiplicationEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const coeff = pickCoefficient(difficulty);
  const result = coeff.value * x;

  return buildQuestion({
    prompt: `Solve for x: ${formatCoeffForVariable(coeff)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_multiplication_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatCoeffForVariable(coeff)} = ${formatNumber(result)}`,
      `Divide both sides by ${coeff.text}.`,
      `x = ${formatNumber(result)} ÷ ${coeff.text}`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateOneStepDivisionEquation(difficulty = 1) {
  const divisor = pickDivisor(difficulty);
  const result = pickSolution(difficulty);
  const x = divisor * result;

  return buildQuestion({
    prompt: `Solve for x: x ÷ ${formatNumber(divisor)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_division_equation",
    difficulty,
    solutionSteps: [
      `Original equation: x ÷ ${formatNumber(divisor)} = ${formatNumber(result)}`,
      `Multiply both sides by ${formatNumber(divisor)}.`,
      `x = ${formatNumber(result)} × ${formatNumber(divisor)}`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateTwoStepEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const coeff = pickCoefficient(difficulty);
  const b = pickConstant(difficulty);
  const result = coeff.value * x + b;

  return buildQuestion({
    prompt: `Solve for x: ${formatCoeffForVariable(coeff)} ${formatSigned(b)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "two_step_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatCoeffForVariable(coeff)} ${formatSigned(b)} = ${formatNumber(result)}`,
      b >= 0 ? `Subtract ${formatNumber(b)} from both sides.` : `Add ${formatNumber(Math.abs(b))} to both sides.`,
      `${formatCoeffForVariable(coeff)} = ${formatNumber(result - b)}`,
      `Divide both sides by ${coeff.text}.`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateMultiStepEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const coeff = pickCoefficient(difficulty);
  const b = pickConstant(difficulty);
  const c = pickConstant(difficulty);
  const combined = b + c;
  const result = coeff.value * x + combined;

  return buildQuestion({
    prompt: `Solve for x: ${formatCoeffForVariable(coeff)} ${formatSigned(b)} ${formatSigned(c)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "multi_step_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatCoeffForVariable(coeff)} ${formatSigned(b)} ${formatSigned(c)} = ${formatNumber(result)}`,
      `Combine constants: ${formatNumber(b)} ${formatSigned(c)} = ${formatNumber(combined)}`,
      `${formatCoeffForVariable(coeff)} ${formatSigned(combined)} = ${formatNumber(result)}`,
      combined >= 0 ? `Subtract ${formatNumber(combined)} from both sides.` : `Add ${formatNumber(Math.abs(combined))} to both sides.`,
      `${formatCoeffForVariable(coeff)} = ${formatNumber(result - combined)}`,
      `Divide both sides by ${coeff.text}.`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateVariablesBothSides(difficulty = 1) {
  const x = pickSolution(difficulty);
  const a = pickIntegerCoefficient(difficulty);
  let c = pickIntegerCoefficient(difficulty);
  if (c === a) c += c > 0 ? -1 : 1;
  if (c === 0) c = 1;

  const b = pickConstant(difficulty);
  const d = a * x + b - c * x;

  return buildQuestion({
    prompt: `Solve for x: ${formatTerm(a, "x")} ${formatSigned(b)} = ${formatTerm(c, "x")} ${formatSigned(d)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "variables_both_sides",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatTerm(a, "x")} ${formatSigned(b)} = ${formatTerm(c, "x")} ${formatSigned(d)}`,
      `Subtract ${formatTerm(c, "x")} from both sides.`,
      `${formatTerm(a - c, "x")} ${formatSigned(b)} = ${formatNumber(d)}`,
      b >= 0 ? `Subtract ${formatNumber(b)} from both sides.` : `Add ${formatNumber(Math.abs(b))} to both sides.`,
      `${formatTerm(a - c, "x")} = ${formatNumber(d - b)}`,
      `Divide both sides by ${formatNumber(a - c)}.`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateDistributivePropertyEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const a = pickIntegerCoefficient(difficulty);
  const b = pickConstant(difficulty);
  const c = pickConstant(difficulty);
  const result = a * (x + b) + c;

  return buildQuestion({
    prompt: `Solve for x: ${formatNumber(a)}(x ${formatSigned(b)}) ${formatSigned(c)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "distributive_property_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatNumber(a)}(x ${formatSigned(b)}) ${formatSigned(c)} = ${formatNumber(result)}`,
      `Distribute ${formatNumber(a)}: ${formatTerm(a, "x")} ${formatSigned(a * b)} ${formatSigned(c)} = ${formatNumber(result)}`,
      `Combine constants: ${formatTerm(a, "x")} ${formatSigned(a * b + c)} = ${formatNumber(result)}`,
      (a * b + c) >= 0 ? `Subtract ${formatNumber(a * b + c)} from both sides.` : `Add ${formatNumber(Math.abs(a * b + c))} to both sides.`,
      `${formatTerm(a, "x")} = ${formatNumber(result - (a * b + c))}`,
      `Divide both sides by ${formatNumber(a)}.`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateCombineLikeTermsEquation(difficulty = 1) {
  const x = pickSolution(difficulty);
  const a = pickIntegerCoefficient(difficulty);
  let b = pickIntegerCoefficient(difficulty);
  if (a + b === 0) b += b > 0 ? 1 : -1;

  const c = pickConstant(difficulty);
  const result = (a + b) * x + c;

  return buildQuestion({
    prompt: `Solve for x: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} ${formatSigned(c)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "combine_like_terms_equation",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} ${formatSigned(c)} = ${formatNumber(result)}`,
      `Combine like terms: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} = ${formatTerm(a + b, "x")}`,
      `${formatTerm(a + b, "x")} ${formatSigned(c)} = ${formatNumber(result)}`,
      c >= 0 ? `Subtract ${formatNumber(c)} from both sides.` : `Add ${formatNumber(Math.abs(c))} to both sides.`,
      `${formatTerm(a + b, "x")} = ${formatNumber(result - c)}`,
      `Divide both sides by ${formatNumber(a + b)}.`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateOneStepInequality(difficulty = 1) {
  const x = pickSolution(difficulty);
  const coeff = pickCoefficient(difficulty);
  const baseSymbol = pickRandom([">", "<", "≥", "≤"]);
  const result = coeff.value * x;
  const answerSymbol = coeff.value < 0 ? flipInequality(baseSymbol) : baseSymbol;

  return buildQuestion({
    prompt: `Solve the inequality: ${formatCoeffForVariable(coeff)} ${baseSymbol} ${formatNumber(result)}`,
    answer: `x ${answerSymbol} ${formatNumber(x)}`,
    problemType: "inequalities",
    difficulty,
    solutionSteps: [
      `Original inequality: ${formatCoeffForVariable(coeff)} ${baseSymbol} ${formatNumber(result)}`,
      `Divide both sides by ${coeff.text}.`,
      coeff.value < 0 ? `Because ${coeff.text} is negative, reverse the inequality symbol.` : `Because ${coeff.text} is positive, keep the inequality symbol the same.`,
      `x ${answerSymbol} ${formatNumber(x)}`
    ]
  });
}

function generateMultiStepInequality(difficulty = 1) {

  const mode = pickRandom([
    "combine",
    "distribute"
  ]);

  const symbol = pickRandom([">", "<", "≥", "≤"]);
  const x = pickSolution(difficulty);

  if (mode === "combine") {
    const a = pickIntegerCoefficient(difficulty);
    let b = pickIntegerCoefficient(difficulty);

    if (a + b === 0) {
      b += (b > 0 ? 1 : -1);
    }

    const c = pickConstant(difficulty);
    const coefficient = a + b;
    const rightSide = coefficient * x + c;
    const finalSymbol = coefficient < 0 ? flipInequality(symbol) : symbol;

    return buildQuestion({
      prompt:
        `Solve the inequality: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
      answer:
        `x ${finalSymbol} ${formatNumber(x)}`,
      problemType:
        "multi_step_inequalities",
      difficulty,
      solutionSteps: [
        `Original inequality: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
        `Combine like terms: ${formatTerm(a, "x")} ${formatSignedTerm(b, "x")} = ${formatTerm(coefficient, "x")}`,
        `${formatTerm(coefficient, "x")} ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
        c >= 0 ? `Subtract ${formatNumber(c)} from both sides.` : `Add ${formatNumber(Math.abs(c))} to both sides.`,
        `${formatTerm(coefficient, "x")} ${symbol} ${formatNumber(rightSide - c)}`,
        `Divide both sides by ${formatNumber(coefficient)}.`,
        coefficient < 0
          ? `Because ${formatNumber(coefficient)} is negative, reverse the inequality symbol.`
          : `Because ${formatNumber(coefficient)} is positive, keep the inequality symbol the same.`,
        `x ${finalSymbol} ${formatNumber(x)}`
      ]
    });
  }

  const a = pickIntegerCoefficient(difficulty);
  const b = pickConstant(difficulty);
  const c = pickConstant(difficulty);
  const rightSide = a * (x + b) + c;
  const finalSymbol = a < 0 ? flipInequality(symbol) : symbol;

  return buildQuestion({
    prompt:
      `Solve the inequality: ${formatNumber(a)}(x ${formatSigned(b)}) ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
    answer:
      `x ${finalSymbol} ${formatNumber(x)}`,
    problemType:
      "multi_step_inequalities",
    difficulty,
    solutionSteps: [
      `Original inequality: ${formatNumber(a)}(x ${formatSigned(b)}) ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
      `Distribute ${formatNumber(a)}: ${formatTerm(a, "x")} ${formatSigned(a * b)} ${formatSigned(c)} ${symbol} ${formatNumber(rightSide)}`,
      `Combine constants: ${formatTerm(a, "x")} ${formatSigned(a * b + c)} ${symbol} ${formatNumber(rightSide)}`,
      (a * b + c) >= 0
        ? `Subtract ${formatNumber(a * b + c)} from both sides.`
        : `Add ${formatNumber(Math.abs(a * b + c))} to both sides.`,
      `${formatTerm(a, "x")} ${symbol} ${formatNumber(rightSide - (a * b + c))}`,
      `Divide both sides by ${formatNumber(a)}.`,
      a < 0
        ? `Because ${formatNumber(a)} is negative, reverse the inequality symbol.`
        : `Because ${formatNumber(a)} is positive, keep the inequality symbol the same.`,
      `x ${finalSymbol} ${formatNumber(x)}`
    ]
  });
}


function generateCompoundInequality(difficulty = 1) {
  const mode = pickRandom(["and_chain", "or_separate"]);
  const x = pickSolution(difficulty);

  if (mode === "and_chain") {
    const a = pickIntegerCoefficient(difficulty);
    const b = pickConstant(difficulty);
    const widthLeft = randInt(2, 8);
    const widthRight = randInt(2, 8);

    const center = a * x + b;
    const low = center - widthLeft;
    const high = center + widthRight;

    const leftSymbol = pickRandom(["<", "≤"]);
    const rightSymbol = pickRandom(["<", "≤"]);

    const answerLeftSymbol = a > 0 ? leftSymbol : flipInequality(rightSymbol);
    const answerRightSymbol = a > 0 ? rightSymbol : flipInequality(leftSymbol);

    const lowerSolution = Math.min(
      (low - b) / a,
      (high - b) / a
    );
    const upperSolution = Math.max(
      (low - b) / a,
      (high - b) / a
    );

    // Because a, low, high, and b are constructed from integer solution x,
    // endpoints can still be fractional. For now, reject non-integer endpoints
    // by regenerating a simpler coefficient.
    if (!Number.isInteger(lowerSolution) || !Number.isInteger(upperSolution)) {
      return generateSimpleCompoundInequality(difficulty);
    }

    return buildQuestion({
      prompt: `Solve the compound inequality: ${formatNumber(low)} ${leftSymbol} ${formatTerm(a, "x")} ${formatSigned(b)} ${rightSymbol} ${formatNumber(high)}`,
      answer: `${formatNumber(lowerSolution)} ${answerLeftSymbol} x ${answerRightSymbol} ${formatNumber(upperSolution)}`,
      problemType: "compound_inequalities",
      difficulty,
      solutionSteps: [
        `Original compound inequality: ${formatNumber(low)} ${leftSymbol} ${formatTerm(a, "x")} ${formatSigned(b)} ${rightSymbol} ${formatNumber(high)}`,
        b >= 0 ? `Subtract ${formatNumber(b)} from all three parts.` : `Add ${formatNumber(Math.abs(b))} to all three parts.`,
        `${formatNumber(low - b)} ${leftSymbol} ${formatTerm(a, "x")} ${rightSymbol} ${formatNumber(high - b)}`,
        `Divide all three parts by ${formatNumber(a)}.`,
        a < 0 ? "Because the divisor is negative, reverse both inequality symbols." : "Because the divisor is positive, keep both inequality symbols the same.",
        `Solution: ${formatNumber(lowerSolution)} ${answerLeftSymbol} x ${answerRightSymbol} ${formatNumber(upperSolution)}`
      ]
    });
  }

  const boundary1 = randInt(-10, -1);
  const boundary2 = randInt(1, 12);
  const useLessGreater = Math.random() < 0.5;
  const leftSymbol = useLessGreater ? "<" : "≤";
  const rightSymbol = useLessGreater ? ">" : "≥";
  const answer = `x ${leftSymbol} ${formatNumber(boundary1)} OR x ${rightSymbol} ${formatNumber(boundary2)}`;

  return buildQuestion({
    prompt: `Solve the compound inequality: x ${leftSymbol} ${formatNumber(boundary1)} OR x ${rightSymbol} ${formatNumber(boundary2)}`,
    answer,
    problemType: "compound_inequalities",
    difficulty,
    solutionSteps: [
      "This is an OR compound inequality.",
      "A value is a solution if it makes either inequality true.",
      `The solution is ${answer}.`
    ]
  });
}

function generateSimpleCompoundInequality(difficulty = 1) {
  const x = pickSolution(difficulty);
  const b = pickConstant(difficulty);
  const low = x + b - randInt(2, 7);
  const high = x + b + randInt(2, 7);
  const leftSymbol = pickRandom(["<", "≤"]);
  const rightSymbol = pickRandom(["<", "≤"]);
  const lowerSolution = low - b;
  const upperSolution = high - b;

  return buildQuestion({
    prompt: `Solve the compound inequality: ${formatNumber(low)} ${leftSymbol} x ${formatSigned(b)} ${rightSymbol} ${formatNumber(high)}`,
    answer: `${formatNumber(lowerSolution)} ${leftSymbol} x ${rightSymbol} ${formatNumber(upperSolution)}`,
    problemType: "compound_inequalities",
    difficulty,
    solutionSteps: [
      `Original compound inequality: ${formatNumber(low)} ${leftSymbol} x ${formatSigned(b)} ${rightSymbol} ${formatNumber(high)}`,
      b >= 0 ? `Subtract ${formatNumber(b)} from all three parts.` : `Add ${formatNumber(Math.abs(b))} to all three parts.`,
      `Solution: ${formatNumber(lowerSolution)} ${leftSymbol} x ${rightSymbol} ${formatNumber(upperSolution)}`
    ]
  });
}

function generateAbsoluteValueEquation(difficulty = 1) {
  const x1 = pickSolution(difficulty);
  const distance = randInt(2, 10);
  const center = x1 - distance;
  const x2 = center - distance;

  const mode = difficulty >= 4 ? pickRandom(["basic", "coefficient"]) : "basic";

  if (mode === "coefficient") {
    const a = pickRandom([2, 3, 4, -2, -3, -4]);
    const b = -a * center;
    const rightSide = Math.abs(a * x1 + b);

    return buildQuestion({
      prompt: `Solve the absolute value equation: |${formatTerm(a, "x")} ${formatSigned(b)}| = ${formatNumber(rightSide)}`,
      answer: `x = ${formatNumber(Math.min(x1, x2))}, x = ${formatNumber(Math.max(x1, x2))}`,
      problemType: "absolute_value_equations",
      difficulty,
      solutionSteps: [
        `Original equation: |${formatTerm(a, "x")} ${formatSigned(b)}| = ${formatNumber(rightSide)}`,
        `Set up two equations: ${formatTerm(a, "x")} ${formatSigned(b)} = ${formatNumber(rightSide)} and ${formatTerm(a, "x")} ${formatSigned(b)} = -${formatNumber(rightSide)}.`,
        "Solve both equations.",
        `Solutions: x = ${formatNumber(Math.min(x1, x2))}, x = ${formatNumber(Math.max(x1, x2))}`
      ]
    });
  }

  return buildQuestion({
    prompt: `Solve the absolute value equation: |x ${formatSigned(-center)}| = ${formatNumber(distance)}`,
    answer: `x = ${formatNumber(Math.min(x1, x2))}, x = ${formatNumber(Math.max(x1, x2))}`,
    problemType: "absolute_value_equations",
    difficulty,
    solutionSteps: [
      `Original equation: |x ${formatSigned(-center)}| = ${formatNumber(distance)}`,
      `Set up two equations: x ${formatSigned(-center)} = ${formatNumber(distance)} and x ${formatSigned(-center)} = -${formatNumber(distance)}.`,
      "Solve both equations.",
      `Solutions: x = ${formatNumber(Math.min(x1, x2))}, x = ${formatNumber(Math.max(x1, x2))}`
    ]
  });
}

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



function generateRelationsFunctions(difficulty = 1) {
  const isFunction = Math.random() < 0.65;

  let pairs;

  if (isFunction) {
    const x1 = randInt(-5, 5);
    const x2 = randInt(-5, 5, [x1]);
    const x3 = randInt(-5, 5, [x1, x2]);
    pairs = [
      [x1, randInt(-8, 8)],
      [x2, randInt(-8, 8)],
      [x3, randInt(-8, 8)]
    ];
  } else {
    const repeatedX = randInt(-5, 5);
    pairs = [
      [repeatedX, randInt(-8, 8)],
      [repeatedX, randInt(-8, 8)],
      [randInt(-5, 5, [repeatedX]), randInt(-8, 8)]
    ];

    if (pairs[0][1] === pairs[1][1]) {
      pairs[1][1] += 1;
    }
  }

  const pairText = pairs.map(([x, y]) => `(${x}, ${y})`).join(", ");
  const answer = isFunction ? "Function" : "Not a function";

  return buildQuestion({
    prompt: `Determine whether the relation is a function: ${pairText}`,
    answer,
    problemType: "relations_functions",
    difficulty,
    solutionSteps: [
      "A relation is a function if each input has exactly one output.",
      `The ordered pairs are: ${pairText}`,
      isFunction
        ? "No input is paired with two different outputs."
        : "At least one input is paired with two different outputs.",
      `Answer: ${answer}`
    ]
  });
}


function generateFunctionNotation(difficulty = 1) {
  const m = randInt(-6, 6, [0]);
  const b = randInt(-10, 10);
  const x = randInt(-6, 6);
  const y = m * x + b;

  return buildQuestion({
    prompt: `If f(x) = ${m}x ${formatSigned(b)}, find f(${x}).`,
    answer: `${y}`,
    problemType: "function_notation",
    difficulty,
    solutionSteps: [
      `Original function: f(x) = ${m}x ${formatSigned(b)}`,
      `Substitute ${x} for x.`,
      `f(${x}) = ${m}(${x}) ${formatSigned(b)}`,
      `f(${x}) = ${m * x} ${formatSigned(b)}`,
      `f(${x}) = ${y}`
    ]
  });
}


function generateDomainRange(difficulty = 1) {
  const pairs = [];
  const usedX = new Set();

  while (pairs.length < 4) {
    const x = randInt(-6, 6);
    if (usedX.has(x)) continue;
    usedX.add(x);
    pairs.push([x, randInt(-8, 8)]);
  }

  const askDomain = Math.random() < 0.5;
  const pairText = pairs.map(([x, y]) => `(${x}, ${y})`).join(", ");
  const values = pairs.map(([x, y]) => askDomain ? x : y);
  const uniqueValues = [...new Set(values)].join(", ");
  const answer = `{${uniqueValues}}`;

  return buildQuestion({
    prompt: `Given the relation ${pairText}, what is the ${askDomain ? "domain" : "range"}?`,
    answer,
    problemType: "domain_range",
    difficulty,
    solutionSteps: [
      "Domain means input values. Range means output values.",
      `The relation is: ${pairText}`,
      askDomain
        ? "Use the x-values from the ordered pairs."
        : "Use the y-values from the ordered pairs.",
      `Answer: ${answer}`
    ]
  });
}


function generateMultipleRepresentations(difficulty = 1) {
  const m = randInt(-4, 4, [0]);
  const b = randInt(-6, 6);
  const x = randInt(-4, 4);
  const y = m * x + b;

  return buildQuestion({
    prompt: `Which equation matches a linear relationship with slope ${m} and y-intercept ${b}?`,
    answer: `y = ${m}x ${formatSigned(b)}`,
    problemType: "multiple_representations",
    difficulty,
    solutionSteps: [
      "Slope-intercept form is y = mx + b.",
      `The slope is ${m}, so m = ${m}.`,
      `The y-intercept is ${b}, so b = ${b}.`,
      `Equation: y = ${m}x ${formatSigned(b)}`
    ]
  });
}


function generateRateOfChange(difficulty = 1) {
  const x1 = randInt(-5, 5);
  const x2 = randInt(-5, 5, [x1]);
  const rate = randInt(-6, 6, [0]);
  const y1 = randInt(-10, 10);
  const y2 = y1 + rate * (x2 - x1);

  return buildQuestion({
    prompt: `Find the rate of change between (${x1}, ${y1}) and (${x2}, ${y2}).`,
    answer: `${rate}`,
    problemType: "rate_of_change",
    difficulty,
    solutionSteps: [
      "Rate of change = change in y ÷ change in x.",
      `Change in y = ${y2} - ${y1} = ${y2 - y1}`,
      `Change in x = ${x2} - ${x1} = ${x2 - x1}`,
      `Rate of change = ${y2 - y1} ÷ ${x2 - x1} = ${rate}`
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



function generateSlopeFromGraph(difficulty = 1) {
  const x1 = randInt(-6, 6);
  const x2 = randInt(-6, 6, [x1]);
  const slope = randInt(-5, 5, [0]);
  const y1 = randInt(-6, 6);
  const y2 = y1 + slope * (x2 - x1);

  return buildQuestion({
    prompt: `A line on a graph passes through (${x1}, ${y1}) and (${x2}, ${y2}). What is the slope?`,
    answer: `${slope}`,
    problemType: "slope_from_graph",
    difficulty,
    solutionSteps: [
      "Use two points from the graph.",
      "Slope = (y₂ - y₁) ÷ (x₂ - x₁).",
      `Slope = (${y2} - ${y1}) ÷ (${x2} - ${x1})`,
      `Slope = ${y2 - y1} ÷ ${x2 - x1}`,
      `Slope = ${slope}`
    ]
  });
}


function generateSlopeFromTable(difficulty = 1) {
  const startX = randInt(-4, 2);
  const step = randInt(1, 4);
  const slope = randInt(-5, 5, [0]);
  const b = randInt(-8, 8);

  const x1 = startX;
  const x2 = startX + step;
  const x3 = startX + 2 * step;
  const y1 = slope * x1 + b;
  const y2 = slope * x2 + b;
  const y3 = slope * x3 + b;

  return buildQuestion({
    prompt: `Find the slope from the table: x: ${x1}, ${x2}, ${x3}; y: ${y1}, ${y2}, ${y3}`,
    answer: `${slope}`,
    problemType: "slope_from_table",
    difficulty,
    solutionSteps: [
      "Use change in y divided by change in x.",
      `Change in y = ${y2} - ${y1} = ${y2 - y1}`,
      `Change in x = ${x2} - ${x1} = ${x2 - x1}`,
      `Slope = ${y2 - y1} ÷ ${x2 - x1} = ${slope}`
    ]
  });
}


function generateGraphLinearFunction(difficulty = 1) {
  const m = randInt(-5, 5, [0]);
  const b = randInt(-8, 8);

  return buildQuestion({
    prompt: `For y = ${m}x ${formatSigned(b)}, what point is the y-intercept?`,
    answer: `(0, ${b})`,
    problemType: "graph_linear_function",
    difficulty,
    solutionSteps: [
      "In slope-intercept form, y = mx + b.",
      "The y-intercept is the point where x = 0.",
      `Here, b = ${b}.`,
      `The y-intercept is (0, ${b}).`
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
      [value + 1, value - 1, -value, value + 2, value - 2, value + 3, value - 3].forEach(n => {
        const choice = `x = ${formatNumber(n)}`;
        if (choice !== answer) distractors.add(choice);
      });
    }
  } else if (answer.startsWith("x ")) {
    const match = answer.match(/^x\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?)$/);
    if (match) {
      const symbol = match[1];
      const value = Number(match[2]);
      const flipped = flipInequality(symbol);
      [
        `x ${flipped} ${formatNumber(value)}`,
        `x ${symbol} ${formatNumber(-value)}`,
        `x ${symbol} ${formatNumber(value + 1)}`,
        `x ${symbol} ${formatNumber(value - 1)}`,
        `x ${flipped} ${formatNumber(value + 1)}`
      ].forEach(choice => { if (choice !== answer) distractors.add(choice); });
    }
  } else if (answer.includes(" OR ")) {
    const match = answer.match(/^x\s*(>|<|≥|≤)\s*(-?\d+)\s+OR\s+x\s*(>|<|≥|≤)\s*(-?\d+)$/);
    if (match) {
      const s1 = match[1], v1 = Number(match[2]), s2 = match[3], v2 = Number(match[4]);
      distractors.add(`x ${flipInequality(s1)} ${formatNumber(v1)} OR x ${s2} ${formatNumber(v2)}`);
      distractors.add(`x ${s1} ${formatNumber(v1)} AND x ${s2} ${formatNumber(v2)}`);
      distractors.add(`x ${s1} ${formatNumber(v1 + 1)} OR x ${s2} ${formatNumber(v2 - 1)}`);
      distractors.add(`x ${s1} ${formatNumber(-v1)} OR x ${s2} ${formatNumber(-v2)}`);
    }
  } else if (answer.match(/^-?\d+\s*(<|≤)\s*x\s*(<|≤)\s*-?\d+$/)) {
    const match = answer.match(/^(-?\d+)\s*(<|≤)\s*x\s*(<|≤)\s*(-?\d+)$/);
    if (match) {
      const a = Number(match[1]), s1 = match[2], s2 = match[3], b = Number(match[4]);
      distractors.add(`${formatNumber(a)} ${s1} x ${flipInequality(s2)} ${formatNumber(b)}`);
      distractors.add(`${formatNumber(a + 1)} ${s1} x ${s2} ${formatNumber(b)}`);
      distractors.add(`${formatNumber(a)} ${s1} x ${s2} ${formatNumber(b - 1)}`);
      distractors.add(`x ${s1} ${formatNumber(a)} OR x ${s2} ${formatNumber(b)}`);
    }
  } else if (answer.startsWith("x = ") && answer.includes(",")) {
    const nums = answer.match(/-?\d+/g)?.map(Number) || [];
    if (nums.length >= 2) {
      const [a,b] = nums;
      distractors.add(`x = ${formatNumber(a)}`);
      distractors.add(`x = ${formatNumber(b)}`);
      distractors.add(`x = ${formatNumber(-a)}, x = ${formatNumber(-b)}`);
      distractors.add(`No solution`);
    }
  } else if (answer.startsWith("(")) {
    distractors.add("(0, 0)");
    distractors.add("(1, 1)");
    distractors.add("No solution");
    distractors.add("Infinitely many solutions");
  } else if (answer.startsWith("{")) {
    distractors.add("{}");
    distractors.add("{0}");
    distractors.add("{1, 2, 3}");
    distractors.add("{-1, 0, 1}");
  } else if (answer === "Function" || answer === "Not a function") {
    distractors.add(answer === "Function" ? "Not a function" : "Function");
    distractors.add("Linear only");
    distractors.add("Cannot be determined");
  } else if (!Number.isNaN(Number(answer))) {
    const value = Number(answer);
    [value + 1, value - 1, -value, value + 2, value - 2].forEach(n => {
      const choice = formatNumber(n);
      if (choice !== answer) distractors.add(choice);
    });
  } else {
    ["positive association", "negative association", "no association", "linear relationship", "No solution", "Infinitely many solutions"].forEach(choice => {
      if (choice !== answer) distractors.add(choice);
    });
  }

  while (distractors.size < 3) {
    const randomChoice = answer.startsWith("x ")
      ? `x ${pickRandom([">", "<", "≥", "≤"])} ${randInt(-12, 12)}`
      : `x = ${randInt(-12, 12)}`;
    if (randomChoice !== answer) distractors.add(randomChoice);
  }

  const finalChoices = [answer, ...shuffle(Array.from(distractors)).slice(0, 3)];
  return shuffle(finalChoices);
}


/* ============================================================
   RIGOR & VARIATION HELPERS
   These helpers control positive/negative integers and fractions
   by difficulty while keeping answers clean.
   ============================================================ */

function pickSolution(difficulty = 1) {
  if (difficulty <= 1) return randInt(1, 10);
  if (difficulty === 2) return randInt(-10, 10, [0]);
  return randInt(-12, 12, [0]);
}

function pickConstant(difficulty = 1) {
  if (difficulty <= 1) return randInt(1, 12);
  return randInt(-12, 12, [0]);
}

function pickIntegerCoefficient(difficulty = 1) {
  if (difficulty <= 1) return randInt(2, 10);
  return Math.random() < 0.4 ? randInt(-10, -2) : randInt(2, 10);
}

function pickDivisor(difficulty = 1) {
  if (difficulty <= 2) return randInt(2, 12);
  return Math.random() < 0.3 ? randInt(-12, -2) : randInt(2, 12);
}

function pickCoefficient(difficulty = 1) {

  // Difficulty 1–3:
  // integers only, but includes positive and negative coefficients.
  // No fractions yet, to avoid decimals like 3.666667.

  if (difficulty <= 5) {

    const n =
      Math.random() < 0.4
        ? randInt(-10, -2)
        : randInt(2, 10);

    return {
      value: n,
      text: String(n),
      numerator: n,
      denominator: 1
    };
  }

  // Difficulty 4+:
  // fractions allowed later.

  const useFraction = Math.random() < 0.4;

  if (!useFraction) {

    const n =
      Math.random() < 0.45
        ? randInt(-10, -2)
        : randInt(2, 10);

    return {
      value: n,
      text: String(n),
      numerator: n,
      denominator: 1
    };
  }

  const denominator = pickRandom([2, 3, 4, 5]);

  let numerator =
    randInt(1, denominator * 2, [denominator]);

  if (Math.random() < 0.5) {
    numerator *= -1;
  }

  return {
    value: numerator / denominator,
    text: `${numerator}/${denominator}`,
    numerator,
    denominator
  };
}

function formatCoeffForVariable(coeff) {
  if (coeff.denominator === 1) return formatTerm(coeff.numerator, "x");
  if (coeff.numerator < 0) return `(-${Math.abs(coeff.numerator)}/${coeff.denominator})x`;
  return `(${coeff.numerator}/${coeff.denominator})x`;
}

function cleanZero(n) {
  return Object.is(n, -0) ? 0 : n;
}

function formatNumber(n) {
  n = cleanZero(n);

  if (Number.isInteger(n)) return String(n);

  const rounded = cleanZero(Number(n.toFixed(6)));
  if (Number.isInteger(rounded)) return String(rounded);

  return String(rounded);
}

function formatTerm(coefficient, variable) {
  if (coefficient === 1) return variable;
  if (coefficient === -1) return `-${variable}`;
  return `${formatNumber(coefficient)}${variable}`;
}

function formatSignedTerm(coefficient, variable) {
  if (coefficient < 0) return `- ${formatTerm(Math.abs(coefficient), variable)}`;
  return `+ ${formatTerm(coefficient, variable)}`;
}

function flipInequality(symbol) {
  const map = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" };
  return map[symbol] || symbol;
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
  if (type === "compound_inequality") return "compound_inequalities";
  if (type === "absolute_value_equation") return "absolute_value_equations";
  if (type === "function_evaluation") return "functions";
  if (type === "distributive_property_equation") return "distributive_property";
  if (type === "combine_like_terms_equation") return "combine_like_terms";
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
