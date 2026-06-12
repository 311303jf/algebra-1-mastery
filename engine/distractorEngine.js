/*
==================================================
 Algebra OS — Universal Distractor Engine
 Version: 3200
==================================================
*/

function detectAnswerFamily(answer) {

  const text = String(answer || "").trim();

  // Coordinate point
  if (/^\(\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\)$/.test(text)) {
    return "point";
  }

  // Equation solution
  if (/^[a-z]\s*=/.test(text)) {
    return "equation_solution";
  }

  // Inequality
  if (/[<>≤≥]/.test(text)) {
    return "inequality";
  }

  // Classification
  if (
    [
      "Exponential growth",
      "Exponential decay",
      "Linear function",
      "Quadratic function",
      "Exponential function"
    ].includes(text)
  ) {
    return "classification";
  }

  // Numeric
  if (!isNaN(Number(text))) {
    return "number";
  }

  // Expression
  return "expression";
}


function generateUniversalDistractors(answer) {
  const family = detectAnswerFamily(answer);
  const text = String(answer || "").trim();

  switch (family) {
    case "point": {
      const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

      if (nums.length >= 2) {
        const x = nums[0];
        const y = nums[1];

        return [
          `(${formatUniversalNumber(x + 1)}, ${formatUniversalNumber(y)})`,
          `(${formatUniversalNumber(x)}, ${formatUniversalNumber(y + 1)})`,
          `(${formatUniversalNumber(x)}, ${formatUniversalNumber(y - 1)})`,
          `(${formatUniversalNumber(y)}, ${formatUniversalNumber(x)})`,
          `(${formatUniversalNumber(-x)}, ${formatUniversalNumber(y)})`,
          `(${formatUniversalNumber(x)}, ${formatUniversalNumber(-y)})`
        ];
      }

      return [];
    }

    case "number": {
      const value = Number(text);

      return [
        formatUniversalNumber(value + 1),
        formatUniversalNumber(value - 1),
        formatUniversalNumber(-value),
        formatUniversalNumber(value * 2),
        formatUniversalNumber(value / 2)
      ];
    }

    case "classification": {
      return [
        "Exponential growth",
        "Exponential decay",
        "Exponential function",
        "Linear function",
        "Quadratic function",
        "Not a function"
      ].filter(choice => choice !== text);
    }

    default:
      return [];
  }
}

function formatUniversalNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
}

window.AlgebraDistractorEngine = {

  detectAnswerFamily,
  generateUniversalDistractors

};
