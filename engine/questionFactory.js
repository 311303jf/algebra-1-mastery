/*
  Algebra OS — Question Factory Engine
  Version: 3.0 Expanded
  Curriculum-driven, no hardcoded lesson config

  Architectural rule:
  - Lessons come from curriculum/algebra1.json
  - This engine only understands problemTypes
  - No lesson-specific hardcoding
*/

const AlgebraQuestionFactory = (() => {

  const usedQuestions = new Set();
  const usedFingerprints = new Set();

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function simplifyFraction(num, den) {
    if (den === 0) return "undefined";
    if (num === 0) return "0";
    const sign = den < 0 ? -1 : 1;
    num *= sign;
    den *= sign;
    const g = gcd(num, den);
    num /= g;
    den /= g;
    if (den === 1) return String(num);
    return `${num}/${den}`;
  }

  function formatSigned(n) {
    if (n < 0) return `- ${Math.abs(n)}`;
    return `+ ${n}`;
  }

  function formatTerm(coef, variable = "x") {
    if (coef === 1) return variable;
    if (coef === -1) return `-${variable}`;
    return `${coef}${variable}`;
  }

  function difficultyRange(difficulty) {
    if (difficulty === "support") return { min: 1, max: 12, allowNegative: false };
    if (difficulty === "challenge") return { min: -20, max: 30, allowNegative: true };
    return { min: -10, max: 20, allowNegative: true };
  }

  function uniqueKey(q) {
    return `${q.prompt}|${q.answer}`;
  }

  function questionFingerprint(q) {
    return q.equation || q.prompt;
  }

  function isTooSimilar(q) {
    return usedFingerprints.has(questionFingerprint(q));
  }

  function rememberQuestion(q) {
    usedQuestions.add(uniqueKey(q));
    usedFingerprints.add(questionFingerprint(q));
  }

  function createChoices(answer) {
    const choices = new Set();
    choices.add(answer);

    if (typeof answer === "number") {
      const candidates = [
        answer + 1,
        answer - 1,
        answer + 2,
        answer - 2,
        -answer,
        answer + 5,
        answer - 5
      ];

      for (const candidate of candidates) {
        if (candidate !== answer && Number.isFinite(candidate)) choices.add(candidate);
        if (choices.size === 4) break;
      }

      while (choices.size < 4) {
        const extra = answer + randInt(-10, 10);
        if (extra !== answer && Number.isFinite(extra)) choices.add(extra);
      }
    } else {
      const distractors = generateStringDistractors(answer);
      for (const d of distractors) {
        if (d !== answer) choices.add(d);
        if (choices.size === 4) break;
      }
    }

    const finalChoices = shuffle(Array.from(choices));

    if (!finalChoices.includes(answer)) throw new Error("Quality Control Failed: correct answer missing.");
    if (new Set(finalChoices).size !== finalChoices.length) throw new Error("Quality Control Failed: duplicate choices.");
    if (finalChoices.length !== 4) throw new Error("Quality Control Failed: must have 4 choices.");

    return finalChoices;
  }

  function generateStringDistractors(answer) {
    const common = [
      "positive association",
      "negative association",
      "no association",
      "linear association",
      "nonlinear association",
      "function",
      "not a function",
      "increasing",
      "decreasing",
      "constant",
      "undefined",
      "no solution",
      "infinitely many solutions",
      "one solution"
    ];

    if (answer.includes && answer.includes("/")) {
      const parts = answer.split("/").map(Number);
      if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
        const [n, d] = parts;
        return [
          simplifyFraction(d, n),
          simplifyFraction(-n, d),
          simplifyFraction(n + 1, d),
          simplifyFraction(n, d + 1),
          String(n / d)
        ];
      }
    }

    return shuffle(common.filter(x => x !== answer));
  }

  function normalizeType(type) {
    return String(type).trim().toLowerCase();
  }

  function oneStepAddition(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const b = randInt(2, 15);
    const c = answer + b;

    return {
      lesson: lessonId,
      type: "one_step_addition",
      dok: 1,
      difficulty,
      prompt: `Solve: x + ${b} = ${c}`,
      equation: `x + ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Subtract ${b} from both sides.`,
      explanation: `Subtract ${b} from both sides. x = ${answer}.`
    };
  }

  function oneStepSubtraction(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const b = randInt(2, 15);
    const c = answer - b;

    return {
      lesson: lessonId,
      type: "one_step_subtraction",
      dok: 1,
      difficulty,
      prompt: `Solve: x - ${b} = ${c}`,
      equation: `x - ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Add ${b} to both sides.`,
      explanation: `Add ${b} to both sides. x = ${answer}.`
    };
  }

  function oneStepMultiplication(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    let answer = randInt(r.min, r.max);
    if (answer === 0) answer = randInt(2, 10);
    const coefficient = choice([2, 3, 4, 5, 6, 7, 8, 9]);
    const product = coefficient * answer;

    return {
      lesson: lessonId,
      type: "one_step_multiplication",
      dok: 1,
      difficulty,
      prompt: `Solve: ${coefficient}x = ${product}`,
      equation: `${coefficient}x = ${product}`,
      answer,
      choices: createChoices(answer),
      hint: `Divide both sides by ${coefficient}.`,
      explanation: `Divide both sides by ${coefficient}. x = ${answer}.`
    };
  }

  function oneStepDivision(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    let answer = randInt(r.min, r.max);
    if (answer === 0) answer = randInt(2, 10);
    const divisor = choice([2, 3, 4, 5, 6, 7, 8, 9]);
    const dividend = answer * divisor;

    return {
      lesson: lessonId,
      type: "one_step_division",
      dok: 1,
      difficulty,
      prompt: `Solve: x ÷ ${divisor} = ${answer}`,
      equation: `x ÷ ${divisor} = ${answer}`,
      answer: dividend,
      choices: createChoices(dividend),
      hint: `Multiply both sides by ${divisor}.`,
      explanation: `Multiply both sides by ${divisor}. x = ${dividend}.`
    };
  }

  function multiStepEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2, 3, 4, 5, 6, 7, 8]);
    const b = randInt(2, 15);
    const c = a * answer + b;

    return {
      lesson: lessonId,
      type: "multi_step_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}x + ${b} = ${c}`,
      equation: `${a}x + ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `First subtract ${b}, then divide by ${a}.`,
      explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}. x = ${answer}.`
    };
  }

  function combineLikeTermsEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2, 3, 4, 5, 6]);
    const b = choice([2, 3, 4, 5, 6]);
    const c = randInt(2, 12);
    const combined = a + b;
    const total = combined * answer + c;

    return {
      lesson: lessonId,
      type: "combine_like_terms_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}x + ${b}x + ${c} = ${total}`,
      equation: `${a}x + ${b}x + ${c} = ${total}`,
      answer,
      choices: createChoices(answer),
      hint: `Combine like terms first: ${a}x + ${b}x = ${combined}x.`,
      explanation: `Combine like terms: ${combined}x + ${c} = ${total}. Then solve. x = ${answer}.`
    };
  }

  function distributivePropertyEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2, 3, 4, 5]);
    const b = randInt(2, 8);
    const c = a * (answer + b);

    return {
      lesson: lessonId,
      type: "distributive_property_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}(x + ${b}) = ${c}`,
      equation: `${a}(x + ${b}) = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Divide both sides by ${a}, then subtract ${b}.`,
      explanation: `Divide by ${a}: x + ${b} = ${c / a}. Subtract ${b}. x = ${answer}.`
    };
  }

  function variablesBothSides(difficulty = "core", lessonId = "") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    let a = choice([3, 4, 5, 6, 7, 8, 9]);
    let b = choice([1, 2, 3, 4, 5]);
    if (a === b) b = 2;
    const c = randInt(1, 12);
    const d = (a - b) * answer + c;

    return {
      lesson: lessonId,
      type: "variables_both_sides",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}x + ${c} = ${b}x + ${d}`,
      equation: `${a}x + ${c} = ${b}x + ${d}`,
      answer,
      choices: createChoices(answer),
      hint: `Move the variable terms to one side and constants to the other side.`,
      explanation: `Subtract ${b}x from both sides: ${a - b}x + ${c} = ${d}. Subtract ${c}: ${a - b}x = ${d - c}. x = ${answer}.`
    };
  }

  function multiStepDistributive(difficulty = "core", lessonId = "") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2, 3, 4, 5]);
    const b = randInt(1, 8);
    const c = choice([2, 3, 4, 5]);
    const d = a * (answer + b) + c;

    return {
      lesson: lessonId,
      type: "multi_step_distributive",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}(x + ${b}) + ${c} = ${d}`,
      equation: `${a}(x + ${b}) + ${c} = ${d}`,
      answer,
      choices: createChoices(answer),
      hint: `Distribute first, then isolate x.`,
      explanation: `Distribute: ${a}x + ${a * b} + ${c} = ${d}. Combine constants: ${a}x + ${a * b + c} = ${d}. x = ${answer}.`
    };
  }

  function inequalities(difficulty = "core", lessonId = "") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2, 3, 4, 5, 6]);
    const b = randInt(1, 10);
    const symbol = choice([">", "<", "≥", "≤"]);
    const c = a * answer + b;
    const solution = `x ${symbol} ${answer}`;

    return {
      lesson: lessonId,
      type: "inequalities",
      dok: 2,
      difficulty,
      prompt: `Solve the inequality: ${a}x + ${b} ${symbol} ${c}`,
      equation: `${a}x + ${b} ${symbol} ${c}`,
      answer: solution,
      choices: createChoices(solution),
      hint: `Solve it like an equation unless you multiply or divide by a negative number.`,
      explanation: `Subtract ${b}: ${a}x ${symbol} ${c - b}. Divide by ${a}. The solution is ${solution}.`
    };
  }

  function inequalitiesNegativeCoefficient(difficulty = "core", lessonId = "") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = -choice([2, 3, 4, 5, 6]);
    const b = randInt(1, 10);
    const originalSymbol = choice([">", "<", "≥", "≤"]);
    const flipped = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" }[originalSymbol];
    const c = a * answer + b;
    const solution = `x ${flipped} ${answer}`;

    return {
      lesson: lessonId,
      type: "inequalities_negative_coefficient",
      dok: 3,
      difficulty,
      prompt: `Solve the inequality: ${a}x + ${b} ${originalSymbol} ${c}`,
      equation: `${a}x + ${b} ${originalSymbol} ${c}`,
      answer: solution,
      choices: createChoices(solution),
      hint: `When you divide by a negative number, reverse the inequality symbol.`,
      explanation: `Subtract ${b}: ${a}x ${originalSymbol} ${c - b}. Divide by ${a} and reverse the symbol. The solution is ${solution}.`
    };
  }

  function functionsEvaluate(difficulty = "core", lessonId = "") {
    const x = randInt(-5, 8);
    const m = choice([-3, -2, -1, 2, 3, 4, 5]);
    const b = randInt(-10, 10);
    const answer = m * x + b;

    return {
      lesson: lessonId,
      type: "functions",
      dok: 1,
      difficulty,
      prompt: `If f(x) = ${m}x ${formatSigned(b)}, find f(${x}).`,
      equation: `f(x) = ${m}x ${formatSigned(b)}`,
      answer,
      choices: createChoices(answer),
      hint: `Substitute ${x} for x.`,
      explanation: `f(${x}) = ${m}(${x}) ${formatSigned(b)} = ${answer}.`
    };
  }

  function functionOrNot(difficulty = "core", lessonId = "") {
    const isFunction = Math.random() > 0.5;
    const pairs = isFunction
      ? [[1, 3], [2, 5], [3, 7], [4, 9]]
      : [[1, 3], [2, 5], [1, 7], [4, 9]];

    const answer = isFunction ? "function" : "not a function";

    return {
      lesson: lessonId,
      type: "function_or_not",
      dok: 2,
      difficulty,
      prompt: `Does this relation represent a function? ${JSON.stringify(pairs)}`,
      equation: JSON.stringify(pairs),
      answer,
      choices: createChoices(answer),
      hint: `Each input can have only one output.`,
      explanation: isFunction
        ? `Each x-value appears only once, so the relation is a function.`
        : `The input 1 has two different outputs, so the relation is not a function.`
    };
  }

  function slope(difficulty = "core", lessonId = "") {
    const x1 = randInt(-6, 3);
    const y1 = randInt(-6, 6);
    const dx = choice([1, 2, 3, 4, 5, 6]);
    const dy = choice([-8, -6, -4, -3, -2, 2, 3, 4, 6, 8]);
    const x2 = x1 + dx;
    const y2 = y1 + dy;
    const answer = simplifyFraction(dy, dx);

    return {
      lesson: lessonId,
      type: "slope",
      dok: 2,
      difficulty,
      prompt: `Find the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
      equation: `m = (${y2} - ${y1}) / (${x2} - ${x1})`,
      answer,
      choices: createChoices(answer),
      hint: `Use slope = change in y ÷ change in x.`,
      explanation: `m = (${y2} - ${y1}) ÷ (${x2} - ${x1}) = ${dy} ÷ ${dx} = ${answer}.`
    };
  }

  function slopeIntercept(difficulty = "core", lessonId = "") {
    const m = choice([-4, -3, -2, -1, 1, 2, 3, 4]);
    const b = randInt(-10, 10);
    const answer = `y = ${formatTerm(m)} ${formatSigned(b)}`;

    return {
      lesson: lessonId,
      type: "slope_intercept",
      dok: 2,
      difficulty,
      prompt: `Write the equation of a line with slope ${m} and y-intercept ${b}.`,
      equation: answer,
      answer,
      choices: createChoices(answer),
      hint: `Use y = mx + b.`,
      explanation: `Substitute m = ${m} and b = ${b} into y = mx + b. The equation is ${answer}.`
    };
  }

  function linearFunctionFromTable(difficulty = "core", lessonId = "") {
    const m = choice([-3, -2, -1, 1, 2, 3, 4]);
    const b = randInt(-8, 8);
    const xs = [0, 1, 2, 3];
    const table = xs.map(x => [x, m * x + b]);
    const answer = `y = ${formatTerm(m)} ${formatSigned(b)}`;

    return {
      lesson: lessonId,
      type: "linear_function_from_table",
      dok: 3,
      difficulty,
      prompt: `Write the linear function represented by this table: ${JSON.stringify(table)}.`,
      equation: JSON.stringify(table),
      answer,
      choices: createChoices(answer),
      hint: `Find the rate of change, then identify the y-intercept.`,
      explanation: `The y-values change by ${m} for each increase of 1 in x. When x = 0, y = ${b}. So ${answer}.`
    };
  }

  function systems(difficulty = "core", lessonId = "") {
    const x = randInt(-5, 8);
    const y = randInt(-5, 8);
    const a = choice([1, 2, 3, 4]);
    const b = choice([1, 2, 3, 4]);
    const c = choice([1, 2, 3, 4]);
    const d = choice([1, 2, 3, 4]);

    if (a * d === b * c) return systems(difficulty, lessonId);

    const e = a * x + b * y;
    const f = c * x + d * y;
    const answer = `(${x}, ${y})`;

    return {
      lesson: lessonId,
      type: "systems",
      dok: 3,
      difficulty,
      prompt: `Solve the system: ${a}x + ${b}y = ${e}; ${c}x + ${d}y = ${f}.`,
      equation: `${a}x + ${b}y = ${e}; ${c}x + ${d}y = ${f}`,
      answer,
      choices: createChoices(answer),
      hint: `Use substitution or elimination to find the ordered pair.`,
      explanation: `The ordered pair (${x}, ${y}) satisfies both equations, so the solution is ${answer}.`
    };
  }

  function systemsByGraphingConcept(difficulty = "core", lessonId = "") {
    const scenario = choice([
      { answer: "one solution", explanation: "Lines with different slopes intersect once." },
      { answer: "no solution", explanation: "Parallel lines have the same slope and different y-intercepts." },
      { answer: "infinitely many solutions", explanation: "The same line has infinitely many points in common." }
    ]);

    return {
      lesson: lessonId,
      type: "systems_by_graphing_concept",
      dok: 2,
      difficulty,
      prompt: `A system of linear equations is represented by two lines. What type of solution does it have if: ${scenario.explanation}`,
      equation: scenario.explanation,
      answer: scenario.answer,
      choices: createChoices(scenario.answer),
      hint: `Think about how many times the two lines intersect.`,
      explanation: scenario.explanation
    };
  }

  function scatterPlots(difficulty = "core", lessonId = "") {
    const type = choice(["positive association", "negative association", "no association"]);
    let data;

    if (type === "positive association") data = [[1, 2], [2, 4], [3, 5], [4, 8], [5, 10]];
    else if (type === "negative association") data = [[1, 10], [2, 8], [3, 6], [4, 5], [5, 2]];
    else data = [[1, 5], [2, 9], [3, 3], [4, 8], [5, 4]];

    return {
      lesson: lessonId,
      type: "scatter_plots",
      dok: 2,
      difficulty,
      prompt: `Describe the association shown by these data points: ${JSON.stringify(data)}.`,
      equation: JSON.stringify(data),
      answer: type,
      choices: createChoices(type),
      hint: `Look at the general direction of the points from left to right.`,
      explanation: `The data show a ${type}.`
    };
  }

  function lineOfFitPrediction(difficulty = "core", lessonId = "") {
    const m = choice([2, 3, 4, 5]);
    const b = randInt(1, 10);
    const x = randInt(6, 12);
    const answer = m * x + b;

    return {
      lesson: lessonId,
      type: "line_of_fit_prediction",
      dok: 3,
      difficulty,
      prompt: `A line of fit for a data set is y = ${m}x + ${b}. Predict y when x = ${x}.`,
      equation: `y = ${m}x + ${b}`,
      answer,
      choices: createChoices(answer),
      hint: `Substitute ${x} for x in the line of fit.`,
      explanation: `y = ${m}(${x}) + ${b} = ${answer}.`
    };
  }

  function exponentRules(difficulty = "core", lessonId = "") {
    const base = choice(["x", "a", "m"]);
    const p = randInt(2, 7);
    const q = randInt(2, 7);
    const answer = `${base}^${p + q}`;

    return {
      lesson: lessonId,
      type: "exponent_rules",
      dok: 1,
      difficulty,
      prompt: `Simplify: ${base}^${p} × ${base}^${q}`,
      equation: `${base}^${p} × ${base}^${q}`,
      answer,
      choices: createChoices(answer),
      hint: `When multiplying powers with the same base, add the exponents.`,
      explanation: `${base}^${p} × ${base}^${q} = ${base}^${p + q}.`
    };
  }

  function polynomialAdd(difficulty = "core", lessonId = "") {
    const a = randInt(1, 6);
    const b = randInt(1, 8);
    const c = randInt(1, 6);
    const d = randInt(1, 8);
    const answer = `${a + c}x + ${b + d}`;

    return {
      lesson: lessonId,
      type: "polynomial_add",
      dok: 2,
      difficulty,
      prompt: `Simplify: (${a}x + ${b}) + (${c}x + ${d})`,
      equation: `(${a}x + ${b}) + (${c}x + ${d})`,
      answer,
      choices: createChoices(answer),
      hint: `Combine like terms.`,
      explanation: `${a}x + ${c}x = ${a + c}x and ${b} + ${d} = ${b + d}. The result is ${answer}.`
    };
  }

  function factoring(difficulty = "core", lessonId = "") {
    const r = choice([1, 2, 3, 4, 5, 6]);
    const s = choice([1, 2, 3, 4, 5, 6]);
    const b = r + s;
    const c = r * s;
    const answer = `(x + ${r})(x + ${s})`;

    return {
      lesson: lessonId,
      type: "factoring",
      dok: 2,
      difficulty,
      prompt: `Factor: x² + ${b}x + ${c}`,
      equation: `x² + ${b}x + ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Find two numbers that multiply to ${c} and add to ${b}.`,
      explanation: `${r} and ${s} multiply to ${c} and add to ${b}, so the factorization is ${answer}.`
    };
  }

  function quadratics(difficulty = "core", lessonId = "") {
    const r = choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const s = choice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const b = -(r + s);
    const c = r * s;
    const answer = `x = ${r} or x = ${s}`;

    return {
      lesson: lessonId,
      type: "quadratics",
      dok: 2,
      difficulty,
      prompt: `Solve: x² ${formatSigned(b)}x ${formatSigned(c)} = 0`,
      equation: `x² ${formatSigned(b)}x ${formatSigned(c)} = 0`,
      answer,
      choices: createChoices(answer),
      hint: `Factor the quadratic and set each factor equal to zero.`,
      explanation: `The solutions are x = ${r} and x = ${s}.`
    };
  }

  function quadraticVertex(difficulty = "core", lessonId = "") {
    const h = randInt(-5, 5);
    const k = randInt(-8, 8);
    const a = choice([1, 2, -1, -2]);
    const answer = `(${h}, ${k})`;

    return {
      lesson: lessonId,
      type: "quadratic_vertex",
      dok: 2,
      difficulty,
      prompt: `Identify the vertex of y = ${a}(x ${formatSigned(-h)})² ${formatSigned(k)}.`,
      equation: `y = ${a}(x ${formatSigned(-h)})² ${formatSigned(k)}`,
      answer,
      choices: createChoices(answer),
      hint: `Vertex form is y = a(x - h)² + k.`,
      explanation: `The vertex is (${h}, ${k}).`
    };
  }

  function realWorldOneStep(difficulty = "core", lessonId = "1.1") {
    const answer = randInt(5, 25);
    const added = randInt(3, 15);
    const total = answer + added;

    return {
      lesson: lessonId,
      type: "real_world_one_step",
      dok: 2,
      difficulty,
      prompt: `A student had some points in a math game. After earning ${added} more points, the student had ${total} points. How many points did the student have at first?`,
      equation: `x + ${added} = ${total}`,
      answer,
      choices: createChoices(answer),
      hint: `Write an equation: x + ${added} = ${total}.`,
      explanation: `Subtract ${added} from both sides. x = ${answer}.`
    };
  }

  function realWorldLinear(difficulty = "core", lessonId = "") {
    const rate = choice([2, 3, 4, 5, 6, 7]);
    const start = randInt(5, 30);
    const x = randInt(3, 12);
    const answer = rate * x + start;

    return {
      lesson: lessonId,
      type: "real_world_linear",
      dok: 3,
      difficulty,
      prompt: `A gym charges a starting fee of $${start} plus $${rate} per class. How much does it cost to take ${x} classes?`,
      equation: `y = ${rate}x + ${start}`,
      answer,
      choices: createChoices(answer),
      hint: `Use y = rate × number of classes + starting fee.`,
      explanation: `y = ${rate}(${x}) + ${start} = ${answer}.`
    };
  }

const registry = {
  one_step_addition: oneStepAddition,
  one_step_addition_equation: oneStepAddition,

  one_step_subtraction: oneStepSubtraction,
  one_step_subtraction_equation: oneStepSubtraction,

  one_step_multiplication: oneStepMultiplication,
  one_step_multiplication_equation: oneStepMultiplication,

  one_step_division: oneStepDivision,
  one_step_division_equation: oneStepDivision,

  real_world_one_step: realWorldOneStep,

    multi_step: multiStepEquation,
    multi_step_equation: multiStepEquation,
    combine_like_terms: combineLikeTermsEquation,
    combine_like_terms_equation: combineLikeTermsEquation,
    distributive_property: distributivePropertyEquation,
    distributive_property_equation: distributivePropertyEquation,
    variables_both_sides: variablesBothSides,
    multi_step_distributive: multiStepDistributive,

    inequalities: inequalities,
    inequalities_negative_coefficient: inequalitiesNegativeCoefficient,

    functions: functionsEvaluate,
    function_evaluate: functionsEvaluate,
    function_or_not: functionOrNot,

    slope: slope,
    slope_intercept: slopeIntercept,
    linear_function_from_table: linearFunctionFromTable,

    systems: systems,
    systems_by_graphing_concept: systemsByGraphingConcept,

    scatter_plots: scatterPlots,
    line_of_fit_prediction: lineOfFitPrediction,

    exponent_rules: exponentRules,
    polynomial_add: polynomialAdd,
    factoring: factoring,

    quadratics: quadratics,
    quadratic_vertex: quadraticVertex,

    real_world_linear: realWorldLinear
  };

  function getGenerator(type) {
    const normalized = normalizeType(type);
    const generator = registry[normalized];

    if (!generator) {
      throw new Error(`Unsupported problem type: ${type}. Add it to AlgebraQuestionFactory registry.`);
    }

    return generator;
  }

  function generateOne(lessonId = "1.1", options = {}) {
    const difficulty = options.difficulty || "core";
    const curriculumProblemTypes = options.problemTypes || [];

    if (!curriculumProblemTypes.length) {
      throw new Error(`No problem types provided for lesson ${lessonId}`);
    }

    let attempts = 0;

    while (attempts < 75) {
      const type = options.type || choice(curriculumProblemTypes);
      const generator = getGenerator(type);
      const question = generator(difficulty, lessonId);
      const key = uniqueKey(question);

      if (!usedQuestions.has(key) && !isTooSimilar(question)) {
        rememberQuestion(question);
        return question;
      }

      attempts++;
    }

    const fallbackType = choice(curriculumProblemTypes);
    const fallbackGenerator = getGenerator(fallbackType);
    const fallback = fallbackGenerator(difficulty, lessonId);
    rememberQuestion(fallback);
    return fallback;
  }

  function generateSet(lessonId = "1.1", count = 5, options = {}) {
    const questions = [];

    for (let i = 0; i < count; i++) {
      questions.push(generateOne(lessonId, options));
    }

    return questions;
  }

  function resetSession() {
    usedQuestions.clear();
    usedFingerprints.clear();
  }

  function supportedProblemTypes() {
    return Object.keys(registry).sort();
  }

  return {
    generateOne,
    generateSet,
    resetSession,
    supportedProblemTypes
  };

})();

window.AlgebraQuestionFactory = AlgebraQuestionFactory;
