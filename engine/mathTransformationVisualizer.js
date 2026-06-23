/*
==================================================
 Algebra OS — Math Transformation Visualizer
 Version: 3507

 Purpose:
 - Show visual math changes between solver steps.
 - Render transformations, not static equations.
 - Avoid broken HTML math replacement.
 - Focus on what changed and why.
==================================================
*/

export function buildTransformationVisual(solved = {}, stepIndex = 1) {
  if (!solved || !Array.isArray(solved.steps)) return "";

  const previous = solved.steps[stepIndex - 1];
  const current = solved.steps[stepIndex];

  if (!previous || !current) return "";
  if (!shouldVisualizeStep(current)) return "";

  return `
${visualizerStyles()}
<div class="aos-transform-visual">
  <div class="aos-transform-title">Visual Math Step</div>

  <div class="aos-transform-row">
    <div class="aos-transform-label">Before</div>
    <div class="aos-transform-equation">${escapeHtml(previous.expression)}</div>
  </div>

  <div class="aos-transform-arrow">
    <div class="aos-transform-action">${escapeHtml(actionLabel(current))}</div>
    <div class="aos-transform-down">↓</div>
  </div>

  <div class="aos-transform-row after">
    <div class="aos-transform-label">After</div>
    <div class="aos-transform-equation changed">${escapeHtml(current.expression)}</div>
  </div>

  <div class="aos-transform-note">
    ${escapeHtml(current.explanation || "This step changes the equation while keeping it equivalent.")}
  </div>
</div>
`;
}

function shouldVisualizeStep(step = {}) {
  const id = String(step.id || "");
  return [
    "undo",
    "combine",
    "distribute",
    "move_variables",
    "move_constant",
    "divide",
    "simplify"
  ].includes(id);
}

function actionLabel(step = {}) {
  const id = String(step.id || "");

  if (id === "undo") return "Apply the inverse operation to both sides";
  if (id === "combine") return "Combine like terms";
  if (id === "distribute") return "Use the distributive property";
  if (id === "move_variables") return "Move variable terms to one side";
  if (id === "move_constant") return "Move the constant away from the variable";
  if (id === "divide") return "Divide to isolate the variable";
  if (id === "simplify") return "Simplify";
  return "Apply the next algebra step";
}

function visualizerStyles() {
  return `
<style>
.aos-transform-visual{
  margin-top:14px;
  background:#ffffff;
  border:1px solid #bfdbfe;
  border-radius:16px;
  padding:14px;
  color:#0f172a;
}
.aos-transform-title{
  font-size:12px;
  font-weight:1000;
  color:#1e3a8a;
  text-transform:uppercase;
  letter-spacing:.06em;
  margin-bottom:12px;
}
.aos-transform-row{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:12px;
}
.aos-transform-row.after{
  background:#eff6ff;
  border-color:#bfdbfe;
}
.aos-transform-label{
  font-size:11px;
  font-weight:1000;
  color:#64748b;
  text-transform:uppercase;
  margin-bottom:7px;
}
.aos-transform-equation{
  background:#ffffff;
  border:2px solid #93c5fd;
  border-radius:12px;
  padding:12px;
  font-size:25px;
  font-weight:1000;
  color:#1e3a8a;
  font-family:"Courier New", Consolas, monospace;
  text-align:center;
  overflow-x:auto;
}
.aos-transform-equation.changed{
  border-color:#86efac;
  color:#166534;
  background:#f0fdf4;
}
.aos-transform-arrow{
  text-align:center;
  margin:10px 0;
  color:#2563eb;
  font-weight:1000;
}
.aos-transform-action{
  display:inline-block;
  background:#dbeafe;
  color:#1e40af;
  border-radius:999px;
  padding:6px 12px;
  font-size:12px;
}
.aos-transform-down{
  font-size:22px;
  margin-top:4px;
}
.aos-transform-note{
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

window.AlgebraMathTransformationVisualizer = {
  buildTransformationVisual
};
