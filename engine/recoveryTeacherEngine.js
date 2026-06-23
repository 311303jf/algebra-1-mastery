/*
==================================================
 Algebra OS — Recovery Teacher Engine
 Version: 3400

 Purpose:
 - Select the best AI teacher automatically.
 - No lesson-by-lesson hardcoding.
 - Generalizes to Algebra 1, Geometry OS, Algebra 2, Precalculus.
==================================================
*/

export function buildRecoveryTeacher(
  problemType,
  skillDefinition = {},
  metadata = {},
  currentQuestion = null,
  parsed = null
) {
  const profile = buildTeacherProfile(problemType, skillDefinition, currentQuestion, parsed);

  if (profile.teacherFamily === "LinearTeacher") {
    return buildLinearTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "InequalityTeacher") {
    return buildInequalityTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "ExponentTeacher") {
    return buildExponentTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "PolynomialTeacher") {
    return buildPolynomialTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "FactoringTeacher") {
    return buildFactoringTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "QuadraticTeacher") {
    return buildQuadraticTeacher(profile, metadata);
  }

  if (profile.teacherFamily === "FunctionTeacher") {
    return buildFunctionTeacher(profile, metadata);
  }

  return buildUniversalTeacher(profile, metadata);
}

export function buildTeacherProfile(problemType, skillDefinition = {}, currentQuestion = null, parsed = null) {
  const key = normalizeKey(problemType);
  const family = normalizeKey(skillDefinition.family || parsed?.family || "");

  let teacherFamily = "UniversalTeacher";
  let subTeacher = "GeneralTeacher";

  if (
    family.includes("linear_equation") ||
    key.includes("equation") ||
    key.includes("variables_both_sides") ||
    key.includes("combine_like_terms") ||
    key.includes("distributive")
  ) {
    teacherFamily = "LinearTeacher";

    if (key.includes("one_step")) subTeacher = "OneStepEquationTeacher";
    else if (key.includes("two_step")) subTeacher = "TwoStepEquationTeacher";
    else if (key.includes("multi_step")) subTeacher = "MultiStepEquationTeacher";
    else if (key.includes("combine_like")) subTeacher = "MultiStepEquationTeacher";
    else if (key.includes("distributive")) subTeacher = "MultiStepEquationTeacher";
    else if (key.includes("variables_both_sides")) subTeacher = "VariablesBothSidesTeacher";
  }

  if (family.includes("inequality") || key.includes("inequalit")) {
    teacherFamily = "InequalityTeacher";

    if (key.includes("compound")) subTeacher = "CompoundInequalityTeacher";
    else if (key.includes("absolute")) subTeacher = "AbsoluteValueTeacher";
    else subTeacher = "LinearInequalityTeacher";
  }

  if (
    family.includes("absolute_value") ||
    key.includes("absolute_value")
  ) {
    teacherFamily = "InequalityTeacher";
    subTeacher = "AbsoluteValueTeacher";
  }

  if (
    family.includes("exponent") ||
    family.includes("scientific") ||
    family.includes("exponential") ||
    key.includes("exponent") ||
    key.includes("scientific") ||
    key.includes("growth") ||
    key.includes("decay")
  ) {
    teacherFamily = "ExponentTeacher";

    if (key.includes("product_rule")) subTeacher = "ProductRuleTeacher";
    else if (key.includes("quotient_rule")) subTeacher = "QuotientRuleTeacher";
    else if (key.includes("power_rule")) subTeacher = "PowerRuleTeacher";
    else if (key.includes("scientific")) subTeacher = "ScientificNotationTeacher";
    else if (key.includes("growth") || key.includes("decay") || key.includes("exponential")) subTeacher = "GrowthDecayTeacher";
    else subTeacher = "GeneralExponentTeacher";
  }

  if (
    family.includes("polynomial") ||
    key.includes("polynomial") ||
    key.includes("monomial") ||
    key.includes("binomial")
  ) {
    teacherFamily = "PolynomialTeacher";

    if (key.includes("classif")) subTeacher = "PolynomialClassificationTeacher";
    else if (key.includes("add") || key.includes("subtract")) subTeacher = "AddSubtractPolynomialTeacher";
    else if (key.includes("multiply")) subTeacher = "MultiplyPolynomialTeacher";
    else if (key.includes("special_product")) subTeacher = "SpecialProductsTeacher";
    else subTeacher = "GeneralPolynomialTeacher";
  }

  if (
    family.includes("factoring") ||
    key.includes("factor") ||
    key.includes("trinomial") ||
    key.includes("difference_of_squares")
  ) {
    teacherFamily = "FactoringTeacher";

    if (key.includes("gcf")) subTeacher = "GCFTeacher";
    else if (key.includes("difference_of_squares")) subTeacher = "DifferenceOfSquaresTeacher";
    else if (key.includes("perfect_square")) subTeacher = "PerfectSquareTrinomialTeacher";
    else if (key.includes("trinomial_a1") || key.includes("trinomial_positive") || key.includes("trinomial_negative")) subTeacher = "TrinomialA1Teacher";
    else if (key.includes("trinomial_an") || key.includes("a_not_1") || key.includes("a_ne_1")) subTeacher = "TrinomialANTeacher";
    else if (key.includes("special")) subTeacher = "MixedSpecialFactoringTeacher";
    else subTeacher = "GeneralFactoringTeacher";
  }

  if (
    family.includes("quadratic") ||
    family.includes("vertex_form") ||
    key.includes("quadratic") ||
    key.includes("vertex") ||
    key.includes("parabola") ||
    key.includes("axis_of_symmetry")
  ) {
    teacherFamily = "QuadraticTeacher";

    if (key.includes("vertex_form")) subTeacher = "VertexFormTeacher";
    else if (key.includes("graph")) subTeacher = "GraphTeacher";
    else if (key.includes("axis")) subTeacher = "AxisOfSymmetryTeacher";
    else if (key.includes("standard_form")) subTeacher = "StandardFormTeacher";
    else if (key.includes("application") || key.includes("word")) subTeacher = "ApplicationsTeacher";
    else if (key.includes("solve") || key.includes("zero_product")) subTeacher = "SolvingQuadraticsTeacher";
    else subTeacher = "QuadraticClassificationTeacher";
  }

  if (
    family.includes("function") ||
    key.includes("function") ||
    key.includes("linear_vs_quadratic") ||
    key.includes("classification")
  ) {
    teacherFamily = "FunctionTeacher";
    subTeacher = "FunctionClassificationTeacher";
  }

  return {
    problemType,
    key,
    family: skillDefinition.family || parsed?.family || "general_math",
    strategy: skillDefinition.strategy || parsed?.strategy || "conceptual_teaching",
    teacherFamily,
    subTeacher,
    currentQuestion,
    parsed,
    originalText: getQuestionText(currentQuestion) || parsed?.originalText || ""
  };
}

/* =========================================================
   TEACHERS
========================================================= */

function buildLinearTeacher(profile, metadata) {
  if (profile.subTeacher === "OneStepEquationTeacher") {
    return makeTeacherLesson(profile, metadata, {
      title: "AI Algebra Teacher: One-Step Equations",
      conceptSummary: [
        "A one-step equation has one operation attached to the variable.",
        "To solve it, undo that operation using the inverse operation.",
        "Whatever is done to one side of the equation must also be done to the other side."
      ],
      tutorDialogue: [
        teacherStep(
          "understand_equation_balance",
          "An equation is like a balance scale. Both sides must stay equal. If we change one side, we must make the same change to the other side.",
          "Why do we do the same operation to both sides?",
          ["To keep the equation balanced", "To make the numbers bigger", "To change the variable", "To guess faster"],
          "To keep the equation balanced",
          "Correct. The equal sign means both sides must remain balanced."
        ),
        teacherStep(
          "inverse_operations",
          "Inverse operations undo each other. Addition is undone by subtraction. Multiplication is undone by division.",
          "What operation undoes addition?",
          ["Subtraction", "Addition", "Multiplication", "Division"],
          "Subtraction",
          "Correct. Subtraction undoes addition."
        ),
        teacherStep(
          "micro_practice",
          "Try this: x + 7 = 15. To isolate x, subtract 7 from both sides.",
          "What is x?",
          ["x = 8", "x = 22", "x = 7", "x = 15"],
          "x = 8",
          "Correct. 15 − 7 = 8, so x = 8."
        )
      ],
      workedExample: [
        "Example: x + 6 = 14",
        "The operation attached to x is addition by 6.",
        "Undo addition by subtracting 6 from both sides.",
        "x + 6 − 6 = 14 − 6",
        "x = 8"
      ],
      recoveryPractice: [
        mc("Solve: x + 5 = 12", "x = 7", ["x = 7", "x = 17", "x = 5", "x = 12"]),
        mc("Solve: 4x = 28", "x = 7", ["x = 7", "x = 24", "x = 32", "x = 4"])
      ]
    });
  }

  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Linear Equations",
    conceptSummary: [
      "Linear equations are solved by simplifying first and then isolating the variable.",
      "If there are like terms or parentheses, clean up the equation before solving.",
      "The goal is always to get the variable alone."
    ],
    tutorDialogue: [
      teacherStep(
        "simplify_first",
        "Before solving a multi-step equation, look for anything that can be simplified: like terms or parentheses.",
        "What should we do before isolating x in a multi-step equation?",
        ["Simplify the equation", "Guess the answer", "Change the equal sign", "Ignore parentheses"],
        "Simplify the equation",
        "Correct. Simplifying first makes the equation easier to solve."
      ),
      teacherStep(
        "isolate_variable",
        "After simplifying, move constants away from the variable term, then divide by the coefficient if needed.",
        "After simplifying, what is the goal?",
        ["Isolate the variable", "Make both sides larger", "Remove the equal sign", "Stop solving"],
        "Isolate the variable",
        "Correct. The final goal is to get the variable alone."
      ),
      teacherStep(
        "micro_practice",
        "Try this: 3x + 2x + 4 = 19. First combine 3x and 2x to get 5x + 4 = 19.",
        "What equation comes after combining like terms?",
        ["5x + 4 = 19", "6x = 19", "3x + 6 = 19", "5x = 19"],
        "5x + 4 = 19",
        "Correct. 3x + 2x = 5x."
      )
    ],
    workedExample: [
      "Example: 2x + 3x + 5 = 20",
      "Combine like terms: 5x + 5 = 20",
      "Subtract 5 from both sides: 5x = 15",
      "Divide both sides by 5.",
      "x = 3"
    ],
    recoveryPractice: [
      mc("Solve: 2x + 3x + 4 = 19", "x = 3", ["x = 3", "x = 5", "x = 15", "x = 19"]),
      mc("Solve: 2(x + 3) = 14", "x = 4", ["x = 4", "x = 7", "x = 11", "x = 2"])
    ]
  });
}

function buildInequalityTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Inequalities",
    conceptSummary: [
      "Inequalities are solved much like equations.",
      "The special rule is that the inequality symbol reverses when multiplying or dividing by a negative number.",
      "The answer represents a set of values, not just one value."
    ],
    tutorDialogue: [
      teacherStep(
        "inequality_meaning",
        "An inequality compares two sides using symbols like <, >, ≤, or ≥. The solution is usually many numbers.",
        "What does an inequality solution usually represent?",
        ["A set of values", "Only one value", "A graph color", "A random number"],
        "A set of values",
        "Correct. Inequalities usually have many possible solutions."
      ),
      teacherStep(
        "reverse_rule",
        "Here is the key rule: when you multiply or divide both sides by a negative number, reverse the inequality symbol.",
        "When do we reverse the inequality symbol?",
        ["When multiplying or dividing by a negative", "Every time", "When adding", "When subtracting"],
        "When multiplying or dividing by a negative",
        "Correct. Only multiplication or division by a negative reverses the symbol."
      ),
      teacherStep(
        "micro_practice",
        "Try this: -2x < 8. Divide both sides by -2, and reverse the symbol.",
        "What is the solution?",
        ["x > -4", "x < -4", "x > 4", "x < 4"],
        "x > -4",
        "Correct. Dividing by -2 reverses < to >."
      )
    ],
    workedExample: [
      "Example: -3x ≥ 12",
      "Divide both sides by -3.",
      "Because we divided by a negative, reverse the symbol.",
      "x ≤ -4"
    ],
    recoveryPractice: [
      mc("Solve: -2x < 10", "x > -5", ["x > -5", "x < -5", "x > 5", "x < 5"]),
      mc("When do you reverse an inequality symbol?", "When multiplying or dividing by a negative", ["When multiplying or dividing by a negative", "When adding", "When subtracting", "Always"])
    ]
  });
}

function buildExponentTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Exponents",
    conceptSummary: [
      "Exponent rules depend on the structure of the expression.",
      "Multiplying same bases means add exponents.",
      "Dividing same bases means subtract exponents.",
      "A power raised to a power means multiply exponents."
    ],
    tutorDialogue: [
      teacherStep(
        "same_base",
        "The first thing to notice is whether the bases are the same. Exponent rules work when the bases match.",
        "In x² · x³, what is the base?",
        ["x", "2", "3", "5"],
        "x",
        "Correct. The base is x."
      ),
      teacherStep(
        "product_rule",
        "When multiplying powers with the same base, keep the base and add the exponents.",
        "What is x² · x³?",
        ["x⁵", "x⁶", "x¹", "2x³"],
        "x⁵",
        "Correct. Add the exponents: 2 + 3 = 5."
      ),
      teacherStep(
        "micro_practice",
        "Try this: y⁴ · y². Same base, so add the exponents.",
        "What is the simplified form?",
        ["y⁶", "y⁸", "y²", "2y⁶"],
        "y⁶",
        "Correct. 4 + 2 = 6."
      )
    ],
    workedExample: [
      "Example: x³ · x⁴",
      "The bases are the same: x.",
      "Use the product rule.",
      "Add exponents: 3 + 4 = 7.",
      "x³ · x⁴ = x⁷"
    ],
    recoveryPractice: [
      mc("Simplify: x² · x⁵", "x⁷", ["x⁷", "x¹⁰", "x³", "2x⁵"]),
      mc("Simplify: (x²)³", "x⁶", ["x⁶", "x⁵", "x⁸", "x²"])
    ]
  });
}

function buildPolynomialTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Polynomials",
    conceptSummary: [
      "Polynomials are expressions made of terms.",
      "Terms are separated by addition or subtraction.",
      "Classification depends on degree and number of terms."
    ],
    tutorDialogue: [
      teacherStep(
        "terms",
        "A term is a piece of an expression separated by plus or minus signs.",
        "How many terms are in x² + 5x + 6?",
        ["3", "2", "1", "6"],
        "3",
        "Correct. x², 5x, and 6 are three terms."
      ),
      teacherStep(
        "classification",
        "A polynomial with three terms is called a trinomial.",
        "What is x² + 5x + 6?",
        ["Trinomial", "Binomial", "Monomial", "Equation"],
        "Trinomial",
        "Correct. It has three terms."
      ),
      teacherStep(
        "micro_practice",
        "Try this: 4x³ − 2x. This has two terms.",
        "What type of polynomial is it?",
        ["Binomial", "Trinomial", "Monomial", "Constant"],
        "Binomial",
        "Correct. Two terms means binomial."
      )
    ],
    workedExample: [
      "Example: 3x² + 2x − 7",
      "Terms: 3x², 2x, −7",
      "There are three terms.",
      "The highest exponent is 2.",
      "This is a quadratic trinomial."
    ],
    recoveryPractice: [
      mc("How many terms are in x² + 4x + 4?", "3", ["3", "2", "1", "4"]),
      mc("A polynomial with two terms is called what?", "Binomial", ["Binomial", "Trinomial", "Monomial", "Quadratic"])
    ]
  });
}

function buildFactoringTeacher(profile, metadata) {
  if (profile.subTeacher === "DifferenceOfSquaresTeacher") {
    return makeTeacherLesson(profile, metadata, {
      title: "AI Algebra Teacher: Difference of Squares",
      conceptSummary: [
        "A difference of squares has two perfect square terms.",
        "The operation between them must be subtraction.",
        "The pattern is a² − b² = (a + b)(a − b)."
      ],
      tutorDialogue: [
        teacherStep(
          "perfect_squares",
          "Look at x² − 81. The first term x² is a square, and 81 is also a square because 81 = 9².",
          "What is 81 written as a square?",
          ["9²", "8²", "81²", "3²"],
          "9²",
          "Correct. 9 × 9 = 81."
        ),
        teacherStep(
          "difference_pattern",
          "Because the expression is subtraction between two squares, we use a² − b² = (a + b)(a − b).",
          "Which pattern matches x² − 81?",
          ["a² − b²", "a² + b²", "a² + 2ab + b²", "ax² + bx + c"],
          "a² − b²",
          "Correct. It is a difference of squares."
        ),
        teacherStep(
          "micro_practice",
          "Now factor x² − 81. Since 81 = 9², the factors are (x + 9)(x − 9).",
          "What is the factored form?",
          ["(x + 9)(x − 9)", "(x + 81)(x − 81)", "(x − 9)(x − 9)", "(x + 9)(x + 9)"],
          "(x + 9)(x − 9)",
          "Correct. Difference of squares uses conjugate factors."
        )
      ],
      workedExample: [
        "Example: x² − 81",
        "81 = 9²",
        "Both terms are perfect squares.",
        "The operation is subtraction.",
        "Use a² − b² = (a + b)(a − b).",
        "x² − 81 = (x + 9)(x − 9)"
      ],
      recoveryPractice: [
        mc("Factor: x² − 49", "(x + 7)(x − 7)", ["(x + 7)(x − 7)", "(x + 49)(x − 49)", "(x − 7)(x − 7)", "(x + 7)(x + 7)"]),
        mc("Why is x² − 25 a difference of squares?", "Both terms are squares and subtraction is between them", ["Both terms are squares and subtraction is between them", "It has three terms", "It has addition", "It has no variable"])
      ]
    });
  }

  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Factoring",
    conceptSummary: [
      "Factoring rewrites an expression as multiplication.",
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Always check by multiplying the factors back."
    ],
    tutorDialogue: [
      teacherStep(
        "factoring_meaning",
        "Factoring is the reverse of multiplying. We are rewriting a polynomial as a product.",
        "What does factoring rewrite an expression as?",
        ["A product", "A sum only", "A graph", "A table"],
        "A product",
        "Correct. Factoring rewrites an expression as multiplication."
      ),
      teacherStep(
        "trinomial_rule",
        "For x² + bx + c, the two numbers must multiply to c and add to b.",
        "For x² + 5x + 6, what numbers multiply to 6 and add to 5?",
        ["2 and 3", "1 and 6", "5 and 6", "4 and 2"],
        "2 and 3",
        "Correct. 2 × 3 = 6 and 2 + 3 = 5."
      ),
      teacherStep(
        "micro_practice",
        "So x² + 5x + 6 factors as (x + 2)(x + 3).",
        "Factor x² + 7x + 10.",
        ["(x + 5)(x + 2)", "(x + 10)(x + 1)", "(x − 5)(x − 2)", "(x + 7)(x + 10)"],
        "(x + 5)(x + 2)",
        "Correct. 5 × 2 = 10 and 5 + 2 = 7."
      )
    ],
    workedExample: [
      "Example: x² + 5x + 6",
      "Find two numbers that multiply to 6.",
      "The pair 2 and 3 multiplies to 6.",
      "2 and 3 also add to 5.",
      "x² + 5x + 6 = (x + 2)(x + 3)"
    ],
    recoveryPractice: [
      mc("Factor: x² + 8x + 15", "(x + 3)(x + 5)", ["(x + 3)(x + 5)", "(x + 1)(x + 15)", "(x − 3)(x − 5)", "(x + 8)(x + 15)"]),
      mc("For x² + 9x + 20, which pair works?", "4 and 5", ["4 and 5", "2 and 10", "1 and 20", "3 and 6"])
    ]
  });
}

function buildQuadraticTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Quadratics",
    conceptSummary: [
      "A quadratic function has x² as its highest power.",
      "Its graph is a parabola.",
      "Important features include vertex, axis of symmetry, intercepts, and roots."
    ],
    tutorDialogue: [
      teacherStep(
        "quadratic_family",
        "A quadratic function is identified by the x² term. The highest exponent is 2.",
        "What highest exponent tells us a function is quadratic?",
        ["2", "1", "0", "x"],
        "2",
        "Correct. Quadratic means degree 2."
      ),
      teacherStep(
        "parabola",
        "The graph of a quadratic function is called a parabola. It has a turning point called the vertex.",
        "What is the turning point of a parabola called?",
        ["Vertex", "Slope", "Initial value", "Rate of change"],
        "Vertex",
        "Correct. The vertex is the turning point."
      ),
      teacherStep(
        "micro_practice",
        "Try this: y = x² + 4x + 1. The highest exponent is 2.",
        "What type of function is it?",
        ["Quadratic function", "Linear function", "Exponential function", "Not a function"],
        "Quadratic function",
        "Correct. The x² term makes it quadratic."
      )
    ],
    workedExample: [
      "Example: y = x² + 3x + 2",
      "The highest exponent of x is 2.",
      "Therefore, it is a quadratic function.",
      "Its graph is a parabola."
    ],
    recoveryPractice: [
      mc("What is the graph of a quadratic function called?", "Parabola", ["Parabola", "Line", "Circle", "Ray"]),
      mc("If the vertex is (3, -2), what is the axis of symmetry?", "x = 3", ["x = 3", "y = 3", "x = -2", "y = -2"])
    ]
  });
}

function buildFunctionTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: "AI Algebra Teacher: Function Classification",
    conceptSummary: [
      "Linear functions add or subtract by a constant amount.",
      "Quadratic functions have constant second differences.",
      "Exponential functions multiply by a constant factor."
    ],
    tutorDialogue: [
      teacherStep(
        "compare_families",
        "Tables can be classified by patterns. Linear has constant first differences. Quadratic has constant second differences. Exponential has a constant multiplier.",
        "Which family has constant second differences?",
        ["Quadratic function", "Linear function", "Exponential function", "Not a function"],
        "Quadratic function",
        "Correct. Constant second differences indicate quadratic."
      ),
      teacherStep(
        "exponential_pattern",
        "Exponential functions multiply by the same factor each step.",
        "Which pattern suggests exponential growth?",
        ["2, 4, 8, 16", "2, 4, 6, 8", "2, 5, 10, 17", "10, 7, 4, 1"],
        "2, 4, 8, 16",
        "Correct. Each output is multiplied by 2."
      ),
      teacherStep(
        "micro_practice",
        "Outputs: 3, 6, 12, 24. Each value is multiplied by 2.",
        "What type of function is this?",
        ["Exponential function", "Linear function", "Quadratic function", "Not a function"],
        "Exponential function",
        "Correct. A constant multiplier means exponential."
      )
    ],
    workedExample: [
      "Example outputs: 1, 4, 9, 16",
      "First differences: 3, 5, 7",
      "Second differences: 2, 2",
      "Because second differences are constant, the function is quadratic."
    ],
    recoveryPractice: [
      mc("Which family has constant first differences?", "Linear function", ["Linear function", "Quadratic function", "Exponential function", "Not a function"]),
      mc("Which family multiplies by the same factor?", "Exponential function", ["Exponential function", "Linear function", "Quadratic function", "Not a function"])
    ]
  });
}

function buildUniversalTeacher(profile, metadata) {
  return makeTeacherLesson(profile, metadata, {
    title: `AI Algebra Teacher: ${formatTitle(profile.problemType)}`,
    conceptSummary: [
      "Let’s slow the problem down and understand what it is asking.",
      "Good algebra starts by recognizing the structure of the expression or equation.",
      "Then we apply the rule that matches that structure."
    ],
    tutorDialogue: [
      teacherStep(
        "understand_problem",
        "We are going to read the problem carefully and look for its structure.",
        "What should we focus on first?",
        ["The structure of the problem", "Guessing", "The longest answer", "Skipping the question"],
        "The structure of the problem",
        "Correct. Understanding the structure tells us what math idea to use."
      ),
      teacherStep(
        "why_steps_matter",
        "Algebra works because each step follows a rule. We do not just choose answers; we justify them.",
        "Why do we show steps?",
        ["To justify the answer", "To make it longer", "To avoid math", "To guess randomly"],
        "To justify the answer",
        "Correct. Steps show why the answer is true."
      )
    ],
    workedExample: [
      "Read the problem.",
      "Identify the structure.",
      "Apply the correct rule.",
      "Check whether the answer makes sense."
    ],
    recoveryPractice: [
      mc("What should you look for first?", "The structure of the problem", ["The structure of the problem", "A random number", "The longest answer", "The graph color"]),
      mc("Why should you check your answer?", "To make sure it makes sense", ["To make sure it makes sense", "To change the problem", "To avoid solving", "To guess faster"])
    ]
  });
}

/* =========================================================
   HELPERS
========================================================= */

function makeTeacherLesson(profile, metadata, parts) {
  return {
    title: parts.title,
    diagnostic: {
      problemType: profile.problemType,
      family: profile.family,
      strategy: profile.strategy,
      teacherFamily: profile.teacherFamily,
      subTeacher: profile.subTeacher,
      tutorType: "recovery_teacher_v3400",
      parsed: profile.parsed || null
    },
    conceptSummary: parts.conceptSummary,
    misconception:
      metadata?.misconception ||
      "A common mistake is trying to answer before understanding why the method works.",
    tutorDialogue: parts.tutorDialogue,
    workedExample: parts.workedExample,
    video: null,
    recoveryPractice: parts.recoveryPractice,
    source: "recoveryTeacherEngine_v3400"
  };
}

function teacherStep(id, concept, question, choices, answer, explanation) {
  return {
    id,
    tutor:
      `<div><strong>Teacher:</strong> ${escapeHtml(concept)}</div>` +
      `<div style="margin-top:10px;">${escapeHtml(question)}</div>`,
    choices,
    expected: [answer],
    explanation,
    theory: concept
  };
}

function mc(prompt, answer, choices) {
  return { prompt, answer, choices };
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function formatTitle(value) {
  return String(value || "Skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function getQuestionText(currentQuestion) {
  if (typeof currentQuestion === "string") return currentQuestion;
  return (
    currentQuestion?.prompt ||
    currentQuestion?.question ||
    currentQuestion?.text ||
    ""
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.AlgebraRecoveryTeacherEngine = {
  buildRecoveryTeacher,
  buildTeacherProfile
};
