/* ============================================================
   Algebra OS — Question Factory 3.3 Systems
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
      "QuestionFactory 3.3 Systems: This lesson has no problemTypes/allowedProblemTypes in algebra1.json"
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
      "QuestionFactory 3.3 Systems: No supported generators found for this lesson. Add generators for: " +
      problemTypes.join(", ")
    );
  }

  let lastQuestion = null;

  for (let attempt = 0; attempt < 30; attempt++) {
    const type = pickRandom(availableTypes);
    const question = normalizeQuestion(
      GENERATORS[type](difficulty),
      type,
      difficulty
    );

    lastQuestion = question;

    const gateAvailable =
      typeof window !== "undefined" &&
      window.AlgebraQuestionQualityGate &&
      typeof window.AlgebraQuestionQualityGate.assertValidQuestion === "function";

    const passesGate = gateAvailable
      ? window.AlgebraQuestionQualityGate.assertValidQuestion(question, lesson)
      : isQualityQuestion(question);

    if (passesGate && isQuestionAlignedToLesson(question, lesson)) {
      return question;
    }
  }

  console.warn(
    "QuestionFactory 3.3 Systems: Could not produce a fully certified question after 30 attempts.",
    lastQuestion,
    lesson
  );

  return lastQuestion;
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
      "QuestionFactory 3.3 Systems: Could not generate enough unique quality questions. Generated " +
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
  absolute_value_functions: generateAbsoluteValueFunction,

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

  systems_graphing: generateSystemsGraphing,
  identify_solution_from_graph: generateIdentifySolutionFromGraph,
  graph_two_linear_equations: generateGraphTwoLinearEquations,

  systems_substitution: generateSystemsSubstitution,
  substitution_one_equation_solved: generateSubstitutionOneEquationSolved,
  substitution_real_world: generateSubstitutionRealWorld,

  systems_elimination: generateSystemsElimination,
  elimination_addition: generateEliminationAddition,
  elimination_multiplication: generateEliminationMultiplication,

  systems_one_solution: generateSystemsOneSolution,
  systems_no_solution: generateSystemsNoSolution,
  systems_infinite_solutions: generateSystemsInfiniteSolutions,

  systems_word_problem: generateSystemsWordProblem,
  systems_cost_problem: generateSystemsCostProblem,
  systems_mixture_problem: generateSystemsMixtureProblem,
  systems_comparison_problem: generateSystemsComparisonProblem,

  systems_inequalities_graphing: generateSystemsInequalitiesGraphing,
  identify_solution_region: generateIdentifySolutionRegion,
  systems_inequalities_word_problem: generateSystemsInequalitiesWordProblem,

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

  absolute_value_functions: {
    hintSteps: [
      "Write the function in vertex form f(x) = a|x - h| + k.",
      "Use h and k to identify the vertex.",
      "Use the sign of a to determine whether the graph opens up or down.",
      "Substitute input values carefully when evaluating the function."
    ],
    misconception:
      "Students often read the horizontal shift with the wrong sign inside the absolute value."
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

  systems_graphing: {
    hintSteps: [
      "Write both equations in slope-intercept form if needed.",
      "Graph both lines.",
      "The solution is the point where the lines intersect."
    ],
    misconception:
      "Students often choose an intercept instead of the intersection point."
  },

  identify_solution_from_graph: {
    hintSteps: [
      "Look for the point where the two lines cross.",
      "Read the x-coordinate and y-coordinate of the intersection.",
      "Write the solution as an ordered pair."
    ],
    misconception:
      "Students often reverse the x-coordinate and y-coordinate."
  },

  graph_two_linear_equations: {
    hintSteps: [
      "Use the y-intercept to start each line.",
      "Use the slope to find a second point.",
      "The solution is the intersection of the two lines."
    ],
    misconception:
      "Students often graph only one of the two equations."
  },

  systems_substitution: {
    hintSteps: [
      "Substitute one expression into the other equation.",
      "Solve for one variable.",
      "Substitute back to find the other variable."
    ],
    misconception:
      "Students often forget to substitute back to find the second variable."
  },

  substitution_one_equation_solved: {
    hintSteps: [
      "Use the equation that is already solved for one variable.",
      "Substitute that expression into the other equation.",
      "Solve and then find the second variable."
    ],
    misconception:
      "Students often substitute into the wrong side of the equation."
  },

  substitution_real_world: {
    hintSteps: [
      "Define the variables.",
      "Write two equations from the situation.",
      "Use substitution to solve the system."
    ],
    misconception:
      "Students often write only one equation for a two-variable situation."
  },

  systems_elimination: {
    hintSteps: [
      "Line up like terms.",
      "Add or subtract the equations to eliminate one variable.",
      "Solve for the remaining variable and substitute back."
    ],
    misconception:
      "Students often eliminate the wrong terms or forget to change signs."
  },

  elimination_addition: {
    hintSteps: [
      "Check if one pair of variable terms are opposites.",
      "Add the equations to eliminate that variable.",
      "Solve for the remaining variable."
    ],
    misconception:
      "Students often add equations before checking whether a variable will eliminate."
  },

  elimination_multiplication: {
    hintSteps: [
      "Multiply one or both equations to create opposite coefficients.",
      "Add the equations to eliminate one variable.",
      "Solve and substitute back."
    ],
    misconception:
      "Students often multiply only one term instead of the entire equation."
  },

  systems_one_solution: {
    hintSteps: [
      "Compare the slopes and y-intercepts.",
      "Different slopes mean the lines intersect once.",
      "The system has one solution."
    ],
    misconception:
      "Students often think all systems have exactly one solution."
  },

  systems_no_solution: {
    hintSteps: [
      "Compare the slopes and y-intercepts.",
      "Same slope and different y-intercepts means parallel lines.",
      "Parallel lines have no solution."
    ],
    misconception:
      "Students often confuse parallel lines with the same line."
  },

  systems_infinite_solutions: {
    hintSteps: [
      "Simplify both equations.",
      "If they represent the same line, every point on the line is a solution.",
      "The system has infinitely many solutions."
    ],
    misconception:
      "Students often think identical equations have no solution."
  },

  systems_word_problem: {
    hintSteps: [
      "Define both variables.",
      "Write two equations from the situation.",
      "Solve the system and interpret the ordered pair."
    ],
    misconception:
      "Students often solve the system but do not interpret what the variables mean."
  },

  systems_cost_problem: {
    hintSteps: [
      "Let the variables represent the number of each item.",
      "Write one equation for quantity and one equation for total cost.",
      "Solve the system and interpret the answer."
    ],
    misconception:
      "Students often mix up price and quantity."
  },

  systems_mixture_problem: {
    hintSteps: [
      "Define the variables for each part of the mixture.",
      "Write one equation for total amount and one for total value.",
      "Solve the system."
    ],
    misconception:
      "Students often add rates or prices incorrectly."
  },

  systems_comparison_problem: {
    hintSteps: [
      "Write one equation for each option.",
      "Solve the system to find when both options are equal.",
      "Interpret the intersection point."
    ],
    misconception:
      "Students often compare only the starting values and ignore the rates."
  },

  systems_inequalities_graphing: {
    hintSteps: [
      "Graph each boundary line.",
      "Use a test point to decide which side to shade.",
      "The solution is the overlapping shaded region."
    ],
    misconception:
      "Students often shade the wrong side of one inequality."
  },

  identify_solution_region: {
    hintSteps: [
      "Test the point in each inequality.",
      "A solution must satisfy both inequalities.",
      "If both statements are true, the point is in the solution region."
    ],
    misconception:
      "Students often check only one inequality instead of both."
  },

  systems_inequalities_word_problem: {
    hintSteps: [
      "Define the variables.",
      "Write inequalities for each constraint.",
      "Interpret the overlapping solution region."
    ],
    misconception:
      "Students often write equations instead of inequalities for constraints."
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
  /*
    Stable clean generator for Lesson 1.6.
    Rules:
    - Final bounds are integers.
    - No repeating choices.
    - No long decimals.
    - No scatter-plot distractors.
  */

  const mode = pickRandom([
    "and_shift",
    "and_scaled_positive",
    "or_split"
  ]);

  if (mode === "or_split") {
    const leftBound = randInt(-12, -2);
    const rightBound = randInt(2, 12);

    const leftSymbol = pickRandom(["<", "≤"]);
    const rightSymbol = pickRandom([">", "≥"]);

    return buildQuestion({
      prompt: `Solve the compound inequality: x ${leftSymbol} ${leftBound} OR x ${rightSymbol} ${rightBound}`,
      answer: `x ${leftSymbol} ${leftBound} OR x ${rightSymbol} ${rightBound}`,
      problemType: "compound_inequalities",
      difficulty,
      solutionSteps: [
        "This is an OR compound inequality.",
        "OR means the solution includes values that satisfy either inequality.",
        `The solution is x ${leftSymbol} ${leftBound} OR x ${rightSymbol} ${rightBound}.`
      ]
    });
  }

  const leftAnswer = randInt(-12, 0);
  const rightAnswer = randInt(2, 14);
  const leftSymbol = pickRandom(["<", "≤"]);
  const rightSymbol = pickRandom(["<", "≤"]);

  if (mode === "and_shift") {
    const shift = pickConstant(difficulty);
    const leftPrompt = leftAnswer + shift;
    const rightPrompt = rightAnswer + shift;

    return buildQuestion({
      prompt: `Solve the compound inequality: ${formatNumber(leftPrompt)} ${leftSymbol} x ${formatSigned(shift)} ${rightSymbol} ${formatNumber(rightPrompt)}`,
      answer: `${formatNumber(leftAnswer)} ${leftSymbol} x ${rightSymbol} ${formatNumber(rightAnswer)}`,
      problemType: "compound_inequalities",
      difficulty,
      solutionSteps: [
        `Original inequality: ${formatNumber(leftPrompt)} ${leftSymbol} x ${formatSigned(shift)} ${rightSymbol} ${formatNumber(rightPrompt)}`,
        shift >= 0
          ? `Subtract ${formatNumber(shift)} from all three parts.`
          : `Add ${formatNumber(Math.abs(shift))} to all three parts.`,
        `${formatNumber(leftAnswer)} ${leftSymbol} x ${rightSymbol} ${formatNumber(rightAnswer)}`
      ]
    });
  }

  // Scaled AND inequality with a positive coefficient.
  // Constructed from integer solution bounds so results are always clean.
  const coefficient = randInt(2, 9);
  const constant = pickConstant(difficulty);

  const leftPrompt = coefficient * leftAnswer + constant;
  const rightPrompt = coefficient * rightAnswer + constant;

  return buildQuestion({
    prompt: `Solve the compound inequality: ${formatNumber(leftPrompt)} ${leftSymbol} ${formatTerm(coefficient, "x")} ${formatSigned(constant)} ${rightSymbol} ${formatNumber(rightPrompt)}`,
    answer: `${formatNumber(leftAnswer)} ${leftSymbol} x ${rightSymbol} ${formatNumber(rightAnswer)}`,
    problemType: "compound_inequalities",
    difficulty,
    solutionSteps: [
      `Original inequality: ${formatNumber(leftPrompt)} ${leftSymbol} ${formatTerm(coefficient, "x")} ${formatSigned(constant)} ${rightSymbol} ${formatNumber(rightPrompt)}`,
      constant >= 0
        ? `Subtract ${formatNumber(constant)} from all three parts.`
        : `Add ${formatNumber(Math.abs(constant))} to all three parts.`,
      `Divide all three parts by ${formatNumber(coefficient)}.`,
      "Because you divided by a positive number, keep the inequality symbols.",
      `${formatNumber(leftAnswer)} ${leftSymbol} x ${rightSymbol} ${formatNumber(rightAnswer)}`
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
  const mode = pickRandom(["basic", "scaled"]);

  const x1 = pickSolution(difficulty);
  const distance = randInt(2, 9);

const m = pickRandom([-5, -4, -3, -2, 2, 3, 4, 5]);

const solutionA = pickSolution(difficulty);
const solutionB = solutionA + pickRandom([2, 4, 6, 8]);

const midpoint = (solutionA + solutionB) / 2;
const distanceFromMidpoint = Math.abs(solutionA - solutionB) / 2;

const b = -m * midpoint;
const target = Math.abs(m * distanceFromMidpoint);

  //const insideValue = Math.abs(m * x1 + b);
  //const target = insideValue === 0 ? distance : insideValue;

  if (mode === "basic") {
    return buildQuestion({
      prompt: `Solve for x: |${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
      answer: `x = ${formatNumber((target - b) / m)}, x = ${formatNumber((-target - b) / m)}`,
      problemType: "absolute_value_equations",
      difficulty,
      solutionSteps: [
        `Original equation: |${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
        `Set up two equations: ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(target)} OR ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(-target)}`,
        `Solve both equations.`,
        `x = ${formatNumber((target - b) / m)}, x = ${formatNumber((-target - b) / m)}`
      ]
    });
  }

  const a = pickRandom([-5, -4, -3, -2, 2, 3, 4, 5]);
  const c = a * target;
   const createNoSolution = Math.random() < 0.15;

if (createNoSolution) {
  const badC = a > 0
    ? -Math.abs(c)
    : Math.abs(c);

  return buildQuestion({
    prompt: `Solve for x: ${formatNumber(a)}|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(badC)}`,
    answer: "No Solution",
    problemType: "absolute_value_equations",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatNumber(a)}|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(badC)}`,
      `Divide both sides by ${formatNumber(a)}.`,
      `|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(badC / a)}`,
      "Absolute value can never equal a negative number.",
      "No Solution"
    ]
  });
}
  
  return buildQuestion({
    prompt: `Solve for x: ${formatNumber(a)}|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(c)}`,
    answer: `x = ${formatNumber((target - b) / m)}, x = ${formatNumber((-target - b) / m)}`,
    problemType: "absolute_value_equations",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatNumber(a)}|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(c)}`,
      `Divide both sides by ${formatNumber(a)}.`,
      `|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
      `Set up two equations: ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(target)} OR ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(-target)}`,
      `Solve both equations.`,
      `x = ${formatNumber((target - b) / m)}, x = ${formatNumber((-target - b) / m)}`
    ]
  });
}


function generateAbsoluteValueFunction(difficulty = 1) {
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);
  const h = randInt(-6, 6);
  const k = randInt(-6, 6);

  const vertex = `(${formatNumber(h)}, ${formatNumber(k)})`;
  const mode = pickRandom(["vertex", "opens", "evaluate", "transformation"]);

  if (mode === "vertex") {
    return buildQuestion({
      prompt: `For the function f(x) = ${formatNumber(a)}|x ${formatSigned(-h)}| ${formatSigned(k)}, identify the vertex.`,
      answer: vertex,
      problemType: "absolute_value_functions",
      difficulty,
      solutionSteps: [
        "The vertex form of an absolute value function is f(x) = a|x - h| + k.",
        `Here, h = ${formatNumber(h)} and k = ${formatNumber(k)}.`,
        `The vertex is (${formatNumber(h)}, ${formatNumber(k)}).`
      ]
    });
  }

  if (mode === "opens") {
    const answer = a > 0 ? "opens up" : "opens down";

    return buildQuestion({
      prompt: `For the function f(x) = ${formatNumber(a)}|x ${formatSigned(-h)}| ${formatSigned(k)}, determine whether the graph opens up or opens down.`,
      answer,
      problemType: "absolute_value_functions",
      difficulty,
      solutionSteps: [
        "Look at the coefficient a in f(x) = a|x - h| + k.",
        "If a is positive, the graph opens up.",
        "If a is negative, the graph opens down.",
        `Here, a = ${formatNumber(a)}, so the graph ${answer}.`
      ]
    });
  }

  if (mode === "evaluate") {
    const x = h + pickRandom([-4, -3, -2, 2, 3, 4]);
    const y = a * Math.abs(x - h) + k;

    return buildQuestion({
      prompt: `Evaluate f(${formatNumber(x)}) for f(x) = ${formatNumber(a)}|x ${formatSigned(-h)}| ${formatSigned(k)}.`,
      answer: `f(${formatNumber(x)}) = ${formatNumber(y)}`,
      problemType: "absolute_value_functions",
      difficulty,
      solutionSteps: [
        `Substitute x = ${formatNumber(x)} into the function.`,
        `f(${formatNumber(x)}) = ${formatNumber(a)}|${formatNumber(x)} ${formatSigned(-h)}| ${formatSigned(k)}`,
        "Simplify inside the absolute value.",
        `f(${formatNumber(x)}) = ${formatNumber(y)}`
      ]
    });
  }

  const horizontalShift = h > 0
    ? `${Math.abs(h)} units right`
    : h < 0
      ? `${Math.abs(h)} units left`
      : "no horizontal shift";

  const verticalShift = k > 0
    ? `${Math.abs(k)} units up`
    : k < 0
      ? `${Math.abs(k)} units down`
      : "no vertical shift";

  return buildQuestion({
    prompt: `Describe the transformation of f(x) = ${formatNumber(a)}|x ${formatSigned(-h)}| ${formatSigned(k)} from the parent function f(x) = |x|.`,
    answer: `${horizontalShift}, ${verticalShift}`,
    problemType: "absolute_value_functions",
    difficulty,
    solutionSteps: [
      "The parent function is f(x) = |x|.",
      "The form f(x) = a|x - h| + k shifts the graph horizontally by h and vertically by k.",
      `Here, h = ${formatNumber(h)} and k = ${formatNumber(k)}.`,
      `So the transformation is: ${horizontalShift}, ${verticalShift}.`
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
   GENERATORS — SYSTEMS OF EQUATIONS AND INEQUALITIES
   Unit 5
   ============================================================ */

function generateSystemsGraphing(difficulty = 1) {
  const point = pickCleanPoint();
  const m1 = pickRandom([-3, -2, -1, 1, 2, 3]);
  let m2 = pickRandom([-3, -2, -1, 1, 2, 3]);
  if (m2 === m1) m2 = m1 === 3 ? -2 : 3;

  const b1 = point.y - m1 * point.x;
  const b2 = point.y - m2 * point.x;

  return buildQuestion({
    prompt: `Solve the system by graphing: y = ${formatNumber(m1)}x ${formatSigned(b1)} and y = ${formatNumber(m2)}x ${formatSigned(b2)}`,
    answer: `(${formatNumber(point.x)}, ${formatNumber(point.y)})`,
    problemType: "systems_graphing",
    difficulty,
    solutionSteps: [
      `Graph y = ${formatNumber(m1)}x ${formatSigned(b1)}.`,
      `Graph y = ${formatNumber(m2)}x ${formatSigned(b2)}.`,
      "The solution is where the lines intersect.",
      `The lines intersect at (${formatNumber(point.x)}, ${formatNumber(point.y)}).`
    ]
  });
}

function generateIdentifySolutionFromGraph(difficulty = 1) {
  const point = pickCleanPoint();

  return buildQuestion({
    prompt: `Two lines intersect on a graph at the point (${formatNumber(point.x)}, ${formatNumber(point.y)}). What is the solution to the system?`,
    answer: `(${formatNumber(point.x)}, ${formatNumber(point.y)})`,
    problemType: "identify_solution_from_graph",
    difficulty,
    solutionSteps: [
      "The solution to a system is the point of intersection.",
      `The graph shows the intersection at (${formatNumber(point.x)}, ${formatNumber(point.y)}).`,
      `Therefore, the solution is (${formatNumber(point.x)}, ${formatNumber(point.y)}).`
    ]
  });
}

function generateGraphTwoLinearEquations(difficulty = 1) {
  const point = pickCleanPoint();
  const m1 = pickRandom([-2, -1, 1, 2]);
  let m2 = pickRandom([-3, -1, 1, 3]);
  if (m2 === m1) m2 = -m1;

  const b1 = point.y - m1 * point.x;
  const b2 = point.y - m2 * point.x;

  return buildQuestion({
    prompt: `Graph the two equations and identify their intersection: y = ${formatNumber(m1)}x ${formatSigned(b1)} and y = ${formatNumber(m2)}x ${formatSigned(b2)}`,
    answer: `(${formatNumber(point.x)}, ${formatNumber(point.y)})`,
    problemType: "graph_two_linear_equations",
    difficulty,
    solutionSteps: [
      "Graph both linear equations.",
      "Find the point where the two lines cross.",
      `The intersection point is (${formatNumber(point.x)}, ${formatNumber(point.y)}).`
    ]
  });
}

function generateSystemsSubstitution(difficulty = 1) {
  const solution = pickCleanPoint();
  const a = randInt(2, 5);
  const b = randInt(-6, 6);
  const c = solution.y - a * solution.x;
  const right = b * solution.x + solution.y;

  return buildQuestion({
    prompt: `Solve by substitution: y = ${formatNumber(a)}x ${formatSigned(c)} and ${formatNumber(b)}x + y = ${formatNumber(right)}`,
    answer: `(${formatNumber(solution.x)}, ${formatNumber(solution.y)})`,
    problemType: "systems_substitution",
    difficulty,
    solutionSteps: [
      `Substitute y = ${formatNumber(a)}x ${formatSigned(c)} into the second equation.`,
      `${formatNumber(b)}x + (${formatNumber(a)}x ${formatSigned(c)}) = ${formatNumber(right)}`,
      `Solve to get x = ${formatNumber(solution.x)}.`,
      `Substitute back to get y = ${formatNumber(solution.y)}.`,
      `Solution: (${formatNumber(solution.x)}, ${formatNumber(solution.y)}).`
    ]
  });
}

function generateSubstitutionOneEquationSolved(difficulty = 1) {
  const solution = pickCleanPoint();
  const m = pickRandom([-3, -2, -1, 1, 2, 3]);
  const b = solution.y - m * solution.x;
  const a = randInt(2, 5);
  const right = a * solution.x + solution.y;

  return buildQuestion({
    prompt: `Solve the system: y = ${formatNumber(m)}x ${formatSigned(b)} and ${formatNumber(a)}x + y = ${formatNumber(right)}`,
    answer: `(${formatNumber(solution.x)}, ${formatNumber(solution.y)})`,
    problemType: "substitution_one_equation_solved",
    difficulty,
    solutionSteps: [
      "One equation is already solved for y.",
      `Substitute ${formatNumber(m)}x ${formatSigned(b)} for y in the other equation.`,
      `Solve for x = ${formatNumber(solution.x)}.`,
      `Then y = ${formatNumber(solution.y)}.`,
      `Solution: (${formatNumber(solution.x)}, ${formatNumber(solution.y)}).`
    ]
  });
}

function generateSubstitutionRealWorld(difficulty = 1, overrideType = "substitution_real_world") {
  const ticketsAdult = randInt(1, 8);
  const ticketsChild = randInt(1, 8);
  const adultPrice = randInt(8, 15);
  const childPrice = randInt(3, 7);
  const totalTickets = ticketsAdult + ticketsChild;
  const totalCost = adultPrice * ticketsAdult + childPrice * ticketsChild;

  return buildQuestion({
    prompt: `A theater sold ${totalTickets} tickets. Adult tickets cost $${adultPrice} and child tickets cost $${childPrice}. The total was $${totalCost}. How many adult and child tickets were sold?`,
    answer: `${ticketsAdult} adult tickets, ${ticketsChild} child tickets`,
    problemType: overrideType,
    difficulty,
    solutionSteps: [
      "Let a = adult tickets and c = child tickets.",
      `a + c = ${totalTickets}`,
      `${adultPrice}a + ${childPrice}c = ${totalCost}`,
      "Use substitution to solve the system.",
      `a = ${ticketsAdult}, c = ${ticketsChild}.`
    ]
  });
}

function generateSystemsElimination(difficulty = 1) {
  const solution = pickCleanPoint();
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 5);
  const d = randInt(1, 5);

  const r1 = a * solution.x + b * solution.y;
  const r2 = c * solution.x - b * solution.y;

  return buildQuestion({
    prompt: `Solve by elimination: ${a}x + ${b}y = ${r1}; ${c}x - ${b}y = ${r2}`,
    answer: `(${formatNumber(solution.x)}, ${formatNumber(solution.y)})`,
    problemType: "systems_elimination",
    difficulty,
    solutionSteps: [
      "Add the equations to eliminate y.",
      `${a + c}x = ${r1 + r2}`,
      `x = ${formatNumber(solution.x)}`,
      `Substitute back to get y = ${formatNumber(solution.y)}.`,
      `Solution: (${formatNumber(solution.x)}, ${formatNumber(solution.y)}).`
    ]
  });
}

function generateEliminationAddition(difficulty = 1) {
  const solution = pickCleanPoint();
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 5);

  const r1 = a * solution.x + b * solution.y;
  const r2 = c * solution.x - b * solution.y;

  return buildQuestion({
    prompt: `Solve by adding the equations: ${a}x + ${b}y = ${r1}; ${c}x - ${b}y = ${r2}`,
    answer: `(${formatNumber(solution.x)}, ${formatNumber(solution.y)})`,
    problemType: "elimination_addition",
    difficulty,
    solutionSteps: [
      "The y-terms are opposites.",
      "Add the equations to eliminate y.",
      `Solve for x = ${formatNumber(solution.x)}.`,
      `Substitute back to find y = ${formatNumber(solution.y)}.`
    ]
  });
}

function generateEliminationMultiplication(difficulty = 1) {
  const solution = pickCleanPoint();
  const a1 = randInt(1, 4);
  const b1 = randInt(1, 4);
  const a2 = randInt(1, 4);
  const b2 = randInt(1, 4, [b1]);

  const r1 = a1 * solution.x + b1 * solution.y;
  const r2 = a2 * solution.x + b2 * solution.y;

  return buildQuestion({
    prompt: `Solve by elimination: ${a1}x + ${b1}y = ${r1}; ${a2}x + ${b2}y = ${r2}`,
    answer: `(${formatNumber(solution.x)}, ${formatNumber(solution.y)})`,
    problemType: "elimination_multiplication",
    difficulty,
    solutionSteps: [
      "Multiply one or both equations to create opposite coefficients.",
      "Add or subtract the equations to eliminate one variable.",
      `The solution is (${formatNumber(solution.x)}, ${formatNumber(solution.y)}).`
    ]
  });
}

function generateSystemsOneSolution(difficulty = 1) {
  const m1 = pickRandom([-3, -2, -1, 1, 2, 3]);
  let m2 = pickRandom([-3, -2, -1, 1, 2, 3]);
  if (m2 === m1) m2 = m1 === 3 ? -2 : 3;
  const b1 = randInt(-8, 8);
  const b2 = randInt(-8, 8);

  return buildQuestion({
    prompt: `How many solutions does the system have? y = ${formatNumber(m1)}x ${formatSigned(b1)} and y = ${formatNumber(m2)}x ${formatSigned(b2)}`,
    answer: "One solution",
    problemType: "systems_one_solution",
    difficulty,
    solutionSteps: [
      `The slopes are ${formatNumber(m1)} and ${formatNumber(m2)}.`,
      "Different slopes mean the lines intersect once.",
      "The system has one solution."
    ]
  });
}

function generateSystemsNoSolution(difficulty = 1) {
  const m = pickRandom([-3, -2, -1, 1, 2, 3]);
  const b1 = randInt(-8, 8);
  let b2 = randInt(-8, 8, [b1]);

  return buildQuestion({
    prompt: `How many solutions does the system have? y = ${formatNumber(m)}x ${formatSigned(b1)} and y = ${formatNumber(m)}x ${formatSigned(b2)}`,
    answer: "No solution",
    problemType: "systems_no_solution",
    difficulty,
    solutionSteps: [
      "The slopes are the same.",
      "The y-intercepts are different.",
      "The lines are parallel, so there is no solution."
    ]
  });
}

function generateSystemsInfiniteSolutions(difficulty = 1) {
  const m = pickRandom([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-8, 8);
  const scale = randInt(2, 5);

  return buildQuestion({
    prompt: `How many solutions does the system have? y = ${formatNumber(m)}x ${formatSigned(b)} and ${scale}y = ${formatNumber(scale * m)}x ${formatSigned(scale * b)}`,
    answer: "Infinitely many solutions",
    problemType: "systems_infinite_solutions",
    difficulty,
    solutionSteps: [
      "Simplify the second equation by dividing every term by the same number.",
      `It becomes y = ${formatNumber(m)}x ${formatSigned(b)}.`,
      "Both equations represent the same line.",
      "The system has infinitely many solutions."
    ]
  });
}

function generateSystemsWordProblem(difficulty = 1) {
  return generateSubstitutionRealWorld(difficulty, "systems_word_problem");
}

function generateSystemsCostProblem(difficulty = 1) {
  const x = randInt(1, 8);
  const y = randInt(1, 8);
  const priceX = randInt(2, 6);
  const priceY = randInt(7, 12);
  const totalItems = x + y;
  const totalCost = priceX * x + priceY * y;

  return buildQuestion({
    prompt: `A student buys ${totalItems} items. Pencils cost $${priceX} each and notebooks cost $${priceY} each. The total cost is $${totalCost}. How many pencils and notebooks were bought?`,
    answer: `${x} pencils, ${y} notebooks`,
    problemType: "systems_cost_problem",
    difficulty,
    solutionSteps: [
      "Let p = pencils and n = notebooks.",
      `p + n = ${totalItems}`,
      `${priceX}p + ${priceY}n = ${totalCost}`,
      `Solving gives p = ${x} and n = ${y}.`
    ]
  });
}

function generateSystemsMixtureProblem(difficulty = 1) {
  const small = randInt(2, 8);
  const large = randInt(2, 8);
  const smallRate = randInt(2, 5);
  const largeRate = randInt(6, 10);
  const totalAmount = small + large;
  const totalValue = small * smallRate + large * largeRate;

  return buildQuestion({
    prompt: `A mix uses ${totalAmount} pounds total. One ingredient costs $${smallRate} per pound and another costs $${largeRate} per pound. The total value is $${totalValue}. How many pounds of each ingredient are used?`,
    answer: `${small} lb at $${smallRate}, ${large} lb at $${largeRate}`,
    problemType: "systems_mixture_problem",
    difficulty,
    solutionSteps: [
      "Let x and y represent the pounds of each ingredient.",
      `x + y = ${totalAmount}`,
      `${smallRate}x + ${largeRate}y = ${totalValue}`,
      `Solving gives x = ${small} and y = ${large}.`
    ]
  });
}

function generateSystemsComparisonProblem(difficulty = 1) {
  const x = randInt(2, 10);
  const rateA = randInt(2, 6);
  const rateB = randInt(7, 12);
  const startA = randInt(10, 30);
  const startB = startA + (rateA - rateB) * x;

  return buildQuestion({
    prompt: `Plan A costs $${startA} plus $${rateA} per hour. Plan B costs $${startB} plus $${rateB} per hour. After how many hours do the plans cost the same?`,
    answer: `${x} hours`,
    problemType: "systems_comparison_problem",
    difficulty,
    solutionSteps: [
      `Write ${startA} + ${rateA}x = ${startB} + ${rateB}x.`,
      "Solve for x.",
      `x = ${x}.`,
      `The plans cost the same after ${x} hours.`
    ]
  });
}

function generateSystemsInequalitiesGraphing(difficulty = 1) {
  const m1 = pickRandom([-2, -1, 1, 2]);
  const b1 = randInt(-6, 6);
  const m2 = pickRandom([-2, -1, 1, 2]);
  const b2 = randInt(-6, 6);
  const s1 = pickRandom(["<", "≤", ">", "≥"]);
  const s2 = pickRandom(["<", "≤", ">", "≥"]);

  return buildQuestion({
    prompt: `Which describes the solution to the system of inequalities y ${s1} ${formatNumber(m1)}x ${formatSigned(b1)} and y ${s2} ${formatNumber(m2)}x ${formatSigned(b2)}?`,
    answer: "The overlapping shaded region",
    problemType: "systems_inequalities_graphing",
    difficulty,
    solutionSteps: [
      "Graph each boundary line.",
      "Shade the correct side for each inequality.",
      "The solution is where the shaded regions overlap."
    ]
  });
}

function generateIdentifySolutionRegion(difficulty = 1) {
  const point = pickCleanPoint();
  const xLimit = point.x + randInt(1, 5);
  const yLimit = point.y + randInt(1, 5);

  return buildQuestion({
    prompt: `Is the point (${formatNumber(point.x)}, ${formatNumber(point.y)}) a solution to the system x < ${formatNumber(xLimit)} and y < ${formatNumber(yLimit)}?`,
    answer: "Yes",
    problemType: "identify_solution_region",
    difficulty,
    solutionSteps: [
      `Check x < ${formatNumber(xLimit)}: ${formatNumber(point.x)} < ${formatNumber(xLimit)} is true.`,
      `Check y < ${formatNumber(yLimit)}: ${formatNumber(point.y)} < ${formatNumber(yLimit)} is true.`,
      "The point satisfies both inequalities."
    ]
  });
}

function generateSystemsInequalitiesWordProblem(difficulty = 1) {
  const maxItems = randInt(10, 25);
  const maxCost = randInt(30, 80);
  const priceX = randInt(2, 5);
  const priceY = randInt(4, 9);

  return buildQuestion({
    prompt: `A club can buy at most ${maxItems} total snacks. Chips cost $${priceX} each and drinks cost $${priceY} each. The club can spend at most $${maxCost}. Which system models the situation?`,
    answer: `x + y ≤ ${maxItems}; ${priceX}x + ${priceY}y ≤ ${maxCost}`,
    problemType: "systems_inequalities_word_problem",
    difficulty,
    solutionSteps: [
      "At most means less than or equal to.",
      `Total snacks: x + y ≤ ${maxItems}.`,
      `Total cost: ${priceX}x + ${priceY}y ≤ ${maxCost}.`
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


function isQuestionAlignedToLesson(question, lesson) {
  if (!question || !lesson) return true;

  const allowedTypes =
    lesson.problemTypes ||
    lesson.allowedProblemTypes ||
    lesson.problem_types ||
    [];

  if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) {
    return true;
  }

  if (!allowedTypes.includes(question.problemType)) {
    return false;
  }

  return true;
}

function isAssociationChoice(choice) {
  const text = String(choice || "").toLowerCase();

  return (
    text.includes("positive association") ||
    text.includes("negative association") ||
    text.includes("no association") ||
    text.includes("linear association") ||
    text.includes("nonlinear association") ||
    text.includes("linear relationship")
  );
}

function isInequalityChoice(choice) {
  const text = String(choice || "");

  return (
    /[<>≤≥]/.test(text) ||
    /\bOR\b/.test(text) ||
    /\bAND\b/.test(text) ||
    /\bNo Solution\b/i.test(text) ||
    /\bAll Real Numbers\b/i.test(text)
  );
}



function generateChoices(answer, problemType) {
  if (typeof answer !== "string") answer = String(answer);

  const type = String(problemType || "").toLowerCase();

  const addUnique = (list, choice) => {
    if (choice === undefined || choice === null) return;
    const cleaned = String(choice).trim();
    if (!cleaned) return;
    if (!list.includes(cleaned)) list.push(cleaned);
  };

  const finalizeChoices = (correctAnswer, candidates) => {
    const choices = [];
    addUnique(choices, correctAnswer);

    candidates.forEach(choice => {
      if (choices.length < 4) addUnique(choices, choice);
    });

    let safety = 0;
    while (choices.length < 4 && safety < 200) {
      safety++;

      if (type.includes("compound_inequalit")) {
        addUnique(
          choices,
          pickRandom([
            "x < -2 OR x > 2",
            "-4 < x < 6",
            "x ≤ -3 OR x ≥ 5",
            "0 ≤ x ≤ 10",
            "No Solution",
            "All Real Numbers"
          ])
        );
      } else if (type.includes("inequalit")) {
        addUnique(
          choices,
          `x ${pickRandom([">", "<", "≥", "≤"])} ${randInt(-12, 12)}`
        );
      } else if (type.includes("scatter")) {
        addUnique(
          choices,
          pickRandom([
            "positive association",
            "negative association",
            "no association",
            "linear association",
            "nonlinear association"
          ])
        );
      } else {
        addUnique(choices, `x = ${randInt(-12, 12)}`);
      }
    }

    return shuffle(choices.slice(0, 4));
  };

  if (answer === "No Solution") {
    if (type.includes("inequalit")) {
      return finalizeChoices(answer, [
        "x > 0",
        "x < 0",
        "x ≥ 0",
        "All Real Numbers"
      ]);
    }

    return finalizeChoices(answer, [
      "x = 0",
      "x = 1",
      "x = -1",
      "All Real Numbers"
    ]);
  }

  if (type.includes("compound_inequalit")) {
    return generateCompoundInequalityAnswerChoices(answer, finalizeChoices);
  }

  if (type.includes("inequalit")) {
    return generateSimpleInequalityAnswerChoices(answer, finalizeChoices);
  }

  if (
    type.includes("systems") ||
    type.includes("substitution") ||
    type.includes("elimination")
  ) {
    return generateSystemsAnswerChoices(answer, problemType, finalizeChoices);
  }

  if (type.includes("scatter")) {
    return finalizeChoices(answer, [
      "positive association",
      "negative association",
      "no association",
      "linear association",
      "nonlinear association"
    ]);
  }

  if (problemType === "absolute_value_functions") {
    if (answer === "opens up" || answer === "opens down") {
      return finalizeChoices(answer, [
        answer === "opens up" ? "opens down" : "opens up",
        "opens left",
        "opens right",
        "cannot be determined"
      ]);
    }

    if (answer.includes("units") || answer.includes("horizontal shift") || answer.includes("vertical shift") || answer.includes("no horizontal shift") || answer.includes("no vertical shift")) {
      return finalizeChoices(answer, [
        "reflected over the y-axis",
        "stretched vertically only",
        "shifted right 1 unit, shifted up 1 unit",
        "no transformation"
      ]);
    }

    if (answer.startsWith("f(")) {
      const numericValue = Number(answer.split("=").pop().trim());
      const inputLabel = answer.match(/f\(([^)]+)\)/)?.[1] || "x";

      if (!Number.isNaN(numericValue)) {
        return finalizeChoices(answer, [
          `f(${inputLabel}) = ${formatNumber(numericValue + 1)}`,
          `f(${inputLabel}) = ${formatNumber(numericValue - 1)}`,
          `f(${inputLabel}) = ${formatNumber(-numericValue)}`,
          `f(${inputLabel}) = ${formatNumber(numericValue + 2)}`
        ]);
      }
    }

    if (answer.startsWith("(")) {
      const nums = answer.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

      if (nums.length >= 2) {
        const [h, k] = nums;

        return finalizeChoices(answer, [
          `(${formatNumber(-h)}, ${formatNumber(k)})`,
          `(${formatNumber(h)}, ${formatNumber(-k)})`,
          `(${formatNumber(k)}, ${formatNumber(h)})`,
          `(0, ${formatNumber(k)})`
        ]);
      }
    }
  }

  if (
    problemType === "absolute_value_equations" &&
    answer !== "No Solution"
  ) {
    const matches = answer.match(/x\s*=\s*(-?\d+(?:\.\d+)?),\s*x\s*=\s*(-?\d+(?:\.\d+)?)/);

    if (matches) {
      const a = Number(matches[1]);
      const b = Number(matches[2]);

      return finalizeChoices(answer, [
        `x = ${formatNumber(a)}`,
        `x = ${formatNumber(b)}`,
        `x = ${formatNumber(b)}, x = ${formatNumber(a)}`,
        `x = ${formatNumber(a)}, x = ${formatNumber(-b)}`,
        `x = ${formatNumber(-a)}, x = ${formatNumber(b)}`,
        `x = ${formatNumber(-a)}, x = ${formatNumber(-b)}`,
        "No Solution"
      ]);
    }
  }

  const distractors = new Set();

  if (answer.startsWith("x = ") && !answer.includes(",")) {
    const value = Number(answer.replace("x = ", ""));
    if (!Number.isNaN(value)) {
      [value + 1, value - 1, -value, value + 2, value - 2, value + 3, value - 3].forEach(n => {
        const choice = `x = ${formatNumber(n)}`;
        if (choice !== answer) distractors.add(choice);
      });
    }
  } else if (answer.startsWith("x = ") && answer.includes(",")) {
    const nums = answer.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 2) {
      const [a, b] = nums;
      distractors.add(`x = ${formatNumber(a)}`);
      distractors.add(`x = ${formatNumber(b)}`);
      distractors.add(`x = ${formatNumber(b)}, x = ${formatNumber(a)}`);
      distractors.add(`x = ${formatNumber(-a)}, x = ${formatNumber(-b)}`);
      distractors.add("No Solution");
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
    [
      "No Solution",
      "All Real Numbers",
      "Cannot be determined",
      "x = 0",
      "x = 1",
      "x = -1"
    ].forEach(choice => {
      if (choice !== answer) distractors.add(choice);
    });
  }

  return finalizeChoices(answer, shuffle(Array.from(distractors)));
}

function generateSimpleInequalityAnswerChoices(answer, finalizeChoices) {
  const match = String(answer).match(/^x\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    return finalizeChoices(answer, [
      "x > 0",
      "x < 0",
      "x ≥ 0",
      "x ≤ 0",
      "No Solution"
    ]);
  }

  const symbol = match[1];
  const value = Number(match[2]);
  const flipped = flipInequality(symbol);

  return finalizeChoices(answer, [
    `x ${flipped} ${formatNumber(value)}`,
    `x ${symbol} ${formatNumber(value + 1)}`,
    `x ${symbol} ${formatNumber(value - 1)}`,
    `x ${flipped} ${formatNumber(value + 1)}`,
    `x ${symbol} ${formatNumber(-value)}`,
    "No Solution"
  ]);
}

function generateCompoundInequalityAnswerChoices(answer, finalizeChoices) {
  const text = String(answer).trim();

  const orMatch = text.match(/^x\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?)\s+OR\s+x\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?)$/i);

  if (orMatch) {
    const s1 = orMatch[1];
    const v1 = Number(orMatch[2]);
    const s2 = orMatch[3];
    const v2 = Number(orMatch[4]);

    return finalizeChoices(text, [
      `x ${flipInequality(s1)} ${formatNumber(v1)} OR x ${s2} ${formatNumber(v2)}`,
      `x ${s1} ${formatNumber(v1)} AND x ${s2} ${formatNumber(v2)}`,
      `x ${s1} ${formatNumber(v1 + 1)} OR x ${s2} ${formatNumber(v2 - 1)}`,
      `x ${s1} ${formatNumber(-v1)} OR x ${s2} ${formatNumber(-v2)}`,
      "No Solution"
    ]);
  }

  const middleMatch = text.match(/^(-?\d+(?:\.\d+)?)\s*(<|≤)\s*x\s*(<|≤)\s*(-?\d+(?:\.\d+)?)$/);

  if (middleMatch) {
    const left = Number(middleMatch[1]);
    const s1 = middleMatch[2];
    const s2 = middleMatch[3];
    const right = Number(middleMatch[4]);

    return finalizeChoices(text, [
      `${formatNumber(left)} ${s1} x ${flipInequality(s2)} ${formatNumber(right)}`,
      `${formatNumber(left + 1)} ${s1} x ${s2} ${formatNumber(right)}`,
      `${formatNumber(left)} ${s1} x ${s2} ${formatNumber(right - 1)}`,
      `x ${s1} ${formatNumber(left)} OR x ${s2} ${formatNumber(right)}`,
      "No Solution",
      "All Real Numbers"
    ]);
  }

  return finalizeChoices(text, [
    "x < -2 OR x > 2",
    "-4 < x < 6",
    "x ≤ -3 OR x ≥ 5",
    "0 ≤ x ≤ 10",
    "No Solution",
    "All Real Numbers"
  ]);
}


function generateSystemsAnswerChoices(answer, problemType, finalizeChoices) {
  const text = String(answer || "").trim();
  const type = String(problemType || "").toLowerCase();

  if (
    text === "One solution" ||
    text === "No solution" ||
    text === "Infinitely many solutions"
  ) {
    return finalizeChoices(text, [
      "One solution",
      "No solution",
      "Infinitely many solutions",
      "Cannot be determined"
    ]);
  }

  if (text === "Yes" || text === "No") {
    return finalizeChoices(text, [
      text === "Yes" ? "No" : "Yes",
      "Only when x = 0",
      "Only when y = 0",
      "Cannot be determined"
    ]);
  }

  if (text === "The overlapping shaded region") {
    return finalizeChoices(text, [
      "The overlapping shaded region",
      "Only the region above the first line",
      "Only the region below the second line",
      "The intersection point only"
    ]);
  }

  if (text.startsWith("(")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if (nums.length >= 2) {
      const [x, y] = nums;

      return finalizeChoices(text, [
        `(${formatNumber(y)}, ${formatNumber(x)})`,
        `(${formatNumber(x + 1)}, ${formatNumber(y)})`,
        `(${formatNumber(x)}, ${formatNumber(y + 1)})`,
        `(${formatNumber(-x)}, ${formatNumber(-y)})`,
        "No solution",
        "Infinitely many solutions"
      ]);
    }
  }

  if (text.includes(";") && type.includes("inequalit")) {
    return finalizeChoices(text, [
      text.replaceAll("≤", "<"),
      text.replaceAll("≤", "≥"),
      "x + y ≥ 0; x ≥ 0; y ≥ 0",
      "No solution"
    ]);
  }

  if (text.includes("adult tickets") || text.includes("child tickets")) {
    const nums = text.match(/\d+/g)?.map(Number) || [];

    if (nums.length >= 2) {
      const [a, c] = nums;

      return finalizeChoices(text, [
        `${c} adult tickets, ${a} child tickets`,
        `${a + 1} adult tickets, ${Math.max(0, c - 1)} child tickets`,
        `${Math.max(0, a - 1)} adult tickets, ${c + 1} child tickets`,
        "No solution"
      ]);
    }
  }

  if (text.includes("pencils") || text.includes("notebooks")) {
    const nums = text.match(/\d+/g)?.map(Number) || [];

    if (nums.length >= 2) {
      const [p, n] = nums;

      return finalizeChoices(text, [
        `${n} pencils, ${p} notebooks`,
        `${p + 1} pencils, ${Math.max(0, n - 1)} notebooks`,
        `${Math.max(0, p - 1)} pencils, ${n + 1} notebooks`,
        "No solution"
      ]);
    }
  }

  if (text.includes("hours")) {
    const value = Number(text.match(/-?\d+(?:\.\d+)?/)?.[0]);

    if (!Number.isNaN(value)) {
      return finalizeChoices(text, [
        `${formatNumber(value + 1)} hours`,
        `${formatNumber(Math.max(0, value - 1))} hours`,
        `${formatNumber(value * 2)} hours`,
        "Never"
      ]);
    }
  }

  if (text.includes("lb")) {
    return finalizeChoices(text, [
      "1 lb at $2, 1 lb at $4",
      "2 lb at $3, 2 lb at $5",
      "No solution",
      "Infinitely many solutions"
    ]);
  }

  return finalizeChoices(text, [
    "No solution",
    "Infinitely many solutions",
    "One solution",
    "Cannot be determined"
  ]);
}

function pickCleanPoint() {
  return {
    x: randInt(-6, 6),
    y: randInt(-6, 6)
  };
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
  if (type === "absolute_value_functions") return "absolute_value_functions";
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
