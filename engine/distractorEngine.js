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
const value = parseUniversalNumber(rawValue);

return [...new Set([

  `${variable} = ${formatUniversalFraction(value - 1)}`,

  `${variable} = ${formatUniversalFraction(value + 1)}`,

  `${variable} = ${formatUniversalFraction(-value)}`,

  "No Solution",

  "All Real Numbers"

])].filter(choice => choice !== text);
}


case "inequality": {

  const match = text.match(
  /^([a-z])\s*(>|<|≥|≤)\s*(-?\d+(?:\.\d+)?|-?\d+\/\d+)$/i
);

  if (!match) return [];

  const variable = match[1];
  const symbol = match[2];
  const value = parseUniversalNumber(match[3]);

  const opposite = {
    ">": "<",
    "<": ">",
    "≥": "≤",
    "≤": "≥"
  };

  return [

  `${variable} ${opposite[symbol]} ${formatUniversalFraction(value)}`,

   `${variable} ${symbol} ${formatUniversalFraction(-value)}`,

symbol === ">"
      ? `${variable} ≥ ${formatUniversalFraction(value)}`
      : symbol === "<"
      ? `${variable} ≤ ${formatUniversalFraction(value)}`
      : symbol === "≥"
      ? `${variable} > ${formatUniversalFraction(value)}`
      : `${variable} < ${formatUniversalFraction(value)}`,

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

    case "expression": {

  // Pure exponent expression: x^2, m^4, a^7
  if (/^[a-z]\^\d+$/i.test(text)) {

    const variable = text[0];

    const exponent = Number(
      text.match(/\d+/)[0]
    );

    return [...new Set([

      `${variable}^${exponent + 1}`,

      exponent - 1 === 1
  ? variable
  : `${variable}^${Math.max(1, exponent - 1)}`,

      `${variable}^${exponent * 2}`,

      variable,

      "1"

    ])].filter(choice => choice !== text);
  }
// Monomial expressions: 3x^2, -2m^4, 5a^3
if (/^-?\d+[a-z]\^\d+$/i.test(text)) {

  const match = text.match(/^(-?\d+)([a-z])\^(\d+)$/i);

  const coefficient = Number(match[1]);
  const variable = match[2];
  const exponent = Number(match[3]);

  return [...new Set([

    `${coefficient * 2}${variable}^${exponent}`,

    `${coefficient}${variable}`,

    `${coefficient}${variable}^${exponent * 2}`,

    `${coefficient - 1}${variable}^${exponent}`,

   `${coefficient + 1}${variable}^${exponent}`

  ])].filter(choice => choice !== text);
}
  return [];
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

function prettifyExponent(text) {

  const superscripts = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻"
};

  return String(text).replace(/\^(-?\d+)/g, function(match, exponent) {
    return String(exponent)
      .split("")
      .map(function(char) {
        return superscripts[char] || char;
      })
      .join("");
  });
}

window.AlgebraDistractorEngine = {

  detectAnswerFamily,
  generateUniversalDistractors

};

// Temporary debugging
window.prettifyExponent = prettifyExponent;
