/* =========================================================
   PATCH — recoveryLessonEngine.js
   Replace these 3 functions entirely:
     1. mathRendererStyle()
     2. renderAdditionSubtractionTransformation(parsed)
     3. renderMultiplicationDivisionTransformation(parsed)
   ========================================================= */


/* =========================================================
   RENDERER — ADDITION / SUBTRACTION
========================================================= */

function renderAdditionSubtractionTransformation(parsed) {
  const variable    = parsed.variable || "x";
  const constant    = Number(parsed.constant);
  const rightValue  = Number(parsed.rightValue);
  const solution    = parseSolutionValue(parsed.equationAfter);

  const isAddition  = parsed.operation === "Addition";
  const sign        = isAddition ? "+" : "−";
  const invSign     = isAddition ? "−" : "+";
  const invLabel    = isAddition ? `Subtract ${constant} from both sides` : `Add ${constant} to both sides`;

  /* pretty tokens */
  const C  = formatNumber(constant);
  const R  = formatNumber(rightValue);
  const S  = formatNumber(solution);

  return `
${mathRendererStyle()}
<div class="aos-tutor-wrap">
  <p class="aos-tutor-heading">What happened to the equation?</p>

  <!-- Row 1: original equation -->
  <div class="aos-eq-step">
    <span class="aos-step-pill">Step 1</span>
    <span class="aos-step-caption">Original equation</span>
    <div class="aos-eq-line-wrap">
      <span class="aos-eq-var">${variable}</span>
      <span class="aos-eq-op">${sign}</span>
      <span class="aos-eq-num">${C}</span>
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-num">${R}</span>
    </div>
  </div>

  <!-- Row 2: apply inverse to both sides -->
  <div class="aos-eq-step">
    <span class="aos-step-pill">Step 2</span>
    <span class="aos-step-caption">${invLabel}</span>
    <div class="aos-eq-line-wrap">
      <span class="aos-eq-var">${variable}</span>
      <span class="aos-eq-op">${sign}</span>
      <span class="aos-eq-cancel">${C}</span>
      <span class="aos-eq-op aos-inv">${invSign} ${C}</span>
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-num">${R}</span>
      <span class="aos-eq-op aos-inv">${invSign} ${C}</span>
    </div>
    <p class="aos-step-note">The inverse operation cancels the number attached to the variable.</p>
  </div>

  <!-- Row 3: simplified result -->
  <div class="aos-eq-step aos-eq-step--success">
    <span class="aos-step-pill aos-step-pill--green">Step 3</span>
    <span class="aos-step-caption">Simplify — variable is isolated</span>
    <div class="aos-eq-line-wrap">
      <span class="aos-eq-var">${variable}</span>
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-answer">${S}</span>
    </div>
  </div>
</div>`;
}


/* =========================================================
   RENDERER — MULTIPLICATION / DIVISION
========================================================= */

function renderMultiplicationDivisionTransformation(parsed) {
  const variable   = parsed.variable || "x";
  const constant   = Number(parsed.constant);
  const rightValue = Number(parsed.rightValue);
  const solution   = parseSolutionValue(parsed.equationAfter);

  const isMult     = parsed.operation === "Multiplication";
  const invSymbol  = isMult ? "÷" : "×";
  const invLabel   = isMult
    ? `Divide both sides by ${formatNumber(constant)}`
    : `Multiply both sides by ${formatNumber(constant)}`;

  const C = formatNumber(constant);
  const R = formatNumber(rightValue);
  const S = formatNumber(solution);

  /* original left-hand side display */
  const lhsOriginal = isMult
    ? `<span class="aos-eq-coeff">${C}</span><span class="aos-eq-var">${variable}</span>`
    : `<span class="aos-eq-var">${variable}</span><span class="aos-eq-op">÷</span><span class="aos-eq-num">${C}</span>`;

  /* step-2 left-hand side (shows cancellation) */
  const lhsInverse = isMult
    ? `<span class="aos-eq-cancel-wrap"><span class="aos-eq-coeff aos-cancel">${C}</span><span class="aos-eq-var">${variable}</span></span>
       <span class="aos-eq-op aos-inv">${invSymbol} ${C}</span>`
    : `<span class="aos-eq-var">${variable}</span>
       <span class="aos-eq-op">÷</span>
       <span class="aos-eq-cancel">${C}</span>
       <span class="aos-eq-op aos-inv">${invSymbol} ${C}</span>`;

  return `
${mathRendererStyle()}
<div class="aos-tutor-wrap">
  <p class="aos-tutor-heading">What happened to the equation?</p>

  <!-- Row 1 -->
  <div class="aos-eq-step">
    <span class="aos-step-pill">Step 1</span>
    <span class="aos-step-caption">Original equation</span>
    <div class="aos-eq-line-wrap">
      ${lhsOriginal}
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-num">${R}</span>
    </div>
  </div>

  <!-- Row 2 -->
  <div class="aos-eq-step">
    <span class="aos-step-pill">Step 2</span>
    <span class="aos-step-caption">${invLabel}</span>
    <div class="aos-eq-line-wrap">
      ${lhsInverse}
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-num">${R}</span>
      <span class="aos-eq-op aos-inv">${invSymbol} ${C}</span>
    </div>
    <p class="aos-step-note">${isMult
      ? "Division cancels the coefficient — the opposite of multiplication."
      : "Multiplication cancels the divisor — the opposite of division."}</p>
  </div>

  <!-- Row 3 -->
  <div class="aos-eq-step aos-eq-step--success">
    <span class="aos-step-pill aos-step-pill--green">Step 3</span>
    <span class="aos-step-caption">Simplify — variable is isolated</span>
    <div class="aos-eq-line-wrap">
      <span class="aos-eq-var">${variable}</span>
      <span class="aos-eq-eq">=</span>
      <span class="aos-eq-answer">${S}</span>
    </div>
  </div>
</div>`;
}


/* =========================================================
   SHARED STYLE — injected once per render call
   (browser deduplicates identical <style> blocks)
========================================================= */

function mathRendererStyle() {
  return `<style>
/* ── wrapper ─────────────────────────────────────────── */
.aos-tutor-wrap{
  margin-top:12px;
  border:1.5px solid #bfdbfe;
  border-radius:16px;
  padding:18px 20px;
  background:#fff;
  color:#0f172a;
  font-family:inherit;
}
@media(prefers-color-scheme:dark){
  .aos-tutor-wrap{background:#1e293b;color:#f1f5f9;border-color:#334155;}
}

/* ── section heading ──────────────────────────────────── */
.aos-tutor-heading{
  margin:0 0 16px;
  font-size:15px;
  font-weight:700;
  color:#1e3a8a;
  text-align:center;
  letter-spacing:.01em;
}
@media(prefers-color-scheme:dark){.aos-tutor-heading{color:#93c5fd;}}

/* ── step card ────────────────────────────────────────── */
.aos-eq-step{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:14px 16px;
  margin-bottom:10px;
}
.aos-eq-step--success{
  background:#f0fdf4;
  border-color:#bbf7d0;
}
@media(prefers-color-scheme:dark){
  .aos-eq-step{background:#0f172a;border-color:#334155;}
  .aos-eq-step--success{background:#052e16;border-color:#166534;}
}

/* ── pill badge ───────────────────────────────────────── */
.aos-step-pill{
  display:inline-block;
  background:#2563eb;
  color:#fff;
  font-size:11px;
  font-weight:700;
  padding:3px 10px;
  border-radius:999px;
  margin-bottom:6px;
  letter-spacing:.04em;
  text-transform:uppercase;
}
.aos-step-pill--green{background:#059669;}

/* ── caption under pill ───────────────────────────────── */
.aos-step-caption{
  display:block;
  font-size:13px;
  font-weight:600;
  color:#475569;
  margin-bottom:10px;
}
@media(prefers-color-scheme:dark){.aos-step-caption{color:#94a3b8;}}

/* ── equation row ─────────────────────────────────────── */
.aos-eq-line-wrap{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:6px 4px;
  min-height:48px;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:10px 16px;
}
@media(prefers-color-scheme:dark){
  .aos-eq-line-wrap{background:#1e293b;border-color:#334155;}
}

/* ── equation tokens ──────────────────────────────────── */
.aos-eq-var,
.aos-eq-coeff,
.aos-eq-num,
.aos-eq-op,
.aos-eq-eq,
.aos-eq-cancel,
.aos-eq-answer{
  font-size:26px;
  font-weight:800;
  line-height:1;
  font-family:"Courier New",Consolas,monospace;
}

.aos-eq-var   { color:#1d4ed8; }       /* variable — blue   */
.aos-eq-coeff { color:#1d4ed8; }       /* coefficient — blue */
.aos-eq-num   { color:#0f172a; }       /* plain number      */
.aos-eq-op    { color:#64748b; font-size:22px; }
.aos-eq-eq    { color:#374151; }
.aos-eq-answer{ color:#047857; }       /* solution — green  */
@media(prefers-color-scheme:dark){
  .aos-eq-var,.aos-eq-coeff{color:#93c5fd;}
  .aos-eq-num{color:#f1f5f9;}
  .aos-eq-op{color:#94a3b8;}
  .aos-eq-eq{color:#cbd5e1;}
  .aos-eq-answer{color:#34d399;}
}

/* ── inverse operation tokens (red) ──────────────────── */
.aos-inv{
  color:#b91c1c !important;
  font-weight:800;
}
@media(prefers-color-scheme:dark){.aos-inv{color:#fca5a5 !important;}}

/* ── cross-out (cancelled term) ───────────────────────── */
.aos-cancel{
  position:relative;
  display:inline-block;
  color:#94a3b8;
}
.aos-cancel::after{
  content:"";
  position:absolute;
  left:-4%;
  top:50%;
  width:108%;
  height:2.5px;
  background:#374151;
  transform:rotate(-18deg);
  transform-origin:center;
  border-radius:999px;
}
@media(prefers-color-scheme:dark){
  .aos-cancel{color:#64748b;}
  .aos-cancel::after{background:#94a3b8;}
}

/* ── wrapper for coeff + var when cancelling coeff ────── */
.aos-cancel-wrap{display:inline-flex;align-items:center;gap:0;}

/* ── note text ────────────────────────────────────────── */
.aos-step-note{
  margin:10px 0 0;
  font-size:13px;
  font-weight:600;
  color:#64748b;
  line-height:1.5;
}
@media(prefers-color-scheme:dark){.aos-step-note{color:#94a3b8;}}

/* ── multi-step vertical workspace (unchanged) ────────── */
.aos-math-workspace{
  margin-top:12px;
  background:#ffffff;
  border:1px solid #bfdbfe;
  border-radius:14px;
  padding:14px;
  color:#0f172a;
}
@media(prefers-color-scheme:dark){
  .aos-math-workspace{background:#1e293b;color:#f1f5f9;border-color:#334155;}
}
.aos-work-title{
  text-align:center;
  font-weight:800;
  color:#1e3a8a;
  margin-bottom:12px;
}
@media(prefers-color-scheme:dark){.aos-work-title{color:#93c5fd;}}
.aos-vertical-work{
  font-size:15px;
  font-weight:700;
  line-height:1.8;
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:12px 16px;
}
@media(prefers-color-scheme:dark){
  .aos-vertical-work{background:#0f172a;border-color:#334155;}
}
.aos-green{color:#047857;}
@media(prefers-color-scheme:dark){.aos-green{color:#34d399;}}

/* ── step tutor (other lesson types — unchanged) ──────── */
.aos-step-tutor{
  background:#ffffff;
  border:1px solid #bfdbfe;
  border-radius:18px;
  padding:18px;
  margin-top:14px;
}
@media(prefers-color-scheme:dark){
  .aos-step-tutor{background:#1e293b;border-color:#334155;}
}
.aos-step-title{
  font-size:17px;
  font-weight:800;
  color:#1e3a8a;
  text-align:center;
  margin-bottom:16px;
}
@media(prefers-color-scheme:dark){.aos-step-title{color:#93c5fd;}}
.aos-step-card{
  background:#f8fafc;
  border:1px solid #dbeafe;
  border-radius:16px;
  padding:16px;
  margin-bottom:14px;
}
.aos-step-card.success{background:#f0fdf4;border-color:#bbf7d0;}
@media(prefers-color-scheme:dark){
  .aos-step-card{background:#0f172a;border-color:#334155;}
  .aos-step-card.success{background:#052e16;border-color:#166534;}
}
.aos-step-badge{
  display:inline-block;
  background:#2563eb;
  color:white;
  font-size:12px;
  font-weight:800;
  padding:6px 10px;
  border-radius:999px;
  margin-bottom:8px;
}
.aos-step-label{
  font-size:14px;
  font-weight:800;
  color:#334155;
  margin-bottom:10px;
}
@media(prefers-color-scheme:dark){.aos-step-label{color:#cbd5e1;}}
.aos-step-equation{
  background:white;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:14px;
  font-size:24px;
  font-weight:800;
  color:#0f172a;
  text-align:center;
  letter-spacing:.03em;
  overflow-x:auto;
}
@media(prefers-color-scheme:dark){
  .aos-step-equation{background:#1e293b;color:#f1f5f9;border-color:#334155;}
}
</style>`;
}
