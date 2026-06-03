/* =========================================================
   ALGEBRA OS — recoveryLessonEngine.js
   Version: 1700 — CERTIFIED RECOVERY TUTOR + MATH RENDERER

   PURPOSE:
   - Compatible with current lesson.html.
   - Restores window.AlgebraRecoveryLessonEngine.
   - Fixes division inverse bug:
       x ÷ 7 = 1
       inverse operation = Multiplication
   - Adds deterministic tutor validation support.
   - Keeps Recovery Practice different from original and from itself.
   - Adds teacher-style aligned math renderer.
   - Shows cancellation with cross-out.
   - Does NOT show + 0.
   - Adds Enter key support for tutor workflow.
========================================================= */

const RECOVERY_PREFIX = "algebra_recovery_";

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

    // IMPORTANT:
    // Every time the student opens the Recovery Tutor from the button,
    // the tutor must begin from Step 1.
    tutorStep: 0,
    tutorAttempts: Number(previousState.tutorAttempts || 0),
    tutorCompleted: false,

    // Keep recovery practice progress only if the student already completed it.
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

function generateRecoveryLesson(problemType = "one_step_addition_equation", metadata = {}, currentQuestion = null) {
  installRecoveryTutorKeyboardSupport();

  const skill = normalizeText(problemType);

  if (
    skill.includes("one_step") ||
    skill.includes("addition_equation") ||
    skill.includes("subtraction_equation") ||
    skill.includes("multiplication_equation") ||
    skill.includes("division_equation") ||
    skill.includes("equation")
  ) {
    return buildOneStepEquationLesson(problemType, metadata, currentQuestion);
  }

  return buildGenericLesson(problemType, metadata, currentQuestion);
}

function buildOneStepEquationLesson(problemType, metadata, currentQuestion) {
  const parsed = parseOneStepEquation(currentQuestion);
  const operation = parsed.operation;
  const inverse = inverseOperation(operation);
  const recoveryPractice = buildRecoveryPracticeItems(parsed, operation);

  return {
    title: "Recovery Tutor: One-Step Equations",

    diagnostic: {
      equationBefore: parsed.equationBefore,
      operation,
      inverseOperation: inverse,
      equationAction: parsed.equationAction,
      equationAfter: parsed.equationAfter
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
        id: "simplified_equation",
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
   RECOVERY PRACTICE GENERATOR
========================================================= */

function buildRecoveryPracticeItems(originalParsed, operation) {
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

function normalizeEquationKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/−/g, "-");
}

/* =========================================================
   EQUATION PARSING
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

  const text =
    typeof currentQuestion === "string"
      ? currentQuestion
      : currentQuestion?.prompt ||
        currentQuestion?.question ||
        currentQuestion?.text ||
        "";

  const answer =
    currentQuestion?.answer ||
    currentQuestion?.correctAnswer ||
    "";

  const equation = extractEquation(text);

  if (!equation) {
    if (answer) {
      return { ...fallback, equationAfter: String(answer).trim() };
    }
    return fallback;
  }

  const compact = equation.replace(/\s+/g, "").replace(/−/g, "-");
  let match;

  // x + a = b
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

  // x - a = b
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

  // a×x = b, a*x = b, ax = b
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

  // x ÷ a = b, x/a = b
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

function extractEquation(text) {
  const source = String(text || "")
    .replace(/Solve\s+for\s+x\.?/i, "")
    .replace(/Solve:/i, "")
    .trim();

  const patterns = [
    /[a-z]\s*[+]\s*-?\d+\s*=\s*-?\d+/i,
    /[a-z]\s*[-−]\s*-?\d+\s*=\s*-?\d+/i,
    /-?\d+\s*[×*]\s*[a-z]\s*=\s*-?\d+/i,
    /-?\d+\s*[a-z]\s*=\s*-?\d+/i,
    /[a-z]\s*[÷/]\s*-?\d+\s*=\s*-?\d+/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[0];
  }

  return "";
}

function prettyEquation(equation) {
  return String(equation)
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−")
    .replace(/\s+/g, " ")
    .trim();
}

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

  if (op === "addition") {
    return ["Addition", "add", "plus", "+", "adding"];
  }

  if (op === "subtraction") {
    return ["Subtraction", "subtract", "minus", "-", "−", "subtracting"];
  }

  if (op === "multiplication") {
    return ["Multiplication", "multiply", "times", "×", "*", "multiplying"];
  }

  if (op === "division") {
    return ["Division", "divide", "÷", "/", "dividing"];
  }

  return [operation];
}

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
   PROFESSIONAL TEACHER-STYLE MATH RENDERER
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

function parseSolutionValue(equationAfter) {
  const match = String(equationAfter || "").match(/=\s*(-?\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
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
   BASIC UTILITIES
========================================================= */

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
   RECOVERY TUTOR CERTIFICATION
========================================================= */

function certifyRecoveryTutor() {
  const testCases = [
    {
      name: "addition equation",
      problemType: "one_step_addition_equation",
      question: { prompt: "Solve for x. x + 8 = 18", answer: "x = 10" },
      attached: "Addition",
      inverse: "Subtraction",
      after: "x = 10"
    },
    {
      name: "subtraction equation",
      problemType: "one_step_subtraction_equation",
      question: { prompt: "Solve for x. x - 8 = 10", answer: "x = 18" },
      attached: "Subtraction",
      inverse: "Addition",
      after: "x = 18"
    },
    {
      name: "multiplication equation",
      problemType: "one_step_multiplication_equation",
      question: { prompt: "Solve for x. 3x = 21", answer: "x = 7" },
      attached: "Multiplication",
      inverse: "Division",
      after: "x = 7"
    },
    {
      name: "division equation",
      problemType: "one_step_division_equation",
      question: { prompt: "Solve for x. x ÷ 7 = 1", answer: "x = 7" },
      attached: "Division",
      inverse: "Multiplication",
      after: "x = 7"
    }
  ];

  const failures = [];

  for (const test of testCases) {
    const lesson = generateRecoveryLesson(test.problemType, {}, test.question);
    const attachedStep = lesson.tutorDialogue[0];
    const inverseStep = lesson.tutorDialogue[1];
    const simplifiedStep = lesson.tutorDialogue[2];

    if (!tutorAnswerMatches(test.attached, attachedStep.expected)) {
      failures.push(`${test.name}: attached operation ${test.attached} did not validate.`);
    }

    if (!tutorAnswerMatches(test.inverse, inverseStep.expected)) {
      failures.push(`${test.name}: inverse operation ${test.inverse} did not validate.`);
    }

    if (!tutorAnswerMatches(test.after, simplifiedStep.expected)) {
      failures.push(`${test.name}: simplified equation ${test.after} did not validate.`);
    }

    const rendererText = String(inverseStep.explanation || "");
    if (!rendererText.includes("aos-math-workspace")) {
      failures.push(`${test.name}: math renderer is missing.`);
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
    inverseOperation,
    expectedOperationAnswers,
    normalizeText,
    normalizeAnswer,
    renderEquationTransformation,
    renderAdditionSubtractionTransformation,
    renderMultiplicationDivisionTransformation
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
