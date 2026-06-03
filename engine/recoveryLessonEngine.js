/* =========================================================
   ALGEBRA OS — RECOVERY TUTOR PATCH
   Interactive Tutor Validation + Live Equation Transformation
   =========================================================

   PURPOSE:
   1. Fix tutor answer validation.
   2. Allow answers like "Addition" to validate correctly.
   3. Keep the same tutor step after an incorrect answer.
   4. Require manual "Next Tutor Step" after a correct answer.
   5. Show equation transformation visually after a correct response.
   6. Preserve conversation visibility.
   7. Support Restart Tutor reset.

   WHERE TO USE:
   Add this block inside the file/page where your Recovery Tutor
   functions currently live, most likely:

   /engine/recoveryLessonEngine.js
   or
   /pages/lesson.html

   Replace your old versions of:

   normalizeTutorAnswer()
   tutorAnswerMatches()
   checkTutorAnswer()
   renderEquationTransformation()
   restartTutor()

   with these versions.
========================================================= */


/* =========================================================
   1. SAFE ANSWER NORMALIZATION
========================================================= */

function normalizeTutorAnswer(value) {
  if (value === null || value === undefined) return "";

  // If the selected answer is an object, extract its usable value.
  if (typeof value === "object") {
    value =
      value.value ??
      value.label ??
      value.text ??
      value.answer ??
      "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


/* =========================================================
   2. FLEXIBLE ANSWER MATCHING
========================================================= */

function tutorAnswerMatches(selectedAnswer, expectedAnswers) {
  const selected = normalizeTutorAnswer(selectedAnswer);

  const expectedList = Array.isArray(expectedAnswers)
    ? expectedAnswers
    : [expectedAnswers];

  return expectedList.some(expected => {
    return normalizeTutorAnswer(expected) === selected;
  });
}


/* =========================================================
   3. GET CURRENT TUTOR STEP SAFELY
========================================================= */

function getCurrentTutorStep() {
  if (!window.currentRecoveryLesson) return null;
  if (!Array.isArray(window.currentRecoveryLesson.tutorSteps)) return null;

  const stepIndex = window.recoveryTutorState?.tutorStep ?? 0;

  return window.currentRecoveryLesson.tutorSteps[stepIndex] ?? null;
}


/* =========================================================
   4. CHECK TUTOR ANSWER
========================================================= */

function checkTutorAnswer(selectedChoice) {
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
        <p>${currentStep.explanation || "Good job. That answer is correct."}</p>
      </div>
    `;

    if (equationBox) {
      equationBox.innerHTML = renderEquationTransformation(currentStep);
      equationBox.style.display = "block";
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
        <p>${currentStep.errorExplanation || currentStep.theory || "Review the operation attached to the variable and try again."}</p>
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

    // Important:
    // Do NOT advance tutorStep here.
    // Student must retry the SAME step.
  }
}


/* =========================================================
   5. NEXT TUTOR STEP — MANUAL ADVANCE ONLY
========================================================= */

function nextTutorStep() {
  const state = window.recoveryTutorState;

  if (!state) return;

  const steps = window.currentRecoveryLesson?.tutorSteps ?? [];

  if (!state.waitingForNextStep) {
    return;
  }

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
   6. TRY AGAIN — SAME STEP
========================================================= */

function tryTutorAgain() {
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

  if (tryAgainButton) {
    tryAgainButton.style.display = "none";
  }

  if (nextButton) {
    nextButton.style.display = "none";
  }

  enableTutorChoices();
}


/* =========================================================
   7. EQUATION TRANSFORMATION DISPLAY
========================================================= */

function renderEquationTransformation(step) {
  if (!step) return "";

  const before = step.equationBefore || "";
  const action = step.equationAction || "";
  const after = step.equationAfter || "";

  if (!before && !action && !after) {
    return "";
  }

  return `
    <div class="equation-transformation-box">
      <div class="equation-title">What happened to the equation?</div>

      ${before ? `<div class="equation-line equation-before">${before}</div>` : ""}

      ${action ? `<div class="equation-line equation-action">${action}</div>` : ""}

      ${(before || action || after) ? `<div class="equation-separator">────────────</div>` : ""}

      ${after ? `<div class="equation-line equation-after">${after}</div>` : ""}
    </div>
  `;
}


/* =========================================================
   8. DISABLE / ENABLE CHOICES
========================================================= */

function disableTutorChoices() {
  document.querySelectorAll(".tutor-choice-btn").forEach(btn => {
    btn.disabled = true;
    btn.classList.add("disabled");
  });
}

function enableTutorChoices() {
  document.querySelectorAll(".tutor-choice-btn").forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("disabled");
  });
}


/* =========================================================
   9. RESTART TUTOR
========================================================= */

function restartTutor() {
  window.recoveryTutorState = {
    tutorStep: 0,
    tutorCompleted: false,
    lastAnswerCorrect: null,
    waitingForNextStep: false
  };

  const feedbackBox = document.getElementById("tutorFeedback");
  const equationBox = document.getElementById("tutorEquationTransformation");
  const nextButton = document.getElementById("nextTutorStepBtn");
  const tryAgainButton = document.getElementById("tryTutorAgainBtn");

  if (feedbackBox) feedbackBox.innerHTML = "";

  if (equationBox) {
    equationBox.innerHTML = "";
    equationBox.style.display = "none";
  }

  if (nextButton) {
    nextButton.style.display = "none";
    nextButton.disabled = false;
  }

  if (tryAgainButton) {
    tryAgainButton.style.display = "none";
    tryAgainButton.disabled = false;
  }

  renderInteractiveTutor();
}


/* =========================================================
   10. RENDER INTERACTIVE TUTOR
========================================================= */

function renderInteractiveTutor() {
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
        <button class="restart-tutor-btn" onclick="restartTutor()">Restart Tutor</button>
      </div>

      <div class="tutor-step-label">
        Step ${(window.recoveryTutorState.tutorStep ?? 0) + 1}
      </div>

      ${currentStep.equationBefore ? `
        <div class="tutor-equation-main">
          ${currentStep.equationBefore}
        </div>
      ` : ""}

      <div class="tutor-prompt">
        ${currentStep.prompt || ""}
      </div>

      <div class="tutor-choices">
        ${choices.map(choice => `
          <button 
            class="tutor-choice-btn"
            onclick="checkTutorAnswer('${escapeTutorChoice(choice)}')">
            ${choice}
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
          class="try-again-btn"
          onclick="tryTutorAgain()"
          style="display:none;">
          Try Again
        </button>

        <button 
          id="nextTutorStepBtn" 
          class="next-step-btn"
          onclick="nextTutorStep()"
          style="display:none;">
          Next Tutor Step
        </button>
      </div>
    </div>
  `;
}


/* =========================================================
   11. ESCAPE CHOICE FOR INLINE onclick
========================================================= */

function escapeTutorChoice(choice) {
  return String(choice)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;");
}


/* =========================================================
   12. TUTOR COMPLETED
========================================================= */

function renderTutorCompleted() {
  const tutorContainer = document.getElementById("interactiveTutor");

  if (!tutorContainer) return;

  tutorContainer.innerHTML = `
    <div class="tutor-card tutor-completed">
      <h3>✔ Tutor Completed</h3>
      <p>You completed the guided tutor. Now try the recovery practice.</p>

      <button class="restart-tutor-btn" onclick="restartTutor()">
        Restart Tutor
      </button>
    </div>
  `;
}


/* =========================================================
   13. EXAMPLE TUTOR STEP STRUCTURE
   Use this structure when generating tutor steps dynamically.
========================================================= */

const EXAMPLE_TUTOR_STEP = {
  prompt: "What operation is attached to x?",
  equationBefore: "x + 8 = 16",
  choices: ["Addition", "Subtraction", "Multiplication", "Division"],
  expected: ["Addition", "add", "+", "+8"],
  explanation: "The operation attached to x is addition because 8 is being added to x.",
  errorExplanation: "Look carefully at x + 8. The + sign means 8 is being added to x.",
  equationAction: "- 8     - 8",
  equationAfter: "x = 8"
};


/* =========================================================
   14. BASIC CSS
   Paste this into lesson.html <style> section
   or your main CSS area.
========================================================= */

/*

.tutor-card {
  background: #ffffff;
  border: 1px solid #d9e2ec;
  border-radius: 14px;
  padding: 18px;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.tutor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.tutor-step-label {
  font-weight: 700;
  margin: 10px 0;
  color: #334e68;
}

.tutor-equation-main {
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  background: #f0f4f8;
  border-radius: 12px;
  padding: 16px;
  margin: 14px 0;
}

.tutor-prompt {
  font-size: 18px;
  font-weight: 700;
  margin: 14px 0;
}

.tutor-choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.tutor-choice-btn {
  border: 1px solid #bcccdc;
  border-radius: 12px;
  padding: 12px;
  background: #f8fafc;
  font-weight: 700;
  cursor: pointer;
}

.tutor-choice-btn:hover {
  background: #e6f0ff;
}

.tutor-choice-btn.disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tutor-feedback-box {
  margin-top: 16px;
}

.tutor-feedback {
  border-radius: 12px;
  padding: 12px 14px;
}

.tutor-correct {
  background: #e3fcef;
  border: 1px solid #8eedc7;
}

.tutor-incorrect {
  background: #ffe3e3;
  border: 1px solid #ffa8a8;
}

.equation-transformation-box {
  margin-top: 16px;
  background: #f7f9fc;
  border: 1px solid #d9e2ec;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}

.equation-title {
  font-weight: 800;
  margin-bottom: 10px;
  color: #334e68;
}

.equation-line {
  font-size: 26px;
  font-weight: 800;
  font-family: Arial, sans-serif;
  line-height: 1.5;
}

.equation-action {
  color: #9b2c2c;
}

.equation-after {
  color: #006644;
}

.equation-separator {
  font-size: 22px;
  color: #627d98;
}

.tutor-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.next-step-btn,
.try-again-btn,
.restart-tutor-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;
}

.next-step-btn {
  background: #2563eb;
  color: white;
}

.try-again-btn {
  background: #f59e0b;
  color: white;
}

.restart-tutor-btn {
  background: #e2e8f0;
  color: #1e293b;
}

*/

