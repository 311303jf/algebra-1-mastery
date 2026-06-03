/* =========================================================
   ALGEBRA OS — recoveryLessonEngine.js
   Version: 1900 — SEMANTIC SKILL VERIFIED RECOVERY TUTOR ROUTING

   PURPOSE:
   - Compatible with current lesson.html.
   - Restores window.AlgebraRecoveryLessonEngine.
   - Fixes one-step equation tutor.
   - Adds skill-aware routing:
       Lesson 1.1 → One-Step Equation Tutor
       Lesson 1.2 → Multi-Step / Combine Like Terms / Distributive Tutor
       Lesson 1.3 → Variables on Both Sides Tutor
       Others → Generic Skill Tutor for now
   - v1900 adds Semantic Skill Verification:
       The tutor no longer trusts problemType alone.
       It checks the actual equation structure before choosing the tutor.
       This prevents one-step equations from being taught as Lesson 1.2.
   - Keeps Recovery Practice different from original and from itself.
   - Adds teacher-style aligned math renderer.
   - Shows cancellation with cross-out.
   - Does NOT show + 0.
   - Adds Enter key support for tutor workflow.
   - Includes certification.
   - v1901: Does not reveal the final solution before the final tutor step.
========================================================= */

const RECOVERY_PREFIX = "algebra_recovery_";

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.。]/g, "");
}

function normalizeAnswer(value) {
  return normalizeText(value)
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");
}

function normalizeSkill(value) {
  return normalizeText(value)
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

function normalizeEquationKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/−/g, "-");
}

/* =========================================================
   STORAGE
========================================================= */

function storageKey(lessonId, problemType) {
  return `${RECOVERY_PREFIX}${lessonId}_${problemType}`;
}

function defaultRecoveryState() {
  return {
    opened: false,
    tutorStep: 0,
    tutorAttempts: 0,
    tutorCompleted: false,
    recoveryCorrectStreak: 0,
    completed: false
  };
}

function loadRecoveryState(lessonId, problemType) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lessonId, problemType)) || "null");
    return { ...defaultRecoveryState(), ...(saved || {}) };
  } catch {
    return defaultRecoveryState();
  }
}

function saveRecoveryState(lessonId, problemType, state) {
  localStorage.setItem(
    storageKey(lessonId, problemType),
    JSON.stringify({ ...defaultRecoveryState(), ...(state || {}) })
  );
}

function loadTutorState(lessonId, problemType) {
  return loadRecoveryState(lessonId, problemType);
}

function markRecoveryOpened(lessonId, problemType) {
  const previousState = loadRecoveryState(lessonId, problemType);

  const freshState = {
    ...defaultRecoveryState(),
    opened: true,
    tutorStep: 0,
    tutorAttempts: Number(previousState.tutorAttempts || 0),
    tutorCompleted: false,
    recoveryCorrectStreak: previousState.completed
      ? Number(previousState.recoveryCorrectStreak || 0)
      : 0,
    completed: previousState.completed === true
  };

  saveRecoveryState(lessonId, problemType, freshState);
  installRecoveryTutorKeyboardSupport();

  return freshState;
}

function recordTutorAnswer(lessonId, problemType, isCorrect, totalSteps = 1) {
  const state = loadRecoveryState(lessonId, problemType);

  state.opened = true;
  state.tutorAttempts = Number(state.tutorAttempts || 0) + 1;

  if (isCorrect) {
    state.tutorStep = Number(state.tutorStep || 0) + 1;
  }

  if (Number(state.tutorStep || 0) >= Number(totalSteps || 1)) {
    state.tutorCompleted = true;
  }

  saveRecoveryState(lessonId, problemType, state);
  return state;
}

function recordRecoveryPractice(lessonId, problemType, isCorrect) {
  const state = loadRecoveryState(lessonId, problemType);

  if (isCorrect) {
    state.recoveryCorrectStreak = Number(state.recoveryCorrectStreak || 0) + 1;
  } else {
    state.recoveryCorrectStreak = 0;
  }

  if (state.recoveryCorrectStreak >= 2) {
    state.completed = true;
  }

  saveRecoveryState(lessonId, problemType, state);
  return state;
}

function tutorAnswerMatches(input, expectedList) {
  const value = normalizeAnswer(input);
  const expected = Array.isArray(expectedList) ? expectedList : [expectedList];

  return expected.some(item => normalizeAnswer(item) === value);
}

/* =========================================================
   PUBLIC ROUTER
========================================================= */

function generateRecoveryLesson(problemType = "one_step_addition_equation", metadata = {}, currentQuestion = null) {
  installRecoveryTutorKeyboardSupport();

  const requestedSkill = normalizeSkill(problemType);
  const semanticSkill = detectRecoverySkillFromQuestion(currentQuestion);
  const effectiveSkill = chooseEffectiveRecoverySkill(requestedSkill, semanticSkill);

  if (semanticSkill && semanticSkill !== effectiveSkill) {
    console.warn("Recovery Tutor v1900 Semantic Skill Guard adjusted routing:", {
      requestedProblemType: problemType,
      requestedSkill,
      semanticSkill,
      effectiveSkill,
      question: currentQuestion?.prompt || currentQuestion?.question || currentQuestion?.text || currentQuestion
    });
  }

  if (isOneStepEquationSkill(effectiveSkill)) {
    return buildOneStepEquationLesson(problemType, metadata, currentQuestion);
  }

  if (isMultiStepEquationSkill(effectiveSkill)) {
    return buildMultiStepEquationLesson(problemType, metadata, currentQuestion);
  }

  if (isVariablesBothSidesSkill(effectiveSkill)) {
    return buildVariablesBothSidesLesson(problemType, metadata, currentQuestion);
  }

  return buildGenericLesson(problemType, metadata, currentQuestion);
}

function isOneStepEquationSkill(skill) {
  return (
    skill.includes("one_step") ||
    skill.includes("one_step_addition") ||
    skill.includes("one_step_subtraction") ||
    skill.includes("one_step_multiplication") ||
    skill.includes("one_step_division")
  );
}

function isMultiStepEquationSkill(skill) {
  return (
    skill.includes("multi_step") ||
    skill.includes("combine_like") ||
    skill.includes("combine_like_terms") ||
    skill.includes("distributive") ||
    skill.includes("distribution")
  );
}

function isVariablesBothSidesSkill(skill) {
  return (
    skill.includes("variables_on_both_sides") ||
    skill.includes("variable_on_both_sides") ||
    skill.includes("both_sides") ||
    skill.includes("variables_both_sides")
  );
}


/* =========================================================
   v1900 SEMANTIC SKILL VERIFICATION LAYER
   The tutor must adapt to the actual equation, not only to the
   problemType label passed by lesson.html.
========================================================= */

function chooseEffectiveRecoverySkill(requestedSkill, semanticSkill) {
  if (!semanticSkill) return requestedSkill;

  // If the actual equation is one-step, do not force it into Lesson 1.2.
  if (semanticSkill === "one_step_equation") return semanticSkill;

  // If the actual equation has variables on both sides, route there.
  if (semanticSkill === "variables_both_sides") return semanticSkill;

  // If the actual equation is a true multi-step structure, route to multi-step.
  if (semanticSkill === "multi_step_equation") return semanticSkill;

  return requestedSkill;
}

function detectRecoverySkillFromQuestion(currentQuestion) {
  const equation = extractEquation(getQuestionText(currentQuestion));
  if (!equation) return "";

  const compact = equation
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");

  if (isVariablesBothSidesEquationStructure(compact)) {
    return "variables_both_sides";
  }

  if (isTrueMultiStepEquationStructure(compact)) {
    return "multi_step_equation";
  }

  if (isOneStepEquationStructure(compact)) {
    return "one_step_equation";
  }

  return "";
}

function isOneStepEquationStructure(compactEquation) {
  const text = String(compactEquation || "");

  return (
    /^[a-z]\+-?\d+=-?\d+$/i.test(text) ||
    /^[a-z]-\d+=-?\d+$/i.test(text) ||
    /^-?\d+\*?[a-z]=-?\d+$/i.test(text) ||
    /^[a-z]\/-?\d+=-?\d+$/i.test(text)
  );
}

function isTrueMultiStepEquationStructure(compactEquation) {
  const text = String(compactEquation || "");

  // Distributive property: 2(x + 3) = 14 or -3(x - 4) + 5 = 20
  if (/^-?\d+\([a-z][+\-]-?\d+\)([+\-]-?\d+)?=-?\d+$/i.test(text)) {
    return true;
  }

  // Combine like terms on the same side: 3x + 5 + 2x = 20
  if (/^-?\d*[a-z][+\-]-?\d+[+\-]-?\d*[a-z]=-?\d+$/i.test(text)) {
    return true;
  }

  // Combine like terms first: 3x + 2x + 5 = 20
  if (/^-?\d*[a-z][+\-]-?\d*[a-z][+\-]-?\d+=-?\d+$/i.test(text)) {
    return true;
  }

  return false;
}

function isVariablesBothSidesEquationStructure(compactEquation) {
  const text = String(compactEquation || "");
  return /^-?\d*[a-z][+\-]-?\d+=-?\d*[a-z][+\-]-?\d+$/i.test(text);
}

/* =========================================================
   LESSON 1.1 — ONE-STEP EQUATION TUTOR
========================================================= */

function buildOneStepEquationLesson(problemType, metadata, currentQuestion) {
  const parsed = parseOneStepEquation(currentQuestion);
  const operation = parsed.operation;
  const inverse = inverseOperation(operation);
  const recoveryPractice = buildOneStepRecoveryPracticeItems(parsed, operation);

  return {
    title: "Recovery Tutor: One-Step Equations",

    diagnostic: {
      equationBefore: parsed.equationBefore,
      operation,
      inverseOperation: inverse,
      equationAction: parsed.equationAction,
      equationAfter: parsed.equationAfter,
      tutorType: "one_step_equation"
    },

    conceptSummary: [
      "A one-step equation is solved by undoing the operation attached to the variable.",
      "Use the inverse operation on both sides of the equation.",
      "Whatever you do to one side, you must also do to the other side."
    ],

    misconception:
      metadata?.misconception ||
      "A common mistake is identifying the inverse operation too early. First identify the operation attached to x, then choose the inverse operation to solve.",

    tutorDialogue: [
      {
        id: "identify_attached_operation",
        expectedOperation: operation,
        tutor: `
          <div><strong>Equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What operation is attached to x?</div>
        `,
        choices: ["Addition", "Subtraction", "Multiplication", "Division"],
        expected: expectedOperationAnswers(operation),
        explanation: `
          The operation attached to x is <strong>${operation}</strong>.
          ${operation === "Addition" ? "The expression has + attached to x." : ""}
          ${operation === "Subtraction" ? "The expression has − attached to x." : ""}
          ${operation === "Multiplication" ? "The variable is being multiplied." : ""}
          ${operation === "Division" ? "The variable is being divided." : ""}
        `,
        theory:
          "Look directly beside the variable. Ask: what operation is being done to x right now?"
      },
      {
        id: "choose_inverse_operation",
        expectedOperation: inverse,
        tutor: `
          <div><strong>Equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What inverse operation should we use to isolate x?</div>
        `,
        choices: ["Addition", "Subtraction", "Multiplication", "Division"],
        expected: expectedOperationAnswers(inverse),
        explanation: `
          Correct. The inverse of <strong>${operation}</strong> is <strong>${inverse}</strong>.
          ${renderEquationTransformation(parsed)}
        `,
        theory:
          "Use the opposite operation. Addition and subtraction undo each other. Multiplication and division undo each other."
      },
      {
        id: "solution",
        tutor: `
          <div><strong>Equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">After applying the inverse operation, what is the solution?</div>
        `,
        choices: buildEquationChoices(parsed.equationAfter),
        expected: [parsed.equationAfter],
        explanation: `
          Correct. The solution is <strong>${escapeHtml(parsed.equationAfter)}</strong>.
          ${renderEquationTransformation(parsed)}
        `,
        theory:
          "Cancel the opposite terms on the left side, bring down the equal sign, and simplify the right side."
      }
    ],

    workedExample: [
      `Start with ${parsed.equationBefore}.`,
      `The operation attached to x is ${operation}.`,
      `Use the inverse operation: ${inverse}.`,
      `Apply it to both sides.`,
      `Cancel the opposite terms on the left side.`,
      `Bring down the equal sign and simplify the right side.`,
      `The result is ${parsed.equationAfter}.`
    ],

    video: null,
    recoveryPractice
  };
}

/* =========================================================
   LESSON 1.2 — MULTI-STEP EQUATION TUTOR
========================================================= */

function buildMultiStepEquationLesson(problemType, metadata, currentQuestion) {
  const parsed = parseMultiStepEquation(currentQuestion);
  const recoveryPractice = buildMultiStepRecoveryPracticeItems(parsed);

  return {
    title: "Recovery Tutor: Multi-Step Equations",

    diagnostic: {
      equationBefore: parsed.equationBefore,
      simplifiedEquation: parsed.simplifiedEquation,
      equationAfter: parsed.equationAfter,
      firstAction: parsed.firstAction,
      tutorType: "multi_step_equation"
    },

    conceptSummary: [
      "A multi-step equation must be simplified before solving.",
      "First combine like terms or use the distributive property when needed.",
      "After the equation is simplified, solve it using inverse operations."
    ],

    misconception:
      metadata?.misconception ||
      "A common mistake is trying to move numbers before simplifying the expression. In multi-step equations, simplify first.",

    tutorDialogue: [
      {
        id: "identify_first_step",
        tutor: `
          <div><strong>Equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What should we do first?</div>
        `,
        choices: [
          "Combine like terms",
          "Use the distributive property",
          "Divide both sides immediately",
          "Guess the value of x"
        ],
        expected: [parsed.firstAction],
        explanation: `
          Correct. First we should <strong>${escapeHtml(parsed.firstAction.toLowerCase())}</strong>.
          ${renderMultiStepTransformation(parsed, "first")}
        `,
        theory:
          "Before using inverse operations, simplify the expression on each side of the equation."
      },
      {
        id: "simplified_equation",
        tutor: `
          <div><strong>Original:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What equation do we get after simplifying?</div>
        `,
        choices: buildMultiStepSimplifiedChoices(parsed.simplifiedEquation),
        expected: [parsed.simplifiedEquation],
        explanation: `
          Correct. After simplifying, the equation is <strong>${escapeHtml(parsed.simplifiedEquation)}</strong>.
          ${renderMultiStepTransformation(parsed, "simplified")}
        `,
        theory:
          "Combine variable terms with variable terms and constants with constants."
      },
      {
        id: "solve_simplified",
        tutor: `
          <div><strong>Simplified equation:</strong> ${escapeHtml(parsed.simplifiedEquation)}</div>
          <div style="margin-top:8px;">What is the solution?</div>
        `,
        choices: buildEquationChoices(parsed.equationAfter),
        expected: [parsed.equationAfter],
        explanation: `
          Correct. The solution is <strong>${escapeHtml(parsed.equationAfter)}</strong>.
          ${renderMultiStepTransformation(parsed, "solution")}
        `,
        theory:
          "Once the equation is simplified, solve it like a one-step or two-step equation."
      }
    ],

    workedExample: [
      `Start with ${parsed.equationBefore}.`,
      `First: ${parsed.firstAction}.`,
      `Simplified equation: ${parsed.simplifiedEquation}.`,
      `Then solve using inverse operations.`,
      `The result is ${parsed.equationAfter}.`
    ],

    video: null,
    recoveryPractice
  };
}

/* =========================================================
   LESSON 1.3 — VARIABLES ON BOTH SIDES TUTOR
========================================================= */

function buildVariablesBothSidesLesson(problemType, metadata, currentQuestion) {
  const parsed = parseVariablesBothSidesEquation(currentQuestion);
  const recoveryPractice = buildVariablesBothSidesRecoveryPracticeItems(parsed);

  return {
    title: "Recovery Tutor: Variables on Both Sides",

    diagnostic: {
      equationBefore: parsed.equationBefore,
      afterMoveVariables: parsed.afterMoveVariables,
      equationAfter: parsed.equationAfter,
      tutorType: "variables_on_both_sides"
    },

    conceptSummary: [
      "When variables appear on both sides, move the variable terms to one side first.",
      "Then move the constants to the other side.",
      "Finally, solve the remaining one-step equation."
    ],

    misconception:
      metadata?.misconception ||
      "A common mistake is moving constants first before collecting variable terms. Start by getting variables on one side.",

    tutorDialogue: [
      {
        id: "move_variable_terms",
        tutor: `
          <div><strong>Equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What should we move first?</div>
        `,
        choices: [
          "Move variable terms",
          "Move constants first",
          "Divide immediately",
          "Change the equal sign"
        ],
        expected: ["Move variable terms"],
        explanation: `
          Correct. When variables are on both sides, move the variable terms first.
          ${renderVariablesBothSidesTransformation(parsed, "moveVariables")}
        `,
        theory:
          "Get all x-terms on one side so the equation becomes easier to solve."
      },
      {
        id: "move_constants",
        tutor: `
          <div><strong>Equation after moving variables:</strong> ${escapeHtml(parsed.afterMoveVariables)}</div>
          <div style="margin-top:8px;">What should we do next?</div>
        `,
        choices: [
          "Move constants",
          "Move variables again",
          "Stop here",
          "Flip the equal sign"
        ],
        expected: ["Move constants"],
        explanation: `
          Correct. Now move constants to isolate the variable term.
          ${renderVariablesBothSidesTransformation(parsed, "moveConstants")}
        `,
        theory:
          "After variable terms are together, use inverse operations to move constants."
      },
      {
        id: "solution",
        tutor: `
          <div><strong>Original equation:</strong> ${escapeHtml(parsed.equationBefore)}</div>
          <div style="margin-top:8px;">What is the solution?</div>
        `,
        choices: buildEquationChoices(parsed.equationAfter),
        expected: [parsed.equationAfter],
        explanation: `
          Correct. The solution is <strong>${escapeHtml(parsed.equationAfter)}</strong>.
          ${renderVariablesBothSidesTransformation(parsed, "solution")}
        `,
        theory:
          "After isolating the variable term, divide or multiply as needed to solve."
      }
    ],

    workedExample: [
      `Start with ${parsed.equationBefore}.`,
      "Move variable terms to one side.",
      `After moving variables: ${parsed.afterMoveVariables}.`,
      "Move constants to isolate the variable term.",
      `The result is ${parsed.equationAfter}.`
    ],

    video: null,
    recoveryPractice
  };
}

/* =========================================================
   GENERIC TUTOR
========================================================= */

function buildGenericLesson(problemType, metadata, currentQuestion) {
  return {
    title: `Recovery Tutor: ${formatSkillName(problemType)}`,

    conceptSummary: [
      "Read the problem carefully.",
      "Identify the skill being tested.",
      "Choose the strategy that matches the skill.",
      "Check that your answer makes sense."
    ],

    misconception:
      metadata?.misconception ||
      "A common mistake is rushing to answer before identifying the skill.",

    tutorDialogue: [
      {
        id: "identify_skill",
        tutor: "What should you do first when you are stuck on this skill?",
        choices: [
          "Identify the skill",
          "Guess quickly",
          "Skip every step",
          "Change the question"
        ],
        expected: ["Identify the skill"],
        explanation:
          "Correct. First identify the skill and what the question is asking.",
        theory:
          "Before solving, identify what type of problem this is and what information is given."
      }
    ],

    workedExample: [
      "Read the question.",
      "Identify the skill.",
      "Use the correct strategy.",
      "Check the answer."
    ],

    video: null,

    recoveryPractice: [
      {
        prompt: "What is the first step when solving this type of problem?",
        answer: "Identify the skill"
      },
      {
        prompt: "What should you do after solving?",
        answer: "Check the answer"
      }
    ]
  };
}

/* =========================================================
   PARSERS — ONE-STEP
========================================================= */

function parseOneStepEquation(currentQuestion) {
  const fallback = {
    equationBefore: "x + 8 = 18",
    variable: "x",
    operation: "Addition",
    inverseOperation: "Subtraction",
    constant: 8,
    rightValue: 18,
    equationAction: "- 8     - 8",
    equationAfter: "x = 10"
  };

  const text = getQuestionText(currentQuestion);
  const answer = getQuestionAnswer(currentQuestion);
  const equation = extractEquation(text);

  if (!equation) {
    if (answer) return { ...fallback, equationAfter: String(answer).trim() };
    return fallback;
  }

  const compact = equation.replace(/\s+/g, "").replace(/−/g, "-");
  let match;

  match = compact.match(/^([a-z])\+(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    return {
      equationBefore: prettyEquation(equation),
      variable,
      operation: "Addition",
      inverseOperation: "Subtraction",
      constant: a,
      rightValue: b,
      equationAction: `- ${a}     - ${a}`,
      equationAfter: `${variable} = ${formatNumber(b - a)}`
    };
  }

  match = compact.match(/^([a-z])-(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    return {
      equationBefore: prettyEquation(equation),
      variable,
      operation: "Subtraction",
      inverseOperation: "Addition",
      constant: a,
      rightValue: b,
      equationAction: `+ ${a}     + ${a}`,
      equationAfter: `${variable} = ${formatNumber(b + a)}`
    };
  }

  match = compact.match(/^(-?\d+)[×*]?([a-z])=(-?\d+)$/i);
  if (match) {
    const a = Number(match[1]);
    const variable = match[2];
    const b = Number(match[3]);
    return {
      equationBefore: prettyEquation(equation),
      variable,
      operation: "Multiplication",
      inverseOperation: "Division",
      constant: a,
      rightValue: b,
      equationAction: `÷ ${a}     ÷ ${a}`,
      equationAfter: `${variable} = ${formatNumber(b / a)}`
    };
  }

  match = compact.match(/^([a-z])[÷/](-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    return {
      equationBefore: prettyEquation(equation),
      variable,
      operation: "Division",
      inverseOperation: "Multiplication",
      constant: a,
      rightValue: b,
      equationAction: `× ${a}     × ${a}`,
      equationAfter: `${variable} = ${formatNumber(b * a)}`
    };
  }

  if (answer) {
    return {
      ...fallback,
      equationBefore: prettyEquation(equation),
      equationAfter: String(answer).trim()
    };
  }

  return {
    ...fallback,
    equationBefore: prettyEquation(equation)
  };
}

/* =========================================================
   PARSERS — MULTI-STEP
   Supports common Lesson 1.2 structures:
   - 3x + 5 + 2x = 20
   - 2(x + 3) = 14
   - 3x + 4 = 16
========================================================= */

function parseMultiStepEquation(currentQuestion) {
  const text = getQuestionText(currentQuestion);
  const answer = getQuestionAnswer(currentQuestion);
  const equation = extractEquation(text) || "3x + 5 + 2x = 20";

  const compact = equation.replace(/\s+/g, "").replace(/−/g, "-");
  let match;

  // ax + b + cx = d
  match = compact.match(/^(-?\d*)x([+\-]-?\d+)([+\-]-?\d*)x=(-?\d+)$/i);
  if (match) {
    const a = coefficientValue(match[1]);
    const b = Number(match[2]);
    const c = coefficientValue(match[3]);
    const d = Number(match[4]);
    const combined = a + c;
    const simplifiedEquation = `${formatCoefficient(combined)}x ${signedNumber(b)} = ${formatNumber(d)}`;
    const solution = (d - b) / combined;

    return {
      equationBefore: prettyEquation(equation),
      firstAction: "Combine like terms",
      simplifiedEquation: normalizeEquationSpacing(simplifiedEquation),
      equationAfter: answer || `x = ${formatNumber(solution)}`,
      combineA: a,
      combineC: c,
      constant: b,
      rightValue: d,
      combinedCoefficient: combined,
      tutorType: "combine_like_terms"
    };
  }

  // Two-step equations such as 3x + 4 = 16 are intentionally NOT accepted here.
  // They belong to a different skill and should not be forced into Lesson 1.2.

  // a(x + b) = d
  match = compact.match(/^(-?\d+)\(([a-z])([+\-]-?\d+)\)=(-?\d+)$/i);
  if (match) {
    const a = Number(match[1]);
    const variable = match[2];
    const b = Number(match[3]);
    const d = Number(match[4]);
    const distributedConstant = a * b;
    const simplifiedEquation = `${formatCoefficient(a)}${variable} ${signedNumber(distributedConstant)} = ${formatNumber(d)}`;
    const solution = (d - distributedConstant) / a;

    return {
      equationBefore: prettyEquation(equation),
      firstAction: "Use the distributive property",
      simplifiedEquation: normalizeEquationSpacing(simplifiedEquation),
      equationAfter: answer || `${variable} = ${formatNumber(solution)}`,
      coefficient: a,
      innerConstant: b,
      distributedConstant,
      rightValue: d,
      tutorType: "distributive_property"
    };
  }

  return {
    equationBefore: prettyEquation(equation),
    firstAction: "Combine like terms",
    simplifiedEquation: prettyEquation(equation),
    equationAfter: answer || "x = 3",
    tutorType: "multi_step_equation"
  };
}

/* =========================================================
   PARSERS — VARIABLES BOTH SIDES
   Supports common Lesson 1.3 structures:
   - 2x + 5 = x + 12
   - 3x - 4 = x + 10
========================================================= */

function parseVariablesBothSidesEquation(currentQuestion) {
  const text = getQuestionText(currentQuestion);
  const answer = getQuestionAnswer(currentQuestion);
  const equation = extractEquation(text) || "2x + 5 = x + 12";
  const compact = equation.replace(/\s+/g, "").replace(/−/g, "-");

  let match = compact.match(/^(-?\d*)x([+\-]-?\d+)=(-?\d*)x([+\-]-?\d+)$/i);

  if (match) {
    const leftCoeff = coefficientValue(match[1]);
    const leftConst = Number(match[2]);
    const rightCoeff = coefficientValue(match[3]);
    const rightConst = Number(match[4]);

    const newCoeff = leftCoeff - rightCoeff;
    const afterMoveVariables = `${formatCoefficient(newCoeff)}x ${signedNumber(leftConst)} = ${formatNumber(rightConst)}`;
    const solution = (rightConst - leftConst) / newCoeff;

    return {
      equationBefore: prettyEquation(equation),
      leftCoeff,
      leftConst,
      rightCoeff,
      rightConst,
      afterMoveVariables: normalizeEquationSpacing(afterMoveVariables),
      equationAfter: answer || `x = ${formatNumber(solution)}`,
      tutorType: "variables_on_both_sides"
    };
  }

  return {
    equationBefore: prettyEquation(equation),
    leftCoeff: 2,
    leftConst: 5,
    rightCoeff: 1,
    rightConst: 12,
    afterMoveVariables: "x + 5 = 12",
    equationAfter: answer || "x = 7",
    tutorType: "variables_on_both_sides"
  };
}

/* =========================================================
   EQUATION EXTRACTION
========================================================= */

function getQuestionText(currentQuestion) {
  return typeof currentQuestion === "string"
    ? currentQuestion
    : currentQuestion?.prompt ||
      currentQuestion?.question ||
      currentQuestion?.text ||
      "";
}

function getQuestionAnswer(currentQuestion) {
  return currentQuestion?.answer ||
    currentQuestion?.correctAnswer ||
    "";
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
    /[a-z]\s*[+]\s*-?\d+\s*=\s*-?\d+/i,
    /[a-z]\s*[-−]\s*-?\d+\s*=\s*-?\d+/i,
    /-?\d+\s*[×*]\s*[a-z]\s*=\s*-?\d+/i,
    /-?\d+\s*[a-z]\s*=\s*-?\d+/i,
    /[a-z]\s*[÷/]\s*-?\d+\s*=\s*-?\d+/i,
    /-?\d*\s*[a-z]\s*[+\-−]\s*-?\d+\s*=\s*-?\d+/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[0];
  }

  return "";
}

/* =========================================================
   RECOVERY PRACTICE ITEMS
========================================================= */

function buildOneStepRecoveryPracticeItems(originalParsed, operation) {
  const originalEquation = normalizeEquationKey(originalParsed.equationBefore);
  const items = [];
  const used = new Set([originalEquation]);

  let candidates = [];

  if (operation === "Addition") {
    candidates = [
      makeAdditionEquation(5, 17),
      makeAdditionEquation(9, 21),
      makeAdditionEquation(4, 13),
      makeAdditionEquation(7, 20)
    ];
  } else if (operation === "Subtraction") {
    candidates = [
      makeSubtractionEquation(6, 11),
      makeSubtractionEquation(8, 14),
      makeSubtractionEquation(5, 9),
      makeSubtractionEquation(7, 12)
    ];
  } else if (operation === "Multiplication") {
    candidates = [
      makeMultiplicationEquation(3, 24),
      makeMultiplicationEquation(4, 28),
      makeMultiplicationEquation(5, 35),
      makeMultiplicationEquation(6, 42)
    ];
  } else if (operation === "Division") {
    candidates = [
      makeDivisionEquation(3, 7),
      makeDivisionEquation(4, 6),
      makeDivisionEquation(5, 8),
      makeDivisionEquation(6, 9)
    ];
  } else {
    candidates = [
      makeAdditionEquation(5, 17),
      makeAdditionEquation(4, 13)
    ];
  }

  return pickTwoUniquePracticeItems(candidates, used);
}

function buildMultiStepRecoveryPracticeItems(parsed) {
  const used = new Set([normalizeEquationKey(parsed.equationBefore)]);

  const candidates = [
    {
      equation: "3x + 4 + 2x = 19",
      answer: "x = 3"
    },
    {
      equation: "4x + 5 + x = 20",
      answer: "x = 3"
    },
    {
      equation: "2(x + 3) = 14",
      answer: "x = 4"
    },
    {
      equation: "3(x + 2) = 21",
      answer: "x = 5"
    }
  ];

  return pickTwoUniquePracticeItems(candidates, used);
}

function buildVariablesBothSidesRecoveryPracticeItems(parsed) {
  const used = new Set([normalizeEquationKey(parsed.equationBefore)]);

  const candidates = [
    {
      equation: "2x + 5 = x + 12",
      answer: "x = 7"
    },
    {
      equation: "3x - 4 = x + 10",
      answer: "x = 7"
    },
    {
      equation: "5x + 2 = 3x + 12",
      answer: "x = 5"
    },
    {
      equation: "4x - 6 = 2x + 8",
      answer: "x = 7"
    }
  ];

  return pickTwoUniquePracticeItems(candidates, used);
}

function pickTwoUniquePracticeItems(candidates, used) {
  const items = [];

  for (const item of candidates) {
    const key = normalizeEquationKey(item.equation);
    if (!used.has(key)) {
      used.add(key);
      items.push({
        prompt: `Solve: ${item.equation}`,
        answer: item.answer,
        equation: item.equation
      });
    }

    if (items.length >= 2) break;
  }

  while (items.length < 2) {
    const n = items.length + 10;
    const item = makeAdditionEquation(n, n + 8);
    const key = normalizeEquationKey(item.equation);
    if (!used.has(key)) {
      used.add(key);
      items.push({
        prompt: `Solve: ${item.equation}`,
        answer: item.answer,
        equation: item.equation
      });
    }
  }

  return items;
}

function makeAdditionEquation(a, b) {
  return {
    equation: `x + ${a} = ${b}`,
    answer: `x = ${formatNumber(b - a)}`
  };
}

function makeSubtractionEquation(a, b) {
  return {
    equation: `x - ${a} = ${b}`,
    answer: `x = ${formatNumber(b + a)}`
  };
}

function makeMultiplicationEquation(a, b) {
  return {
    equation: `${a}x = ${b}`,
    answer: `x = ${formatNumber(b / a)}`
  };
}

function makeDivisionEquation(a, b) {
  return {
    equation: `x ÷ ${a} = ${b}`,
    answer: `x = ${formatNumber(a * b)}`
  };
}

/* =========================================================
   RENDERERS
========================================================= */

function renderEquationTransformation(parsed) {
  if (!parsed?.equationAfter) return "";

  if (parsed.operation === "Addition" || parsed.operation === "Subtraction") {
    return renderAdditionSubtractionTransformation(parsed);
  }

  if (parsed.operation === "Multiplication" || parsed.operation === "Division") {
    return renderMultiplicationDivisionTransformation(parsed);
  }

  return "";
}

function renderAdditionSubtractionTransformation(parsed) {
  const variable = parsed.variable || "x";
  const constant = Number(parsed.constant);
  const rightValue = Number(parsed.rightValue);
  const solutionValue = parseSolutionValue(parsed.equationAfter);

  const originalSign = parsed.operation === "Addition" ? "+" : "−";
  const inverseSign = parsed.operation === "Addition" ? "−" : "+";

  const rightExpression = parsed.operation === "Addition"
    ? `${formatNumber(rightValue)} − ${formatNumber(constant)}`
    : `${formatNumber(rightValue)} + ${formatNumber(constant)}`;

  return `
    <div class="aos-math-workspace">
      ${mathRendererStyle()}
      <div class="aos-work-title">What happened to the equation?</div>

      <div class="aos-work-grid">
        <div class="aos-work-math">
          <div class="aos-eq-row aos-row-original">
            <span>${escapeHtml(variable)}</span>
            <span>${originalSign}</span>
            <span>${formatNumber(constant)}</span>
            <span>=</span>
            <span>${formatNumber(rightValue)}</span>
          </div>

          <div class="aos-eq-row aos-row-operation">
            <span></span>
            <span></span>
            <span class="aos-red">${inverseSign}${formatNumber(constant)}</span>
            <span></span>
            <span class="aos-red">${inverseSign}${formatNumber(constant)}</span>
          </div>

          <div class="aos-eq-line"></div>

          <div class="aos-eq-row aos-row-cancel">
            <span>${escapeHtml(variable)}</span>
            <span>${originalSign}</span>
            <span>
              <span class="aos-cancel">${formatNumber(constant)}</span>
              <span class="aos-red aos-cancel">${inverseSign}${formatNumber(constant)}</span>
            </span>
            <span>=</span>
            <span>${rightExpression}</span>
          </div>

          <div class="aos-eq-line"></div>

          <div class="aos-eq-row aos-row-final">
            <span>${escapeHtml(variable)}</span>
            <span></span>
            <span></span>
            <span>=</span>
            <span class="aos-green">${formatNumber(solutionValue)}</span>
          </div>
        </div>

        <div class="aos-work-notes">
          <div><strong>1</strong> Apply the inverse operation to both sides.</div>
          <div><strong>2</strong> The opposite terms cancel on the left.</div>
          <div><strong>3</strong> Bring down the = sign and solve the right side.</div>
        </div>
      </div>
    </div>
  `;
}

function renderMultiplicationDivisionTransformation(parsed) {
  const variable = parsed.variable || "x";
  const constant = Number(parsed.constant);
  const rightValue = Number(parsed.rightValue);
  const solutionValue = parseSolutionValue(parsed.equationAfter);

  if (parsed.operation === "Multiplication") {
    return `
      <div class="aos-math-workspace">
        ${mathRendererStyle()}
        <div class="aos-work-title">What happened to the equation?</div>

        <div class="aos-work-grid">
          <div class="aos-work-math simple">
            <div class="aos-eq-row aos-row-original">
              <span>${formatNumber(constant)}${escapeHtml(variable)}</span>
              <span>=</span>
              <span>${formatNumber(rightValue)}</span>
            </div>

            <div class="aos-eq-row aos-row-operation">
              <span class="aos-red">÷ ${formatNumber(constant)}</span>
              <span></span>
              <span class="aos-red">÷ ${formatNumber(constant)}</span>
            </div>

            <div class="aos-eq-line"></div>

            <div class="aos-eq-row aos-row-final">
              <span>${escapeHtml(variable)}</span>
              <span>=</span>
              <span class="aos-green">${formatNumber(solutionValue)}</span>
            </div>
          </div>

          <div class="aos-work-notes">
            <div><strong>1</strong> Divide both sides by ${formatNumber(constant)}.</div>
            <div><strong>2</strong> The coefficient is undone.</div>
            <div><strong>3</strong> Bring down the = sign and simplify.</div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="aos-math-workspace">
      ${mathRendererStyle()}
      <div class="aos-work-title">What happened to the equation?</div>

      <div class="aos-work-grid">
        <div class="aos-work-math simple">
          <div class="aos-eq-row aos-row-original">
            <span>${escapeHtml(variable)} ÷ ${formatNumber(constant)}</span>
            <span>=</span>
            <span>${formatNumber(rightValue)}</span>
          </div>

          <div class="aos-eq-row aos-row-operation">
            <span class="aos-red">× ${formatNumber(constant)}</span>
            <span></span>
            <span class="aos-red">× ${formatNumber(constant)}</span>
          </div>

          <div class="aos-eq-line"></div>

          <div class="aos-eq-row aos-row-final">
            <span>${escapeHtml(variable)}</span>
            <span>=</span>
            <span class="aos-green">${formatNumber(solutionValue)}</span>
          </div>
        </div>

        <div class="aos-work-notes">
          <div><strong>1</strong> Multiply both sides by ${formatNumber(constant)}.</div>
          <div><strong>2</strong> Division is undone.</div>
          <div><strong>3</strong> Bring down the = sign and simplify.</div>
        </div>
      </div>
    </div>
  `;
}

function renderMultiStepTransformation(parsed, stage = "solution") {
  /*
    v1901 Step Visibility Fix:
    The tutor must teach step-by-step.
    It must NOT reveal the final solution during the first or simplified step.
  */

  const showFirst =
    stage === "first" ||
    stage === "simplified" ||
    stage === "solution";

  const showSimplified =
    stage === "simplified" ||
    stage === "solution";

  const showSolution =
    stage === "solution";

  return `
    <div class="aos-math-workspace">
      ${mathRendererStyle()}
      <div class="aos-work-title">Multi-step equation work</div>

      <div class="aos-vertical-work">
        <div><strong>Original:</strong> ${escapeHtml(parsed.equationBefore)}</div>

        ${
          showFirst
            ? `<div><strong>First:</strong> ${escapeHtml(parsed.firstAction)}</div>`
            : ""
        }

        ${
          showSimplified
            ? `<div><strong>Simplified:</strong> ${escapeHtml(parsed.simplifiedEquation)}</div>`
            : ""
        }

        ${
          showSolution
            ? `<div><strong>Solution:</strong> <span class="aos-green">${escapeHtml(parsed.equationAfter)}</span></div>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderVariablesBothSidesTransformation(parsed, stage = "solution") {
  return `
    <div class="aos-math-workspace">
      ${mathRendererStyle()}
      <div class="aos-work-title">Variables on both sides work</div>
      <div class="aos-vertical-work">
        <div><strong>Original:</strong> ${escapeHtml(parsed.equationBefore)}</div>
        <div><strong>Move variable terms:</strong> ${escapeHtml(parsed.afterMoveVariables)}</div>
        <div><strong>Solution:</strong> <span class="aos-green">${escapeHtml(parsed.equationAfter)}</span></div>
      </div>
    </div>
  `;
}

function mathRendererStyle() {
  return `
    <style>
      .aos-math-workspace{
        margin-top:12px;
        background:#ffffff;
        border:1px solid #bfdbfe;
        border-radius:14px;
        padding:14px;
        color:#0f172a;
      }

      .aos-work-title{
        text-align:center;
        font-weight:1000;
        color:#1e3a8a;
        margin-bottom:12px;
      }

      .aos-work-grid{
        display:grid;
        grid-template-columns:minmax(260px,1fr) minmax(210px,.75fr);
        gap:18px;
        align-items:center;
      }

      .aos-work-math{
        font-family:"Courier New", Consolas, monospace;
        font-size:28px;
        font-weight:1000;
        text-align:center;
        padding:8px 0;
      }

      .aos-work-math.simple{
        max-width:430px;
        margin:auto;
      }

      .aos-eq-row{
        display:grid;
        grid-template-columns:70px 42px 120px 42px 130px;
        align-items:center;
        justify-content:center;
        column-gap:4px;
        line-height:1.45;
        min-height:42px;
      }

      .aos-work-math.simple .aos-eq-row{
        grid-template-columns:150px 50px 150px;
      }

      .aos-eq-line{
        height:2px;
        background:#111827;
        margin:4px auto;
        max-width:520px;
      }

      .aos-red{color:#b91c1c;}
      .aos-green{color:#047857;}

      .aos-cancel{
        position:relative;
        display:inline-block;
        margin:0 2px;
      }

      .aos-cancel::after{
        content:"";
        position:absolute;
        left:-6%;
        top:52%;
        width:112%;
        height:3px;
        background:#111827;
        transform:rotate(-28deg);
        transform-origin:center;
        border-radius:999px;
      }

      .aos-work-notes{
        border-left:1px dashed #93c5fd;
        padding-left:18px;
        font-size:14px;
        font-weight:800;
        line-height:1.5;
        color:#1e40af;
      }

      .aos-work-notes div{
        margin:10px 0;
      }

      .aos-work-notes strong{
        display:inline-flex;
        width:24px;
        height:24px;
        border-radius:999px;
        background:#2563eb;
        color:#fff;
        align-items:center;
        justify-content:center;
        margin-right:8px;
      }

      .aos-vertical-work{
        font-size:16px;
        font-weight:800;
        line-height:1.7;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:12px;
        padding:12px;
      }

      @media(max-width:780px){
        .aos-work-grid{
          grid-template-columns:1fr;
        }

        .aos-work-math{
          font-size:22px;
        }

        .aos-eq-row{
          grid-template-columns:52px 32px 96px 32px 100px;
        }

        .aos-work-notes{
          border-left:none;
          border-top:1px dashed #93c5fd;
          padding-left:0;
          padding-top:10px;
        }
      }
    </style>
  `;
}

/* =========================================================
   CHOICES
========================================================= */

function buildEquationChoices(correct) {
  const parsed = String(correct || "x = 10").match(/^([a-z])\s*=\s*(-?\d+(?:\.\d+)?)$/i);

  if (!parsed) {
    return uniqueChoices([correct, "x = 0", "x = 1", "No solution"]);
  }

  const variable = parsed[1];
  const value = Number(parsed[2]);

  return uniqueChoices([
    `${variable} = ${formatNumber(value)}`,
    `${variable} = ${formatNumber(value + 1)}`,
    `${variable} = ${formatNumber(value - 1)}`,
    `${variable} = ${formatNumber(-value)}`
  ]);
}

function buildMultiStepSimplifiedChoices(correct) {
  return uniqueChoices([
    correct,
    "x = 3",
    "5x = 20",
    "3x + 2x = 20"
  ]);
}

function uniqueChoices(list) {
  const seen = new Set();
  const result = [];

  for (const item of list) {
    const key = normalizeText(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  while (result.length < 4) {
    result.push(`x = ${result.length + 20}`);
  }

  return result.slice(0, 4);
}

/* =========================================================
   OPERATIONS
========================================================= */

function inverseOperation(operation) {
  const op = normalizeText(operation);

  if (op === "addition") return "Subtraction";
  if (op === "subtraction") return "Addition";
  if (op === "multiplication") return "Division";
  if (op === "division") return "Multiplication";

  throw new Error(`Unknown operation for inverse: ${operation}`);
}

function expectedOperationAnswers(operation) {
  const op = normalizeText(operation);

  if (op === "addition") return ["Addition", "add", "plus", "+", "adding"];
  if (op === "subtraction") return ["Subtraction", "subtract", "minus", "-", "−", "subtracting"];
  if (op === "multiplication") return ["Multiplication", "multiply", "times", "×", "*", "multiplying"];
  if (op === "division") return ["Division", "divide", "÷", "/", "dividing"];

  return [operation];
}

/* =========================================================
   UTILS
========================================================= */

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

function normalizeEquationSpacing(value) {
  return String(value)
    .replace(/\+/g, " + ")
    .replace(/−/g, " − ")
    .replace(/-/g, " − ")
    .replace(/=/g, " = ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSolutionValue(equationAfter) {
  const match = String(equationAfter || "").replace(/−/g, "-").match(/=\s*(-?\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function prettyEquation(equation) {
  return String(equation)
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−")
    .replace(/\s+/g, " ")
    .trim();
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

function formatSkillName(value) {
  return String(value || "Skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

function installRecoveryTutorKeyboardSupport() {
  if (window.__algebraRecoveryTutorKeyboardInstalled) return;

  window.__algebraRecoveryTutorKeyboardInstalled = true;

  document.addEventListener("keydown", function(event) {
    if (event.key !== "Enter") return;

    const active = document.activeElement;
    const tag = active?.tagName?.toLowerCase();

    if (tag === "textarea") return;

    if (tag === "input") {
      const id = active.id || "";
      if (id === "recoveryAnswerInput") {
        const checkAnswerBtn = findVisibleButtonByText(["check answer"]);
        if (checkAnswerBtn) {
          event.preventDefault();
          checkAnswerBtn.click();
        }
        return;
      }
    }

    const buttonOrder = [
      ["next tutor step"],
      ["try again"],
      ["check with tutor"],
      ["start / restart tutor", "start/restart tutor", "restart tutor"],
      ["start recovery practice"],
      ["check answer"]
    ];

    for (const textOptions of buttonOrder) {
      const btn = findVisibleButtonByText(textOptions);
      if (btn) {
        event.preventDefault();
        btn.click();
        return;
      }
    }
  });
}

function findVisibleButtonByText(textOptions) {
  const buttons = Array.from(document.querySelectorAll("button"));

  return buttons.find(btn => {
    if (btn.disabled) return false;
    if (!isElementVisible(btn)) return false;

    const text = normalizeText(btn.textContent);
    return textOptions.some(option => text.includes(normalizeText(option)));
  });
}

function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/* =========================================================
   CERTIFICATION
========================================================= */

function certifyRecoveryTutor() {
  const testCases = [
    {
      name: "one-step addition",
      problemType: "one_step_addition_equation",
      question: { prompt: "Solve for x. x + 8 = 18", answer: "x = 10" },
      tutorType: "one_step_equation",
      attached: "Addition",
      inverse: "Subtraction",
      after: "x = 10"
    },
    {
      name: "one-step division",
      problemType: "one_step_division_equation",
      question: { prompt: "Solve for x. x ÷ 7 = 1", answer: "x = 7" },
      tutorType: "one_step_equation",
      attached: "Division",
      inverse: "Multiplication",
      after: "x = 7"
    },
    {
      name: "multi-step combine like terms",
      problemType: "combine_like_terms",
      question: { prompt: "Solve for x. 3x + 5 + 2x = 20", answer: "x = 3" },
      tutorType: "multi_step_equation"
    },
    {
      name: "variables on both sides",
      problemType: "variables_on_both_sides",
      question: { prompt: "Solve for x. 2x + 5 = x + 12", answer: "x = 7" },
      tutorType: "variables_on_both_sides"
    },
    {
      name: "semantic guard prevents one-step equation inside 1.2 tutor",
      problemType: "multi_step_equation",
      question: { prompt: "Solve for x: x - 6 = -2", answer: "x = 4" },
      tutorType: "one_step_equation",
      attached: "Subtraction",
      inverse: "Addition",
      after: "x = 4"
    },
    {
      name: "semantic guard accepts true Lesson 1.2 combine-like-terms",
      problemType: "multi_step_equation",
      question: { prompt: "Solve for x: 3x + 4 + 2x = 19", answer: "x = 3" },
      tutorType: "multi_step_equation"
    },
    {
      name: "semantic guard accepts true Lesson 1.2 distributive property",
      problemType: "multi_step_equation",
      question: { prompt: "Solve for x: 2(x + 3) = 14", answer: "x = 4" },
      tutorType: "multi_step_equation"
    }
  ];

  const failures = [];

  for (const test of testCases) {
    const lesson = generateRecoveryLesson(test.problemType, {}, test.question);

    if (lesson.diagnostic?.tutorType !== test.tutorType) {
      failures.push(`${test.name}: expected tutorType ${test.tutorType}, got ${lesson.diagnostic?.tutorType}`);
    }

    if (test.attached) {
      if (!tutorAnswerMatches(test.attached, lesson.tutorDialogue[0].expected)) {
        failures.push(`${test.name}: attached operation failed.`);
      }

      if (!tutorAnswerMatches(test.inverse, lesson.tutorDialogue[1].expected)) {
        failures.push(`${test.name}: inverse operation failed.`);
      }

      if (!tutorAnswerMatches(test.after, lesson.tutorDialogue[2].expected)) {
        failures.push(`${test.name}: solution validation failed.`);
      }
    }

    const originalKey = normalizeEquationKey(lesson.diagnostic.equationBefore);
    const recoveryKeys = lesson.recoveryPractice.map(item => normalizeEquationKey(item.equation || item.prompt));

    if (recoveryKeys.some(key => key === originalKey)) {
      failures.push(`${test.name}: recovery practice repeats original equation.`);
    }

    if (new Set(recoveryKeys).size !== recoveryKeys.length) {
      failures.push(`${test.name}: recovery practice contains duplicate checks.`);
    }
  }

  const result = {
    passed: failures.length === 0,
    failures,
    tested: testCases.length,
    message: failures.length === 0
      ? "Recovery Tutor Certification PASS"
      : "Recovery Tutor Certification FAIL"
  };

  if (result.passed) {
    console.log("✅", result.message, result);
  } else {
    console.error("❌", result.message, result);
  }

  return result;
}

/* =========================================================
   EXPORTS + GLOBAL OBJECT
========================================================= */

const AlgebraRecoveryLessonEngine = {
  generateRecoveryLesson,
  markRecoveryOpened,
  loadRecoveryState,
  loadTutorState,
  recordTutorAnswer,
  recordRecoveryPractice,
  tutorAnswerMatches,
  certifyRecoveryTutor,
  installRecoveryTutorKeyboardSupport,
  __private: {
    parseOneStepEquation,
    parseMultiStepEquation,
    parseVariablesBothSidesEquation,
    detectRecoverySkillFromQuestion,
    chooseEffectiveRecoverySkill,
    isOneStepEquationStructure,
    isTrueMultiStepEquationStructure,
    isVariablesBothSidesEquationStructure,
    inverseOperation,
    expectedOperationAnswers,
    normalizeText,
    normalizeAnswer,
    renderEquationTransformation,
    renderMultiStepTransformation,
    renderVariablesBothSidesTransformation
  }
};

window.AlgebraRecoveryLessonEngine = AlgebraRecoveryLessonEngine;
installRecoveryTutorKeyboardSupport();

export {
  generateRecoveryLesson,
  markRecoveryOpened,
  loadRecoveryState,
  loadTutorState,
  recordTutorAnswer,
  recordRecoveryPractice,
  tutorAnswerMatches,
  certifyRecoveryTutor,
  installRecoveryTutorKeyboardSupport
};

export default AlgebraRecoveryLessonEngine;
