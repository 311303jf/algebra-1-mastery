/* ============================================================
   Algebra OS — Question Factory 4.7 Coverage-Balanced Certified + Skill Integrity Fix
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

// Internal round-robin state.
// Purpose: prevent random generation from over-serving one skill while ignoring another.
// This is critical for QA coverage audits and for real student practice.
const LESSON_COVERAGE_STATE = new Map();

function getLessonCoverageKey(lesson) {
  return String(
    lesson?.id ||
    lesson?.lessonId ||
    lesson?.title ||
    "unknown_lesson"
  );
}

function getNextCoverageType(lesson, availableTypes) {
  if (!Array.isArray(availableTypes) || availableTypes.length === 0) {
    return null;
  }

  const key = getLessonCoverageKey(lesson);
  const currentIndex = LESSON_COVERAGE_STATE.get(key) || 0;
  const selectedType = availableTypes[currentIndex % availableTypes.length];

  LESSON_COVERAGE_STATE.set(key, currentIndex + 1);

  return selectedType;
}

function buildAttemptTypeSequence(lesson, availableTypes, requestedProblemType) {
  if (requestedProblemType) {
    return availableTypes;
  }

  const firstType = getNextCoverageType(lesson, availableTypes);
  const rest = availableTypes.filter(type => type !== firstType);

  return [firstType, ...shuffle(rest)];
}

export function generateQuestionForLesson(lesson, options = {}) {
  const problemTypes =
    lesson.problemTypes ||
    lesson.allowedProblemTypes ||
    lesson.problem_types ||
    [];

  const requestedProblemType =
    options.problemType ||
    options.problem_type ||
    options.forceProblemType ||
    options.forcedProblemType ||
    options.type ||
    null;

  if (!Array.isArray(problemTypes) || problemTypes.length === 0) {
    throw new Error(
      "QuestionFactory 3.5 Semantic QA: This lesson has no problemTypes/allowedProblemTypes in algebra1.json"
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

  let availableTypes = problemTypes.filter(type => GENERATORS[type]);

  // Coverage Guard support: lesson.html may request one specific problemType
  // so the student practices every lesson skill before repetition.
  if (requestedProblemType) {
    if (problemTypes.includes(requestedProblemType) && GENERATORS[requestedProblemType]) {
      availableTypes = [requestedProblemType];
    } else {
      console.warn(
        "QuestionFactory 4.4: Requested problemType is not available for this lesson:",
        requestedProblemType,
        lesson
      );
    }
  }

  if (availableTypes.length === 0) {
    throw new Error(
      "QuestionFactory 3.5 Semantic QA: No supported generators found for this lesson. Add generators for: " +
      problemTypes.join(", ")
    );
  }

  let lastQuestion = null;
  const attemptTypeSequence =
    buildAttemptTypeSequence(lesson, availableTypes, requestedProblemType);

  for (let attempt = 0; attempt < 30; attempt++) {
    const type =
      attemptTypeSequence[attempt % attemptTypeSequence.length] ||
      pickRandom(availableTypes);

    const question = normalizeQuestion(
      GENERATORS[type](difficulty),
      type,
      difficulty
    );

    // Wrapper generators sometimes reuse another generator internally.
    // Example: factor_trinomial_positive_c uses the same math as factor_trinomial_a1.
    // If a specific problemType was requested by the lesson coverage engine or QA audit,
    // the returned question must keep the requested skill label.
    if (requestedProblemType) {
      question.problemType = requestedProblemType;
    }

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
    "QuestionFactory 3.5 Semantic QA: Could not produce a fully certified question after 30 attempts.",
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
      "QuestionFactory 3.5 Semantic QA: Could not generate enough unique quality questions. Generated " +
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

  // ============================================================
  // UNIT 6 — EXPONENTS & EXPONENTIAL FUNCTIONS
  // ============================================================
  product_rule_exponents: generateProductRuleExponents,
  quotient_rule_exponents: generateQuotientRuleExponents,
  power_rule_exponents: generatePowerRuleExponents,
  power_of_product: generatePowerOfProduct,
  power_of_quotient: generatePowerOfQuotient,

  zero_exponent: generateZeroExponent,
  negative_exponent: generateNegativeExponent,
  mixed_exponent_simplify: generateMixedExponentSimplify,
  rewrite_with_positive_exponents: generateRewritePositiveExponent,

  convert_to_scientific_notation: generateScientificNotation,
  convert_from_scientific_notation: generateFromScientificNotation,
  multiply_scientific_notation: generateMultiplyScientificNotation,
  divide_scientific_notation: generateDivideScientificNotation,
  compare_scientific_notation: generateCompareScientificNotation,

  exponential_growth_evaluate: generateExponentialGrowth,
  exponential_decay_evaluate: generateExponentialDecay,
  identify_growth_decay: generateIdentifyGrowthDecay,
  write_exponential_model: generateExponentialModel,

  exponential_table: generateExponentialTable,
  exponential_graph_features: generateExponentialGraphFeatures,
  identify_exponential_function: generateIdentifyExponentialFunction,
  compare_exponential_growth: generateCompareExponentialGrowth,

  // ============================================================
  // UNIT 7 — POLYNOMIALS
  // ============================================================
  classify_polynomial_degree: generateClassifyPolynomialDegree,
  classify_polynomial_terms: generateClassifyPolynomialTerms,
  identify_leading_coefficient: generateIdentifyLeadingCoefficient,
  standard_form_polynomial: generateStandardFormPolynomial,

  add_polynomials: generateAddPolynomials,
  subtract_polynomials: generateSubtractPolynomials,
  combine_like_terms_polynomial: generateCombineLikeTermsPolynomial,
  polynomial_expression_equivalence: generatePolynomialExpressionEquivalence,

  monomial_times_polynomial: generateMonomialTimesPolynomial,
  binomial_times_binomial: generateBinomialTimesBinomial,
  polynomial_area_model: generatePolynomialAreaModel,
  distributive_polynomial: generateDistributivePolynomial,

  square_of_binomial: generateSquareOfBinomial,
  difference_of_squares_expand: generateDifferenceOfSquaresExpand,
  special_product_identify: generateSpecialProductIdentify,
  special_product_application: generateSpecialProductApplication,

  // ============================================================
  // UNIT 8 — FACTORING
  // ============================================================
  factor_gcf_monomial: generateFactorGCFMonomial,
  factor_gcf_polynomial: generateFactorGCFPolynomial,
  factor_gcf_with_negative: generateFactorGCFWithNegative,
  factor_gcf_application: generateFactorGCFApplication,

  factor_trinomial_a1: generateFactorTrinomialA1,
  factor_trinomial_positive_c: generateFactorTrinomialPositiveC,
  factor_trinomial_negative_c: generateFactorTrinomialNegativeC,
  identify_factor_pair: generateIdentifyFactorPair,

  factor_trinomial_a_not_1: generateFactorTrinomialANot1,
  factor_by_grouping_quadratic: generateFactorByGroupingQuadratic,
  factor_ac_method: generateFactorACMethod,
  identify_equivalent_factored_form: generateIdentifyEquivalentFactoredForm,

  factor_difference_of_squares: generateFactorDifferenceOfSquares,
  factor_perfect_square_trinomial: generateFactorPerfectSquareTrinomial,
  identify_special_factoring_pattern: generateIdentifySpecialFactoringPattern,
  mixed_special_factoring: generateMixedSpecialFactoring,

  solve_quadratic_by_factoring: generateSolveQuadraticByFactoring,
  zero_product_property: generateZeroProductProperty,
  quadratic_factoring_word_problem: generateQuadraticFactoringWordProblem,
  identify_quadratic_solutions: generateIdentifyQuadraticSolutions,

  // ============================================================
  // UNIT 9 — QUADRATIC FUNCTIONS
  // ============================================================
  identify_quadratic_function: generateIdentifyQuadraticFunction,
  quadratic_table_pattern: generateQuadraticTablePattern,
  quadratic_graph_shape: generateQuadraticGraphShape,
  linear_vs_quadratic_vs_exponential: generateLinearVsQuadraticVsExponential,

  quadratic_vertex: generateQuadraticVertex,
  quadratic_axis_of_symmetry: generateQuadraticAxisOfSymmetry,
  quadratic_y_intercept: generateQuadraticYIntercept,
  quadratic_graph_features: generateQuadraticGraphFeatures,

  vertex_form_identify_vertex: generateVertexFormIdentifyVertex,
  vertex_form_transformations: generateVertexFormTransformations,
  vertex_form_graph_features: generateVertexFormGraphFeatures,
  write_vertex_form_from_graph: generateWriteVertexFormFromGraph,

  solve_quadratic_by_graphing: generateSolveQuadraticByGraphing,
  identify_x_intercepts: generateIdentifyXIntercepts,
  quadratic_number_of_solutions: generateQuadraticNumberOfSolutions,
  interpret_quadratic_roots: generateInterpretQuadraticRoots,

  quadratic_formula_real_solutions: generateQuadraticFormulaRealSolutions,
  discriminant_number_of_solutions: generateDiscriminantNumberOfSolutions,
  quadratic_formula_simplify: generateQuadraticFormulaSimplify,
  choose_correct_quadratic_solution: generateChooseCorrectQuadraticSolution,

  projectile_motion_quadratic: generateProjectileMotionQuadratic,
  maximum_minimum_quadratic: generateMaximumMinimumQuadratic,
  area_quadratic_word_problem: generateAreaQuadraticWordProblem,
  interpret_quadratic_context: generateInterpretQuadraticContext,

  // LEGACY GENERATORS
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

  product_rule_exponents: {
    hintSteps: [
      "Identify the common base.",
      "When multiplying powers with the same base, add the exponents.",
      "Keep the base and simplify the exponent."
    ],
    misconception: "Students often multiply the exponents instead of adding them for the product rule."
  },

  quotient_rule_exponents: {
    hintSteps: [
      "Identify the common base.",
      "When dividing powers with the same base, subtract the exponents.",
      "Keep the base and simplify the exponent."
    ],
    misconception: "Students often add exponents instead of subtracting them for the quotient rule."
  },

  power_rule_exponents: {
    hintSteps: [
      "Identify the power raised to another power.",
      "Multiply the exponents.",
      "Keep the same base."
    ],
    misconception: "Students often add the exponents instead of multiplying them in a power of a power."
  },

  classify_polynomial_degree: {
    hintSteps: [
      "Write the polynomial in standard form.",
      "Find the term with the greatest exponent.",
      "The greatest exponent is the degree of the polynomial."
    ],
    misconception: "Students often use the number of terms instead of the greatest exponent to identify degree."
  },

  classify_polynomial_terms: {
    hintSteps: [
      "Count the terms separated by plus or minus signs.",
      "One term is a monomial, two terms is a binomial, and three terms is a trinomial.",
      "Use the term count to classify the polynomial."
    ],
    misconception: "Students often count factors inside a term as separate terms."
  },

  identify_leading_coefficient: {
    hintSteps: [
      "Write the polynomial in standard form.",
      "Identify the term with the highest degree.",
      "The coefficient of that term is the leading coefficient."
    ],
    misconception: "Students often choose the first coefficient shown instead of rewriting in standard form first."
  },

  standard_form_polynomial: {
    hintSteps: [
      "Identify the degree of each term.",
      "Order the terms from greatest degree to least degree.",
      "Keep each coefficient and sign with its term."
    ],
    misconception: "Students often move terms but forget to keep the correct signs."
  },

  add_polynomials: {
    hintSteps: [
      "Group like terms with the same variable and exponent.",
      "Add the coefficients of like terms.",
      "Write the result in standard form."
    ],
    misconception: "Students often combine terms with different exponents as if they were like terms."
  },

  subtract_polynomials: {
    hintSteps: [
      "Distribute the subtraction sign to every term in the second polynomial.",
      "Group like terms.",
      "Combine coefficients and write the result in standard form."
    ],
    misconception: "Students often change only the first sign of the second polynomial instead of all signs."
  },

  monomial_times_polynomial: {
    hintSteps: [
      "Distribute the monomial to each term in the polynomial.",
      "Multiply the coefficients.",
      "Use exponent rules for matching variables."
    ],
    misconception: "Students often multiply only the first term and forget to distribute to every term."
  },

  binomial_times_binomial: {
    hintSteps: [
      "Multiply each term in the first binomial by each term in the second binomial.",
      "Combine like terms if possible.",
      "Write the product in standard form."
    ],
    misconception: "Students often multiply first and last terms only and forget the middle products."
  },

  square_of_binomial: {
    hintSteps: [
      "Use the pattern (a + b)² = a² + 2ab + b² or (a - b)² = a² - 2ab + b².",
      "Square the first term.",
      "Double the product of the two terms, then square the last term."
    ],
    misconception: "Students often think (a + b)² equals a² + b² and forget the middle term."
  },

  difference_of_squares_expand: {
    hintSteps: [
      "Recognize the pattern (a + b)(a - b).",
      "Square the first term and square the second term.",
      "Subtract the squares."
    ],
    misconception: "Students often include a middle term even though the middle terms cancel."
  },


  factor_gcf_monomial: {
    hintSteps: [
      "Find the greatest common factor of all terms.",
      "Factor out the common number and variable factor.",
      "Check by distributing the factor back in."
    ],
    misconception: "Students often factor out only the number and forget the common variable factor."
  },

  factor_trinomial_a1: {
    hintSteps: [
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Use those numbers to write two binomial factors.",
      "Multiply the factors to check your answer."
    ],
    misconception: "Students often find numbers that multiply to c but do not add to b."
  },

  factor_trinomial_positive_c: {
    hintSteps: [
      "For x² + bx + c with positive c, the factor signs may be the same.",
      "Find two numbers that multiply to c and add to b.",
      "Use those numbers to write the binomial factors."
    ],
    misconception: "Students often ignore whether c is positive and choose signs that do not produce the middle term."
  },

  factor_trinomial_negative_c: {
    hintSteps: [
      "For x² + bx + c with negative c, the factor signs must be opposite.",
      "Find two numbers that multiply to c and add to b.",
      "Use those numbers to write the binomial factors."
    ],
    misconception: "Students often choose two positive factors even when c is negative."
  },

  mixed_special_factoring: {
    hintSteps: [
      "First decide whether the expression is a difference of squares or a perfect square trinomial.",
      "Use the matching special factoring pattern.",
      "Multiply the factors to check your result."
    ],
    misconception: "Students often apply the perfect square pattern to a difference of squares, or the reverse."
  },

  factor_trinomial_a_not_1: {
    hintSteps: [
      "Look for two binomial factors whose first terms multiply to ax².",
      "Check that the outer and inner products combine to the middle term.",
      "Multiply the factors to verify the trinomial."
    ],
    misconception: "Students often factor as if a = 1 and ignore the leading coefficient."
  },

  factor_difference_of_squares: {
    hintSteps: [
      "Recognize the pattern a² - b².",
      "Write the factors as (a + b)(a - b).",
      "Check that the middle terms cancel."
    ],
    misconception: "Students often try to factor a difference of squares as a trinomial."
  },

  solve_quadratic_by_factoring: {
    hintSteps: [
      "Set the quadratic equation equal to zero.",
      "Factor the quadratic expression.",
      "Use the zero product property to solve each factor."
    ],
    misconception: "Students often factor correctly but forget to set each factor equal to zero."
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
  },

  /* ============================================================
     HINT QUALITY EXPANSION — Algebra OS 4.6
     Added to reduce generic Help Panel fallback across all units.
     ============================================================ */

  distributive_property_equation: {
    hintSteps: [
      "Distribute the outside number to every term inside the parentheses.",
      "Combine like terms after distributing.",
      "Use inverse operations to isolate the variable."
    ],
    misconception:
      "Students often distribute to only the first term or forget to keep the signs."
  },

  combine_like_terms_equation: {
    hintSteps: [
      "Identify terms with the same variable part.",
      "Combine coefficients of like terms.",
      "Solve the simplified equation using inverse operations."
    ],
    misconception:
      "Students often combine constants with variable terms even though they are not like terms."
  },

  inequality: {
    hintSteps: [
      "Solve the inequality using the same steps as an equation.",
      "Keep the inequality balanced by doing the same operation on both sides.",
      "Reverse the inequality symbol only if multiplying or dividing by a negative number."
    ],
    misconception:
      "Students often forget to reverse the inequality symbol after dividing by a negative coefficient."
  },

  one_step_inequality: {
    hintSteps: [
      "Identify the operation attached to the variable.",
      "Use the inverse operation on both sides.",
      "Reverse the symbol if you multiply or divide by a negative number."
    ],
    misconception:
      "Students often solve correctly but keep the wrong inequality direction."
  },

  one_step_inequalities: {
    hintSteps: [
      "Identify the operation attached to the variable.",
      "Use the inverse operation on both sides.",
      "Check whether the operation requires reversing the inequality symbol."
    ],
    misconception:
      "Students often treat inequalities exactly like equations and forget the symbol rule."
  },

  multi_step_inequality: {
    hintSteps: [
      "Simplify the inequality first if there are like terms or parentheses.",
      "Move constants away from the variable term.",
      "Divide by the coefficient and reverse the symbol if the coefficient is negative."
    ],
    misconception:
      "Students often reverse the inequality too early or forget to reverse it when dividing by a negative."
  },

  multi_step_inequalities: {
    hintSteps: [
      "Simplify each side before solving.",
      "Use inverse operations to isolate the variable term.",
      "Reverse the inequality symbol if the final division is by a negative number."
    ],
    misconception:
      "Students often make sign errors when combining terms before solving the inequality."
  },

  compound_inequality: {
    hintSteps: [
      "Decide whether the compound statement uses AND or OR.",
      "Solve each part carefully.",
      "For AND, keep the overlap. For OR, include values from either side."
    ],
    misconception:
      "Students often confuse AND with OR and choose the wrong solution region."
  },

  absolute_value_equation: {
    hintSteps: [
      "Isolate the absolute value expression first.",
      "Create two cases: the inside equals the positive value and the negative value.",
      "Solve both cases and check for no-solution situations."
    ],
    misconception:
      "Students often solve only one case or forget that absolute value cannot equal a negative number."
  },

  function_evaluation: {
    hintSteps: [
      "Identify the input value inside the parentheses.",
      "Substitute that value for x everywhere in the function.",
      "Simplify using order of operations."
    ],
    misconception:
      "Students often confuse the input with the output or treat function notation as multiplication."
  },

  slope_from_graph: {
    hintSteps: [
      "Choose two clear points on the line.",
      "Count the vertical change, then the horizontal change.",
      "Slope equals rise ÷ run."
    ],
    misconception:
      "Students often reverse rise and run or count in only one direction."
  },

  slope_from_table: {
    hintSteps: [
      "Find the change in y between two rows.",
      "Find the change in x using the same two rows.",
      "Divide change in y by change in x."
    ],
    misconception:
      "Students often compare non-matching rows or calculate change in x over change in y."
  },

  graph_linear_function: {
    hintSteps: [
      "Write the equation in slope-intercept form if needed.",
      "Start at the y-intercept.",
      "Use the slope to locate another point on the line."
    ],
    misconception:
      "Students often start with the slope instead of first locating the y-intercept."
  },

  power_of_product: {
    hintSteps: [
      "Apply the exponent to each factor inside the parentheses.",
      "Raise the coefficient to the power.",
      "Raise the variable factor to the power."
    ],
    misconception:
      "Students often apply the exponent only to the variable and forget the coefficient."
  },

  power_of_quotient: {
    hintSteps: [
      "Apply the exponent to the numerator.",
      "Apply the exponent to the denominator.",
      "Simplify each part separately."
    ],
    misconception:
      "Students often apply the exponent to only one part of the quotient."
  },

  zero_exponent: {
    hintSteps: [
      "Check that the base is not zero.",
      "Any nonzero base raised to the zero power equals 1.",
      "The answer is 1."
    ],
    misconception:
      "Students often think a zero exponent makes the answer 0."
  },

  negative_exponent: {
    hintSteps: [
      "A negative exponent means move the factor across the fraction bar.",
      "Change the exponent to positive after moving it.",
      "Do not make the value negative just because the exponent is negative."
    ],
    misconception:
      "Students often think a negative exponent creates a negative answer."
  },

  mixed_exponent_simplify: {
    hintSteps: [
      "Apply the rule inside the parentheses first.",
      "Then apply the outside exponent.",
      "Use the correct exponent rule at each step."
    ],
    misconception:
      "Students often mix up when to add, subtract, or multiply exponents."
  },

  rewrite_with_positive_exponents: {
    hintSteps: [
      "Locate every negative exponent.",
      "Move each factor with a negative exponent across the fraction bar.",
      "Rewrite the exponent as positive."
    ],
    misconception:
      "Students often leave negative exponents in the final answer."
  },

  convert_to_scientific_notation: {
    hintSteps: [
      "Move the decimal to create a number at least 1 and less than 10.",
      "Count how many places the decimal moved.",
      "Use that count as the power of 10."
    ],
    misconception:
      "Students often use the wrong exponent sign when converting large or small numbers."
  },

  convert_from_scientific_notation: {
    hintSteps: [
      "Look at the exponent on 10.",
      "Move the decimal right for a positive exponent and left for a negative exponent.",
      "Write the number in standard form."
    ],
    misconception:
      "Students often move the decimal in the wrong direction."
  },

  multiply_scientific_notation: {
    hintSteps: [
      "Multiply the decimal coefficients.",
      "Add the powers of 10.",
      "Adjust the coefficient if it is not between 1 and 10."
    ],
    misconception:
      "Students often multiply the exponents instead of adding them."
  },

  divide_scientific_notation: {
    hintSteps: [
      "Divide the decimal coefficients.",
      "Subtract the powers of 10.",
      "Adjust the coefficient if needed."
    ],
    misconception:
      "Students often subtract the coefficients instead of dividing them."
  },

  compare_scientific_notation: {
    hintSteps: [
      "Compare the powers of 10 first.",
      "If the powers match, compare the decimal coefficients.",
      "Choose the number with the greater overall value."
    ],
    misconception:
      "Students often compare only the decimal coefficient and ignore the exponent."
  },

  exponential_growth_evaluate: {
    hintSteps: [
      "Identify the initial value.",
      "Use a growth factor greater than 1.",
      "Raise the growth factor to the time value and multiply."
    ],
    misconception:
      "Students often add the percent repeatedly instead of multiplying by the growth factor."
  },

  exponential_decay_evaluate: {
    hintSteps: [
      "Identify the initial value.",
      "Use a decay factor between 0 and 1.",
      "Raise the decay factor to the time value and multiply."
    ],
    misconception:
      "Students often subtract the same amount each time instead of using exponential decay."
  },

  identify_growth_decay: {
    hintSteps: [
      "Look at the base of the exponential expression.",
      "If the base is greater than 1, it is growth.",
      "If the base is between 0 and 1, it is decay."
    ],
    misconception:
      "Students often look at the starting value instead of the base."
  },

  write_exponential_model: {
    hintSteps: [
      "Use the form y = a(b)^x.",
      "Let a be the initial value.",
      "Let b be the multiplier or growth/decay factor."
    ],
    misconception:
      "Students often place the initial value and multiplier in the wrong positions."
  },

  exponential_table: {
    hintSteps: [
      "Identify the starting value.",
      "Look for a constant multiplier between outputs.",
      "Use the multiplier to evaluate the requested input."
    ],
    misconception:
      "Students often treat exponential tables as if they had constant differences."
  },

  exponential_graph_features: {
    hintSteps: [
      "Find the value of the function when x = 0.",
      "Remember that any nonzero base to the zero power equals 1.",
      "The y-intercept is the output when x = 0."
    ],
    misconception:
      "Students often confuse the y-intercept with the growth factor."
  },

  identify_exponential_function: {
    hintSteps: [
      "Check whether outputs are multiplied by the same factor.",
      "A constant multiplier indicates an exponential function.",
      "Do not use constant differences for exponential patterns."
    ],
    misconception:
      "Students often confuse constant first differences with constant ratios."
  },

  compare_exponential_growth: {
    hintSteps: [
      "Compare the exponential bases.",
      "For growth functions with the same starting value, the larger base grows faster.",
      "Choose the function with the greater base."
    ],
    misconception:
      "Students often compare only the initial values instead of the growth factors."
  },

  combine_like_terms_polynomial: {
    hintSteps: [
      "Group terms with the same variable and exponent.",
      "Combine only their coefficients.",
      "Write the simplified polynomial in standard form."
    ],
    misconception:
      "Students often combine x² terms with x terms."
  },

  polynomial_expression_equivalence: {
    hintSteps: [
      "Simplify the expression by combining like terms.",
      "Keep the exponent attached to each term.",
      "Match the simplified expression to the equivalent choice."
    ],
    misconception:
      "Students often match expressions by appearance instead of simplifying."
  },

  polynomial_area_model: {
    hintSteps: [
      "Area means multiply length by width.",
      "Write the product of the two side expressions.",
      "Multiply and combine like terms."
    ],
    misconception:
      "Students often add side lengths instead of multiplying them for area."
  },

  distributive_polynomial: {
    hintSteps: [
      "Distribute the monomial to every term in the parentheses.",
      "Multiply coefficients.",
      "Use exponent rules for matching variables."
    ],
    misconception:
      "Students often distribute to the first term only."
  },

  special_product_identify: {
    hintSteps: [
      "Look for a perfect square trinomial or a difference of squares.",
      "Check whether the first and last terms are squares.",
      "Use the middle term or minus sign to identify the pattern."
    ],
    misconception:
      "Students often confuse difference of squares with perfect square trinomials."
  },

  special_product_application: {
    hintSteps: [
      "Identify the special product pattern.",
      "Use the matching formula or expansion rule.",
      "Simplify the resulting polynomial."
    ],
    misconception:
      "Students often expand special products without the middle term or with the wrong sign."
  },

  factor_gcf_polynomial: {
    hintSteps: [
      "Find the greatest common factor of all terms.",
      "Divide each term by the GCF.",
      "Write the GCF outside the parentheses."
    ],
    misconception:
      "Students often factor only the first two terms and ignore the entire polynomial."
  },

  factor_gcf_with_negative: {
    hintSteps: [
      "If the leading term is negative, consider factoring out a negative GCF.",
      "Divide each term by the negative GCF.",
      "Check by distributing back."
    ],
    misconception:
      "Students often leave a negative leading term inside the parentheses."
  },

  factor_gcf_application: {
    hintSteps: [
      "Identify the expression being factored from the context.",
      "Find the greatest common factor.",
      "Interpret the factored form in the situation."
    ],
    misconception:
      "Students often solve for a variable instead of factoring the expression."
  },

  identify_factor_pair: {
    hintSteps: [
      "Find the value of c.",
      "Find two numbers that multiply to c.",
      "Check that the same two numbers add to b."
    ],
    misconception:
      "Students often find a pair that multiplies correctly but does not add to the middle coefficient."
  },

  factor_by_grouping_quadratic: {
    hintSteps: [
      "Split the middle term into two terms.",
      "Group the first two terms and the last two terms.",
      "Factor out the common binomial."
    ],
    misconception:
      "Students often split the middle term correctly but do not factor by grouping afterward."
  },

  factor_ac_method: {
    hintSteps: [
      "Multiply a and c.",
      "Find two numbers that multiply to ac and add to b.",
      "Split the middle term and factor by grouping."
    ],
    misconception:
      "Students often use c instead of ac when the leading coefficient is not 1."
  },

  identify_equivalent_factored_form: {
    hintSteps: [
      "Multiply the factored form mentally or by distribution.",
      "Compare the result to the original polynomial.",
      "Choose the form that expands correctly."
    ],
    misconception:
      "Students often choose a factored form with correct constants but wrong middle term."
  },

  factor_perfect_square_trinomial: {
    hintSteps: [
      "Check whether the first and last terms are perfect squares.",
      "Check whether the middle term is twice the product of the square roots.",
      "Write the factor as a binomial squared."
    ],
    misconception:
      "Students often recognize the squares but miss the required middle term."
  },

  identify_special_factoring_pattern: {
    hintSteps: [
      "Check whether there are two terms or three terms.",
      "For two terms, look for a difference of squares.",
      "For three terms, check for a perfect square trinomial."
    ],
    misconception:
      "Students often apply a trinomial pattern to a two-term expression."
  },

  zero_product_property: {
    hintSteps: [
      "If a product equals zero, at least one factor must be zero.",
      "Set each factor equal to zero.",
      "Solve each small equation."
    ],
    misconception:
      "Students often multiply the factors first instead of setting each factor equal to zero."
  },

  quadratic_factoring_word_problem: {
    hintSteps: [
      "Set the quadratic model equal to zero for the relevant event.",
      "Factor the quadratic expression.",
      "Choose the solution that makes sense in context."
    ],
    misconception:
      "Students often keep a negative solution even when the context requires a positive value."
  },

  identify_quadratic_solutions: {
    hintSteps: [
      "Set the quadratic equal to zero.",
      "Factor if possible.",
      "Use the zero product property to identify both solutions."
    ],
    misconception:
      "Students often give only one solution when a quadratic can have two."
  },

  identify_quadratic_function: {
    hintSteps: [
      "Look for the highest power of x.",
      "A quadratic function has x² as the highest power.",
      "Choose the equation with degree 2."
    ],
    misconception:
      "Students often choose any curved-looking or nonlinear expression without checking for x²."
  },

  quadratic_table_pattern: {
    hintSteps: [
      "Find the first differences between y-values.",
      "Then find the second differences.",
      "A constant second difference indicates a quadratic pattern."
    ],
    misconception:
      "Students often stop at first differences and miss the constant second difference."
  },

  quadratic_graph_shape: {
    hintSteps: [
      "Remember that quadratic functions graph as curved U-shaped figures.",
      "The graph of a quadratic function is called a parabola.",
      "It can open up or down depending on the coefficient of x²."
    ],
    misconception:
      "Students often confuse a parabola with a line or exponential curve."
  },

  linear_vs_quadratic_vs_exponential: {
    hintSteps: [
      "Check first differences for a linear pattern.",
      "Check second differences for a quadratic pattern.",
      "Check constant multipliers for an exponential pattern."
    ],
    misconception:
      "Students often identify every increasing pattern as linear."
  },

  quadratic_vertex: {
    hintSteps: [
      "Use vertex form y = a(x - h)² + k when available.",
      "Read h from inside the parentheses using the opposite sign.",
      "Read k as the vertical coordinate of the vertex."
    ],
    misconception:
      "Students often read the h-value with the wrong sign."
  },

  quadratic_axis_of_symmetry: {
    hintSteps: [
      "Find the vertex of the parabola.",
      "The axis of symmetry passes through the vertex.",
      "Write the axis as x = the x-coordinate of the vertex."
    ],
    misconception:
      "Students often write the axis as y = instead of x =."
  },

  quadratic_y_intercept: {
    hintSteps: [
      "The y-intercept occurs when x = 0.",
      "Substitute x = 0 into the function.",
      "Write the intercept as an ordered pair."
    ],
    misconception:
      "Students often choose the vertex instead of the y-intercept."
  },

  quadratic_graph_features: {
    hintSteps: [
      "Identify the vertex.",
      "Use the sign of a to determine whether the parabola opens up or down.",
      "Use the vertex to identify the maximum or minimum value."
    ],
    misconception:
      "Students often confuse opening direction with the location of the vertex."
  },

  vertex_form_identify_vertex: {
    hintSteps: [
      "Compare the equation to y = a(x - h)² + k.",
      "The vertex is (h, k).",
      "Remember that h has the opposite sign from what appears inside parentheses."
    ],
    misconception:
      "Students often report the inside value directly instead of changing its sign."
  },

  vertex_form_transformations: {
    hintSteps: [
      "Use h to describe the horizontal shift.",
      "Use k to describe the vertical shift.",
      "Use the sign of a to identify reflection over the x-axis."
    ],
    misconception:
      "Students often reverse left and right shifts."
  },

  vertex_form_graph_features: {
    hintSteps: [
      "Use vertex form to identify the vertex.",
      "Use the sign of a to determine opening direction.",
      "Use the vertex y-value as the maximum or minimum value."
    ],
    misconception:
      "Students often identify the y-intercept instead of the vertex."
  },

  write_vertex_form_from_graph: {
    hintSteps: [
      "Start with vertex form y = a(x - h)² + k.",
      "Use the vertex for h and k.",
      "Substitute the a-value or another point if given."
    ],
    misconception:
      "Students often write standard form when the problem asks for vertex form."
  },

  solve_quadratic_by_graphing: {
    hintSteps: [
      "Look for where the parabola crosses the x-axis.",
      "The x-values of the x-intercepts are the solutions.",
      "List both solutions if the graph crosses twice."
    ],
    misconception:
      "Students often give the y-values of the intercepts instead of the x-values."
  },

  identify_x_intercepts: {
    hintSteps: [
      "X-intercepts occur where y = 0.",
      "Solve the quadratic or inspect where the graph crosses the x-axis.",
      "Write each intercept as an ordered pair with y = 0."
    ],
    misconception:
      "Students often write roots as numbers when the question asks for intercepts as points."
  },

  quadratic_number_of_solutions: {
    hintSteps: [
      "Think about how many times the parabola crosses the x-axis.",
      "Two crossings mean two real solutions.",
      "Touching once means one real solution, and no crossing means no real solutions."
    ],
    misconception:
      "Students often assume every quadratic has two real solutions."
  },

  interpret_quadratic_roots: {
    hintSteps: [
      "Roots show where the quadratic equals zero.",
      "In context, decide which root is meaningful.",
      "Reject roots that do not make sense, such as negative time."
    ],
    misconception:
      "Students often keep both roots without interpreting the context."
  },

  quadratic_formula_real_solutions: {
    hintSteps: [
      "Identify a, b, and c from ax² + bx + c = 0.",
      "Substitute into x = (-b ± √(b² - 4ac)) ÷ 2a.",
      "Simplify to get the real solutions."
    ],
    misconception:
      "Students often forget the negative on -b or divide only part of the numerator by 2a."
  },

  discriminant_number_of_solutions: {
    hintSteps: [
      "Compute the discriminant b² - 4ac.",
      "Positive means two real solutions.",
      "Zero means one real solution, and negative means no real solutions."
    ],
    misconception:
      "Students often solve the entire equation when only the number of solutions is needed."
  },

  quadratic_formula_simplify: {
    hintSteps: [
      "Identify a, b, and c.",
      "Substitute carefully into the quadratic formula.",
      "Simplify the discriminant and then simplify the final solutions."
    ],
    misconception:
      "Students often make sign errors inside b² - 4ac."
  },

  choose_correct_quadratic_solution: {
    hintSteps: [
      "Use the quadratic formula or given solutions.",
      "Check which solution satisfies the equation or context.",
      "Choose the solution set that matches both roots."
    ],
    misconception:
      "Students often choose one root and ignore the ± part of the formula."
  },

  projectile_motion_quadratic: {
    hintSteps: [
      "The object hits the ground when height equals zero.",
      "Set the quadratic model equal to zero.",
      "Choose the positive time solution."
    ],
    misconception:
      "Students often choose a negative time or the maximum height instead of the ground time."
  },

  maximum_minimum_quadratic: {
    hintSteps: [
      "Find the vertex of the parabola.",
      "If a is positive, the vertex gives a minimum.",
      "If a is negative, the vertex gives a maximum."
    ],
    misconception:
      "Students often use the y-intercept instead of the vertex value."
  },

  area_quadratic_word_problem: {
    hintSteps: [
      "Area of a rectangle is length times width.",
      "Multiply the two expressions for the side lengths.",
      "Combine like terms to write the quadratic expression."
    ],
    misconception:
      "Students often add the side lengths instead of multiplying them."
  },

  interpret_quadratic_context: {
    hintSteps: [
      "Identify what the vertex, roots, or intercepts represent in the situation.",
      "Use the sign of a to decide whether the vertex is a maximum or minimum.",
      "Match the mathematical feature to the real-world meaning."
    ],
    misconception:
      "Students often give the algebraic value without explaining what it means in context."
  },
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
  /*
    Skill integrity rule:
    one_step_addition_equation must visually show x + b = c.
    Therefore b must be positive.
  */
  const x = pickSolution(difficulty);
  const b = randInt(1, difficulty <= 1 ? 12 : 15);
  const result = x + b;

  return buildQuestion({
    prompt: `Solve for x: x + ${formatNumber(b)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_addition_equation",
    difficulty,
    solutionSteps: [
      `Original equation: x + ${formatNumber(b)} = ${formatNumber(result)}`,
      `Subtract ${formatNumber(b)} from both sides.`,
      `x = ${formatNumber(result)} - ${formatNumber(b)}`,
      `x = ${formatNumber(x)}`
    ]
  });
}

function generateOneStepSubtractionEquation(difficulty = 1) {
  /*
    Skill integrity rule:
    one_step_subtraction_equation must visually show x - b = c.
    Therefore b must be positive.
  */
  const x = pickSolution(difficulty);
  const b = randInt(1, difficulty <= 1 ? 12 : 15);
  const result = x - b;

  return buildQuestion({
    prompt: `Solve for x: x - ${formatNumber(b)} = ${formatNumber(result)}`,
    answer: `x = ${formatNumber(x)}`,
    problemType: "one_step_subtraction_equation",
    difficulty,
    solutionSteps: [
      `Original equation: x - ${formatNumber(b)} = ${formatNumber(result)}`,
      `Add ${formatNumber(b)} to both sides.`,
      `x = ${formatNumber(result)} + ${formatNumber(b)}`,
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
  /*
    Algebra OS 4.8 Semantic Skill Integrity Rule:
    A multi-step equation must visibly require simplification before solving.

    Lesson 1.2 must NOT generate one-step equations such as:
    x - 6 = -2
    x + 5 = 10
    4x = 20

    Therefore, this generator delegates only to true multi-step subskills:
    - combine like terms
    - distributive property
  */

  const mode = pickRandom([
    "combine_like_terms",
    "distributive_property"
  ]);

  if (mode === "combine_like_terms") {
    const question = generateCombineLikeTermsEquation(difficulty);
    question.problemType = "multi_step_equation";
    question.hintSteps = METADATA.multi_step_equation.hintSteps;
    question.misconception = METADATA.multi_step_equation.misconception;
    return question;
  }

  const question = generateDistributivePropertyEquation(difficulty);
  question.problemType = "multi_step_equation";
  question.hintSteps = METADATA.multi_step_equation.hintSteps;
  question.misconception = METADATA.multi_step_equation.misconception;
  return question;
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
  /*
    Absolute Value Equations — Stable Semantic Version
    Rules:
    - Multiple-solution answers are always canonical.
    - Example: x = -12, x = -8, never x = -8, x = -12.
    - Equivalent answer choices are blocked globally.
  */

  const mode = pickRandom(["basic", "scaled"]);

  const m = pickRandom([-5, -4, -3, -2, 2, 3, 4, 5]);

  const solutionA = pickSolution(difficulty);
  const solutionB = solutionA + pickRandom([2, 4, 6, 8]);

  const midpoint = (solutionA + solutionB) / 2;
  const distanceFromMidpoint = Math.abs(solutionA - solutionB) / 2;

  const b = -m * midpoint;
  const target = Math.abs(m * distanceFromMidpoint);

  const solution1 = (target - b) / m;
  const solution2 = (-target - b) / m;

  const canonicalAnswer = normalizeMultipleSolutions(solution1, solution2);

  if (mode === "basic") {
    return buildQuestion({
      prompt: `Solve for x: |${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
      answer: canonicalAnswer,
      problemType: "absolute_value_equations",
      difficulty,
      solutionSteps: [
        `Original equation: |${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
        `Set up two equations: ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(target)} OR ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(-target)}`,
        `Solve both equations.`,
        canonicalAnswer
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
    answer: canonicalAnswer,
    problemType: "absolute_value_equations",
    difficulty,
    solutionSteps: [
      `Original equation: ${formatNumber(a)}|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(c)}`,
      `Divide both sides by ${formatNumber(a)}.`,
      `|${formatTerm(m, "x")} ${formatSigned(b)}| = ${formatNumber(target)}`,
      `Set up two equations: ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(target)} OR ${formatTerm(m, "x")} ${formatSigned(b)} = ${formatNumber(-target)}`,
      `Solve both equations.`,
      canonicalAnswer
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


/* ============================================================
   GENERATORS — UNIT 6: EXPONENTS & EXPONENTIAL FUNCTIONS
   QuestionFactory 4.0 Phase A
   ============================================================ */

function generateProductRuleExponents(difficulty = 1) {
  const base = pickRandom(["x", "a", "m", "n"]);
  const p = randInt(2, 8);
  const q = randInt(2, 8);
  return buildQuestion({
    prompt: `Simplify: ${base}^${p} × ${base}^${q}`,
    answer: `${base}^${p + q}`,
    problemType: "product_rule_exponents",
    difficulty,
    solutionSteps: [
      "When multiplying powers with the same base, add the exponents.",
      `${base}^${p} × ${base}^${q} = ${base}^(${p} + ${q})`,
      `The simplified expression is ${base}^${p + q}.`
    ]
  });
}

function generateQuotientRuleExponents(difficulty = 1) {
  const base = pickRandom(["x", "a", "m", "n"]);
  const p = randInt(6, 12);
  const q = randInt(2, p - 1);
  return buildQuestion({
    prompt: `Simplify: ${base}^${p} ÷ ${base}^${q}`,
    answer: `${base}^${p - q}`,
    problemType: "quotient_rule_exponents",
    difficulty,
    solutionSteps: [
      "When dividing powers with the same base, subtract the exponents.",
      `${base}^${p} ÷ ${base}^${q} = ${base}^(${p} - ${q})`,
      `The simplified expression is ${base}^${p - q}.`
    ]
  });
}

function generatePowerRuleExponents(difficulty = 1) {
  const base = pickRandom(["x", "a", "m", "n"]);
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  return buildQuestion({
    prompt: `Simplify: (${base}^${p})^${q}`,
    answer: `${base}^${p * q}`,
    problemType: "power_rule_exponents",
    difficulty,
    solutionSteps: [
      "When raising a power to a power, multiply the exponents.",
      `(${base}^${p})^${q} = ${base}^(${p} × ${q})`,
      `The simplified expression is ${base}^${p * q}.`
    ]
  });
}

function generatePowerOfProduct(difficulty = 1) {
  const a = randInt(2, 6);
  const p = randInt(2, 5);
  return buildQuestion({
    prompt: `Simplify: (${a}x)^${p}`,
    answer: `${formatNumber(a ** p)}x^${p}`,
    problemType: "power_of_product",
    difficulty,
    solutionSteps: [
      "Apply the exponent to each factor inside the parentheses.",
      `(${a}x)^${p} = ${a}^${p}x^${p}`,
      `${a}^${p} = ${formatNumber(a ** p)}`,
      `The simplified expression is ${formatNumber(a ** p)}x^${p}.`
    ]
  });
}

function generatePowerOfQuotient(difficulty = 1) {
  const a = randInt(2, 6);
  const b = randInt(2, 6, [a]);
  const p = randInt(2, 4);
  return buildQuestion({
    prompt: `Simplify: (${a}x ÷ ${b})^${p}`,
    answer: `${formatNumber(a ** p)}x^${p} ÷ ${formatNumber(b ** p)}`,
    problemType: "power_of_quotient",
    difficulty,
    solutionSteps: [
      "Apply the exponent to the numerator and the denominator.",
      `(${a}x ÷ ${b})^${p} = ${a}^${p}x^${p} ÷ ${b}^${p}`,
      `The simplified expression is ${formatNumber(a ** p)}x^${p} ÷ ${formatNumber(b ** p)}.`
    ]
  });
}

function generateZeroExponent(difficulty = 1) {
  const base = pickRandom(["x", "a", "5", "12", "m"]);
  return buildQuestion({
    prompt: `Simplify: ${base}^0`,
    answer: "1",
    problemType: "zero_exponent",
    difficulty,
    solutionSteps: [
      "Any nonzero base raised to the zero power equals 1.",
      `${base}^0 = 1`
    ]
  });
}

function generateNegativeExponent(difficulty = 1) {
  const base = pickRandom(["x", "a", "m", "n"]);
  const p = randInt(2, 6);
  return buildQuestion({
    prompt: `Rewrite with a positive exponent: ${base}^-${p}`,
    answer: `1 ÷ ${base}^${p}`,
    problemType: "negative_exponent",
    difficulty,
    solutionSteps: [
      "A negative exponent means the factor moves to the denominator.",
      `${base}^-${p} = 1 ÷ ${base}^${p}`
    ]
  });
}

function generateMixedExponentSimplify(difficulty = 1) {
  const base = pickRandom(["x", "a", "m"]);
  const p = randInt(3, 8);
  const q = randInt(1, p - 1);
  const r = randInt(2, 4);
  const exp = (p - q) * r;
  return buildQuestion({
    prompt: `Simplify: (${base}^${p} ÷ ${base}^${q})^${r}`,
    answer: `${base}^${exp}`,
    problemType: "mixed_exponent_simplify",
    difficulty,
    solutionSteps: [
      "First use the quotient rule by subtracting exponents.",
      `${base}^${p} ÷ ${base}^${q} = ${base}^${p - q}`,
      "Then use the power rule by multiplying exponents.",
      `(${base}^${p - q})^${r} = ${base}^${exp}`
    ]
  });
}

function generateRewritePositiveExponent(difficulty = 1) {
  const base = pickRandom(["x", "a", "m", "n"]);
  const p = randInt(2, 6);
  return buildQuestion({
    prompt: `Rewrite using only positive exponents: 1 ÷ ${base}^-${p}`,
    answer: `${base}^${p}`,
    problemType: "rewrite_with_positive_exponents",
    difficulty,
    solutionSteps: [
      "A factor with a negative exponent in the denominator moves to the numerator.",
      `1 ÷ ${base}^-${p} = ${base}^${p}`
    ]
  });
}

function generateScientificNotation(difficulty = 1) {
  const coefficient = randInt(11, 99) / 10;
  const exponent = randInt(3, 7);
  const standard = coefficient * 10 ** exponent;
  return buildQuestion({
    prompt: `Write ${formatNumber(standard)} in scientific notation.`,
    answer: `${formatNumber(coefficient)} × 10^${exponent}`,
    problemType: "convert_to_scientific_notation",
    difficulty,
    solutionSteps: [
      "Move the decimal so the first factor is at least 1 and less than 10.",
      `The decimal moves ${exponent} places.`,
      `Scientific notation: ${formatNumber(coefficient)} × 10^${exponent}`
    ]
  });
}

function generateFromScientificNotation(difficulty = 1) {
  const coefficient = randInt(11, 99) / 10;
  const exponent = randInt(2, 6);
  const standard = coefficient * 10 ** exponent;
  return buildQuestion({
    prompt: `Write ${formatNumber(coefficient)} × 10^${exponent} in standard form.`,
    answer: formatNumber(standard),
    problemType: "convert_from_scientific_notation",
    difficulty,
    solutionSteps: [
      `A positive exponent moves the decimal ${exponent} places to the right.`,
      `${formatNumber(coefficient)} × 10^${exponent} = ${formatNumber(standard)}`
    ]
  });
}

function generateMultiplyScientificNotation(difficulty = 1) {
  const a = randInt(11, 45) / 10;
  const b = randInt(11, 35) / 10;
  const p = randInt(2, 5);
  const q = randInt(2, 5);
  const product = a * b;
  const extra = product >= 10 ? 1 : 0;
  const coeff = product >= 10 ? product / 10 : product;
  const exp = p + q + extra;
  return buildQuestion({
    prompt: `Multiply: (${formatNumber(a)} × 10^${p})(${formatNumber(b)} × 10^${q})`,
    answer: `${formatNumber(coeff)} × 10^${exp}`,
    problemType: "multiply_scientific_notation",
    difficulty,
    solutionSteps: [
      "Multiply the coefficients and add the powers of 10.",
      `${formatNumber(a)} × ${formatNumber(b)} = ${formatNumber(product)}`,
      `10^${p} × 10^${q} = 10^${p + q}`,
      `Scientific notation: ${formatNumber(coeff)} × 10^${exp}`
    ]
  });
}

function generateDivideScientificNotation(difficulty = 1) {
  const b = randInt(2, 5);
  const quotient = randInt(2, 8);
  const a = b * quotient;
  const p = randInt(5, 8);
  const q = randInt(1, 4);
  return buildQuestion({
    prompt: `Divide: (${a} × 10^${p}) ÷ (${b} × 10^${q})`,
    answer: `${quotient} × 10^${p - q}`,
    problemType: "divide_scientific_notation",
    difficulty,
    solutionSteps: [
      "Divide the coefficients and subtract the powers of 10.",
      `${a} ÷ ${b} = ${quotient}`,
      `10^${p} ÷ 10^${q} = 10^${p - q}`,
      `Answer: ${quotient} × 10^${p - q}`
    ]
  });
}

function generateCompareScientificNotation(difficulty = 1) {
  const a = randInt(11, 98) / 10;
  const b = randInt(11, 98) / 10;
  let p = randInt(2, 6);
  let q = randInt(2, 6, [p]);
  const left = `${formatNumber(a)} × 10^${p}`;
  const right = `${formatNumber(b)} × 10^${q}`;
  const answer = p > q ? left : right;
  return buildQuestion({
    prompt: `Which number is greater: ${left} or ${right}?`,
    answer,
    problemType: "compare_scientific_notation",
    difficulty,
    solutionSteps: [
      "Compare the powers of 10 first.",
      `10^${Math.max(p, q)} is greater than 10^${Math.min(p, q)}.`,
      `So the greater number is ${answer}.`
    ]
  });
}

function generateExponentialGrowth(difficulty = 1) {
  const start = randInt(20, 100);
  const rate = pickRandom([0.05, 0.1, 0.2]);
  const t = randInt(2, 5);
  const value = Math.round(start * (1 + rate) ** t);
  return buildQuestion({
    prompt: `A quantity starts at ${start} and grows by ${formatNumber(rate * 100)}% each year. What is its value after ${t} years?`,
    answer: `${value}`,
    problemType: "exponential_growth_evaluate",
    difficulty,
    solutionSteps: [
      "Use exponential growth: initial value × growth factor^time.",
      `Growth factor = 1 + ${formatNumber(rate)} = ${formatNumber(1 + rate)}`,
      `${start} × ${formatNumber(1 + rate)}^${t} ≈ ${value}`
    ]
  });
}

function generateExponentialDecay(difficulty = 1) {
  const start = randInt(100, 500);
  const rate = pickRandom([0.1, 0.2, 0.25]);
  const t = randInt(2, 5);
  const value = Math.round(start * (1 - rate) ** t);
  return buildQuestion({
    prompt: `A quantity starts at ${start} and decreases by ${formatNumber(rate * 100)}% each year. What is its value after ${t} years?`,
    answer: `${value}`,
    problemType: "exponential_decay_evaluate",
    difficulty,
    solutionSteps: [
      "Use exponential decay: initial value × decay factor^time.",
      `Decay factor = 1 - ${formatNumber(rate)} = ${formatNumber(1 - rate)}`,
      `${start} × ${formatNumber(1 - rate)}^${t} ≈ ${value}`
    ]
  });
}

function generateIdentifyGrowthDecay(difficulty = 1) {
  const factor = pickRandom([0.6, 0.75, 0.8, 1.2, 1.3, 1.5]);
  const answer = factor > 1 ? "Exponential growth" : "Exponential decay";
  return buildQuestion({
    prompt: `Does y = 40(${formatNumber(factor)})^x represent exponential growth or exponential decay?`,
    answer,
    problemType: "identify_growth_decay",
    difficulty,
    solutionSteps: [
      "Look at the base of the exponential function.",
      "If the base is greater than 1, it is growth. If the base is between 0 and 1, it is decay.",
      `The base is ${formatNumber(factor)}, so this is ${answer.toLowerCase()}.`
    ]
  });
}

function generateExponentialModel(difficulty = 1) {
  const start = randInt(20, 100);
  const factor = pickRandom([1.1, 1.2, 1.5, 0.8, 0.75]);
  return buildQuestion({
    prompt: `Write an exponential model for an initial value of ${start} with a multiplier of ${formatNumber(factor)} each time period.`,
    answer: `y = ${start}(${formatNumber(factor)})^x`,
    problemType: "write_exponential_model",
    difficulty,
    solutionSteps: [
      "An exponential model has the form y = a(b)^x.",
      `The initial value is a = ${start}.`,
      `The multiplier is b = ${formatNumber(factor)}.`,
      `The model is y = ${start}(${formatNumber(factor)})^x.`
    ]
  });
}

function generateExponentialTable(difficulty = 1) {
  const start = randInt(2, 8);
  const factor = pickRandom([2, 3, 4]);
  const x = randInt(2, 4);
  const y = start * factor ** x;
  return buildQuestion({
    prompt: `For y = ${start}(${factor})^x, what is y when x = ${x}?`,
    answer: `${y}`,
    problemType: "exponential_table",
    difficulty,
    solutionSteps: [
      `Substitute x = ${x}.`,
      `y = ${start}(${factor})^${x}`,
      `y = ${y}`
    ]
  });
}

function generateExponentialGraphFeatures(difficulty = 1) {
  const a = randInt(1, 8);
  const b = pickRandom([2, 3, 0.5]);
  return buildQuestion({
    prompt: `For y = ${a}(${formatNumber(b)})^x, what is the y-intercept?`,
    answer: `(0, ${a})`,
    problemType: "exponential_graph_features",
    difficulty,
    solutionSteps: [
      "The y-intercept occurs when x = 0.",
      `${formatNumber(b)}^0 = 1`,
      `y = ${a} × 1 = ${a}`,
      `The y-intercept is (0, ${a}).`
    ]
  });
}

function generateIdentifyExponentialFunction(difficulty = 1) {
  const factor = pickRandom([2, 3, 4]);
  const start = randInt(1, 5);
  return buildQuestion({
    prompt: `A table has y-values ${start}, ${start * factor}, ${start * factor ** 2}, ${start * factor ** 3}. What type of function does it represent?`,
    answer: "Exponential function",
    problemType: "identify_exponential_function",
    difficulty,
    solutionSteps: [
      "Check whether the outputs are multiplied by the same factor each time.",
      `Each y-value is multiplied by ${factor}.`,
      "A constant multiplier means the function is exponential."
    ]
  });
}

function generateCompareExponentialGrowth(difficulty = 1) {
  const a = pickRandom([2, 3, 4]);
  let b = pickRandom([2, 3, 4, 5]);
  if (b === a) b += 1;
  const answer = a > b ? `y = 10(${a})^x` : `y = 10(${b})^x`;
  return buildQuestion({
    prompt: `Which function grows faster: y = 10(${a})^x or y = 10(${b})^x?`,
    answer,
    problemType: "compare_exponential_growth",
    difficulty,
    solutionSteps: [
      "For exponential growth, the larger base grows faster.",
      `Compare the bases ${a} and ${b}.`,
      `${Math.max(a, b)} is larger, so ${answer} grows faster.`
    ]
  });
}


/* ============================================================
   GENERATORS — UNIT 7: POLYNOMIALS
   QuestionFactory 4.0 Phase B
   ============================================================ */

function generateClassifyPolynomialDegree(difficulty = 1) {
  const mode = pickRandom([
    { degree: 1, name: "Linear" },
    { degree: 2, name: "Quadratic" },
    { degree: 3, name: "Cubic" },
    { degree: 4, name: "Quartic" }
  ]);
  const a = randInt(2, 8);
  const b = randInt(1, 9);
  const c = randInt(-9, 9, [0]);
  const prompt = `Classify the polynomial by degree: ${formatTermPower(a, "x", mode.degree)} ${formatSignedTermPower(b, "x", Math.max(1, mode.degree - 1))} ${formatSigned(c)}`;
  return buildQuestion({
    prompt,
    answer: mode.name,
    problemType: "classify_polynomial_degree",
    difficulty,
    solutionSteps: [
      "The degree of a polynomial is the greatest exponent of the variable.",
      `The greatest exponent is ${mode.degree}.`,
      `A polynomial with degree ${mode.degree} is ${mode.name.toLowerCase()}.`
    ]
  });
}

function generateClassifyPolynomialTerms(difficulty = 1) {
  const modes = [
    { terms: 1, name: "Monomial" },
    { terms: 2, name: "Binomial" },
    { terms: 3, name: "Trinomial" },
    { terms: 4, name: "Polynomial with 4 terms" }
  ];
  const mode = pickRandom(modes);
  const a = randInt(2, 9);
  const b = randInt(1, 9);
  const c = randInt(1, 9);
  const d = randInt(1, 9);
  let expression = `${formatTermPower(a, "x", 3)}`;
  if (mode.terms >= 2) expression += ` ${formatSignedTermPower(b, "x", 2)}`;
  if (mode.terms >= 3) expression += ` ${formatSignedTerm(c, "x")}`;
  if (mode.terms >= 4) expression += ` ${formatSigned(d)}`;
  return buildQuestion({
    prompt: `Classify the polynomial by number of terms: ${expression}`,
    answer: mode.name,
    problemType: "classify_polynomial_terms",
    difficulty,
    solutionSteps: [
      "Count the terms separated by plus or minus signs.",
      `This expression has ${mode.terms} term(s).`,
      `Therefore, it is a ${mode.name.toLowerCase()}.`
    ]
  });
}

function generateIdentifyLeadingCoefficient(difficulty = 1) {
  const leading = pickRandom([-7, -5, -3, 2, 4, 6, 8]);
  const mid = randInt(-9, 9, [0]);
  const constant = randInt(-12, 12, [0]);
  const degree = pickRandom([2, 3, 4]);
  const prompt = `Identify the leading coefficient of ${formatTermPower(mid, "x", degree - 1)} ${formatSigned(constant)} ${formatSignedTermPower(leading, "x", degree)}.`;
  return buildQuestion({
    prompt,
    answer: `${leading}`,
    problemType: "identify_leading_coefficient",
    difficulty,
    solutionSteps: [
      "Write the polynomial in standard form from greatest exponent to least exponent.",
      `The highest-degree term is ${formatTermPower(leading, "x", degree)}.`,
      `The leading coefficient is ${leading}.`
    ]
  });
}

function generateStandardFormPolynomial(difficulty = 1) {
  const a = pickRandom([-6, -4, -2, 2, 3, 5, 7]);
  const b = randInt(-8, 8, [0]);
  const c = randInt(-10, 10, [0]);
  const expression = `${formatTermPower(b, "x", 1)} ${formatSigned(c)} ${formatSignedTermPower(a, "x", 3)}`;
  const answer = `${formatTermPower(a, "x", 3)} ${formatSignedTerm(b, "x")} ${formatSigned(c)}`;
  return buildQuestion({
    prompt: `Write the polynomial in standard form: ${expression}`,
    answer,
    problemType: "standard_form_polynomial",
    difficulty,
    solutionSteps: [
      "Standard form orders terms from greatest degree to least degree.",
      "The cubic term goes first, then the linear term, then the constant.",
      `Standard form: ${answer}`
    ]
  });
}

function generateAddPolynomials(difficulty = 1) {
  const a = randInt(-6, 6, [0]);
  const b = randInt(-8, 8, [0]);
  const c = randInt(-10, 10, [0]);
  const d = randInt(-6, 6, [0]);
  const e = randInt(-8, 8, [0]);
  const f = randInt(-10, 10, [0]);
  const answer = formatQuadraticPolynomial(a + d, b + e, c + f);
  return buildQuestion({
    prompt: `Add: (${formatQuadraticPolynomial(a, b, c)}) + (${formatQuadraticPolynomial(d, e, f)})`,
    answer,
    problemType: "add_polynomials",
    difficulty,
    solutionSteps: [
      "Combine like terms with the same exponent.",
      `x² terms: ${a} + ${d} = ${a + d}`,
      `x terms: ${b} + ${e} = ${b + e}`,
      `constants: ${c} + ${f} = ${c + f}`,
      `Result: ${answer}`
    ]
  });
}

function generateSubtractPolynomials(difficulty = 1) {
  const a = randInt(-6, 6, [0]);
  const b = randInt(-8, 8, [0]);
  const c = randInt(-10, 10, [0]);
  const d = randInt(-6, 6, [0]);
  const e = randInt(-8, 8, [0]);
  const f = randInt(-10, 10, [0]);
  const answer = formatQuadraticPolynomial(a - d, b - e, c - f);
  return buildQuestion({
    prompt: `Subtract: (${formatQuadraticPolynomial(a, b, c)}) - (${formatQuadraticPolynomial(d, e, f)})`,
    answer,
    problemType: "subtract_polynomials",
    difficulty,
    solutionSteps: [
      "Distribute the subtraction sign to every term in the second polynomial.",
      `x² terms: ${a} - (${d}) = ${a - d}`,
      `x terms: ${b} - (${e}) = ${b - e}`,
      `constants: ${c} - (${f}) = ${c - f}`,
      `Result: ${answer}`
    ]
  });
}

function generateCombineLikeTermsPolynomial(difficulty = 1) {
  const a = randInt(2, 7);
  const b = randInt(-6, 6, [0]);
  const c = randInt(2, 7);
  const d = randInt(-8, 8, [0]);
  const answer = `${formatTermPower(a + c, "x", 2)} ${formatSignedTerm(b + d, "x")}`;
  return buildQuestion({
    prompt: `Combine like terms: ${formatTermPower(a, "x", 2)} ${formatSignedTerm(b, "x")} ${formatSignedTermPower(c, "x", 2)} ${formatSignedTerm(d, "x")}`,
    answer,
    problemType: "combine_like_terms_polynomial",
    difficulty,
    solutionSteps: [
      "Combine x² terms with x² terms and x terms with x terms.",
      `${a}x² + ${c}x² = ${a + c}x²`,
      `${b}x + ${d}x = ${b + d}x`,
      `Result: ${answer}`
    ]
  });
}

function generatePolynomialExpressionEquivalence(difficulty = 1) {
  const a = randInt(2, 6);
  const b = randInt(-6, 6, [0]);
  const c = randInt(-8, 8, [0]);
  const answer = formatQuadraticPolynomial(a, b, c);
  return buildQuestion({
    prompt: `Which expression is equivalent to ${formatTermPower(a - 1, "x", 2)} + ${formatTermPower(1, "x", 2)} ${formatSignedTerm(b, "x")} ${formatSigned(c)}?`,
    answer,
    problemType: "polynomial_expression_equivalence",
    difficulty,
    solutionSteps: [
      "Combine like terms.",
      `${a - 1}x² + x² = ${a}x²`,
      `The equivalent expression is ${answer}.`
    ]
  });
}

function generateMonomialTimesPolynomial(difficulty = 1) {
  const k = pickRandom([-5, -3, -2, 2, 3, 4, 5]);
  const a = randInt(1, 6);
  const b = randInt(-8, 8, [0]);
  const c = randInt(-8, 8, [0]);
  const answer = `${formatTermPower(k * a, "x", 3)} ${formatSignedTermPower(k * b, "x", 2)} ${formatSignedTerm(k * c, "x")}`;
  return buildQuestion({
    prompt: `Multiply: ${formatTerm(k, "x")}(${formatQuadraticPolynomial(a, b, c)})`,
    answer,
    problemType: "monomial_times_polynomial",
    difficulty,
    solutionSteps: [
      "Distribute the monomial to each term.",
      `Multiply ${formatTerm(k, "x")} by each term inside the parentheses.`,
      `Result: ${answer}`
    ]
  });
}

function generateBinomialTimesBinomial(difficulty = 1) {
  const r = randInt(-7, 7, [0]);
  const s = randInt(-7, 7, [0]);
  const b = r + s;
  const c = r * s;
  const answer = formatQuadraticPolynomial(1, b, c);
  return buildQuestion({
    prompt: `Multiply: (x ${formatSigned(r)})(x ${formatSigned(s)})`,
    answer,
    problemType: "binomial_times_binomial",
    difficulty,
    solutionSteps: [
      "Multiply each term in the first binomial by each term in the second binomial.",
      `The middle coefficient is ${r} + ${s} = ${b}.`,
      `The constant is ${r} × ${s} = ${c}.`,
      `Result: ${answer}`
    ]
  });
}

function generatePolynomialAreaModel(difficulty = 1) {
  const length = randInt(2, 8);
  const width = randInt(2, 8);
  const answer = formatQuadraticPolynomial(1, length + width, length * width);
  return buildQuestion({
    prompt: `A rectangle has side lengths (x + ${length}) and (x + ${width}). What polynomial represents the area?`,
    answer,
    problemType: "polynomial_area_model",
    difficulty,
    solutionSteps: [
      "Area is length times width.",
      `(x + ${length})(x + ${width})`,
      `Multiply the binomials to get ${answer}.`
    ]
  });
}

function generateDistributivePolynomial(difficulty = 1) {
  const k = randInt(2, 7);
  const a = randInt(1, 6);
  const b = randInt(-8, 8, [0]);
  const answer = `${formatTermPower(k * a, "x", 2)} ${formatSignedTerm(k * b, "x")}`;
  return buildQuestion({
    prompt: `Use the distributive property to simplify: ${k}x(${formatTerm(a, "x")} ${formatSigned(b)})`,
    answer,
    problemType: "distributive_polynomial",
    difficulty,
    solutionSteps: [
      "Distribute the monomial to each term inside the parentheses.",
      `${k}x × ${formatTerm(a, "x")} = ${formatTermPower(k * a, "x", 2)}`,
      `${k}x × ${b} = ${formatTerm(k * b, "x")}`,
      `Result: ${answer}`
    ]
  });
}

function generateSquareOfBinomial(difficulty = 1) {
  const sign = pickRandom([1, -1]);
  const b = randInt(2, 9);
  const mid = sign * 2 * b;
  const answer = formatQuadraticPolynomial(1, mid, b * b);
  return buildQuestion({
    prompt: `Expand: (x ${formatSigned(sign * b)})²`,
    answer,
    problemType: "square_of_binomial",
    difficulty,
    solutionSteps: [
      "Use the square of a binomial pattern.",
      `(x ${formatSigned(sign * b)})² = x² ${formatSignedTerm(mid, "x")} ${formatSigned(b * b)}`,
      `Result: ${answer}`
    ]
  });
}

function generateDifferenceOfSquaresExpand(difficulty = 1) {
  const b = randInt(2, 9);
  const answer = `x² - ${b * b}`;
  return buildQuestion({
    prompt: `Expand: (x + ${b})(x - ${b})`,
    answer,
    problemType: "difference_of_squares_expand",
    difficulty,
    solutionSteps: [
      "This is the difference of squares pattern.",
      `(x + ${b})(x - ${b}) = x² - ${b}²`,
      `Result: ${answer}`
    ]
  });
}

function generateSpecialProductIdentify(difficulty = 1) {
  const mode = pickRandom(["Perfect square trinomial", "Difference of squares"]);
  const b = randInt(2, 9);
  const prompt = mode === "Perfect square trinomial"
    ? `Identify the special product pattern: x² + ${2 * b}x + ${b * b}`
    : `Identify the special product pattern: x² - ${b * b}`;
  return buildQuestion({
    prompt,
    answer: mode,
    problemType: "special_product_identify",
    difficulty,
    solutionSteps: [
      "Look for a known special product pattern.",
      mode === "Perfect square trinomial"
        ? "A perfect square trinomial has the form a² + 2ab + b² or a² - 2ab + b²."
        : "A difference of squares has the form a² - b².",
      `The pattern is ${mode}.`
    ]
  });
}

function generateSpecialProductApplication(difficulty = 1) {
  const b = randInt(2, 9);
  const mode = pickRandom(["square", "difference"]);
  if (mode === "square") {
    const answer = formatQuadraticPolynomial(1, 2 * b, b * b);
    return buildQuestion({
      prompt: `Use a special product pattern to expand: (x + ${b})²`,
      answer,
      problemType: "special_product_application",
      difficulty,
      solutionSteps: [
        "Use (a + b)² = a² + 2ab + b².",
        `The result is ${answer}.`
      ]
    });
  }
  const answer = `x² - ${b * b}`;
  return buildQuestion({
    prompt: `Use a special product pattern to expand: (x + ${b})(x - ${b})`,
    answer,
    problemType: "special_product_application",
    difficulty,
    solutionSteps: [
      "Use (a + b)(a - b) = a² - b².",
      `The result is ${answer}.`
    ]
  });
}



/* ============================================================
   GENERATORS — UNIT 8: FACTORING
   QuestionFactory 4.0 Phase C
   ============================================================ */

function generateFactorGCFMonomial(difficulty = 1) {
  const g = randInt(2, 9);
  const a = randInt(2, 7);
  const b = randInt(2, 9);
  const prompt = `Factor completely: ${formatTermPower(g * a, "x", 2)} ${formatSignedTerm(g * b, "x")}`;
  const answer = `${formatTerm(g, "x")}(${formatTerm(a, "x")} ${formatSigned(b)})`;

  return buildQuestion({
    prompt,
    answer,
    problemType: "factor_gcf_monomial",
    difficulty,
    solutionSteps: [
      "Find the greatest common factor of both terms.",
      `The GCF of ${formatTermPower(g * a, "x", 2)} and ${formatTerm(g * b, "x")} is ${formatTerm(g, "x")}.`,
      `Factor out ${formatTerm(g, "x")}.`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorGCFPolynomial(difficulty = 1) {
  const g = randInt(2, 8);
  const a = randInt(1, 5);
  const b = randInt(2, 7);
  const c = randInt(2, 9);
  const inside = formatQuadraticPolynomial(a, b, c);
  const prompt = `Factor completely: ${formatQuadraticPolynomial(g * a, g * b, g * c)}`;
  const answer = `${g}(${inside})`;

  return buildQuestion({
    prompt,
    answer,
    problemType: "factor_gcf_polynomial",
    difficulty,
    solutionSteps: [
      "Find the greatest common factor of all terms.",
      `The GCF is ${g}.`,
      `Divide each term by ${g}.`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorGCFWithNegative(difficulty = 1) {
  const g = randInt(2, 7);
  const a = randInt(1, 5);
  const b = randInt(2, 8);
  const c = randInt(2, 9);
  const inside = formatQuadraticPolynomial(a, b, c);
  const prompt = `Factor completely: ${formatQuadraticPolynomial(-g * a, -g * b, -g * c)}`;
  const answer = `-${g}(${inside})`;

  return buildQuestion({
    prompt,
    answer,
    problemType: "factor_gcf_with_negative",
    difficulty,
    solutionSteps: [
      "When the leading term is negative, factor out a negative GCF.",
      `The negative GCF is -${g}.`,
      `Divide each term by -${g}.`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorGCFApplication(difficulty = 1) {
  const widthGcf = randInt(2, 6);
  const a = randInt(2, 6);
  const b = randInt(2, 9);
  const expression = `${formatTermPower(widthGcf * a, "x", 2)} ${formatSignedTerm(widthGcf * b, "x")}`;
  const answer = `${formatTerm(widthGcf, "x")}(${formatTerm(a, "x")} ${formatSigned(b)})`;

  return buildQuestion({
    prompt: `A rectangle has area ${expression}. Which factored expression can represent its area?`,
    answer,
    problemType: "factor_gcf_application",
    difficulty,
    solutionSteps: [
      "Factor the area expression by finding the GCF.",
      `The GCF is ${formatTerm(widthGcf, "x")}.`,
      `The factored area expression is ${answer}.`
    ]
  });
}

function generateFactorTrinomialA1(difficulty = 1, overrideType = "factor_trinomial_a1") {
  const r = randInt(1, 9);
  const s = randInt(1, 9);
  const b = r + s;
  const c = r * s;
  const answer = `(x + ${r})(x + ${s})`;

  return buildQuestion({
    prompt: `Factor: x² + ${b}x + ${c}`,
    answer,
    problemType: overrideType,
    difficulty,
    solutionSteps: [
      `Find two numbers that multiply to ${c} and add to ${b}.`,
      `${r} × ${s} = ${c}`,
      `${r} + ${s} = ${b}`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorTrinomialPositiveC(difficulty = 1) {
  return generateFactorTrinomialA1(difficulty, "factor_trinomial_positive_c");
}

function generateFactorTrinomialNegativeC(difficulty = 1) {
  const r = randInt(2, 9);
  const s = -randInt(1, 8, [r]);
  const b = r + s;
  const c = r * s;
  const answer = `(x ${formatSigned(r)})(x ${formatSigned(s)})`;

  return buildQuestion({
    prompt: `Factor: x² ${formatSignedTerm(b, "x")} ${formatSigned(c)}`,
    answer,
    problemType: "factor_trinomial_negative_c",
    difficulty,
    solutionSteps: [
      `Find two numbers that multiply to ${c} and add to ${b}.`,
      `${r} × ${s} = ${c}`,
      `${r} + ${s} = ${b}`,
      `Result: ${answer}`
    ]
  });
}

function generateIdentifyFactorPair(difficulty = 1) {
  const r = randInt(1, 9);
  const s = randInt(1, 9);
  const b = r + s;
  const c = r * s;
  const answer = `${r} and ${s}`;

  return buildQuestion({
    prompt: `For x² + ${b}x + ${c}, which pair of numbers multiplies to ${c} and adds to ${b}?`,
    answer,
    problemType: "identify_factor_pair",
    difficulty,
    solutionSteps: [
      `The pair must multiply to ${c}.`,
      `The pair must add to ${b}.`,
      `${r} × ${s} = ${c} and ${r} + ${s} = ${b}.`
    ]
  });
}

function generateFactorTrinomialANot1(difficulty = 1, overrideType = "factor_trinomial_a_not_1") {
  const p = randInt(2, 5);
  const q = randInt(2, 5, [p]);
  const r = randInt(1, 6);
  const s = randInt(1, 6);
  const a = p * q;
  const b = p * s + q * r;
  const c = r * s;
  const answer = `(${formatTerm(p, "x")} + ${r})(${formatTerm(q, "x")} + ${s})`;

  return buildQuestion({
    prompt: `Factor: ${formatQuadraticPolynomial(a, b, c)}`,
    answer,
    problemType: overrideType,
    difficulty,
    solutionSteps: [
      "Factor into two binomials.",
      `${formatTerm(p, "x")} × ${formatTerm(q, "x")} = ${formatTermPower(a, "x", 2)}.`,
      `The outer and inner products combine to ${formatTerm(b, "x")}.`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorByGroupingQuadratic(difficulty = 1) {
  return generateFactorTrinomialANot1(difficulty, "factor_by_grouping_quadratic");
}

function generateFactorACMethod(difficulty = 1) {
  return generateFactorTrinomialANot1(difficulty, "factor_ac_method");
}

function generateIdentifyEquivalentFactoredForm(difficulty = 1) {
  return generateFactorTrinomialANot1(difficulty, "identify_equivalent_factored_form");
}

function generateFactorDifferenceOfSquares(difficulty = 1) {
  const n = randInt(2, 12);
  const answer = `(x + ${n})(x - ${n})`;

  return buildQuestion({
    prompt: `Factor: x² - ${n * n}`,
    answer,
    problemType: "factor_difference_of_squares",
    difficulty,
    solutionSteps: [
      "Recognize the pattern a² - b².",
      `x² - ${n * n} = x² - ${n}²`,
      `Use a² - b² = (a + b)(a - b).`,
      `Result: ${answer}`
    ]
  });
}

function generateFactorPerfectSquareTrinomial(difficulty = 1) {
  const sign = pickRandom([1, -1]);
  const n = randInt(2, 9);
  const b = sign * 2 * n;
  const c = n * n;
  const answer = `(x ${formatSigned(sign * n)})²`;

  return buildQuestion({
    prompt: `Factor: ${formatQuadraticPolynomial(1, b, c)}`,
    answer,
    problemType: "factor_perfect_square_trinomial",
    difficulty,
    solutionSteps: [
      "Recognize the perfect square trinomial pattern.",
      `The first term is x² and the last term is ${n}².`,
      `The middle term is ${formatTerm(b, "x")}.`,
      `Result: ${answer}`
    ]
  });
}

function generateIdentifySpecialFactoringPattern(difficulty = 1) {
  const mode = pickRandom(["Difference of squares", "Perfect square trinomial"]);
  const n = randInt(2, 9);
  const prompt = mode === "Difference of squares"
    ? `Identify the factoring pattern: x² - ${n * n}`
    : `Identify the factoring pattern: x² + ${2 * n}x + ${n * n}`;

  return buildQuestion({
    prompt,
    answer: mode,
    problemType: "identify_special_factoring_pattern",
    difficulty,
    solutionSteps: [
      "Look for a special factoring pattern.",
      mode === "Difference of squares"
        ? "A difference of squares has the form a² - b²."
        : "A perfect square trinomial has the form a² + 2ab + b².",
      `The pattern is ${mode}.`
    ]
  });
}

function generateMixedSpecialFactoring(difficulty = 1) {
  const question = Math.random() < 0.5
    ? generateFactorDifferenceOfSquares(difficulty)
    : generateFactorPerfectSquareTrinomial(difficulty);

  question.problemType = "mixed_special_factoring";
  return question;
}

function generateSolveQuadraticByFactoring(difficulty = 1) {
  const r = randInt(-9, 9, [0]);
  const s = randInt(-9, 9, [0, r]);
  const b = -(r + s);
  const c = r * s;
  const answer = normalizeMultipleSolutions(r, s);

  return buildQuestion({
    prompt: `Solve by factoring: ${formatQuadraticPolynomial(1, b, c)} = 0`,
    answer,
    problemType: "solve_quadratic_by_factoring",
    difficulty,
    solutionSteps: [
      `Factor the quadratic: ${formatQuadraticPolynomial(1, b, c)} = (x ${formatSigned(-r)})(x ${formatSigned(-s)}).`,
      "Use the zero product property.",
      `Set each factor equal to zero.`,
      `Solutions: ${answer}`
    ]
  });
}

function generateZeroProductProperty(difficulty = 1) {
  const r = randInt(-9, 9, [0]);
  const s = randInt(-9, 9, [0, r]);
  const answer = normalizeMultipleSolutions(r, s);

  return buildQuestion({
    prompt: `Use the zero product property to solve: (x ${formatSigned(-r)})(x ${formatSigned(-s)}) = 0`,
    answer,
    problemType: "zero_product_property",
    difficulty,
    solutionSteps: [
      "If a product equals zero, at least one factor must equal zero.",
      `Set x ${formatSigned(-r)} = 0 and x ${formatSigned(-s)} = 0.`,
      `Solutions: ${answer}`
    ]
  });
}

function generateQuadraticFactoringWordProblem(difficulty = 1) {
  const solution = randInt(2, 10);
  const other = -randInt(1, 8);
  const b = -(solution + other);
  const c = solution * other;

  return buildQuestion({
    prompt: `The height of an object is modeled by h(t) = ${formatQuadraticPolynomial(1, b, c)}. When does the object hit the ground? Use h(t) = 0 and choose the positive solution.`,
    answer: `t = ${solution}`,
    problemType: "quadratic_factoring_word_problem",
    difficulty,
    solutionSteps: [
      "Set the height equal to zero.",
      `Factor ${formatQuadraticPolynomial(1, b, c)} = 0.`,
      `The solutions are ${normalizeMultipleSolutions(solution, other)}.`,
      `Time cannot be negative, so t = ${solution}.`
    ]
  });
}

function generateIdentifyQuadraticSolutions(difficulty = 1) {
  const r = randInt(-8, 8, [0]);
  const s = randInt(-8, 8, [0, r]);
  const b = -(r + s);
  const c = r * s;
  const answer = normalizeMultipleSolutions(r, s);

  return buildQuestion({
    prompt: `What are the solutions of ${formatQuadraticPolynomial(1, b, c)} = 0?`,
    answer,
    problemType: "identify_quadratic_solutions",
    difficulty,
    solutionSteps: [
      `Factor the quadratic.`,
      `${formatQuadraticPolynomial(1, b, c)} = (x ${formatSigned(-r)})(x ${formatSigned(-s)})`,
      "Set each factor equal to zero.",
      `Solutions: ${answer}`
    ]
  });
}


/* ============================================================
   GENERATORS — UNIT 9: QUADRATIC FUNCTIONS
   QuestionFactory 4.0 Phase D
   ============================================================ */

function generateIdentifyQuadraticFunction(difficulty = 1) {
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-6, 6);
  const c = randInt(-8, 8);
  const answer = `y = ${formatQuadraticPolynomial(a, b, c)}`;

  return buildQuestion({
    prompt: `Which equation represents a quadratic function?`,
    answer,
    problemType: "identify_quadratic_function",
    difficulty,
    solutionSteps: [
      "A quadratic function contains an x² term as the highest power.",
      `${answer} has degree 2.`,
      "Therefore, it is a quadratic function."
    ]
  });
}

function generateQuadraticTablePattern(difficulty = 1) {
  const a = pickRandom([-2, -1, 1, 2]);
  const b = randInt(-3, 3);
  const c = randInt(-5, 5);
  const xs = [-2, -1, 0, 1];
  const ys = xs.map(x => a * x * x + b * x + c);

  return buildQuestion({
    prompt: `The table has x-values -2, -1, 0, 1 and y-values ${ys.join(", ")}. What type of function is shown?`,
    answer: "Quadratic function",
    problemType: "quadratic_table_pattern",
    difficulty,
    solutionSteps: [
      "A quadratic table has a constant second difference.",
      "The y-values do not change by a constant first difference.",
      "The pattern is quadratic."
    ]
  });
}

function generateQuadraticGraphShape(difficulty = 1) {
  return buildQuestion({
    prompt: "What is the shape of the graph of a quadratic function?",
    answer: "Parabola",
    problemType: "quadratic_graph_shape",
    difficulty,
    solutionSteps: [
      "Quadratic functions graph as U-shaped curves.",
      "That shape is called a parabola."
    ]
  });
}

function generateLinearVsQuadraticVsExponential(difficulty = 1) {
  const mode = pickRandom(["Linear function", "Quadratic function", "Exponential function"]);

  let values;
  if (mode === "Linear function") {
    const start = randInt(-5, 5);
    const rate = randInt(2, 6);
    values = [start, start + rate, start + 2 * rate, start + 3 * rate];
  } else if (mode === "Quadratic function") {
    const a = pickRandom([1, 2]);
    values = [0, 1, 2, 3].map(x => a * x * x + 1);
  } else {
    const start = randInt(1, 4);
    const factor = pickRandom([2, 3]);
    values = [start, start * factor, start * factor ** 2, start * factor ** 3];
  }

  return buildQuestion({
    prompt: `Classify the function from the output pattern: ${values.join(", ")}.`,
    answer: mode,
    problemType: "linear_vs_quadratic_vs_exponential",
    difficulty,
    solutionSteps: [
      "Linear patterns have constant first differences.",
      "Quadratic patterns have constant second differences.",
      "Exponential patterns have a constant multiplier.",
      `This pattern is a ${mode.toLowerCase()}.`
    ]
  });
}

function generateQuadraticVertex(difficulty = 1) {
  const h = randInt(-6, 6);
  const k = randInt(-8, 8);
  const a = pickRandom([-2, -1, 1, 2]);

  return buildQuestion({
    prompt: `For y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}, identify the vertex.`,
    answer: `(${formatNumber(h)}, ${formatNumber(k)})`,
    problemType: "quadratic_vertex",
    difficulty,
    solutionSteps: [
      "Vertex form is y = a(x - h)² + k.",
      `Here, h = ${formatNumber(h)} and k = ${formatNumber(k)}.`,
      `The vertex is (${formatNumber(h)}, ${formatNumber(k)}).`
    ]
  });
}

function generateQuadraticAxisOfSymmetry(difficulty = 1) {
  const h = randInt(-8, 8);
  const k = randInt(-6, 6);
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);

  return buildQuestion({
    prompt: `For y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}, what is the axis of symmetry?`,
    answer: `x = ${formatNumber(h)}`,
    problemType: "quadratic_axis_of_symmetry",
    difficulty,
    solutionSteps: [
      "The axis of symmetry is the vertical line through the vertex.",
      `The vertex has x-coordinate ${formatNumber(h)}.`,
      `So the axis of symmetry is x = ${formatNumber(h)}.`
    ]
  });
}

function generateQuadraticYIntercept(difficulty = 1) {
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-6, 6);
  const c = randInt(-9, 9);

  return buildQuestion({
    prompt: `For y = ${formatQuadraticPolynomial(a, b, c)}, what is the y-intercept?`,
    answer: `(0, ${formatNumber(c)})`,
    problemType: "quadratic_y_intercept",
    difficulty,
    solutionSteps: [
      "The y-intercept occurs when x = 0.",
      `Substitute x = 0 into ${formatQuadraticPolynomial(a, b, c)}.`,
      `The y-intercept is (0, ${formatNumber(c)}).`
    ]
  });
}

function generateQuadraticGraphFeatures(difficulty = 1, overrideType = "quadratic_graph_features") {
  const h = randInt(-5, 5);
  const k = randInt(-6, 6);
  const a = pickRandom([-2, -1, 1, 2]);
  const direction = a > 0 ? "opens up" : "opens down";
  const extremum = a > 0 ? "minimum" : "maximum";
  const answer = `${direction}; vertex (${formatNumber(h)}, ${formatNumber(k)}); ${extremum} value ${formatNumber(k)}`;

  return buildQuestion({
    prompt: `Identify the key features of y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}.`,
    answer,
    problemType: overrideType,
    difficulty,
    solutionSteps: [
      "Use vertex form y = a(x - h)² + k.",
      `The vertex is (${formatNumber(h)}, ${formatNumber(k)}).`,
      a > 0 ? "Because a is positive, the parabola opens up." : "Because a is negative, the parabola opens down.",
      `The ${extremum} value is ${formatNumber(k)}.`
    ]
  });
}

function generateVertexFormIdentifyVertex(difficulty = 1) {
  const h = randInt(-7, 7);
  const k = randInt(-7, 7);
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);

  return buildQuestion({
    prompt: `Identify the vertex of y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}.`,
    answer: `(${formatNumber(h)}, ${formatNumber(k)})`,
    problemType: "vertex_form_identify_vertex",
    difficulty,
    solutionSteps: [
      "Compare the equation to y = a(x - h)² + k.",
      `h = ${formatNumber(h)} and k = ${formatNumber(k)}.`,
      `The vertex is (${formatNumber(h)}, ${formatNumber(k)}).`
    ]
  });
}

function generateVertexFormTransformations(difficulty = 1) {
  const h = randInt(-6, 6);
  const k = randInt(-6, 6);
  const a = pickRandom([-2, -1, 1, 2]);
  const horizontal = h > 0 ? `${Math.abs(h)} units right` : h < 0 ? `${Math.abs(h)} units left` : "no horizontal shift";
  const vertical = k > 0 ? `${Math.abs(k)} units up` : k < 0 ? `${Math.abs(k)} units down` : "no vertical shift";
  const reflection = a < 0 ? "reflected over the x-axis" : "not reflected";
  const answer = `${horizontal}, ${vertical}, ${reflection}`;

  return buildQuestion({
    prompt: `Describe the transformation from y = x² to y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}.`,
    answer,
    problemType: "vertex_form_transformations",
    difficulty,
    solutionSteps: [
      "Use y = a(x - h)² + k.",
      `h controls the horizontal shift: ${horizontal}.`,
      `k controls the vertical shift: ${vertical}.`,
      `The sign of a gives: ${reflection}.`
    ]
  });
}

function generateVertexFormGraphFeatures(difficulty = 1) {
  return generateQuadraticGraphFeatures(difficulty, "vertex_form_graph_features");
}

function generateWriteVertexFormFromGraph(difficulty = 1) {
  const h = randInt(-5, 5);
  const k = randInt(-6, 6);
  const a = pickRandom([-2, -1, 1, 2]);
  const answer = `y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}`;

  return buildQuestion({
    prompt: `A parabola has vertex (${formatNumber(h)}, ${formatNumber(k)}) and a-value ${formatNumber(a)}. Write the function in vertex form.`,
    answer,
    problemType: "write_vertex_form_from_graph",
    difficulty,
    solutionSteps: [
      "Vertex form is y = a(x - h)² + k.",
      `Substitute a = ${formatNumber(a)}, h = ${formatNumber(h)}, and k = ${formatNumber(k)}.`,
      `The function is ${answer}.`
    ]
  });
}

function generateSolveQuadraticByGraphing(difficulty = 1) {
  const r = randInt(-8, 2);
  const s = randInt(3, 10, [r]);
  const b = -(r + s);
  const c = r * s;
  const answer = normalizeMultipleSolutions(r, s);

  return buildQuestion({
    prompt: `The graph of y = ${formatQuadraticPolynomial(1, b, c)} crosses the x-axis at its roots. Solve ${formatQuadraticPolynomial(1, b, c)} = 0 by graphing.`,
    answer,
    problemType: "solve_quadratic_by_graphing",
    difficulty,
    solutionSteps: [
      "Solutions by graphing are the x-values where the parabola crosses the x-axis.",
      `The x-intercepts are x = ${formatNumber(r)} and x = ${formatNumber(s)}.`,
      `So the solutions are ${answer}.`
    ]
  });
}

function generateIdentifyXIntercepts(difficulty = 1) {
  const r = randInt(-7, -1);
  const s = randInt(1, 8);
  const b = -(r + s);
  const c = r * s;
  const answer = `(${formatNumber(r)}, 0) and (${formatNumber(s)}, 0)`;

  return buildQuestion({
    prompt: `Identify the x-intercepts of y = ${formatQuadraticPolynomial(1, b, c)}.`,
    answer,
    problemType: "identify_x_intercepts",
    difficulty,
    solutionSteps: [
      "The x-intercepts occur where y = 0.",
      `Solve ${formatQuadraticPolynomial(1, b, c)} = 0.`,
      `The x-intercepts are ${answer}.`
    ]
  });
}

function generateQuadraticNumberOfSolutions(difficulty = 1) {
  const mode = pickRandom(["Two real solutions", "One real solution", "No real solutions"]);
  let prompt;

  if (mode === "Two real solutions") {
    const r = randInt(-6, -1);
    const s = randInt(1, 6);
    prompt = `How many real solutions does ${formatQuadraticPolynomial(1, -(r + s), r * s)} = 0 have?`;
  } else if (mode === "One real solution") {
    const r = randInt(-6, 6);
    prompt = `How many real solutions does x² ${formatSignedTerm(-2 * r, "x")} ${formatSigned(r * r)} = 0 have?`;
  } else {
    const k = randInt(1, 9);
    prompt = `How many real solutions does x² + ${k} = 0 have?`;
  }

  return buildQuestion({
    prompt,
    answer: mode,
    problemType: "quadratic_number_of_solutions",
    difficulty,
    solutionSteps: [
      "The number of real solutions equals the number of x-intercepts.",
      "A parabola can cross twice, touch once, or not cross the x-axis.",
      `This equation has ${mode.toLowerCase()}.`
    ]
  });
}

function generateInterpretQuadraticRoots(difficulty = 1) {
  const t = randInt(2, 10);
  const other = -randInt(1, 6);
  const b = -(t + other);
  const c = t * other;

  return buildQuestion({
    prompt: `The height of a ball is modeled by h(t) = ${formatQuadraticPolynomial(1, b, c)}. The roots are t = ${formatNumber(other)} and t = ${formatNumber(t)}. Which root makes sense in context?`,
    answer: `t = ${formatNumber(t)}`,
    problemType: "interpret_quadratic_roots",
    difficulty,
    solutionSteps: [
      "Roots represent times when the height is zero.",
      "Negative time does not make sense in this context.",
      `The meaningful root is t = ${formatNumber(t)}.`
    ]
  });
}

function generateQuadraticFormulaRealSolutions(difficulty = 1, overrideType = "quadratic_formula_real_solutions") {
  const r = randInt(-8, -1);
  const s = randInt(1, 8);
  const b = -(r + s);
  const c = r * s;
  const answer = normalizeMultipleSolutions(r, s);

  return buildQuestion({
    prompt: `Use the quadratic formula to solve: ${formatQuadraticPolynomial(1, b, c)} = 0`,
    answer,
    problemType: overrideType,
    difficulty,
    solutionSteps: [
      "Use x = (-b ± √(b² - 4ac)) ÷ 2a.",
      `For ${formatQuadraticPolynomial(1, b, c)}, a = 1, b = ${formatNumber(b)}, c = ${formatNumber(c)}.`,
      `The solutions are ${answer}.`
    ]
  });
}

function generateDiscriminantNumberOfSolutions(difficulty = 1) {
  const mode = pickRandom(["Two real solutions", "One real solution", "No real solutions"]);
  let a = 1, b, c, d;

  if (mode === "Two real solutions") {
    const r = randInt(-5, -1);
    const s = randInt(1, 5);
    b = -(r + s);
    c = r * s;
  } else if (mode === "One real solution") {
    const r = randInt(-5, 5);
    b = -2 * r;
    c = r * r;
  } else {
    b = 0;
    c = randInt(1, 9);
  }

  d = b * b - 4 * a * c;

  return buildQuestion({
    prompt: `Use the discriminant to determine the number of real solutions for ${formatQuadraticPolynomial(a, b, c)} = 0.`,
    answer: mode,
    problemType: "discriminant_number_of_solutions",
    difficulty,
    solutionSteps: [
      "The discriminant is b² - 4ac.",
      `Here, b² - 4ac = ${formatNumber(d)}.`,
      d > 0 ? "A positive discriminant means two real solutions." : d === 0 ? "A zero discriminant means one real solution." : "A negative discriminant means no real solutions.",
      `Answer: ${mode}.`
    ]
  });
}

function generateQuadraticFormulaSimplify(difficulty = 1) {
  return generateQuadraticFormulaRealSolutions(difficulty, "quadratic_formula_simplify");
}

function generateChooseCorrectQuadraticSolution(difficulty = 1) {
  return generateQuadraticFormulaRealSolutions(difficulty, "choose_correct_quadratic_solution");
}

function generateProjectileMotionQuadratic(difficulty = 1) {
  const hitTime = randInt(2, 10);
  const otherRoot = -randInt(1, 5);
  const a = -1;
  const b = hitTime + otherRoot;
  const c = -hitTime * otherRoot;

  return buildQuestion({
    prompt: `The height of a projectile is h(t) = ${formatQuadraticPolynomial(a, b, c)}. When does it hit the ground?`,
    answer: `t = ${formatNumber(hitTime)}`,
    problemType: "projectile_motion_quadratic",
    difficulty,
    solutionSteps: [
      "The object hits the ground when h(t) = 0.",
      "Solve the quadratic equation and choose the positive time.",
      `The positive solution is t = ${formatNumber(hitTime)}.`
    ]
  });
}

function generateMaximumMinimumQuadratic(difficulty = 1) {
  const h = randInt(-5, 5);
  const k = randInt(-10, 10);
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);
  const type = a > 0 ? "minimum" : "maximum";

  return buildQuestion({
    prompt: `For y = ${formatNumber(a)}(x ${formatSigned(-h)})² ${formatSigned(k)}, identify the ${type} value.`,
    answer: `The ${type} value is ${formatNumber(k)}`,
    problemType: "maximum_minimum_quadratic",
    difficulty,
    solutionSteps: [
      "The vertex gives the maximum or minimum value.",
      a > 0 ? "Because a is positive, the parabola has a minimum." : "Because a is negative, the parabola has a maximum.",
      `The ${type} value is the y-coordinate of the vertex: ${formatNumber(k)}.`
    ]
  });
}

function generateAreaQuadraticWordProblem(difficulty = 1) {
  const r = randInt(2, 9);
  const s = randInt(2, 9);
  const answer = formatQuadraticPolynomial(1, r + s, r * s);

  return buildQuestion({
    prompt: `A rectangle has side lengths x + ${r} and x + ${s}. Which quadratic expression represents the area?`,
    answer,
    problemType: "area_quadratic_word_problem",
    difficulty,
    solutionSteps: [
      "Area of a rectangle is length times width.",
      `(x + ${r})(x + ${s})`,
      `Multiply to get ${answer}.`
    ]
  });
}

function generateInterpretQuadraticContext(difficulty = 1) {
  const h = randInt(1, 8);
  const k = randInt(10, 80);

  return buildQuestion({
    prompt: `The path of a ball is modeled by h(t) = -2(t - ${h})² + ${k}. What does the vertex represent?`,
    answer: `The ball reaches a maximum height of ${k} at t = ${h}`,
    problemType: "interpret_quadratic_context",
    difficulty,
    solutionSteps: [
      "The vertex of a quadratic model gives the maximum or minimum value.",
      "Because the coefficient is negative, the parabola opens down.",
      `The maximum height is ${k} at t = ${h}.`
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

function cleanDisplayText(text) {
  return String(text)
    .replace(/\+\s*-/g, "- ")
    .replace(/-\s*-/g, "+ ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildQuestion({ prompt, answer, problemType, difficulty, solutionSteps }) {
  const meta = METADATA[problemType] || METADATA[normalizeMetaType(problemType)] || {};

  const cleanPrompt = cleanDisplayText(prompt);
  const cleanAnswer = cleanDisplayText(answer);
  const cleanSolutionSteps = Array.isArray(solutionSteps)
    ? solutionSteps.map(step => cleanDisplayText(step))
    : [];

  const choices = generateChoices(cleanAnswer, problemType);

   if (!areChoicesFamilyConsistent(cleanAnswer, problemType, choices)) {
  throw new Error(
    `QuestionFactory Choice Family Error: Invalid choices for ${problemType}: ${choices.join(" | ")}`
  );
}

  return {
    id: createId(),
    prompt: cleanPrompt,
    choices,
    answer: cleanAnswer,
    problemType,
    difficulty,
    hintSteps: meta.hintSteps || [
      "Read the question carefully.",
      "Identify what the problem is asking.",
      "Use the correct algebraic procedure."
    ],
    solutionSteps: cleanSolutionSteps || [],
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

  const uniqueChoices = new Set(q.choices.map(normalizeAnswerChoiceForEquivalence));
  if (uniqueChoices.size !== q.choices.length) return false;

  if (!q.choices.includes(q.answer)) return false;

  if (!Array.isArray(q.hintSteps) || q.hintSteps.length === 0) return false;
  if (!Array.isArray(q.solutionSteps) || q.solutionSteps.length === 0) return false;
  if (!q.misconception || q.misconception.trim().length < 5) return false;

  return true;
}



function isSemanticallyValidForProblemType(question) {
  if (!question || !question.prompt || !question.problemType) return false;

  const type = String(question.problemType || "").toLowerCase();
  const prompt = String(question.prompt || "");

  /*
    1.1 One-step equations:
    They should not contain parentheses and should contain only one visible variable term.
  */
  if (
    type === "one_step_equation" ||
    type === "one_step_addition_equation" ||
    type === "one_step_subtraction_equation" ||
    type === "one_step_multiplication_equation" ||
    type === "one_step_division_equation"
  ) {
    if (prompt.includes("(") || prompt.includes(")")) return false;
    return countVariableTerms(prompt) === 1;
  }

  /*
    1.2 Multi-step equations:
    They must show either true like terms or a distributive structure.
    This blocks mislabeled one-step equations such as x - 6 = -2.
  */
  if (type === "multi_step_equation") {
    const hasParentheses = prompt.includes("(") && prompt.includes(")");
    const variableTermCount = countVariableTerms(prompt);
    return hasParentheses || variableTermCount >= 2;
  }

  /*
    1.3 Variables on both sides:
    Both sides of the equation must visibly contain a variable.
  */
  if (type === "variables_both_sides") {
    const parts = splitEquationOrInequality(prompt);
    if (!parts) return false;

    return /[a-z]/i.test(parts.left) && /[a-z]/i.test(parts.right);
  }

  /*
    1.4 One-step inequalities:
    Must contain an inequality symbol, no parentheses, and only one visible variable term.
  */
  if (
    type === "inequality" ||
    type === "inequalities" ||
    type === "one_step_inequality" ||
    type === "one_step_inequalities"
  ) {
    if (!/[<>≤≥]/.test(prompt)) return false;
    if (prompt.includes("(") || prompt.includes(")")) return false;
    return countVariableTerms(prompt) === 1;
  }

  /*
    1.5 Multi-step inequalities:
    Must contain an inequality symbol and either like terms or distributive structure.
  */
  if (
    type === "multi_step_inequality" ||
    type === "multi_step_inequalities"
  ) {
    if (!/[<>≤≥]/.test(prompt)) return false;

    const hasParentheses = prompt.includes("(") && prompt.includes(")");
    const variableTermCount = countVariableTerms(prompt);
    return hasParentheses || variableTermCount >= 2;
  }

  /*
    1.6 Compound inequalities:
    Must contain AND/OR or be a three-part inequality.
  */
  if (
    type === "compound_inequality" ||
    type === "compound_inequalities"
  ) {
    const upper = prompt.toUpperCase();
    const hasAndOr = upper.includes(" AND ") || upper.includes(" OR ");
    const inequalitySymbolCount = (prompt.match(/[<>≤≥]/g) || []).length;

    return hasAndOr || inequalitySymbolCount >= 2;
  }

  /*
    1.7 Absolute value equations:
    Must visibly contain absolute value bars.
  */
  if (
    type === "absolute_value_equation" ||
    type === "absolute_value_equations"
  ) {
    return prompt.includes("|");
  }

  /*
    Future units:
    No blocking unless a semantic rule exists.
    This keeps current certified Units 2–9 stable while allowing rule expansion.
  */
  return true;
}

function countVariableTerms(text) {
  const matches = String(text || "").match(/-?\s*\d*\.?\d*\s*[a-z](?![a-z])/gi);
  return Array.isArray(matches) ? matches.length : 0;
}

function splitEquationOrInequality(prompt) {
  const text = String(prompt || "")
    .replace(/^Solve for [a-z]:/i, "")
    .replace(/^Solve the inequality:/i, "")
    .replace(/^Solve the compound inequality:/i, "")
    .trim();

  const match = text.match(/(.+?)(=|<|>|≤|≥)(.+)/);
  if (!match) return null;

  return {
    left: match[1].trim(),
    symbol: match[2].trim(),
    right: match[3].trim()
  };
}

function isQuestionAlignedToLesson(question, lesson) {
  if (!question || !lesson) return true;

  const allowedTypes =
    lesson.problemTypes ||
    lesson.allowedProblemTypes ||
    lesson.problem_types ||
    [];

  if (!isSemanticallyValidForProblemType(question)) {
    console.warn(
      "QuestionFactory 4.8 Semantic Skill Guard blocked a mislabeled question:",
      {
        lessonId: lesson?.id || lesson?.lessonId || lesson?.title,
        problemType: question.problemType,
        prompt: question.prompt
      }
    );

    return false;
  }

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



function normalizeMultipleSolutions(a, b) {
  const values = [Number(a), Number(b)]
    .map(cleanZero)
    .sort((x, y) => x - y);

  return `x = ${formatNumber(values[0])}, x = ${formatNumber(values[1])}`;
}

function normalizeTwoXIntercepts(a, b) {
  const values = [Number(a), Number(b)]
    .map(cleanZero)
    .sort((x, y) => x - y);

  return `(${formatNumber(values[0])}, 0) and (${formatNumber(values[1])}, 0)`;
}

function looksLikeTwoInterceptAnswer(text) {
  text = String(text || "").trim();

  const matches =
    text.match(/\((-?\d+(?:\.\d+)?),\s*0\)/g);

  return Array.isArray(matches) && matches.length === 2;
}

function extractTwoInterceptXValues(text) {
  if (!looksLikeTwoInterceptAnswer(text)) return null;

  const nums =
    String(text).match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

  // For "(a, 0) and (b, 0)", nums is [a, 0, b, 0].
  if (nums.length < 4) return null;

  return [nums[0], nums[2]];
}

function buildTwoSolutionDistractors(a, b, mode = "roots") {
  const first = Number(a);
  const second = Number(b);

  if (mode === "intercepts") {
    return [
      normalizeTwoXIntercepts(first + 1, second),
      normalizeTwoXIntercepts(first, second + 1),
      normalizeTwoXIntercepts(-first, second),
      normalizeTwoXIntercepts(first, -second),
      normalizeTwoXIntercepts(first - 1, second + 1),
      "No x-intercepts"
    ];
  }

  return [
    normalizeMultipleSolutions(first + 1, second),
    normalizeMultipleSolutions(first, second + 1),
    normalizeMultipleSolutions(-first, second),
    normalizeMultipleSolutions(first, -second),
    normalizeMultipleSolutions(first - 1, second + 1),
    "No real solutions"
  ];
}

function normalizeAnswerChoiceForEquivalence(choice) {
  const text = String(choice || "").trim();

  if (/^x\s*=/.test(text) && text.includes(",")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if (nums.length === 2) {
      return normalizeMultipleSolutions(nums[0], nums[1])
        .replace(/\s+/g, "")
        .toLowerCase();
    }
  }

  if (looksLikeTwoInterceptAnswer(text)) {
    const xs = extractTwoInterceptXValues(text);

    if (xs) {
      return normalizeTwoXIntercepts(xs[0], xs[1])
        .replace(/\s+/g, "")
        .toLowerCase();
    }
  }

  if (text.startsWith("{") && text.endsWith("}")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if (nums.length > 1) {
      return "{" + nums.sort((a, b) => a - b).map(formatNumber).join(",") + "}";
    }
  }

  return text.replace(/\s+/g, "").toLowerCase();
}

function addUniqueByEquivalence(list, choice) {
  if (choice === undefined || choice === null) return;

  const cleaned = String(choice).trim();
  if (!cleaned) return;

  const normalized = normalizeAnswerChoiceForEquivalence(cleaned);
  const existing = list.map(normalizeAnswerChoiceForEquivalence);

  if (!existing.includes(normalized)) {
    list.push(cleaned);
  }
}

function areChoicesFamilyConsistent(answer, problemType, choices) {
  const type = String(problemType || "").toLowerCase();
  const list = Array.isArray(choices) ? choices.map(String) : [];

  const forbiddenForExpression = [
    /^x\s*=/i,
    /^y\s*=/i,
    /^t\s*=/i,
    /all real numbers/i,
    /no solution/i,
    /no real solutions/i,
    /exponential growth/i,
    /exponential decay/i,
    /linear function/i,
    /quadratic function/i,
    /exponential function/i,
    /cannot be determined/i
  ];

  const isExponentExpressionSkill =
    type.includes("exponent") ||
    type.includes("scientific") ||
    type === "power_of_product" ||
    type === "power_of_quotient" ||
    type === "mixed_exponent_simplify" ||
    type === "rewrite_with_positive_exponents";

  if (isExponentExpressionSkill) {
    return list.every(choice =>
      !forbiddenForExpression.some(pattern => pattern.test(choice))
    );
  }

  return true;
}

function generateChoices(answer, problemType) {
  if (typeof answer !== "string") answer = String(answer);

  const type = String(problemType || "").toLowerCase();

  const addUnique = (list, choice) => {
    addUniqueByEquivalence(list, choice);
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

  // Quadratic-family questions must be handled BEFORE the generic exponent branch,
  // because linear_vs_quadratic_vs_exponential contains the word "exponential"
  // but needs function-type choices, not numeric exponent distractors.
  if (
    type.includes("quadratic") ||
    type.includes("vertex_form") ||
    type.includes("discriminant") ||
    type.includes("projectile") ||
    type.includes("maximum_minimum") ||
    type.includes("x_intercepts") ||
    type.includes("linear_vs_quadratic_vs_exponential")
  ) {
    return generateQuadraticAnswerChoices(answer, problemType, finalizeChoices);
  }

// Exponential FUNCTIONS / MODELS / TABLES / GRAPHS
if (
  type.includes("exponential_growth") ||
  type.includes("exponential_decay") ||
  type.includes("growth_decay") ||
  type.includes("identify_exponential") ||
  type.includes("write_exponential_model") ||
  type.includes("exponential_table") ||
  type.includes("exponential_graph") ||
  type.includes("compare_exponential_growth")
) {
  return generateExponentialFunctionAnswerChoices(
    answer,
    problemType,
    finalizeChoices
  );
}

  return finalizeChoices(answer, [
    "Exponential growth",
    "Exponential decay",
    "Exponential function",
    "Linear function",
    "Quadratic function",
    "Cannot be determined"
  ]);

}


// Exponent RULES
if (
  type.includes("exponent") ||
  type.includes("scientific")
) {

  return generateExponentAnswerChoices(
    answer,
    problemType,
    finalizeChoices
  );

}

  if (
    type.includes("polynomial") ||
    type.includes("binomial") ||
    type.includes("factor") ||
    type.includes("factoring") ||
    type.includes("zero_product") ||
    type.includes("special_product") ||
    type.includes("difference_of_squares") ||
    type.includes("monomial_times") ||
    type.includes("distributive_polynomial")
  ) {
    return generatePolynomialAnswerChoices(answer, problemType, finalizeChoices);
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
      const canonicalAnswer = normalizeMultipleSolutions(a, b);

      return finalizeChoices(
        canonicalAnswer,
        buildTwoSolutionDistractors(a, b, "roots").concat(["No Solution"])
      );
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
      buildTwoSolutionDistractors(a, b, "roots").forEach(choice => {
        if (choice !== answer) distractors.add(choice);
      });
      distractors.add("No Solution");
    }
  } else if (looksLikeTwoInterceptAnswer(answer)) {
    const xs = extractTwoInterceptXValues(answer);

    if (xs) {
      buildTwoSolutionDistractors(xs[0], xs[1], "intercepts").forEach(choice => {
        if (choice !== answer) distractors.add(choice);
      });
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

function generateExponentialFunctionAnswerChoices(answer, problemType, finalizeChoices) {
  const text = String(answer || "").trim();
  const type = String(problemType || "").toLowerCase();

  if (text === "Exponential growth" || text === "Exponential decay") {
    return finalizeChoices(text, [
      "Exponential growth",
      "Exponential decay",
      "Linear function",
      "Quadratic function"
    ]);
  }

  if (text === "Exponential function") {
    return finalizeChoices(text, [
      "Exponential function",
      "Linear function",
      "Quadratic function",
      "Not a function"
    ]);
  }

  if (text.startsWith("y = ")) {
    return finalizeChoices(text, [
      text.replace(/\^x/g, "^2"),
      text.replace(/\(([^)]+)\)\^x/g, "($1)x"),
      "y = 2x + 5",
      "y = x² + 3"
    ]);
  }

  if (text.startsWith("(0,")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    const y = nums[1];

    if (!Number.isNaN(y)) {
      return finalizeChoices(text, [
        `(0, ${formatNumber(y + 1)})`,
        `(0, ${formatNumber(Math.max(0, y - 1))})`,
        `(1, ${formatNumber(y)})`,
        `(${formatNumber(y)}, 0)`
      ]);
    }
  }

  if (!Number.isNaN(Number(text))) {
    const value = Number(text);

    return finalizeChoices(text, [
      formatNumber(value + 1),
      formatNumber(Math.max(0, value - 1)),
      formatNumber(value * 2),
      formatNumber(Math.round(value / 2))
    ]);
  }

  return finalizeChoices(text, [
    "Exponential growth",
    "Exponential decay",
    "Exponential function",
    "Linear function",
    "Quadratic function",
    "Cannot be determined"
  ]);
}
function generateExponentAnswerChoices(answer, problemType, finalizeChoices) {
  const text = String(answer || "").trim();
  const type = String(problemType || "").toLowerCase();

  const powerMatch = text.match(/^([a-z])\^(-?\d+)$/i);

  if (powerMatch) {
    const base = powerMatch[1];
    const exponent = Number(powerMatch[2]);

    return finalizeChoices(text, [
      `${base}^${exponent + 1}`,
      `${base}^${Math.max(0, exponent - 1)}`,
      `${base}^${exponent + 2}`,
      `${base}^${Math.abs(exponent)}`,
      "1",
      `${base}`
    ]);
  }

  const coefficientPowerMatch = text.match(/^(-?\d+)([a-z])\^(-?\d+)$/i);

  if (coefficientPowerMatch) {
    const coeff = Number(coefficientPowerMatch[1]);
    const variable = coefficientPowerMatch[2];
    const exponent = Number(coefficientPowerMatch[3]);

    return finalizeChoices(text, [
      `${coeff + 1}${variable}^${exponent}`,
      `${coeff}${variable}^${exponent + 1}`,
      `${coeff}${variable}^${Math.max(0, exponent - 1)}`,
      `${Math.abs(coeff)}${variable}^${exponent}`,
      "1",
      `${variable}^${exponent}`
    ]);
  }
  const quotientExpressionMatch = text.match(/^(-?\d+)([a-z])\^(-?\d+)\s*÷\s*(-?\d+)$/i);

  if (quotientExpressionMatch) {
    const coeff = Number(quotientExpressionMatch[1]);
    const variable = quotientExpressionMatch[2];
    const exponent = Number(quotientExpressionMatch[3]);
    const denominator = Number(quotientExpressionMatch[4]);

    return finalizeChoices(text, [
      `${coeff}${variable}^${exponent + 1} ÷ ${denominator}`,
      `${coeff}${variable}^${Math.max(1, exponent - 1)} ÷ ${denominator}`,
      `${coeff}${variable}^${exponent} ÷ ${denominator + 1}`,
      `${Math.max(1, coeff / 2)}${variable}^${exponent} ÷ ${denominator}`,
      `${coeff}${variable} ÷ ${denominator}`
    ]);
  }
   
  if (text.includes("× 10^")) {
    const expMatch = text.match(/×\s*10\^(-?\d+)/);
    const coeffMatch = text.match(/^(-?\d+(?:\.\d+)?)/);

    if (expMatch && coeffMatch) {
      const exponent = Number(expMatch[1]);
      const coeff = Number(coeffMatch[1]);

      return finalizeChoices(text, [
        `${formatNumber(coeff)} × 10^${exponent + 1}`,
        `${formatNumber(coeff)} × 10^${exponent - 1}`,
        `${formatNumber(coeff + 1)} × 10^${exponent}`,
        `${formatNumber(Math.max(1, coeff - 1))} × 10^${exponent}`,
        `${formatNumber(coeff)} × 10^${Math.abs(exponent)}`
      ]);
    }
  }

  if (!Number.isNaN(Number(text))) {
    const value = Number(text);

    return finalizeChoices(text, [
      formatNumber(value + 1),
      formatNumber(value - 1),
      formatNumber(value * 10),
      formatNumber(value / 10),
      "1",
      "0"
    ]);
  }

  return finalizeChoices(text, [
    String(text).replace("^", "^2"),
    String(text).replace("×", "÷"),
    "1",
    "0",
    "Cannot be determined"
  ]);
}

function generateQuadraticAnswerChoices(answer, problemType, finalizeChoices) {
  const text = String(answer || "").trim();
  const type = String(problemType || "").toLowerCase();

  // Critical semantic guard for 9.1:
  // An identify_quadratic_function item must have exactly ONE quadratic equation.
  // The distractors must be non-quadratic equations/functions.
  if (type === "identify_quadratic_function" && text.startsWith("y = ")) {
    return finalizeChoices(text, [
      "y = 5x + 3",
      "y = 2(3)^x",
      "y = |x| + 4",
      "y = 7"
    ]);
  }

  // Function-classification questions should never receive numeric choices like 0 or 1.
  if (["Quadratic function", "Linear function", "Exponential function"].includes(text)) {
    return finalizeChoices(text, [
      "Quadratic function",
      "Linear function",
      "Exponential function",
      "Not a function"
    ]);
  }

  if (["Parabola", "Line", "Exponential curve"].includes(text)) {
    return finalizeChoices(text, [
      "Parabola",
      "Line",
      "Exponential curve",
      "Circle"
    ]);
  }

  if (["Two real solutions", "One real solution", "No real solutions"].includes(text)) {
    return finalizeChoices(text, [
      "Two real solutions",
      "One real solution",
      "No real solutions",
      "Infinitely many solutions"
    ]);
  }

  // Real-world quadratic context answers must receive context-matched distractors.
  // They must never receive function-classification choices like "Linear function"
  // or "Exponential function".
  if (/^t\s*=\s*-?\d+(?:\.\d+)?$/i.test(text)) {
    const value = Number(text.match(/-?\d+(?:\.\d+)?/)?.[0]);

    if (!Number.isNaN(value)) {
      const candidates = [
        `t = ${formatNumber(value + 1)}`,
        `t = ${formatNumber(Math.max(0, value - 1))}`,
        `t = ${formatNumber(value + 2)}`,
        `t = ${formatNumber(-value)}`,
        "No real solution"
      ];

      return finalizeChoices(text, candidates);
    }
  }

  if (/^The (maximum|minimum) value is -?\d+(?:\.\d+)?$/i.test(text)) {
    const kind = text.toLowerCase().includes("maximum") ? "maximum" : "minimum";
    const value = Number(text.match(/-?\d+(?:\.\d+)?/)?.[0]);

    if (!Number.isNaN(value)) {
      const label = kind.charAt(0).toUpperCase() + kind.slice(1);

      return finalizeChoices(text, [
        `The ${kind} value is ${formatNumber(value + 1)}`,
        `The ${kind} value is ${formatNumber(value - 1)}`,
        `The ${kind === "maximum" ? "minimum" : "maximum"} value is ${formatNumber(value)}`,
        `${label} occurs at x = ${formatNumber(value)}`
      ]);
    }
  }

  if (/^The ball reaches a maximum height of -?\d+(?:\.\d+)? at t = -?\d+(?:\.\d+)?$/i.test(text)) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if (nums.length >= 2) {
      const [height, time] = nums;

      return finalizeChoices(text, [
        `The ball reaches a maximum height of ${formatNumber(height + 5)} at t = ${formatNumber(time)}`,
        `The ball reaches a maximum height of ${formatNumber(height)} at t = ${formatNumber(time + 1)}`,
        `The ball reaches a minimum height of ${formatNumber(height)} at t = ${formatNumber(time)}`,
        `The ball reaches a maximum height of ${formatNumber(Math.max(0, height - 5))} at t = ${formatNumber(Math.max(0, time - 1))}`
      ]);
    }
  }

  // Area/context answers that are polynomial expressions should receive polynomial distractors,
  // not function-type distractors.
  if (type.includes("area_quadratic") && text.includes("x²")) {
    const coeffs = text.match(/-?\d+/g)?.map(Number) || [];
    const candidates = [];

    if (coeffs.length > 0) {
      candidates.push(text.replace(String(coeffs[0]), String(coeffs[0] + 1)));
    }

    candidates.push(
      text.replace(/\+\s*/g, "- "),
      text.replace(/-\s*/g, "+ "),
      "x² + 2x + 1",
      "x² - 2x + 1",
      "2x² + 3x + 1"
    );

    return finalizeChoices(text, candidates);
  }

  if (text === "opens up" || text === "opens down") {
    return finalizeChoices(text, [
      text === "opens up" ? "opens down" : "opens up",
      "opens left",
      "opens right",
      "cannot be determined"
    ]);
  }

  if (text.startsWith("x = ") && !text.includes(",")) {
    const value = Number(text.replace("x = ", ""));
    if (!Number.isNaN(value)) {
      return finalizeChoices(text, [
        `x = ${formatNumber(value + 1)}`,
        `x = ${formatNumber(value - 1)}`,
        `x = ${formatNumber(-value)}`,
        "No real solutions"
      ]);
    }
  }

  if (text.startsWith("x = ") && text.includes(",")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 2) {
      const [a, b] = nums;
      return finalizeChoices(
        normalizeMultipleSolutions(a, b),
        buildTwoSolutionDistractors(a, b, "roots")
      );
    }
  }

  // Two x-intercept answers must be handled BEFORE single-coordinate answers.
  // Otherwise a correct answer like "(-7, 0) and (5, 0)" is mistakenly treated
  // as one coordinate pair and receives weak one-intercept distractors.
  if (looksLikeTwoInterceptAnswer(text)) {
    const xs = extractTwoInterceptXValues(text);

    if (xs) {
      return finalizeChoices(
        normalizeTwoXIntercepts(xs[0], xs[1]),
        buildTwoSolutionDistractors(xs[0], xs[1], "intercepts")
      );
    }
  }

  if (text.startsWith("(") && text.includes(",")) {
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 2) {
      const [x, y] = nums;
      return finalizeChoices(text, [
        `(${formatNumber(-x)}, ${formatNumber(y)})`,
        `(${formatNumber(x)}, ${formatNumber(-y)})`,
        `(${formatNumber(y)}, ${formatNumber(x)})`,
        `(0, ${formatNumber(y)})`
      ]);
    }
  }

  if (text.includes("maximum") || text.includes("minimum")) {
    return finalizeChoices(text, [
      text.replace("maximum", "minimum"),
      text.replace("minimum", "maximum"),
      "The y-intercept is the maximum.",
      "Cannot be determined"
    ]);
  }

  if (text.startsWith("y = ")) {
    return finalizeChoices(text, [
      text.replace("+", "-"),
      text.replace("-", "+"),
      "y = x + 1",
      "y = 2(3)^x",
      "Cannot be determined"
    ]);
  }

  return finalizeChoices(text, [
    "Quadratic function",
    "Linear function",
    "Exponential function",
    "Two real solutions",
    "One real solution",
    "No real solutions",
    "Cannot be determined"
  ]);
}

function generatePolynomialAnswerChoices(answer, problemType, finalizeChoices) {
  const text = String(answer || "").trim();
  const type = String(problemType || "").toLowerCase();

  if (["Linear", "Quadratic", "Cubic", "Quartic"].includes(text)) {
    return finalizeChoices(text, [
      "Linear",
      "Quadratic",
      "Cubic",
      "Quartic"
    ]);
  }

  if (["Monomial", "Binomial", "Trinomial", "Polynomial with 4 terms"].includes(text)) {
    return finalizeChoices(text, [
      "Monomial",
      "Binomial",
      "Trinomial",
      "Polynomial with 4 terms"
    ]);
  }

  if (text === "Perfect square trinomial" || text === "Difference of squares") {
    return finalizeChoices(text, [
      "Perfect square trinomial",
      "Difference of squares",
      "Sum of cubes",
      "Not a special product"
    ]);
  }

  if (!Number.isNaN(Number(text))) {
    const value = Number(text);
    return finalizeChoices(text, [
      `${value + 1}`,
      `${value - 1}`,
      `${-value}`,
      "Cannot be determined"
    ]);
  }

  const coeffs = text.match(/-?\d+/g)?.map(Number) || [];
  const candidates = [];

  if (text.includes("x²")) {
    candidates.push(text.replace("x²", "x"));
    candidates.push(text.replace(/\+\s*/g, "- "));
    candidates.push(text.replace(/-\s*/g, "+ "));
  }

  if (coeffs.length > 0) {
    const changedFirst = text.replace(String(coeffs[0]), String(coeffs[0] + 1));
    candidates.push(changedFirst);
  }

  candidates.push(
    "x² + 2x + 1",
    "x² - 2x + 1",
    "2x² + 3x + 1",
    "x² - 4",
    "Cannot be determined"
  );

  return finalizeChoices(text, candidates);
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
   POLYNOMIAL FORMAT HELPERS
   ============================================================ */

function formatTermPower(coefficient, variable, power) {
  if (power === 0) return formatNumber(coefficient);
  if (power === 1) return formatTerm(coefficient, variable);
  if (coefficient === 1) return `${variable}²`.replace("²", power === 2 ? "²" : `^${power}`);
  if (coefficient === -1) return `-${variable}${power === 2 ? "²" : `^${power}`}`;
  return `${formatNumber(coefficient)}${variable}${power === 2 ? "²" : `^${power}`}`;
}

function formatSignedTermPower(coefficient, variable, power) {
  if (coefficient < 0) return `- ${formatTermPower(Math.abs(coefficient), variable, power)}`;
  return `+ ${formatTermPower(coefficient, variable, power)}`;
}

function formatQuadraticPolynomial(a, b, c) {
  const parts = [];

  if (a !== 0) parts.push(formatTermPower(a, "x", 2));

  if (b !== 0) {
    if (parts.length === 0) parts.push(formatTerm(b, "x"));
    else parts.push(formatSignedTerm(b, "x"));
  }

  if (c !== 0) {
    if (parts.length === 0) parts.push(formatNumber(c));
    else parts.push(formatSigned(c));
  }

  return parts.join(" ").trim() || "0";
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
   SEMANTIC SKILL AUDIT
   Browser console helper:
   AlgebraQuestionFactorySemanticAudit()
   ============================================================ */

export function AlgebraQuestionFactorySemanticAudit() {
  const testLessons = [
    {
      id: "1.1-test",
      title: "One-Step Equations",
      problemTypes: [
        "one_step_equation",
        "one_step_addition_equation",
        "one_step_subtraction_equation",
        "one_step_multiplication_equation",
        "one_step_division_equation"
      ]
    },
    {
      id: "1.2-test",
      title: "Multi-Step Equations",
      problemTypes: ["multi_step_equation"]
    },
    {
      id: "1.3-test",
      title: "Variables on Both Sides",
      problemTypes: ["variables_both_sides"]
    },
    {
      id: "1.4-test",
      title: "Inequalities",
      problemTypes: ["inequalities", "one_step_inequality"]
    },
    {
      id: "1.5-test",
      title: "Multi-Step Inequalities",
      problemTypes: ["multi_step_inequalities"]
    },
    {
      id: "1.6-test",
      title: "Compound Inequalities",
      problemTypes: ["compound_inequalities"]
    },
    {
      id: "1.7-test",
      title: "Absolute Value Equations",
      problemTypes: ["absolute_value_equations"]
    }
  ];

  const rows = [];

  testLessons.forEach(lesson => {
    for (let i = 0; i < 25; i++) {
      const q = generateQuestionForLesson(lesson);

      rows.push({
        lesson: lesson.id,
        problemType: q.problemType,
        prompt: q.prompt,
        semanticPass: isSemanticallyValidForProblemType(q),
        alignedPass: isQuestionAlignedToLesson(q, lesson)
      });
    }
  });

  const summary = {
    total: rows.length,
    pass: rows.filter(row => row.semanticPass && row.alignedPass).length,
    fail: rows.filter(row => !row.semanticPass || !row.alignedPass).length,
    failures: rows.filter(row => !row.semanticPass || !row.alignedPass)
  };

  console.table(rows);
  console.log("AlgebraQuestionFactorySemanticAudit Summary:", summary);

  return summary;
}

if (typeof window !== "undefined") {
  window.AlgebraQuestionFactorySemanticAudit = AlgebraQuestionFactorySemanticAudit;
}


/* ============================================================
   HINT QUALITY AUDIT
   Browser console helper:
   AlgebraQuestionFactoryHintAudit()
   ============================================================ */

export function AlgebraQuestionFactoryHintAudit() {
  const generatorTypes = Object.keys(GENERATORS);
  const defaultHints = [
    "Read the question carefully.",
    "Identify what the problem is asking.",
    "Use the correct algebraic procedure."
  ];

  const rows = generatorTypes.map(type => {
    const normalized = normalizeMetaType(type);
    const meta = METADATA[type] || METADATA[normalized] || {};
    const hasSpecificHints =
      Array.isArray(meta.hintSteps) &&
      meta.hintSteps.length > 0 &&
      JSON.stringify(meta.hintSteps) !== JSON.stringify(defaultHints);

    const hasMisconception =
      typeof meta.misconception === "string" &&
      meta.misconception.trim().length >= 5;

    return {
      problemType: type,
      normalizedType: normalized,
      hasSpecificHints,
      hasMisconception,
      status: hasSpecificHints && hasMisconception ? "PASS" : "WARNING"
    };
  });

  const summary = {
    totalProblemTypes: rows.length,
    pass: rows.filter(row => row.status === "PASS").length,
    warning: rows.filter(row => row.status !== "PASS").length,
    rows
  };

  console.table(rows);
  console.log("Hint Quality Audit Summary:", summary);

  return summary;
}

if (typeof window !== "undefined") {
  window.AlgebraQuestionFactoryHintAudit = AlgebraQuestionFactoryHintAudit;
}


/* ============================================================
   OPTIONAL DEBUG TEST
   You can run this from browser console if imported:
   generateQuestionsForLesson({
     title: "Test Lesson",
     problemTypes: ["variables_both_sides"]
   }, 5)
   ============================================================ */
