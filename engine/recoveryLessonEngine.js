/* =========================================================
   ALGEBRA OS — recoveryLessonEngine.js
   SAFE RESTORE + INTERACTIVE TUTOR FIX
   Version: Recovery Tutor Hotfix 2

   USE:
   Replace the content of:

   engine/recoveryLessonEngine.js

   with this complete file.

   WHY THIS VERSION:
   The previous patch broke the Recovery Tutor button because it only
   declared functions locally and did not properly expose/export them.
   This version:
   - exports the main engine functions
   - attaches tutor functions to window for onclick compatibility
   - fixes answer validation
   - supports Recovery Tutor button behavior
   - shows live equation transformation
   - supports Restart Tutor
========================================================= */


/* =========================================================
   DEFAULT RECOVERY CONTENT
========================================================= */

const DEFAULT_VIDEO_PLACEHOLDER = {
  title: "Video support coming soon",
  url: ""
};

const OPERATION_CHOICES = [
  "Addition",
  "Subtraction",
  "Multiplication",
  "Division"
];


/* =========================================================
   PUBLIC ENGINE FACTORY
   This is the main function lesson.html should use.
========================================================= */

export function generateRecoveryLesson(skill = "one_step_equation", question = null) {
  const skillId = normalizeSkillId(skill);

  if (skillId.includes("one_step") || skillId.includes("equation")) {
    return buildOneStepEquationRecovery(question, skillId);
  }

  if (skillId.includes("linear") || skillId.includes("slope")) {
    return buildGenericRecovery(skillId, "linear equations and relationships");
  }

  if (skillId.includes("quadratic")) {
    return buildGenericRecovery(skillId, "quadratic functions");
  }

  if (skillId.includes("system")) {
    return buildGenericRecovery(skillId, "systems of equations");
  }

  return buildGenericRecovery(skillId, "this skill");
}


/* Compatibility aliases in case lesson.html imports a different name. */
export const buildRecoveryLesson = generateRecoveryLesson;
export const createRecoveryLesson = generateRecoveryLesson;
export const getRecoveryLesson = generateRecoveryLesson;


/* =========================================================
   ONE-STEP EQUATION RECOVERY LESSON
========================================================= */

function buildOneStepEquationRecovery(question = null, skillId = "one_step_equation") {
  const parsed = parseEquationFromQuestion(question);

  const equationBefore = parsed.equation || "x + 8 = 16";
  const operation = parsed.operation || "Addition";
  const inverseOperation = getInverseOperation(operation);
  const action = parsed.action || "- 8     - 8";
  const equationAfter = parsed.equationAfter || "x = 8";

  return {
    id: `recovery_${skillId}`,
    skillId,
    title: "Recovery Tutor: One-Step Equations",

    conceptSummary:
      "To solve a one-step equation, identify the operation attached to the variable. Then use the inverse operation on both sides to isolate the variable.",

    commonMistake:
      "A common mistake is choosing the operation you see instead of the inverse operation needed to solve. First identify the attached operation, then undo it.",

    tutorSteps: [
      {
        prompt: "What operation is attached to x?",
        equationBefore,
        choices: OPERATION_CHOICES,
        expected: buildExpectedOperationAnswers(operation),
        explanation: `The operation attached to x is ${operation.toLowerCase()}.`,
        errorExplanation: "Look at the sign or operation next to x. Identify what is happening to x before solving.",
        equationAction: "",
        equationAfter: ""
      },
      {
        prompt: "What inverse operation should we use to isolate x?",
        equationBefore,
        choices: OPERATION_CHOICES,
        expected: buildExpectedOperationAnswers(inverseOperation),
        explanation: `Correct. The inverse of ${operation.toLowerCase()} is ${inverseOperation.toLowerCase()}.`,
        errorExplanation: "Use the opposite operation. Addition and subtraction undo each other. Multiplication and division undo each other.",
        equationAction: action,
        equationAfter
      },
      {
        prompt: "After applying the inverse operation to both sides, what is the simplified equation?",
        equationBefore,
        choices: buildEquationAfterChoices(equationAfter),
        expected: [equationAfter],
        explanation: `Correct. The equation simplifies to ${equationAfter}.`,
        errorExplanation: "Apply the same inverse operation to both sides, then simplify.",
        equationAction: action,
        equationAfter
      }
    ],

    workedExample: {
      title: "Worked Example",
      steps: [
        `Start with ${equationBefore}.`,
        `Identify the operation attached to x: ${operation}.`,
        `Use the inverse operation: ${inverseOperation}.`,
        `Apply it to both sides: ${action}.`,
        `The result is ${equationAfter}.`
      ]
    },

    video: DEFAULT_VIDEO_PLACEHOLDER,

    recoveryPractice: [
      {
        question: `Solve: ${equationBefore}`,
        choices: buildEquationAfterChoices(equationAfter),
        answer: equationAfter,
        explanation: `Use the inverse operation to isolate x.`
      }
    ]
  };
}


/* =========================================================
   GENERIC RECOVERY LESSON
========================================================= */

function buildGenericRecovery(skillId, topicName) {
  return {
    id: `recovery_${skillId}`,
    skillId,
    title: `Recovery Tutor: ${titleCase(topicName)}`,

    conceptSummary:
      `This recovery lesson reviews ${topicName}. Read the prompt carefully, identify what the problem is asking, and use the correct algebraic step.`,

    commonMistake:
      "A common mistake is rushing to calculate before identifying the skill being tested.",

    tutorSteps: [
      {
        prompt: "What should you do first?",
        equationBefore: "",
        choices: [
          "Identify the skill",
          "Guess an answer",
          "Skip the problem",
          "Change the question"
        ],
        expected: ["Identify the skill"],
        explanation: "Correct. First identify the skill and what the question is asking.",
        errorExplanation: "Before solving, identify the skill and the information given.",
        equationAction: "",
        equationAfter: ""
      }
    ],

    workedExample: {
      title: "Worked Example",
      steps: [
        "Read the problem.",
        "Identify the skill.",
        "Choose the correct strategy.",
        "Check that your answer makes sense."
      ]
    },

    video: DEFAULT_VIDEO_PLACEHOLDER,

    recoveryPractice: []
  };
}


/* =========================================================
   OPEN / RENDER RECOVERY TUTOR
========================================================= */

export function openRecoveryTutor(recoveryLesson = null) {
  if (recoveryLesson) {
    window.currentRecoveryLesson = recoveryLesson;
  }

  if (!window.currentRecoveryLesson) {
    window.currentRecoveryLesson = generateRecoveryLesson("one_step_equation", null);
  }

  window.recoveryTutorState = {
    tutorStep: 0,
    tutorCompleted: false,
    lastAnswerCorrect: null,
    waitingForNextStep: false
  };

  renderRecoveryTutorShell();
  renderInteractiveTutor();
}

export function startRecoveryTutor(recoveryLesson = null) {
  openRecoveryTutor(recoveryLesson);
}

export function renderRecoveryTutorShell() {
  let container =
    document.getElementById("recoveryTutorPanel") ||
    document.getElementById("recoveryTutor") ||
    document.getElementById("recoveryPanel") ||
    document.getElementById("tutorPanel");

  if (!container) {
    container = document.createElement("section");
    container.id = "recoveryTutorPanel";
    document.body.appendChild(container);
  }

  const lesson = window.currentRecoveryLesson || generateRecoveryLesson();

  container.style.display = "block";

  container.innerHTML = `
    <div class="recovery-tutor-shell">
      <div class="recovery-tutor-header">
        <h2>${escapeHtml(lesson.title || "Recovery Tutor")}</h2>
      </div>

      <div class="recovery-section">
        <h3>Concept Summary</h3>
        <p>${escapeHtml(lesson.conceptSummary || "")}</p>
      </div>

      <div class="recovery-section">
        <h3>Common Mistake</h3>
        <p>${escapeHtml(lesson.commonMistake || "")}</p>
      </div>

      <div id="interactiveTutor"></div>

      ${renderWorkedExample(lesson.workedExample)}

      <div class="recovery-section">
        <h3>Video Support</h3>
        <p>${escapeHtml(lesson.video?.title || "Video support coming soon")}</p>
      </div>
    </div>
  `;
}


/* =========================================================
   ANSWER NORMALIZATION + VALIDATION FIX
========================================================= */

export function normalizeTutorAnswer(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    value =
      value.value ??
      value.label ??
      value.text ??
      value.answer ??
      value.choice ??
      "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.。]/g, "");
}

export function tutorAnswerMatches(selectedAnswer, expectedAnswers) {
  const selected = normalizeTutorAnswer(selectedAnswer);

  const expectedList = Array.isArray(expectedAnswers)
    ? expectedAnswers
    : [expectedAnswers];

  return expectedList.some(expected => {
    return normalizeTutorAnswer(expected) === selected;
  });
}


/* =========================================================
   CURRENT TUTOR STEP
========================================================= */

export function getCurrentTutorStep() {
  const lesson = window.currentRecoveryLesson;

  if (!lesson) return null;
  if (!Array.isArray(lesson.tutorSteps)) return null;

  const stepIndex = window.recoveryTutorState?.tutorStep ?? 0;

  return lesson.tutorSteps[stepIndex] ?? null;
}


/* =========================================================
   RENDER INTERACTIVE TUTOR
========================================================= */

export function renderInteractiveTutor() {
  const tutorContainer = document.getElementById("interactiveTutor");

  if (!tutorContainer) {
    console.error("Missing interactiveTutor container.");
    return;
  }

  if (!window.recoveryTutorState) {
    window.recoveryTutorState = {
      tutorStep: 0,
      tutorCompleted: false,
      lastAnswerCorrect: null,
      waitingForNextStep: false
    };
  }

  const currentStep = getCurrentTutorStep();

  if (!currentStep) {
    tutorContainer.innerHTML = `
      <div class="tutor-card">
        <h3>Interactive Tutor</h3>
        <p>No tutor step found for this skill.</p>
      </div>
    `;
    return;
  }

  const choices = Array.isArray(currentStep.choices)
    ? currentStep.choices
    : [];

  tutorContainer.innerHTML = `
    <div class="tutor-card">
      <div class="tutor-header">
        <h3>Interactive Tutor</h3>
        <button class="restart-tutor-btn" type="button" data-action="restart-tutor">
          Restart Tutor
        </button>
      </div>

      <div class="tutor-step-label">
        Step ${(window.recoveryTutorState.tutorStep ?? 0) + 1}
      </div>

      ${currentStep.equationBefore ? `
        <div class="tutor-equation-main">
          ${escapeHtml(currentStep.equationBefore)}
        </div>
      ` : ""}

      <div class="tutor-prompt">
        ${escapeHtml(currentStep.prompt || "")}
      </div>

      <div class="tutor-choices">
        ${choices.map(choice => `
          <button
            type="button"
            class="tutor-choice-btn"
            data-tutor-choice="${escapeAttribute(choice)}">
            ${escapeHtml(choice)}
          </button>
        `).join("")}
      </div>

      <div id="tutorFeedback" class="tutor-feedback-box"></div>

      <div
        id="tutorEquationTransformation"
        class="tutor-equation-transformation"
        style="display:none;">
      </div>

      <div class="tutor-actions">
        <button
          id="tryTutorAgainBtn"
          type="button"
          class="try-again-btn"
          data-action="try-again"
          style="display:none;">
          Try Again
        </button>

        <button
          id="nextTutorStepBtn"
          type="button"
          class="next-step-btn"
          data-action="next-step"
          style="display:none;">
          Next Tutor Step
        </button>
      </div>
    </div>
  `;

  bindTutorButtons();
}


/* =========================================================
   BIND BUTTONS
   Safer than inline onclick and works with ES modules.
========================================================= */

function bindTutorButtons() {
  document.querySelectorAll(".tutor-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      checkTutorAnswer(btn.dataset.tutorChoice);
    });
  });

  document.querySelectorAll("[data-action='restart-tutor']").forEach(btn => {
    btn.addEventListener("click", restartTutor);
  });

  document.querySelectorAll("[data-action='try-again']").forEach(btn => {
    btn.addEventListener("click", tryTutorAgain);
  });

  document.querySelectorAll("[data-action='next-step']").forEach(btn => {
    btn.addEventListener("click", nextTutorStep);
  });
}


/* =========================================================
   CHECK TUTOR ANSWER
========================================================= */

export function checkTutorAnswer(selectedChoice) {
  const state = window.recoveryTutorState;

  if (!state) {
    console.error("Recovery tutor state not found.");
    return;
  }

  const currentStep = getCurrentTutorStep();

  if (!currentStep) {
    console.error("Current tutor step not found.");
    return;
  }

  const isCorrect = tutorAnswerMatches(selectedChoice, currentStep.expected);

  const feedbackBox = document.getElementById("tutorFeedback");
  const equationBox = document.getElementById("tutorEquationTransformation");
  const nextButton = document.getElementById("nextTutorStepBtn");
  const tryAgainButton = document.getElementById("tryTutorAgainBtn");

  if (!feedbackBox) {
    console.error("Missing tutorFeedback element.");
    return;
  }

  if (isCorrect) {
    state.lastAnswerCorrect = true;
    state.waitingForNextStep = true;

    feedbackBox.innerHTML = `
      <div class="tutor-feedback tutor-correct">
        <strong>✔ Correct.</strong>
        <p>${escapeHtml(currentStep.explanation || "Good job. That answer is correct.")}</p>
      </div>
    `;

    if (equationBox) {
      equationBox.innerHTML = renderEquationTransformation(currentStep);
      equationBox.style.display = equationBox.innerHTML.trim() ? "block" : "none";
    }

    if (nextButton) {
      nextButton.style.display = "inline-block";
      nextButton.disabled = false;
    }

    if (tryAgainButton) {
      tryAgainButton.style.display = "none";
    }

    disableTutorChoices();

  } else {
    state.lastAnswerCorrect = false;
    state.waitingForNextStep = false;

    feedbackBox.innerHTML = `
      <div class="tutor-feedback tutor-incorrect">
        <strong>❌ Not yet.</strong>
        <p>${escapeHtml(currentStep.errorExplanation || currentStep.theory || "Review the operation attached to the variable and try again.")}</p>
      </div>
    `;

    if (equationBox) {
      equationBox.style.display = "none";
      equationBox.innerHTML = "";
    }

    if (nextButton) {
      nextButton.style.display = "none";
    }

    if (tryAgainButton) {
      tryAgainButton.style.display = "inline-block";
      tryAgainButton.disabled = false;
    }

    // Do NOT advance. Student retries the same step.
  }
}


/* =========================================================
   NEXT STEP — MANUAL ADVANCE ONLY
========================================================= */

export function nextTutorStep() {
  const state = window.recoveryTutorState;
  if (!state) return;

  const steps = window.currentRecoveryLesson?.tutorSteps ?? [];

  if (!state.waitingForNextStep) return;

  state.tutorStep += 1;
  state.lastAnswerCorrect = null;
  state.waitingForNextStep = false;

  if (state.tutorStep >= steps.length) {
    state.tutorCompleted = true;
    renderTutorCompleted();
    return;
  }

  renderInteractiveTutor();
}


/* =========================================================
   TRY AGAIN — SAME STEP
========================================================= */

export function tryTutorAgain() {
  const state = window.recoveryTutorState;
  if (!state) return;

  state.lastAnswerCorrect = null;
  state.waitingForNextStep = false;

  const feedbackBox = document.getElementById("tutorFeedback");
  const equationBox = document.getElementById("tutorEquationTransformation");
  const tryAgainButton = document.getElementById("tryTutorAgainBtn");
  const nextButton = document.getElementById("nextTutorStepBtn");

  if (feedbackBox) feedbackBox.innerHTML = "";

  if (equationBox) {
    equationBox.innerHTML = "";
    equationBox.style.display = "none";
  }

  if (tryAgainButton) tryAgainButton.style.display = "none";
  if (nextButton) nextButton.style.display = "none";

  enableTutorChoices();
}


/* =========================================================
   RESTART TUTOR
========================================================= */

export function restartTutor() {
  window.recoveryTutorState = {
    tutorStep: 0,
    tutorCompleted: false,
    lastAnswerCorrect: null,
    waitingForNextStep: false
  };

  renderInteractiveTutor();
}


/* =========================================================
   TUTOR COMPLETED
========================================================= */

export function renderTutorCompleted() {
  const tutorContainer = document.getElementById("interactiveTutor");
  if (!tutorContainer) return;

  tutorContainer.innerHTML = `
    <div class="tutor-card tutor-completed">
      <h3>✔ Tutor Completed</h3>
      <p>You completed the guided tutor. Now try the recovery practice.</p>

      <button class="restart-tutor-btn" type="button" data-action="restart-tutor">
        Restart Tutor
      </button>
    </div>
  `;

  bindTutorButtons();
}


/* =========================================================
   EQUATION TRANSFORMATION DISPLAY
========================================================= */

export function renderEquationTransformation(step) {
  if (!step) return "";

  const before = step.equationBefore || "";
  const action = step.equationAction || "";
  const after = step.equationAfter || "";

  if (!before && !action && !after) return "";

  return `
    <div class="equation-transformation-box">
      <div class="equation-title">What happened to the equation?</div>

      ${before ? `<div class="equation-line equation-before">${escapeHtml(before)}</div>` : ""}

      ${action ? `<div class="equation-line equation-action">${escapeHtml(action)}</div>` : ""}

      ${(action || after) ? `<div class="equation-separator">────────────</div>` : ""}

      ${after ? `<div class="equation-line equation-after">${escapeHtml(after)}</div>` : ""}
    </div>
  `;
}


/* =========================================================
   ENABLE / DISABLE CHOICES
========================================================= */

export function disableTutorChoices() {
  document.querySelectorAll(".tutor-choice-btn").forEach(btn => {
    btn.disabled = true;
    btn.classList.add("disabled");
  });
}

export function enableTutorChoices() {
  document.querySelectorAll(".tutor-choice-btn").forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("disabled");
  });
}


/* =========================================================
   WORKED EXAMPLE RENDER
========================================================= */

function renderWorkedExample(workedExample) {
  if (!workedExample) return "";

  const steps = Array.isArray(workedExample.steps)
    ? workedExample.steps
    : [];

  return `
    <div class="recovery-section">
      <h3>${escapeHtml(workedExample.title || "Worked Example")}</h3>
      <ol>
        ${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </div>
  `;
}


/* =========================================================
   PARSING HELPERS
========================================================= */

function normalizeSkillId(skill) {
  if (typeof skill === "string") return skill.toLowerCase().replace(/\s+/g, "_");
  if (skill?.id) return String(skill.id).toLowerCase().replace(/\s+/g, "_");
  if (skill?.skillId) return String(skill.skillId).toLowerCase().replace(/\s+/g, "_");
  if (skill?.title) return String(skill.title).toLowerCase().replace(/\s+/g, "_");
  return "general_skill";
}

function parseEquationFromQuestion(question) {
  let text = "";

  if (typeof question === "string") text = question;
  else if (question?.question) text = question.question;
  else if (question?.prompt) text = question.prompt;
  else if (question?.text) text = question.text;

  const equationMatch = text.match(/[a-z]\s*[+\-×*÷/]\s*-?\d+\s*=\s*-?\d+/i);
  const equation = equationMatch ? cleanEquation(equationMatch[0]) : "";

  if (!equation) {
    return {
      equation: "x + 8 = 16",
      operation: "Addition",
      action: "- 8     - 8",
      equationAfter: "x = 8"
    };
  }

  return analyzeOneStepEquation(equation);
}

function cleanEquation(eq) {
  return String(eq)
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\s+/g, " ")
    .trim();
}

function analyzeOneStepEquation(equation) {
  const compact = equation.replace(/\s+/g, "");

  let match;

  // x + a = b
  match = compact.match(/^([a-z])\+(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    const result = b - a;
    return {
      equation,
      operation: "Addition",
      action: `- ${a}     - ${a}`,
      equationAfter: `${variable} = ${result}`
    };
  }

  // x - a = b
  match = compact.match(/^([a-z])-(-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    const result = b + a;
    return {
      equation,
      operation: "Subtraction",
      action: `+ ${a}     + ${a}`,
      equationAfter: `${variable} = ${result}`
    };
  }

  // ax = b or a×x = b
  match = compact.match(/^(-?\d+)[×*]?([a-z])=(-?\d+)$/i);
  if (match) {
    const a = Number(match[1]);
    const variable = match[2];
    const b = Number(match[3]);
    const result = b / a;
    return {
      equation,
      operation: "Multiplication",
      action: `÷ ${a}     ÷ ${a}`,
      equationAfter: `${variable} = ${formatNumber(result)}`
    };
  }

  // x ÷ a = b
  match = compact.match(/^([a-z])[÷/](-?\d+)=(-?\d+)$/i);
  if (match) {
    const variable = match[1];
    const a = Number(match[2]);
    const b = Number(match[3]);
    const result = b * a;
    return {
      equation,
      operation: "Division",
      action: `× ${a}     × ${a}`,
      equationAfter: `${variable} = ${result}`
    };
  }

  return {
    equation,
    operation: "Addition",
    action: "- 8     - 8",
    equationAfter: "x = 8"
  };
}

function getInverseOperation(operation) {
  const op = normalizeTutorAnswer(operation);

  if (op === "addition") return "Subtraction";
  if (op === "subtraction") return "Addition";
  if (op === "multiplication") return "Division";
  if (op === "division") return "Multiplication";

  return "Subtraction";
}

function buildExpectedOperationAnswers(operation) {
  const op = normalizeTutorAnswer(operation);

  if (op === "addition") return ["Addition", "add", "plus", "+"];
  if (op === "subtraction") return ["Subtraction", "subtract", "minus", "-"];
  if (op === "multiplication") return ["Multiplication", "multiply", "times", "×", "*"];
  if (op === "division") return ["Division", "divide", "÷", "/"];

  return [operation];
}

function buildEquationAfterChoices(correct) {
  const normalized = String(correct || "x = 8").trim();
  const match = normalized.match(/^([a-z])\s*=\s*(-?\d+(?:\.\d+)?)$/i);

  if (!match) {
    return uniqueChoices([normalized, "x = 0", "x = 1", "No solution"]);
  }

  const variable = match[1];
  const value = Number(match[2]);

  return uniqueChoices([
    `${variable} = ${formatNumber(value)}`,
    `${variable} = ${formatNumber(value + 1)}`,
    `${variable} = ${formatNumber(value - 1)}`,
    `${variable} = ${formatNumber(-value)}`
  ]);
}

function uniqueChoices(choices) {
  const seen = new Set();
  const result = [];

  for (const choice of choices) {
    const key = normalizeTutorAnswer(choice);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(choice);
    }
  }

  while (result.length < 4) {
    result.push(`Choice ${result.length + 1}`);
  }

  return result.slice(0, 4);
}

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(2)));
}

function titleCase(text) {
  return String(text)
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}


/* =========================================================
   BASIC ESCAPE HELPERS
========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* =========================================================
   GLOBAL EXPOSURE
   Needed because lesson.html may call these functions from buttons.
========================================================= */

window.generateRecoveryLesson = generateRecoveryLesson;
window.buildRecoveryLesson = buildRecoveryLesson;
window.createRecoveryLesson = createRecoveryLesson;
window.getRecoveryLesson = getRecoveryLesson;

window.openRecoveryTutor = openRecoveryTutor;
window.startRecoveryTutor = startRecoveryTutor;
window.renderRecoveryTutorShell = renderRecoveryTutorShell;
window.renderInteractiveTutor = renderInteractiveTutor;

window.normalizeTutorAnswer = normalizeTutorAnswer;
window.tutorAnswerMatches = tutorAnswerMatches;
window.getCurrentTutorStep = getCurrentTutorStep;
window.checkTutorAnswer = checkTutorAnswer;

window.nextTutorStep = nextTutorStep;
window.tryTutorAgain = tryTutorAgain;
window.restartTutor = restartTutor;
window.renderTutorCompleted = renderTutorCompleted;
window.renderEquationTransformation = renderEquationTransformation;


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  generateRecoveryLesson,
  buildRecoveryLesson,
  createRecoveryLesson,
  getRecoveryLesson,
  openRecoveryTutor,
  startRecoveryTutor,
  renderRecoveryTutorShell,
  renderInteractiveTutor,
  normalizeTutorAnswer,
  tutorAnswerMatches,
  checkTutorAnswer,
  nextTutorStep,
  tryTutorAgain,
  restartTutor,
  renderTutorCompleted,
  renderEquationTransformation
};
