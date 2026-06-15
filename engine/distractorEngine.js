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

    ])]
.map(prettifyMathExpression)
.filter(choice => choice !== prettifyMathExpression(text));
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

])]
.map(prettifyMathExpression)
.filter(choice => choice !== prettifyMathExpression(text));
}
     // Binomial linear expressions: x + 5, 2x - 3, 3a + 7
if (/^-?\d*[a-z]\s*[+-]\s*-?\d+$/i.test(text)) {

  const match = text.match(/^(-?\d*)([a-z])\s*([+-])\s*(-?\d+)$/i);

  if (!match) return [];

  const rawCoefficient = match[1];
  const variable = match[2];
  const sign = match[3];
  const constant = Number(match[4]);

  const coefficient =
    rawCoefficient === "" ? 1 :
    rawCoefficient === "-" ? -1 :
    Number(rawCoefficient);

  const signedConstant = sign === "+" ? constant : -constant;

  function buildBinomial(c, k) {
if (c === 0) {
  return String(k);
}

const cText =
  c === 1 ? variable :
  c === -1 ? `-${variable}` :
  `${c}${variable}`;

    const signText = k >= 0 ? " + " : " - ";
    return `${cText}${signText}${Math.abs(k)}`;
  }

  return [...new Set([

    buildBinomial(coefficient, -signedConstant),

    buildBinomial(coefficient + 1, signedConstant),

    buildBinomial(coefficient - 1, signedConstant),

    buildBinomial(coefficient, signedConstant + 1),

    buildBinomial(coefficient, signedConstant - 1)

  ])]
  .map(prettifyMathExpression)
  .filter(choice => choice !== prettifyMathExpression(text));
}

     // Simple quadratic trinomials: x^2 + 5x + 6
if (/^[a-z]\^2\s*[+-]\s*\d+[a-z]\s*[+-]\s*\d+$/i.test(text)) {

  const match = text.match(
    /^([a-z])\^2\s*([+-])\s*(\d+)([a-z])\s*([+-])\s*(\d+)$/i
  );

  if (!match) return [];

  const variable = match[1];
  const signB = match[2];
  const b = Number(match[3]);
  const signC = match[5];
  const c = Number(match[6]);

  const signedB = signB === "+" ? b : -b;
  const signedC = signC === "+" ? c : -c;

  function buildTrinomial(aExp, bValue, cValue) {
    const firstTerm = `${variable}^${aExp}`;
    const middleSign = bValue >= 0 ? " + " : " - ";
    const constantSign = cValue >= 0 ? " + " : " - ";

    return `${firstTerm}${middleSign}${Math.abs(bValue)}${variable}${constantSign}${Math.abs(cValue)}`;
  }

  return [...new Set([

    buildTrinomial(2, signedB, -signedC),

    buildTrinomial(2, signedB + 1, signedC),

    buildTrinomial(2, signedB - 1, signedC),

    buildTrinomial(2, signedB, signedC + 1),

    buildTrinomial(4, signedB, signedC)

  ])]
  .map(prettifyMathExpression)
  .filter(choice => choice !== prettifyMathExpression(text));
}

// General quadratic trinomials: 2x^2 - 3x + 1
if (/^-?\d+[a-z]\^2\s*[+-]\s*\d+[a-z]\s*[+-]\s*\d+$/i.test(text)) {

  const match = text.match(
    /^(-?\d+)([a-z])\^2\s*([+-])\s*(\d+)([a-z])\s*([+-])\s*(\d+)$/i
  );

  if (!match) return [];

  const a = Number(match[1]);
  const variable = match[2];
  const signB = match[3];
  const b = Number(match[4]);
  const signC = match[6];
  const c = Number(match[7]);

  const signedB = signB === "+" ? b : -b;
  const signedC = signC === "+" ? c : -c;

  function buildGeneralTrinomial(aValue, bValue, cValue, exponent = 2) {
    const firstTerm =
      aValue === 1 ? `${variable}^${exponent}` :
      aValue === -1 ? `-${variable}^${exponent}` :
      `${aValue}${variable}^${exponent}`;

    const middleSign = bValue >= 0 ? " + " : " - ";
    const constantSign = cValue >= 0 ? " + " : " - ";

    return `${firstTerm}${middleSign}${Math.abs(bValue)}${variable}${constantSign}${Math.abs(cValue)}`;
  }

  return [...new Set([

    buildGeneralTrinomial(a, signedB, -signedC),

    buildGeneralTrinomial(a + 1, signedB, signedC),

    buildGeneralTrinomial(a - 1, signedB, signedC),

    buildGeneralTrinomial(a, signedB + 1, signedC),

    buildGeneralTrinomial(a, signedB, signedC, 4)

  ])]
  .map(prettifyMathExpression)
  .filter(choice => choice !== prettifyMathExpression(text));
}

// Factored binomials: (x + 3)(x - 2)
if (/^\([a-z]\s*[+-]\s*\d+\)\([a-z]\s*[+-]\s*\d+\)$/i.test(text)) {

  const match = text.match(
    /^\(([a-z])\s*([+-])\s*(\d+)\)\(([a-z])\s*([+-])\s*(\d+)\)$/i
  );

  if (!match) return [];

  const variable1 = match[1];
  const sign1 = match[2];
  const n1 = Number(match[3]);

  const variable2 = match[4];
  const sign2 = match[5];
  const n2 = Number(match[6]);

  if (variable1 !== variable2) return [];

  function buildFactor(signA, valueA, signB, valueB) {
    return `(${variable1} ${signA} ${valueA})(${variable1} ${signB} ${valueB})`;
  }

  const oppositeSign1 = sign1 === "+" ? "-" : "+";
  const oppositeSign2 = sign2 === "+" ? "-" : "+";

  const signedA = sign1 === "+" ? n1 : -n1;
  const signedB = sign2 === "+" ? n2 : -n2;

  const expandedB = signedA + signedB;
  const expandedC = signedA * signedB;

  function buildExpanded(b, c) {
    const middleSign = b >= 0 ? " + " : " - ";
    const constantSign = c >= 0 ? " + " : " - ";
    return `${variable1}^2${middleSign}${Math.abs(b)}${variable1}${constantSign}${Math.abs(c)}`;
  }

  return [...new Set([

    buildFactor(oppositeSign1, n1, sign2, n2),

    buildFactor(sign1, n1, oppositeSign2, n2),

    buildFactor(oppositeSign1, n1, oppositeSign2, n2),

    buildFactor(sign2, n2, sign1, n1),

    buildExpanded(expandedB, expandedC)

  ])]
  .map(prettifyMathExpression)
  .filter(choice => choice !== prettifyMathExpression(text));
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

function prettifyMonomial(text) {

  return String(text)
    .replace(/\b1([a-z])/gi, "$1")
    .replace(/\b-1([a-z])/gi, "-$1");

}

function prettifyMathExpression(text) {

  return prettifyExponent(
    prettifyMonomial(text)
  );

}

window.AlgebraDistractorEngine = {

  detectAnswerFamily,
  generateUniversalDistractors,
  prettifyExponent,
  prettifyMonomial

};

// Temporary debugging
window.prettifyExponent = prettifyExponent;
window.prettifyMonomial = prettifyMonomial;
window.prettifyMathExpression = prettifyMathExpression;

function runDistractorCertification() {

  console.clear();

  console.log("================================");
  console.log("DISTRACTOR ENGINE CERTIFICATION");
  console.log("================================");

  const testCases = [

    // POINT
    "(0,8)",

    // NUMBER
    "12",
    "-5",

    // EQUATION SOLUTION
    "x = 3",
    "x = -4",
    "x = 1/2",
    "No Solution",
    "All Real Numbers",

    // INEQUALITY
    "x > 5",
    "x < -3/4",

    // EXPONENTS
    "x^2",
    "m^4",

    // MONOMIALS
    "3x^2",
    "-2m^4",

    // BINOMIALS
    "x + 5",
    "2x - 3",

    // TRINOMIALS
    "x^2 + 5x + 6",
    "2x^2 - 3x + 1",

    // FACTORED FORMS
    "(x + 3)(x - 2)",
    "(m - 3)(m - 6)"

  ];

  let failures = 0;

  for (const answer of testCases) {

    const distractors =
      AlgebraDistractorEngine.generateUniversalDistractors(answer);

    console.log(answer, "→", distractors);

  }

  console.log("--------------------------------");
  console.log("INITIAL CERTIFICATION COMPLETE");
  console.log("--------------------------------");

}

window.runDistractorCertification = runDistractorCertification;
