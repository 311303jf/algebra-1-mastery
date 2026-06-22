import {
  parseRecoveryQuestion
} from "./recoveryParserEngine.js?v=2300";
/*
  Algebra OS — Recovery Template Engine
  Version: 2200

  Purpose:
  - Generate reusable Recovery Tutor templates from registry definitions. 
  - Reduce lesson-specific hardcoding.
  - Provide automatic generic tutors for skills not yet supported by custom parsers.
*/

export function buildTemplateRecoveryLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null) {
  const tutorType = skillDefinition.tutor || "generic_skill";
  const parsed = parseRecoveryQuestion(problemType, currentQuestion, skillDefinition);
    if (
    skillDefinition.family === "vertex_form" ||
    skillDefinition.family === "quadratic_graphs" ||
    skillDefinition.family === "quadratic_functions" ||
    skillDefinition.family === "function_classification"
  ) {
    return buildQuadraticFamilyTeacherV3300(
      problemType,
      skillDefinition,
      metadata,
      currentQuestion,
      parsed
    );
  }

  if (skillDefinition.tutor === "linear_equation_template") {
  return buildLinearEquationTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

  if (skillDefinition.tutor === "multi_step_template") {
  return buildMultiStepTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (skillDefinition.tutor === "variables_both_sides_template") {
  return buildVariablesBothSidesTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

  if (skillDefinition.tutor === "exponent_template") {
  return buildExponentTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (
  skillDefinition.family === "factoring" ||
  skillDefinition.tutor === "factoring_template"
) {
  return buildFactoringFamilyTeacherV3301(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (problemType === "identify_quadratic_function") {
  return buildIdentifyQuadraticFunctionTeacherV3300(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}
  if (skillDefinition.tutor === "quadratic_template") {
  return buildQuadraticTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}
  
if (skillDefinition.family === "linear_inequality") {
  return buildLinearInequalityTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (skillDefinition.family === "compound_inequality") {
  return buildCompoundInequalityTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (skillDefinition.family === "absolute_value") {
  return buildAbsoluteValueTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (tutorType === "generic_skill") {
  return buildGenericTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

return null;
}

function buildGenericTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const strategyName = formatStrategyName(skillDefinition.strategy || "identify_skill");

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
  problemType,
  family: skillDefinition.family || "generic",
  strategy: skillDefinition.strategy || "identify_skill",
  tutorType: "generic_skill_template",
  parsed
},
    conceptSummary: [
      `This skill belongs to the ${formatSkillName(skillDefinition.family || "general math")} family.`,
      `The main strategy is: ${strategyName}.`,
      "Read the problem carefully, identify what is being asked, and choose the method that matches the skill."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is trying to solve before identifying the skill and the first correct strategy.",
    tutorDialogue: [
      {
        id: "identify_skill",
        tutor: `<div><strong>Skill:</strong> ${escapeHtml(skillName)}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The skill and strategy",
          "A random answer",
          "The longest answer choice",
          "A number to guess"
        ],
        expected: ["The skill and strategy"],
        explanation: `Correct. First identify the skill and the strategy: <strong>${escapeHtml(strategyName)}</strong>.`,
        theory: "Before solving, match the problem to the correct skill. This prevents using the wrong procedure."
      },
      {
        id: "choose_strategy",
        tutor: `<div><strong>Strategy:</strong> ${escapeHtml(strategyName)}</div><div style="margin-top:8px;">What should you do next?</div>`,
        choices: [
          "Apply the matching strategy carefully",
          "Skip the steps",
          "Change the problem",
          "Ignore the given information"
        ],
        expected: ["Apply the matching strategy carefully"],
        explanation: "Correct. Use the matching strategy and check each step.",
        theory: "Every skill has a strategy. Good algebra starts by choosing the right strategy before calculating."
      }
    ],
    workedExample: [
      `Skill: ${skillName}.`,
      `Strategy: ${strategyName}.`,
      "Step 1: Identify what the question is asking.",
      "Step 2: Choose the matching strategy.",
      "Step 3: Solve carefully and check the answer."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: `What should you identify first when practicing ${skillName}?`,
        answer: "The skill and strategy"
      },
      {
        prompt: `What should you apply after identifying the skill?`,
        answer: "The matching strategy"
      }
    ],
    source: "recoveryTemplateEngine_v2200"
  };
}

function buildLinearEquationTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const operation = skillDefinition.operation || "mixed";

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "linear_equation",
      strategy: skillDefinition.strategy || "inverse_operation",
      operation,
      tutorType: "linear_equation_template",
      parsed
    },
    conceptSummary: [
      "A linear equation is solved by isolating the variable.",
      "Use inverse operations to undo what is attached to the variable.",
      "Whatever you do to one side, you must do to the other side."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is using the same operation instead of the inverse operation.",
    tutorDialogue: [
      {
        id: "identify_operation",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "linear equation")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The operation attached to the variable",
          "A random answer",
          "The largest number",
          "The answer choice pattern"
        ],
        expected: ["The operation attached to the variable"],
        explanation: "Correct. First identify what operation is attached to the variable.",
        theory: "To solve an equation, first ask what is being done to the variable. Then undo that operation."
      },
      {
        id: "use_inverse",
        tutor: `<div><strong>Strategy:</strong> Use inverse operations.</div><div style="margin-top:8px;">What should you do to isolate the variable?</div>`,
        choices: [
          "Use the inverse operation on both sides",
          "Only change the left side",
          "Only change the right side",
          "Guess and check only"
        ],
        expected: ["Use the inverse operation on both sides"],
        explanation: "Correct. Use the inverse operation on both sides to keep the equation balanced.",
        theory: "Equations stay balanced only when the same operation is applied to both sides."
      }
    ],
    workedExample: [
      "Identify the operation attached to the variable.",
      "Choose the inverse operation.",
      "Apply the inverse operation to both sides.",
      "Simplify and check the solution."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "What should you identify first in a one-step equation?",
        answer: "The operation attached to the variable"
      },
      {
        prompt: "What operation should you use to isolate the variable?",
        answer: "The inverse operation"
      }
    ],
    source: "recoveryTemplateEngine_v2600"
  };
}
function buildMultiStepTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const firstStep = skillDefinition.firstStep || "simplify";

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "linear_equation",
      strategy: skillDefinition.strategy || "simplify_then_solve",
      firstStep,
      tutorType: "multi_step_template",
      parsed
    },
    conceptSummary: [
      "A multi-step equation must be simplified before solving.",
      "First combine like terms or use the distributive property when needed.",
      "After simplifying, use inverse operations to isolate the variable."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is jumping straight to the answer without simplifying first.",
    tutorDialogue: [
      {
        id: "identify_first_step",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "multi-step equation")}</div><div style="margin-top:8px;">What should you do first?</div>`,
        choices: [
          firstStep === "distributive_property" ? "Use the distributive property" : "Combine like terms",
          "Divide both sides immediately",
          "Guess the value of x",
          "Ignore the expression structure"
        ],
        expected: [
          firstStep === "distributive_property" ? "Use the distributive property" : "Combine like terms"
        ],
        explanation:
          firstStep === "distributive_property"
            ? "Correct. First use the distributive property to remove parentheses."
            : "Correct. First combine like terms before solving.",
        theory: "Before solving a multi-step equation, simplify the expression so the equation becomes easier to solve."
      },
      {
        id: "solve_after_simplifying",
        tutor: `<div><strong>Strategy:</strong> Simplify first, then solve.</div><div style="margin-top:8px;">What should you do after simplifying?</div>`,
        choices: [
          "Use inverse operations to isolate the variable",
          "Stop immediately",
          "Change the equation",
          "Use only mental guessing"
        ],
        expected: ["Use inverse operations to isolate the variable"],
        explanation: "Correct. After simplifying, use inverse operations to isolate the variable.",
        theory: "Once the equation is simplified, solve it like a two-step or one-step equation."
      }
    ],
    workedExample: [
      "Inspect the equation structure.",
      firstStep === "distributive_property"
        ? "Use the distributive property first."
        : "Combine like terms first.",
      "Simplify the equation.",
      "Use inverse operations.",
      "Check the solution."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "What should you usually do first in a multi-step equation?",
        answer:
          firstStep === "distributive_property"
            ? "Use the distributive property"
            : "Combine like terms"
      },
      {
        prompt: "What should you do after simplifying?",
        answer: "Use inverse operations"
      }
    ],
    source: "recoveryTemplateEngine_v2700"
  };
}

function buildVariablesBothSidesTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "linear_equation",
      strategy: skillDefinition.strategy || "move_variables_first",
      tutorType: "variables_both_sides_template",
      parsed
    },
    conceptSummary: [
      "When variables appear on both sides, move variable terms to one side first.",
      "Then move constants to the other side.",
      "Finally, use inverse operations to isolate the variable."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is moving constants first before collecting variable terms.",
    tutorDialogue: [
      {
        id: "move_variables_first",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "variables on both sides")}</div><div style="margin-top:8px;">What should you move first?</div>`,
        choices: [
          "Move variable terms",
          "Move constants first",
          "Divide immediately",
          "Change the equal sign"
        ],
        expected: ["Move variable terms"],
        explanation: "Correct. Move variable terms first so all variables are on one side.",
        theory: "Variables on both sides must be collected before isolating the variable."
      },
      {
        id: "move_constants_next",
        tutor: `<div><strong>Strategy:</strong> Variables first, constants second.</div><div style="margin-top:8px;">What should you move after variable terms are together?</div>`,
        choices: [
          "Move constants",
          "Move variables again",
          "Stop solving",
          "Guess the answer"
        ],
        expected: ["Move constants"],
        explanation: "Correct. After variables are together, move constants away from the variable term.",
        theory: "Once variables are on one side, move constants to the other side and solve."
      }
    ],
    workedExample: [
      "Identify variable terms on both sides.",
      "Move variable terms to one side.",
      "Move constants to the other side.",
      "Divide or multiply to isolate the variable.",
      "Check the solution."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "What should you move first when variables are on both sides?",
        answer: "Move variable terms"
      },
      {
        prompt: "What should you move after variable terms are together?",
        answer: "Move constants"
      }
    ],
    source: "recoveryTemplateEngine_v2700"
  };
}

function buildExponentTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const strategy = skillDefinition.strategy || "exponent_rule";

  const strategyLabel =
    strategy === "add_exponents"
      ? "Add the exponents"
      : strategy === "subtract_exponents"
        ? "Subtract the exponents"
        : strategy === "multiply_exponents"
          ? "Multiply the exponents"
          : strategy === "distribute_power"
            ? "Apply the power to each factor"
            : "Identify the exponent rule";

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "exponents",
      strategy,
      tutorType: "exponent_template",
      parsed
    },
    conceptSummary: [
      "Exponent rules depend on the structure of the expression.",
      "When multiplying same bases, add exponents.",
      "When dividing same bases, subtract exponents.",
      "When raising a power to a power, multiply exponents."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is using the wrong exponent rule, such as multiplying exponents when the product rule requires addition.",
    tutorDialogue: [
      {
        id: "identify_rule",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "exponent expression")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The exponent rule",
          "Only the base letter",
          "A random exponent",
          "The largest number"
        ],
        expected: ["The exponent rule"],
        explanation: `Correct. First identify the rule. Here the strategy is: <strong>${escapeHtml(strategyLabel)}</strong>.`,
        theory: "Exponent problems are mostly about matching the structure to the correct rule."
      },
      {
        id: "apply_rule",
        tutor: `<div><strong>Strategy:</strong> ${escapeHtml(strategyLabel)}</div><div style="margin-top:8px;">What should you do next?</div>`,
        choices: [
          strategyLabel,
          "Always add the bases",
          "Always multiply the bases",
          "Ignore the exponent"
        ],
        expected: [strategyLabel],
        explanation: "Correct. Apply the matching exponent rule carefully.",
        theory: "The base usually stays the same. The operation changes how the exponents combine."
      }
    ],
    workedExample: [
      "Look at the structure of the expression.",
      "Decide which exponent rule applies.",
      `Use the strategy: ${strategyLabel}.`,
      "Simplify and check that the base stays consistent."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "When multiplying powers with the same base, what do you do with the exponents?",
        answer: "Add the exponents"
      },
      {
        prompt: "When raising a power to a power, what do you do with the exponents?",
        answer: "Multiply the exponents"
      }
    ],
    source: "recoveryTemplateEngine_v2800"
  };
}
function buildFactoringFamilyTeacherV3301(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const strategy = skillDefinition.strategy || "factor_expression";

  const isTrinomial =
    problemType === "factor_trinomial_a1" ||
    problemType === "factor_trinomial_positive_c" ||
    problemType === "factor_trinomial_negative_c" ||
    strategy === "find_two_numbers";

  if (isTrinomial) {
    return buildTrinomialTeacherV3301(
      problemType,
      skillDefinition,
      metadata,
      currentQuestion,
      parsed
    );
  }

  return buildFactoringTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

function buildTrinomialTeacherV3301(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const problemText = currentQuestion?.prompt || parsed?.originalText || "Factor x² + 5x + 6";
  const answerText = currentQuestion?.answer || "(x + 2)(x + 3)";

  return {
    title: "AI Math Teacher: Factoring Trinomials",
    diagnostic: {
      problemType,
      family: "factoring",
      strategy: "find_two_numbers",
      tutorType: "trinomial_teacher_v3301",
      parsed
    },
    conceptSummary: [
      "Factoring rewrites a trinomial as a product of two binomials.",
      "For x² + bx + c, find two numbers that multiply to c and add to b.",
      "Those two numbers become the constants inside the binomial factors.",
      "Always check by multiplying the factors back."
    ],
    misconception:
      metadata?.misconception ||
      "Students often find two numbers that multiply to c but forget they must also add to b.",
    tutorDialogue: [
      {
        id: "identify_trinomial_structure",
        tutor:
          `<div><strong>Let’s learn factoring trinomials step by step.</strong></div>` +
          `<div style="margin-top:8px;">A trinomial like this has the form:</div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">x² + bx + c</div>` +
          `<div style="margin-top:10px;">What are we trying to rewrite it as?</div>`,
        choices: [
          "A product of two binomials",
          "A single number",
          "A linear equation",
          "A graph"
        ],
        expected: ["A product of two binomials"],
        explanation:
          "Correct. Factoring rewrites the trinomial as a product of two binomials.",
        theory:
          "Factoring is the reverse of multiplying. We are undoing the trinomial back into binomial factors."
      },
      {
        id: "multiply_and_add_rule",
        tutor:
          `<div><strong>Key rule:</strong></div>` +
          `<div style="margin-top:8px;font-size:20px;font-weight:1000;color:#1e3a8a;">x² + bx + c</div>` +
          `<div style="margin-top:10px;">For this type of trinomial, what must the two numbers do?</div>`,
        choices: [
          "Multiply to c and add to b",
          "Add to c and multiply to b",
          "Multiply to b only",
          "Add to x²"
        ],
        expected: ["Multiply to c and add to b"],
        explanation:
          "Correct. The two numbers must multiply to c and add to b.",
        theory:
          "The constant term comes from multiplying the two factor numbers. The middle coefficient comes from adding them."
      },
      {
        id: "worked_example_pair",
        tutor:
          `<div><strong>Example:</strong></div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">x² + 5x + 6</div>` +
          `<div style="margin-top:10px;">Which pair multiplies to 6 and adds to 5?</div>`,
        choices: [
          "2 and 3",
          "1 and 6",
          "4 and 2",
          "5 and 1"
        ],
        expected: ["2 and 3"],
        explanation:
          "Correct. 2 × 3 = 6 and 2 + 3 = 5.",
        theory:
          "Both conditions must be true. A pair that only multiplies correctly is not enough."
      },
      {
        id: "build_factors",
        tutor:
          `<div><strong>Now build the factors.</strong></div>` +
          `<div style="margin-top:8px;">Since the numbers are 2 and 3:</div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">x² + 5x + 6 = (x + 2)(x + 3)</div>` +
          `<div style="margin-top:10px;">How do we check the answer?</div>`,
        choices: [
          "Multiply the factors back",
          "Choose the shortest expression",
          "Change both signs",
          "Ignore the middle term"
        ],
        expected: ["Multiply the factors back"],
        explanation:
          "Correct. Multiply the factors to make sure they return the original trinomial.",
        theory:
          "Factoring and multiplying are inverse processes. Multiplying back verifies the factorization."
      },
      {
        id: "micro_practice_trinomial",
        tutor:
          `<div><strong>Try one.</strong></div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">x² + 7x + 10</div>` +
          `<div style="margin-top:10px;">Which factored form is correct?</div>`,
        choices: [
          "(x + 5)(x + 2)",
          "(x + 10)(x + 1)",
          "(x - 5)(x - 2)",
          "(x + 7)(x + 10)"
        ],
        expected: ["(x + 5)(x + 2)"],
        explanation:
          "Correct. 5 × 2 = 10 and 5 + 2 = 7.",
        theory:
          "For x² + 7x + 10, the pair must multiply to 10 and add to 7."
      }
    ],
    workedExample: [
      "Start with x² + bx + c.",
      "Find two numbers that multiply to c.",
      "Check which pair also adds to b.",
      "Write the factors as (x + m)(x + n).",
      "Multiply back to check."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "Factor x² + 8x + 15.",
        answer: "(x + 3)(x + 5)",
        choices: [
          "(x + 3)(x + 5)",
          "(x + 1)(x + 15)",
          "(x - 3)(x - 5)",
          "(x + 8)(x + 15)"
        ]
      },
      {
        prompt: "For x² + 9x + 20, which numbers multiply to 20 and add to 9?",
        answer: "4 and 5",
        choices: [
          "4 and 5",
          "2 and 10",
          "1 and 20",
          "3 and 6"
        ]
      }
    ],
    source: "trinomial_teacher_v3301"
  };
}

function buildFactoringTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const strategy = skillDefinition.strategy || "factor_expression";

  const strategyLabel =
    strategy === "find_two_numbers"
      ? "Find two numbers that multiply to c and add to b"
      : strategy === "recognize_pattern"
        ? "Recognize the factoring pattern"
        : "Choose the correct factoring strategy";

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "factoring",
      strategy,
      tutorType: "factoring_template",
      parsed
    },
    conceptSummary: [
      "Factoring rewrites an expression as a product.",
      "For trinomials, look for numbers that multiply to the constant and add to the middle coefficient.",
      "For special patterns, recognize the structure before factoring."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is finding numbers that multiply correctly but do not add to the middle coefficient.",
    tutorDialogue: [
      {
        id: "identify_factoring_strategy",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "factoring problem")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The factoring strategy",
          "A random factor",
          "Only the constant term",
          "The answer choice length"
        ],
        expected: ["The factoring strategy"],
        explanation: `Correct. First identify the factoring strategy: <strong>${escapeHtml(strategyLabel)}</strong>.`,
        theory: "Factoring depends on recognizing the structure before writing factors."
      },
      {
        id: "apply_factoring_strategy",
        tutor: `<div><strong>Strategy:</strong> ${escapeHtml(strategyLabel)}</div><div style="margin-top:8px;">What should you do after choosing the strategy?</div>`,
        choices: [
          "Write factors and check by multiplying",
          "Stop immediately",
          "Change the expression",
          "Ignore the middle term"
        ],
        expected: ["Write factors and check by multiplying"],
        explanation: "Correct. After factoring, multiply back to check the original expression.",
        theory: "A factored form is correct only if it multiplies back to the original expression."
      }
    ],
    workedExample: [
      "Identify the expression type.",
      `Use the strategy: ${strategyLabel}.`,
      "Write the factored form.",
      "Multiply the factors to check your answer."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "How can you check a factoring answer?",
        answer: "Multiply the factors"
      },
      {
        prompt: "For x² + bx + c, what must the two numbers do?",
        answer: "Multiply to c and add to b"
      }
    ],
    source: "recoveryTemplateEngine_v2800"
  };
}

function buildQuadraticTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const strategy = skillDefinition.strategy || "quadratic_strategy";

  const strategyLabel =
    strategy === "factor_and_zero_product"
      ? "Factor and use the zero product property"
      : strategy === "zero_product"
        ? "Set each factor equal to zero"
        : strategy === "context_root"
          ? "Choose the root that makes sense in context"
          : strategy === "analyze_roots"
            ? "Analyze the number of real solutions"
            : strategy === "meaningful_root"
              ? "Interpret the meaningful root"
              : strategy === "quadratic_formula"
                ? "Use the quadratic formula"
                : "Choose the correct quadratic strategy";

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "quadratics",
      strategy,
      tutorType: "quadratic_template",
      parsed
    },
    conceptSummary: [
      "Quadratic problems often involve roots, intercepts, factoring, or the vertex.",
      "When solving by factoring, set the quadratic equal to zero first.",
      "Use the zero product property after factoring.",
      "In word problems, reject solutions that do not make sense in context."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is factoring correctly but forgetting to set each factor equal to zero.",
    tutorDialogue: [
      {
        id: "identify_quadratic_strategy",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "quadratic problem")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The quadratic strategy",
          "Only the largest number",
          "A random root",
          "The graph color"
        ],
        expected: ["The quadratic strategy"],
        explanation: `Correct. First identify the quadratic strategy: <strong>${escapeHtml(strategyLabel)}</strong>.`,
        theory: "Quadratic questions can ask for different features, so the first step is identifying the task."
      },
      {
        id: "apply_quadratic_strategy",
        tutor: `<div><strong>Strategy:</strong> ${escapeHtml(strategyLabel)}</div><div style="margin-top:8px;">What should you do next?</div>`,
        choices: [
          strategyLabel,
          "Ignore the equation",
          "Always choose x = 0",
          "Use a linear rule"
        ],
        expected: [strategyLabel],
        explanation: "Correct. Apply the strategy that matches the quadratic task.",
        theory: "Quadratics require matching the method to the question: factoring, graphing, formula, vertex, or interpretation."
      }
    ],
    workedExample: [
      "Identify what the quadratic problem is asking.",
      `Use the strategy: ${strategyLabel}.`,
      "Carry out the method carefully.",
      "Check whether the answer makes sense."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "After factoring a quadratic equation equal to zero, what property should you use?",
        answer: "Zero product property"
      },
      {
        prompt: "In a quadratic word problem, should every algebraic solution always be kept?",
        answer: "No"
      }
    ],
    source: "recoveryTemplateEngine_v2800"
  };
}

function buildLinearInequalityTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "linear_inequality",
      strategy: skillDefinition.strategy || "inverse_operation_with_symbol_rule",
      tutorType: "linear_inequality_template",
      parsed
    },
    conceptSummary: [
      "Solve inequalities like equations using inverse operations.",
      "Keep the inequality balanced by doing the same operation to both sides.",
      "If you multiply or divide by a negative number, reverse the inequality symbol."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is forgetting to reverse the inequality symbol when multiplying or dividing by a negative number.",
    tutorDialogue: [
      {
        id: "identify_symbol_rule",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "linear inequality")}</div><div style="margin-top:8px;">What special rule must we remember for inequalities?</div>`,
        choices: [
          "Reverse the symbol when multiplying or dividing by a negative",
          "Always reverse the symbol",
          "Never reverse the symbol",
          "Change the variable"
        ],
        expected: ["Reverse the symbol when multiplying or dividing by a negative"],
        explanation: "Correct. The inequality symbol reverses only when multiplying or dividing by a negative number.",
        theory: "Inequalities follow equation steps, but negative multiplication or division changes the direction of the inequality."
      },
      {
        id: "solve_carefully",
        tutor: `<div><strong>Strategy:</strong> Use inverse operations and check the symbol.</div><div style="margin-top:8px;">What should you do after isolating the variable?</div>`,
        choices: [
          "Check whether the inequality symbol should reverse",
          "Ignore the symbol",
          "Make the answer an equation",
          "Guess the direction"
        ],
        expected: ["Check whether the inequality symbol should reverse"],
        explanation: "Correct. Always check whether the final operation required reversing the inequality symbol.",
        theory: "The most common inequality error is a correct number with the wrong inequality direction."
      }
    ],
    workedExample: [
      "Identify the operation attached to the variable.",
      "Use inverse operations to isolate the variable.",
      "If multiplying or dividing by a negative number, reverse the inequality symbol.",
      "Check the solution direction."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "When do you reverse an inequality symbol?",
        answer: "When multiplying or dividing by a negative"
      },
      {
        prompt: "Should you reverse the symbol when adding or subtracting?",
        answer: "No"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
  };
}

function buildCompoundInequalityTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "compound_inequality",
      strategy: skillDefinition.strategy || "solve_each_part",
      tutorType: "compound_inequality_template",
      parsed
    },
    conceptSummary: [
      "A compound inequality combines two inequalities.",
      "AND means the solution must satisfy both parts.",
      "OR means the solution can satisfy either part.",
      "Solve each part carefully and interpret the solution set."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is confusing AND with OR, or solving only one side of the compound inequality.",
    tutorDialogue: [
      {
        id: "identify_and_or",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "compound inequality")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "Whether it is AND or OR",
          "Only the largest number",
          "Only the first inequality",
          "The answer without solving"
        ],
        expected: ["Whether it is AND or OR"],
        explanation: "Correct. First decide whether the compound inequality uses AND or OR.",
        theory: "AND and OR create different solution sets. AND usually means overlap; OR usually means either region."
      },
      {
        id: "solve_each_part",
        tutor: `<div><strong>Strategy:</strong> Solve each part carefully.</div><div style="margin-top:8px;">What should you do after solving both parts?</div>`,
        choices: [
          "Interpret the solution set",
          "Ignore one side",
          "Change OR into AND",
          "Always choose no solution"
        ],
        expected: ["Interpret the solution set"],
        explanation: "Correct. After solving, interpret whether the answer is an overlap or separate regions.",
        theory: "For AND, look for values that satisfy both. For OR, include values that satisfy either inequality."
      }
    ],
    workedExample: [
      "Identify whether the statement uses AND or OR.",
      "Solve each inequality carefully.",
      "Apply the inequality reversal rule if needed.",
      "Interpret the final solution set."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "What does AND mean in a compound inequality?",
        answer: "Both parts must be true"
      },
      {
        prompt: "What does OR mean in a compound inequality?",
        answer: "Either part can be true"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
  };
}

function buildAbsoluteValueTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "absolute_value",
      strategy: skillDefinition.strategy || "split_into_cases",
      tutorType: "absolute_value_template",
      parsed
    },
    conceptSummary: [
      "Absolute value represents distance from zero.",
      "After the absolute value expression is isolated, create two cases.",
      "One case uses the positive value and the other uses the negative value.",
      "If an absolute value equals a negative number, there is no solution."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is solving only the positive case and forgetting the negative case.",
    tutorDialogue: [
      {
        id: "identify_cases",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "absolute value equation")}</div><div style="margin-top:8px;">What should you do after isolating the absolute value?</div>`,
        choices: [
          "Create two cases",
          "Solve only one equation",
          "Drop the absolute value without cases",
          "Always answer no solution"
        ],
        expected: ["Create two cases"],
        explanation: "Correct. Absolute value equations usually split into two cases: positive and negative.",
        theory: "Because distance can be positive in two directions, absolute value equations can have two solutions."
      },
      {
        id: "check_negative_target",
        tutor: `<div><strong>Important Check:</strong> Absolute value cannot equal a negative number.</div><div style="margin-top:8px;">What happens if |expression| = -5?</div>`,
        choices: [
          "No solution",
          "Two solutions",
          "One solution",
          "Every number works"
        ],
        expected: ["No solution"],
        explanation: "Correct. An absolute value cannot be negative, so the equation has no solution.",
        theory: "Absolute value is distance, and distance is never negative."
      }
    ],
    workedExample: [
      "Isolate the absolute value expression.",
      "Check whether it equals a negative number.",
      "If it is nonnegative, create two equations.",
      "Solve both equations and check both answers."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "How many cases do you usually create for an absolute value equation?",
        answer: "Two"
      },
      {
        prompt: "Can an absolute value equal a negative number?",
        answer: "No"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
  };
}
function buildIdentifyQuadraticFunctionTeacherV3300(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const exampleEquation =
    currentQuestion?.answer && String(currentQuestion.answer).startsWith("y = ")
      ? currentQuestion.answer
      : "y = x² + 3x + 2";

  return {
    title: "AI Math Teacher: Identify Quadratic Functions",
    diagnostic: {
      problemType,
      family: "quadratic_functions",
      strategy: "identify_highest_exponent",
      tutorType: "quadratic_teacher_v3300",
      parsed
    },
    conceptSummary: [
      "A quadratic function is identified by the highest exponent of x.",
      "If the highest exponent is 2, the function is quadratic.",
      "Linear functions have highest exponent 1.",
      "Exponential functions have the variable in the exponent."
    ],
    misconception:
      metadata?.misconception ||
      "Students often choose any nonlinear-looking equation without checking whether the highest exponent is 2.",
    tutorDialogue: [
      {
        id: "notice_expression",
        tutor:
          `<div><strong>Let’s learn this skill step by step.</strong></div>` +
          `<div style="margin-top:8px;">Look at this function:</div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">${escapeHtml(exampleEquation)}</div>` +
          `<div style="margin-top:10px;">What should we look for first?</div>`,
        choices: [
          "The highest exponent of x",
          "The largest number",
          "The y-intercept only",
          "The longest answer choice"
        ],
        expected: ["The highest exponent of x"],
        explanation:
          "Correct. To identify a quadratic function, first look for the highest exponent of x.",
        theory:
          "The degree of the function tells us the family. Quadratic functions have degree 2."
      },
      {
        id: "highest_exponent",
        tutor:
          `<div><strong>Now inspect the function:</strong></div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">${escapeHtml(exampleEquation)}</div>` +
          `<div style="margin-top:10px;">What highest exponent tells us the function is quadratic?</div>`,
        choices: [
          "2",
          "1",
          "0",
          "The coefficient"
        ],
        expected: ["2"],
        explanation:
          "Correct. A highest exponent of 2 means the function is quadratic.",
        theory:
          "Quadratic means degree 2. The x² term is the key feature."
      },
      {
        id: "compare_function_families",
        tutor:
          `<div><strong>Compare the families:</strong></div>` +
          `<ul style="margin-top:8px;">` +
          `<li><strong>Linear:</strong> highest exponent is 1</li>` +
          `<li><strong>Quadratic:</strong> highest exponent is 2</li>` +
          `<li><strong>Exponential:</strong> x is in the exponent</li>` +
          `</ul>` +
          `<div style="margin-top:10px;">If a function contains x² as the highest power, what type of function is it?</div>`,
        choices: [
          "Quadratic function",
          "Linear function",
          "Exponential function",
          "Not a function"
        ],
        expected: ["Quadratic function"],
        explanation:
          "Correct. x² as the highest power means it is a quadratic function.",
        theory:
          "Do not classify by appearance only. Always check the exponent structure."
      },
      {
        id: "micro_practice",
        tutor:
          `<div><strong>Try one.</strong></div>` +
          `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">y = 4x² - 7</div>` +
          `<div style="margin-top:10px;">What type of function is this?</div>`,
        choices: [
          "Quadratic function",
          "Linear function",
          "Exponential function",
          "Not a function"
        ],
        expected: ["Quadratic function"],
        explanation:
          "Correct. The highest exponent is 2, so this is quadratic.",
        theory:
          "The coefficient 4 does not change the family. The exponent 2 is what matters."
      }
    ],
    workedExample: [
      "Look at the equation.",
      "Find the highest exponent of x.",
      "If the highest exponent is 2, classify it as a quadratic function.",
      "Do not confuse quadratic with exponential: exponential functions have x in the exponent."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "In y = x² + 5x + 6, what is the highest exponent?",
        answer: "2"
      },
      {
        prompt: "If the highest exponent of x is 2, what type of function is it?",
        answer: "Quadratic function"
      }
    ],
    source: "quadratic_teacher_v3300"
  };
}

function buildQuadraticFamilyTeacherV3300(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const family = skillDefinition.family || "quadratic_functions";
  const strategy = skillDefinition.strategy || "analyze_quadratic_features";

  if (family === "vertex_form") {
    return {
      title: `AI Math Teacher: ${formatSkillName(problemType)}`,
      diagnostic: {
        problemType,
        family,
        strategy,
        tutorType: "quadratic_family_teacher_v3300",
        parsed
      },
      conceptSummary: [
        "Vertex form is written as y = a(x - h)² + k.",
        "The vertex is (h, k).",
        "Inside the parentheses, the sign changes: x - 3 gives h = 3.",
        "The value outside the parentheses is k."
      ],
      misconception:
        metadata?.misconception ||
        "Students often report the inside value directly instead of changing its sign.",
      tutorDialogue: [
        {
          id: "vertex_form_structure",
          tutor:
            `<div><strong>Let’s learn vertex form step by step.</strong></div>` +
            `<div style="margin-top:8px;">Vertex form looks like:</div>` +
            `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">y = a(x - h)² + k</div>` +
            `<div style="margin-top:10px;">Which part gives the vertex?</div>`,
          choices: [
            "(h, k)",
            "(a, h)",
            "(a, k)",
            "The coefficient only"
          ],
          expected: ["(h, k)"],
          explanation: "Correct. In vertex form, the vertex is (h, k).",
          theory: "The h value controls left/right movement. The k value controls up/down movement."
        },
        {
          id: "inside_sign_change",
          tutor:
            `<div><strong>Look at this function:</strong></div>` +
            `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">y = (x - 4)² + 7</div>` +
            `<div style="margin-top:10px;">What is the vertex?</div>`,
          choices: [
            "(4, 7)",
            "(-4, 7)",
            "(4, -7)",
            "(-4, -7)"
          ],
          expected: ["(4, 7)"],
          explanation: "Correct. x - 4 means h = 4, and +7 means k = 7.",
          theory: "The sign inside parentheses changes when finding h."
        },
        {
          id: "micro_practice_vertex",
          tutor:
            `<div><strong>Try one.</strong></div>` +
            `<div style="margin-top:10px;font-size:20px;font-weight:1000;color:#1e3a8a;">y = 2(x + 3)² - 5</div>` +
            `<div style="margin-top:10px;">What is the vertex?</div>`,
          choices: [
            "(-3, -5)",
            "(3, -5)",
            "(-3, 5)",
            "(2, -5)"
          ],
          expected: ["(-3, -5)"],
          explanation: "Correct. x + 3 means h = -3, and -5 means k = -5.",
          theory: "Rewrite x + 3 as x - (-3). That means h = -3."
        }
      ],
      workedExample: [
        "Start with y = a(x - h)² + k.",
        "Identify h from inside the parentheses.",
        "Change the sign of the inside value.",
        "Identify k from outside the parentheses.",
        "Write the vertex as (h, k)."
      ],
      video: null,
      recoveryPractice: [
        {
          prompt: "In y = (x - 2)² + 6, what is the vertex?",
          answer: "(2, 6)",
          choices: ["(2, 6)", "(-2, 6)", "(2, -6)", "(-2, -6)"]
        },
        {
          prompt: "In y = 3(x + 5)² - 1, what is the vertex?",
          answer: "(-5, -1)",
          choices: ["(-5, -1)", "(5, -1)", "(-5, 1)", "(3, -1)"]
        }
      ],
      source: "quadratic_family_teacher_v3300"
    };
  }

  if (family === "quadratic_graphs") {
    return {
      title: `AI Math Teacher: ${formatSkillName(problemType)}`,
      diagnostic: {
        problemType,
        family,
        strategy,
        tutorType: "quadratic_family_teacher_v3300",
        parsed
      },
      conceptSummary: [
        "A quadratic graph is a parabola.",
        "The vertex is the turning point.",
        "The axis of symmetry is the vertical line through the vertex.",
        "The y-intercept is where the graph crosses the y-axis."
      ],
      misconception:
        metadata?.misconception ||
        "Students often confuse the vertex, intercepts, and axis of symmetry.",
      tutorDialogue: [
        {
          id: "parabola_feature",
          tutor:
            `<div><strong>Quadratic graphs have special features.</strong></div>` +
            `<div style="margin-top:8px;">The graph of a quadratic function is called a parabola.</div>` +
            `<div style="margin-top:10px;">What is the turning point called?</div>`,
          choices: [
            "Vertex",
            "y-intercept",
            "Slope",
            "Rate of change"
          ],
          expected: ["Vertex"],
          explanation: "Correct. The turning point of a parabola is the vertex.",
          theory: "A parabola turns around at its vertex."
        },
        {
          id: "axis_symmetry",
          tutor:
            `<div><strong>Now think about symmetry.</strong></div>` +
            `<div style="margin-top:8px;">A parabola can be folded in half through a vertical line.</div>` +
            `<div style="margin-top:10px;">What is that vertical line called?</div>`,
          choices: [
            "Axis of symmetry",
            "y-intercept",
            "x-intercept",
            "Initial value"
          ],
          expected: ["Axis of symmetry"],
          explanation: "Correct. The axis of symmetry cuts the parabola into two matching halves.",
          theory: "The axis of symmetry passes through the vertex."
        },
        {
          id: "micro_practice_graph",
          tutor:
            `<div><strong>Try one.</strong></div>` +
            `<div style="margin-top:8px;">If the vertex is (3, -2), what is the axis of symmetry?</div>`,
          choices: [
            "x = 3",
            "y = 3",
            "x = -2",
            "y = -2"
          ],
          expected: ["x = 3"],
          explanation: "Correct. The axis of symmetry uses the x-coordinate of the vertex.",
          theory: "For vertex (h, k), the axis of symmetry is x = h."
        }
      ],
      workedExample: [
        "Identify the vertex first.",
        "Use the x-coordinate of the vertex for the axis of symmetry.",
        "Find the y-intercept where x = 0.",
        "Find x-intercepts where y = 0, if they exist."
      ],
      video: null,
      recoveryPractice: [
        {
          prompt: "If a parabola has vertex (4, 1), what is the axis of symmetry?",
          answer: "x = 4",
          choices: ["x = 4", "y = 4", "x = 1", "y = 1"]
        },
        {
          prompt: "What is the turning point of a parabola called?",
          answer: "Vertex",
          choices: ["Vertex", "Slope", "Initial value", "Rate of change"]
        }
      ],
      source: "quadratic_family_teacher_v3300"
    };
  }

  if (family === "function_classification") {
    return {
      title: `AI Math Teacher: ${formatSkillName(problemType)}`,
      diagnostic: {
        problemType,
        family,
        strategy,
        tutorType: "quadratic_family_teacher_v3300",
        parsed
      },
      conceptSummary: [
        "Linear functions have a constant first difference.",
        "Quadratic functions have a constant second difference.",
        "Exponential functions multiply by the same factor.",
        "Different representations require different checks."
      ],
      misconception:
        metadata?.misconception ||
        "Students often classify by appearance instead of checking the pattern.",
      tutorDialogue: [
        {
          id: "classification_rules",
          tutor:
            `<div><strong>Let’s compare function families.</strong></div>` +
            `<ul style="margin-top:8px;">` +
            `<li>Linear: add or subtract the same amount.</li>` +
            `<li>Quadratic: second differences are constant.</li>` +
            `<li>Exponential: multiply by the same factor.</li>` +
            `</ul>` +
            `<div style="margin-top:10px;">Which family has constant second differences?</div>`,
          choices: [
            "Quadratic function",
            "Linear function",
            "Exponential function",
            "Not a function"
          ],
          expected: ["Quadratic function"],
          explanation: "Correct. Constant second differences indicate a quadratic function.",
          theory: "Tables are classified by patterns in the outputs."
        },
        {
          id: "micro_practice_classification",
          tutor:
            `<div><strong>Try one.</strong></div>` +
            `<div style="margin-top:8px;">Outputs: 2, 5, 10, 17</div>` +
            `<div style="margin-top:8px;">First differences: 3, 5, 7</div>` +
            `<div style="margin-top:8px;">Second differences: 2, 2</div>` +
            `<div style="margin-top:10px;">What type of function is this?</div>`,
          choices: [
            "Quadratic function",
            "Linear function",
            "Exponential function",
            "Not a function"
          ],
          expected: ["Quadratic function"],
          explanation: "Correct. The second differences are constant.",
          theory: "When second differences are equal, the relationship is quadratic."
        }
      ],
      workedExample: [
        "Check whether the outputs add by the same amount.",
        "If first differences are constant, the function is linear.",
        "If second differences are constant, the function is quadratic.",
        "If outputs multiply by the same factor, the function is exponential."
      ],
      video: null,
      recoveryPractice: [
        {
          prompt: "Which family has constant second differences?",
          answer: "Quadratic function",
          choices: ["Quadratic function", "Linear function", "Exponential function", "Not a function"]
        },
        {
          prompt: "Which family multiplies by the same factor each time?",
          answer: "Exponential function",
          choices: ["Exponential function", "Linear function", "Quadratic function", "Not a function"]
        }
      ],
      source: "quadratic_family_teacher_v3300"
    };
  }

  return buildIdentifyQuadraticFunctionTeacherV3300(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}
function formatSkillName(value) {
  return String(value || "skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatStrategyName(value) {
  return String(value || "identify_skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.AlgebraRecoveryTemplateEngine = {
  buildTemplateRecoveryLesson
};
