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
  if (
  /^[a-z]\s*=/i.test(text) ||
  text === "No Solution" ||
  text === "All Real Numbers"
) {
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

   case "equation_solution": {

  // Special cases
  if (text === "No Solution") {
    return [
      "All Real Numbers",
      "x = 0",
      "x = 1",
      "x = -1"
    ];
  }

  if (text === "All Real Numbers") {
    return [
      "No Solution",
      "x = 0",
      "x = 1",
      "x = -1"
    ];
  }

  const match = text.match(/^([a-z])\s*=\s*(-?\d+(?:\.\d+)?|-?\d+\/\d+)$/i);

  if (!match) return [];

  const variable = match[1];
  const rawValue = match[2];

const value = rawValue.includes("/")
  ? rawValue.split("/").map(Number).reduce((a, b) => a / b)
  : Number(rawValue);

  return [

    `${variable} = ${formatUniversalNumber(value - 1)}`,

    `${variable} = ${formatUniversalNumber(value + 1)}`,

    `${variable} = ${formatUniversalNumber(-value)}`,

    "No Solution",

    "All Real Numbers"

  ].filter(choice => choice !== text);
}


case "inequality": {

  const match = text.match(/^([a-z])\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?)$/i);

  if (!match) return [];

  const variable = match[1];
  const symbol = match[2];
  const value = Number(match[3]);

  const opposite = {
    ">": "<",
    "<": ">",
    "≥": "≤",
    "≤": "≥"
  };

  return [

    `${variable} ${opposite[symbol]} ${formatUniversalNumber(value)}`,

    `${variable} ${symbol} ${formatUniversalNumber(-value)}`,

    symbol === ">"
      ? `${variable} ≥ ${formatUniversalNumber(value)}`
      : symbol === "<"
      ? `${variable} ≤ ${formatUniversalNumber(value)}`
      : symbol === "≥"
      ? `${variable} > ${formatUniversalNumber(value)}`
      : `${variable} < ${formatUniversalNumber(value)}`,

    "All Real Numbers"

  ].filter(choice => choice !== text);
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
function parseUniversalNumber(text) {

  text = String(text).trim();

  if (text.includes("/")) {

    const [num, den] = text.split("/").map(Number);

    return den === 0 ? NaN : num / den;
  }

  return Number(text);
}


function formatUniversalFraction(value) {

  if (Number.isInteger(value)) {
    return String(value);
  }

  const tolerance = 1e-10;

  for (let denominator = 2; denominator <= 20; denominator++) {

    const numerator = Math.round(value * denominator);

    if (Math.abs(value - numerator / denominator) < tolerance) {

      const divisor = gcd(
        Math.abs(numerator),
        Math.abs(denominator)
      );

      return `${numerator / divisor}/${denominator / divisor}`;
    }
  }

  return formatUniversalNumber(value);
}


function gcd(a, b) {

  while (b !== 0) {

    [a, b] = [b, a % b];

  }

  return a || 1;
}

window.AlgebraDistractorEngine = {

  detectAnswerFamily,
  generateUniversalDistractors

};
