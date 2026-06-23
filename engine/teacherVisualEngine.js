/*
==================================================
 Algebra OS — Teacher Visual Engine
 Version: 3506

 Purpose:
 - Convert solver steps into visual algebra workspaces.
 - Show what changes on both sides of an equation.
 - Support real teacher-style explanations.
 - No lesson-by-lesson hardcoding.
==================================================
*/

export function buildTeacherVisual(solved = {}, stepIndex = 0) {
  if (!solved || !Array.isArray(solved.steps)) return "";

  const step = solved.steps[stepIndex];
  if (!step) return "";

  if (solved.family === "linear_equation") {
    return buildLinearEquationVisual(solved, stepIndex);
  }

  return buildGenericVisual(step);
}

/* =========================================================
   LINEAR EQUATION VISUALS
========================================================= */

function buildLinearEquationVisual(solved, stepIndex) {
  const steps = solved.steps || [];
  const current = steps[stepIndex];

  if (!current) return "";

  const original = solved.equationBefore || steps[0]?.expression || "";
  const currentExpression = current.expression || "";

  return `
${visualStyles()}
<div class="aos-visual-teacher">
  <div class="aos-visual-title">What is happening visually?</div>

  <div class="aos-visual-model">
    ${renderEquationBalance(original, currentExpression, stepIndex)}
  </div>

  <div class="aos-visual-note">
    ${escapeHtml(current.explanation || "This step keeps the equation balanced.")}
  </div>
</div>
`;
}

function renderEquationBalance(original, currentExpression, stepIndex) {
  const originalParts = splitEquation(original);
  const currentParts = splitEquation(currentExpression);

  if (!originalParts || !currentParts) {
    return renderExpressionOnly(currentExpression || original);
  }

  const arrowLabel =
    stepIndex === 0
      ? "Read the equation"
      : stepIndex === 1
        ? "Apply the same move to both sides"
        : "Simplify";

  return `
<div class="aos-balance-wrap">
  <div class="aos-balance-row">
    <div class="aos-side aos-left">
      <div class="aos-side-label">Left Side</div>
      <div class="aos-expression-box">${formatMathText(originalParts.left)}</div>
    </div>

    <div class="aos-equal-sign">=</div>

    <div class="aos-side aos-right">
      <div class="aos-side-label">Right Side</div>
      <div class="aos-expression-box right">${formatMathText(originalParts.right)}</div>
    </div>
  </div>

  <div class="aos-visual-arrow">
    <span>${escapeHtml(arrowLabel)}</span>
    <div>↓</div>
  </div>

  <div class="aos-balance-row after">
    <div class="aos-side aos-left">
      <div class="aos-side-label">Left Side Now</div>
      <div class="aos-expression-box changed">${formatMathText(currentParts.left)}</div>
    </div>

    <div class="aos-equal-sign">=</div>

    <div class="aos-side aos-right">
      <div class="aos-side-label">Right Side Now</div>
      <div class="aos-expression-box right changed">${formatMathText(currentParts.right)}</div>
    </div>
  </div>
</div>
`;
}

function renderExpressionOnly(expression) {
  return `
<div class="aos-expression-only">
  <div class="aos-expression-box changed">${formatMathText(expression)}</div>
</div>
`;
}

function buildGenericVisual(step) {
  return `
${visualStyles()}
<div class="aos-visual-teacher">
  <div class="aos-visual-title">Math Workspace</div>
  <div class="aos-expression-only">
    <div class="aos-expression-box changed">${formatMathText(step?.expression || "")}</div>
  </div>
  <div class="aos-visual-note">${escapeHtml(step?.explanation || "")}</div>
</div>
`;
}

/* =========================================================
   HELPERS
========================================================= */

function splitEquation(value) {
  const text = String(value || "");
  const parts = text.split("=");
  if (parts.length !== 2) return null;

  return {
    left: parts[0].trim(),
    right: parts[1].trim()
  };
}

function formatMathText(value) {
  return escapeHtml(value)
    .replace(/\+/g, `<span class="aos-op">+</span>`)
    .replace(/−/g, `<span class="aos-subtract">−</span>`)
    .replace(/-/g, `<span class="aos-subtract">−</span>`)
    .replace(/÷/g, `<span class="aos-op">÷</span>`)
    .replace(/×/g, `<span class="aos-op">×</span>`);
}

function visualStyles() {
  return `
<style>
.aos-visual-teacher{
  margin-top:14px;
  background:#ffffff;
  border:1px solid #bfdbfe;
  border-radius:16px;
  padding:14px;
  color:#0f172a;
}
.aos-visual-title{
  font-size:13px;
  font-weight:1000;
  color:#1e3a8a;
  text-transform:uppercase;
  letter-spacing:.05em;
  margin-bottom:12px;
}
.aos-visual-model{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:14px;
}
.aos-balance-wrap{
  display:flex;
  flex-direction:column;
  gap:10px;
}
.aos-balance-row{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:end;
  gap:10px;
}
.aos-side-label{
  font-size:11px;
  font-weight:1000;
  color:#475569;
  text-align:center;
  margin-bottom:6px;
}
.aos-expression-box{
  min-height:54px;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#ffffff;
  border:2px solid #93c5fd;
  border-radius:12px;
  padding:10px;
  font-size:25px;
  font-weight:1000;
  color:#1e3a8a;
  font-family:"Courier New", Consolas, monospace;
  line-height:1.2;
}
.aos-expression-box.right{
  border-color:#86efac;
  color:#166534;
}
.aos-expression-box.changed{
  background:#eff6ff;
}
.aos-expression-box.right.changed{
  background:#f0fdf4;
}
.aos-equal-sign{
  font-size:26px;
  font-weight:1000;
  color:#334155;
  padding-bottom:12px;
}
.aos-visual-arrow{
  text-align:center;
  color:#2563eb;
  font-weight:1000;
  line-height:1.2;
}
.aos-visual-arrow span{
  display:inline-block;
  background:#dbeafe;
  color:#1e40af;
  border-radius:999px;
  padding:5px 10px;
  font-size:11px;
  margin-bottom:4px;
}
.aos-op{
  color:#334155;
  margin:0 4px;
}
.aos-subtract{
  color:#dc2626;
  margin:0 4px;
}
.aos-visual-note{
  margin-top:10px;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  color:#166534;
  border-radius:12px;
  padding:10px;
  font-size:13px;
  font-weight:900;
  line-height:1.4;
}
.aos-expression-only{
  display:flex;
  justify-content:center;
}
@media(max-width:700px){
  .aos-balance-row{
    grid-template-columns:1fr;
  }
  .aos-equal-sign{
    text-align:center;
    padding-bottom:0;
  }
}
</style>
`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.AlgebraTeacherVisualEngine = {
  buildTeacherVisual
};
