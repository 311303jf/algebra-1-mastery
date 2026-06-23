/*
==================================================
 Algebra OS — Universal Distractor Engine
 Version: 3206
==================================================
*/

function detectAnswerFamily(answer) {

  const text = String(answer || "").trim();

   // Vertex form equation: y = a(x - h)^2 + k
  if (/^y\s*=\s*-?\d*(?:\.\d+)?\s*\(\s*x\s*[+-]\s*\d+(?:\.\d+)?\s*\)\s*(\^2|²)\s*[+-]\s*\d+(?:\.\d+)?$/i.test(text)) {
    return "vertex_form_equation";
  }

  // Factored form equation: y = a(x - r1)(x - r2)
  if (/^y\s*=\s*-?\d*(?:\.\d+)?\s*\(\s*x\s*[+-]\s*\d+(?:\.\d+)?\s*\)\s*\(\s*x\s*[+-]\s*\d+(?:\.\d+)?\s*\)$/i.test(text)) {
    return "factored_form_equation";
  }

  // Standard form equation: y = ax^2 + bx + c
  if (/^y\s*=\s*-?\d*(?:\.\d+)?x(\^2|²)(\s*[+-]\s*\d*(?:\.\d+)?x)?(\s*[+-]\s*\d+(?:\.\d+)?)?$/i.test(text)) {
    return "standard_form_equation";
  }

  // Quadratic equation: ax^2 + bx + c = 0
  if (/^-?\d*(?:\.\d+)?x(\^2|²)(\s*[+-]\s*\d*(?:\.\d+)?x)?(\s*[+-]\s*\d+(?:\.\d+)?)?\s*=\s*0$/i.test(text)) {
    return "quadratic_equation";
  } 

   // Difference of squares factored form: (x + n)(x - n)
  if (/^\(\s*[a-z]\s*\+\s*\d+\s*\)\s*\(\s*[a-z]\s*-\s*\d+\s*\)$/i.test(text)) {
    const nums = text.match(/\d+/g)?.map(Number) || [];
    if (nums.length === 2 && nums[0] === nums[1]) {
      return "difference_of_squares_factor";
    }
  }

  // Binomial square factored form: (x + n)² or (x - n)²
  if (/^\(\s*[a-z]\s*[+-]\s*\d+\s*\)\s*(\^2|²)$/i.test(text)) {
    return "binomial_square_factor";
  }
 // Coordinate point
  if (/^\(\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\)$/.test(text)) {
    return "point";
  }

   // Quadratic solutions
  // Example: x = -4, x = 7
  if (
    /^x\s*=\s*-?\d+(\.\d+)?\s*,\s*x\s*=\s*-?\d+(\.\d+)?$/i.test(text)
  ) {
    return "quadratic_solution";
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

   // Vertex / transformation descriptions
  if (
    /units?\s+(left|right)/i.test(text) ||
    /units?\s+(up|down)/i.test(text) ||
    /vertical\s+shift/i.test(text) ||
    /reflected\s+over\s+the\s+x-axis/i.test(text) ||
    /opens\s+(upward|downward)/i.test(text)
  ) {
    return "vertex_transformation";
  }

  // Axis of symmetry
  if (/^[xy]\s*=\s*-?\d+(\.\d+)?$/i.test(text)) {
    return "axis_of_symmetry";
  }

  // Quadratic graph features
  if (
    [
      "Vertex",
      "Axis of symmetry",
      "y-intercept",
      "x-intercept",
      "x-intercepts",
      "y intercept",
      "x intercept"
    ].includes(text)
  ) {
    return "quadratic_feature";
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
        case "vertex_form_equation": {
      return generateVertexFormEquationDistractors(text);
    }
case "quadratic_solution":{
  return generateQuadraticSolutionDistractors(text);
}
    case "difference_of_squares_factor": {
  return generateDifferenceOfSquaresFactorDistractors(text);
}

case "binomial_square_factor": {
  return generateBinomialSquareFactorDistractors(text);
}
   
    
    case "factored_form_equation": {
      return generateFactoredFormEquationDistractors(text);
    }

    case "standard_form_equation": {
      return generateStandardFormEquationDistractors(text);
    }

    case "quadratic_equation": {
      return generateQuadraticEquationDistractors(text);
    }
    case "vertex_transformation": {
  return generateVertexTransformationDistractors(text);
}

case "axis_of_symmetry": {
  return generateAxisOfSymmetryDistractors(text);
}

case "quadratic_feature": {
  return [
    "Vertex",
    "Axis of symmetry",
    "y-intercept",
    "x-intercept"
  ].filter(choice => choice !== text);
}
case "point": {
  const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

  if (nums.length >= 2) {
    const x = nums[0];
    const y = nums[1];

    const normalizedText = text.replace(/\s+/g, "");

     const candidates = [
      `(${formatUniversalNumber(y)}, ${formatUniversalNumber(x)})`,
      `(${formatUniversalNumber(-x)}, ${formatUniversalNumber(y)})`,
      `(${formatUniversalNumber(x)}, ${formatUniversalNumber(-y)})`,
      `(${formatUniversalNumber(-x)}, ${formatUniversalNumber(-y)})`,
      `(${formatUniversalNumber(x + 1)}, ${formatUniversalNumber(y)})`,
      `(${formatUniversalNumber(x - 1)}, ${formatUniversalNumber(y)})`,
      `(${formatUniversalNumber(x)}, ${formatUniversalNumber(y + 1)})`,
      `(${formatUniversalNumber(x)}, ${formatUniversalNumber(y - 1)})`,
      `(${formatUniversalNumber(x + 1)}, ${formatUniversalNumber(y + 1)})`,
      `(${formatUniversalNumber(x - 1)}, ${formatUniversalNumber(y - 1)})`
    ];

    return candidates
      .filter(choice => choice.replace(/\s+/g, "") !== normalizedText)
      .filter((choice, index, array) =>
        array.findIndex(item =>
          item.replace(/\s+/g, "") === choice.replace(/\s+/g, "")
        ) === index
      );
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
function generateVertexFormEquationDistractors(text) {
  const source = String(text || "").trim().replace(/²/g, "^2");

  const match = source.match(
    /^y\s*=\s*(-?\d*)\s*\(\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*\)\s*\^2\s*([+-])\s*(\d+(?:\.\d+)?)$/i
  );

  if (!match) return [];

  let a = match[1];
  if (a === "" || a === "+") a = "1";
  if (a === "-") a = "-1";

  const aValue = Number(a);
  const hSign = match[2];
  const hNumber = Number(match[3]);
  const kSign = match[4];
  const kNumber = Number(match[5]);

  const hValue = hSign === "-" ? hNumber : -hNumber;
  const kValue = kSign === "+" ? kNumber : -kNumber;

  function build(a, h, k) {
    const inside = h >= 0 ? `x - ${Math.abs(h)}` : `x + ${Math.abs(h)}`;
    const outside = k >= 0 ? `+ ${Math.abs(k)}` : `- ${Math.abs(k)}`;
    return `y = ${a}( ${inside} )^2 ${outside}`.replace("( ", "(").replace(" )", ")");
  }

  return [
    build(aValue, -hValue, kValue),
    build(-aValue, hValue, kValue),
    build(aValue, kValue, hValue),
    build(aValue, hValue, -kValue),
    build(-aValue, -hValue, -kValue)
  ].filter(choice =>
    choice.replace(/\s+/g, "") !== source.replace(/\s+/g, "")
  );
}

function generateFactoredFormEquationDistractors(text) {
  const source = String(text || "").trim();

  const match = source.match(
    /^y\s*=\s*(-?\d*)\s*\(\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*\)\s*\(\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*\)$/i
  );

  if (!match) return [];

  let a = match[1];
  if (a === "" || a === "+") a = "1";
  if (a === "-") a = "-1";

  const aValue = Number(a);

  const sign1 = match[2];
  const n1 = Number(match[3]);
  const sign2 = match[4];
  const n2 = Number(match[5]);

  function build(a, s1, v1, s2, v2) {
    const aText =
      a === 1 ? "" :
      a === -1 ? "-" :
      String(a);

    return `y = ${aText}(x ${s1} ${v1})(x ${s2} ${v2})`;
  }

  const opposite1 = sign1 === "+" ? "-" : "+";
  const opposite2 = sign2 === "+" ? "-" : "+";

  return [
    build(-aValue, sign1, n1, sign2, n2),
    build(aValue, opposite1, n1, sign2, n2),
    build(aValue, sign1, n1, opposite2, n2),
    build(aValue, opposite1, n1, opposite2, n2),
    build(aValue + 1, sign1, n1, sign2, n2)
  ].filter(choice =>
    normalizeDistractorChoice(choice) !== normalizeDistractorChoice(source)
  );
}

function generateStandardFormEquationDistractors(text) {
  const source = String(text || "").trim().replace(/²/g, "^2");

  const match = source.match(
    /^y\s*=\s*(-?\d*)x\^2(?:\s*([+-])\s*(\d*)x)?(?:\s*([+-])\s*(\d+))?$/i
  );

  if (!match) return [];

  let a = match[1];
  if (a === "" || a === "+") a = "1";
  if (a === "-") a = "-1";

  const aValue = Number(a);

  const bSign = match[2] || "+";
  const bRaw = match[3];
  const cSign = match[4] || "+";
  const cRaw = match[5];

  const bAbs = bRaw === undefined ? 0 : bRaw === "" ? 1 : Number(bRaw);
  const cAbs = cRaw === undefined ? 0 : Number(cRaw);

  const bValue = bSign === "+" ? bAbs : -bAbs;
  const cValue = cSign === "+" ? cAbs : -cAbs;

  return [
    buildStandardQuadraticEquation(-aValue, bValue, cValue),
    buildStandardQuadraticEquation(aValue, -bValue, cValue),
    buildStandardQuadraticEquation(aValue, bValue, -cValue),
    buildStandardQuadraticEquation(aValue + 1, bValue, cValue),
    buildStandardQuadraticEquation(aValue, bValue + 1, cValue)
  ].filter(choice =>
    normalizeDistractorChoice(choice) !== normalizeDistractorChoice(source)
  );
}

function generateQuadraticEquationDistractors(text) {
  const source = String(text || "").trim().replace(/²/g, "^2");

  const match = source.match(
    /^(-?\d*)x\^2(?:\s*([+-])\s*(\d*)x)?(?:\s*([+-])\s*(\d+))?\s*=\s*0$/i
  );

  if (!match) return [];

  let a = match[1];
  if (a === "" || a === "+") a = "1";
  if (a === "-") a = "-1";

  const aValue = Number(a);

  const bSign = match[2] || "+";
  const bRaw = match[3];
  const cSign = match[4] || "+";
  const cRaw = match[5];

  const bAbs = bRaw === undefined ? 0 : bRaw === "" ? 1 : Number(bRaw);
  const cAbs = cRaw === undefined ? 0 : Number(cRaw);

  const bValue = bSign === "+" ? bAbs : -bAbs;
  const cValue = cSign === "+" ? cAbs : -cAbs;

  return [
    buildStandardQuadraticExpression(-aValue, bValue, cValue) + " = 0",
    buildStandardQuadraticExpression(aValue, -bValue, cValue) + " = 0",
    buildStandardQuadraticExpression(aValue, bValue, -cValue) + " = 0",
    buildStandardQuadraticExpression(aValue + 1, bValue, cValue) + " = 0",
    buildStandardQuadraticExpression(aValue, bValue + 1, cValue) + " = 0"
  ].filter(choice =>
    normalizeDistractorChoice(choice) !== normalizeDistractorChoice(source)
  );
}

function buildStandardQuadraticEquation(a, b, c) {
  return "y = " + buildStandardQuadraticExpression(a, b, c);
}

function buildStandardQuadraticExpression(a, b, c) {
  let result = "";

  if (a === 1) result += "x^2";
  else if (a === -1) result += "-x^2";
  else result += `${a}x^2`;

  if (b !== 0) {
    const sign = b > 0 ? " + " : " - ";
    const coefficient = Math.abs(b) === 1 ? "" : Math.abs(b);
    result += `${sign}${coefficient}x`;
  }

  if (c !== 0) {
    const sign = c > 0 ? " + " : " - ";
    result += `${sign}${Math.abs(c)}`;
  }

  return result;
}

function normalizeDistractorChoice(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/²/g, "^2")
    .replace(/\s+/g, "")
    .trim();
}

function generateQuadraticSolutionDistractors(text) {

  const nums =
    text.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

  if (nums.length !== 2) return [];

  const a = nums[0];
  const b = nums[1];

  return [

    `x = ${a}, x = ${-b}`,

    `x = ${-a}, x = ${b}`,

    `x = ${b}, x = ${a}`,

    `x = ${a - 1}, x = ${b + 1}`,

    `x = ${a + 1}, x = ${b - 1}`

  ];
}
function generateBinomialSquareFactorDistractors(text) {
  const source = String(text || "").trim().replace(/²/g, "^2");

  const match = source.match(
    /^\(\s*([a-z])\s*([+-])\s*(\d+)\s*\)\s*\^2$/i
  );

  if (!match) return [];

  const variable = match[1];
  const sign = match[2];
  const value = Number(match[3]);

  const oppositeSign = sign === "+" ? "-" : "+";

  const candidates = [
    `(${variable} ${oppositeSign} ${value})^2`,
    `(${variable} ${sign} ${value + 1})^2`,
    `(${variable} ${sign} ${Math.max(1, value - 1)})^2`,
    `(${variable} ${sign} ${value})(${variable} ${oppositeSign} ${value})`,
    `(${variable} ${oppositeSign} ${value})(${variable} ${oppositeSign} ${value})`
  ];

  return candidates.filter(choice =>
    normalizeDistractorChoice(choice) !== normalizeDistractorChoice(source)
  );
}
function generateDifferenceOfSquaresFactorDistractors(text) {
  const source = String(text || "").trim();

  const match = source.match(
    /^\(\s*([a-z])\s*\+\s*(\d+)\s*\)\s*\(\s*\1\s*-\s*\2\s*\)$/i
  );

  if (!match) return [];

  const variable = match[1];
  const n = Number(match[2]);

  return [
    `(${variable} + ${n})(${variable} + ${n})`,
    `(${variable} - ${n})(${variable} - ${n})`,
    `(${variable} + ${n + 1})(${variable} - ${n + 1})`,
    `(${variable} + ${Math.max(1, n - 1)})(${variable} - ${Math.max(1, n - 1)})`,
    `(${variable} + ${n + 1})(${variable} - ${n})`
  ].filter(choice =>
    normalizeDistractorChoice(choice) !== normalizeDistractorChoice(source)
  );
}


function generateAxisOfSymmetryDistractors(text) {
  const match = String(text || "").match(/^([xy])\s*=\s*(-?\d+(?:\.\d+)?)$/i);

  if (!match) return [];

  const variable = match[1].toLowerCase();
  const value = Number(match[2]);
  const otherVariable = variable === "x" ? "y" : "x";

  return [
    `${variable} = ${formatUniversalNumber(-value)}`,
    `${otherVariable} = ${formatUniversalNumber(value)}`,
    `${otherVariable} = ${formatUniversalNumber(-value)}`,
    `${variable} = ${formatUniversalNumber(value + 1)}`,
    `${variable} = ${formatUniversalNumber(value - 1)}`
  ].filter(choice => choice.replace(/\s+/g, "") !== text.replace(/\s+/g, ""));
}

function generateVertexTransformationDistractors(text) {
  const source = String(text || "").trim();

  const horizontalMatch = source.match(/(\d+)\s+units?\s+(left|right)/i);
  const verticalMatch = source.match(/(\d+)\s+units?\s+(up|down)/i);

  const hasNoVerticalShift = /no\s+vertical\s+shift/i.test(source);
  const reflected = /reflected\s+over\s+the\s+x-axis/i.test(source);
  const opensUpward = /opens\s+upward/i.test(source);
  const opensDownward = /opens\s+downward/i.test(source);

  const horizontalAmount = horizontalMatch ? Number(horizontalMatch[1]) : 0;
  const horizontalDirection = horizontalMatch ? horizontalMatch[2].toLowerCase() : "right";

  const verticalAmount = verticalMatch ? Number(verticalMatch[1]) : 0;
  const verticalDirection = verticalMatch ? verticalMatch[2].toLowerCase() : "up";

  const oppositeHorizontal = horizontalDirection === "right" ? "left" : "right";
  const oppositeVertical = verticalDirection === "up" ? "down" : "up";

  const openingPhrase =
    reflected || opensDownward
      ? "reflected over the x-axis"
      : "opens upward";

  const oppositeOpeningPhrase =
    reflected || opensDownward
      ? "opens upward"
      : "reflected over the x-axis";

  const verticalPhrase = hasNoVerticalShift
    ? "no vertical shift"
    : `${verticalAmount} units ${verticalDirection}`;

  const oppositeVerticalPhrase = hasNoVerticalShift
    ? "2 units up"
    : `${verticalAmount} units ${oppositeVertical}`;

  const candidates = [
    `${horizontalAmount} units ${oppositeHorizontal}, ${verticalPhrase}, ${openingPhrase}`,
    `${horizontalAmount} units ${horizontalDirection}, ${oppositeVerticalPhrase}, ${openingPhrase}`,
    `${horizontalAmount} units ${horizontalDirection}, ${verticalPhrase}, ${oppositeOpeningPhrase}`,
    `${horizontalAmount} units ${oppositeHorizontal}, ${oppositeVerticalPhrase}, ${oppositeOpeningPhrase}`,
    `${horizontalAmount + 1} units ${horizontalDirection}, ${verticalPhrase}, ${openingPhrase}`,
    `${Math.max(1, horizontalAmount - 1)} units ${horizontalDirection}, ${verticalPhrase}, ${openingPhrase}`
  ];

  return [...new Set(candidates)]
    .filter(choice => choice.toLowerCase() !== source.toLowerCase());
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
  console.log("DISTRACTOR ENGINE CERTIFICATION V3205");
  console.log("================================");

  const testCases = [

    "(0,8)",
    "12",
    "-5",

    "x = 3",
    "x = -4",
    "x = 1/2",
    "No Solution",
    "All Real Numbers",

    "x > 5",
    "x < -3/4",

    "x^2",
    "m^4",

    "3x^2",
    "-2m^4",

    "x + 5",
    "2x - 3",

    "x^2 + 5x + 6",
    "2x^2 - 3x + 1",

    "(x + 3)(x - 2)",
    "(m - 3)(m - 6)"

  ];

  let failures = 0;
  let totalTests = 0;

  function normalize(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^4/g, "⁴")
      .trim();
  }

  function hasDuplicateDistractors(distractors) {
    return new Set(distractors.map(normalize)).size !== distractors.length;
  }

  function containsCorrectAnswer(answer, distractors) {
    const correct = normalize(prettifyMathExpression(answer));
    return distractors.some(choice => normalize(choice) === correct);
  }

  function hasMalformedExpression(distractors) {
    return distractors.some(choice =>
      /\b0[a-z]/i.test(choice) ||
      /\b1[a-z]/i.test(choice) ||
      /\b-1[a-z]/i.test(choice)
    );
  }

  function normalizeFactoredForm(value) {
    const text = String(value || "").replace(/\s+/g, "");

    const match = text.match(
      /^\(([a-z][+-]\d+)\)\(([a-z][+-]\d+)\)$/i
    );

    if (!match) return normalize(value);

    return [match[1], match[2]].sort().join("*");
  }

  function containsEquivalentFactoredAnswer(answer, distractors) {
    const correct = normalizeFactoredForm(answer);

    return distractors.some(choice =>
      normalizeFactoredForm(choice) === correct
    );
  }

  for (const answer of testCases) {

    totalTests++;

    const distractors =
      AlgebraDistractorEngine.generateUniversalDistractors(answer);

    const errors = [];

    if (!Array.isArray(distractors)) {
      errors.push("Not an array");
    }

    if (Array.isArray(distractors) && distractors.length === 0) {
      errors.push("Empty distractor array");
    }

    if (Array.isArray(distractors) && hasDuplicateDistractors(distractors)) {
      errors.push("Duplicate distractors");
    }

    if (Array.isArray(distractors) && containsCorrectAnswer(answer, distractors)) {
      errors.push("Correct answer appears as distractor");
    }

    if (Array.isArray(distractors) && hasMalformedExpression(distractors)) {
      errors.push("Malformed expression: 0x, 1x, or -1x");
    }

    if (
      String(answer).includes("(") &&
      String(answer).includes(")") &&
      Array.isArray(distractors) &&
      containsEquivalentFactoredAnswer(answer, distractors)
    ) {
      errors.push("Equivalent factored form appears as distractor");
    }

    if (errors.length > 0) {

      failures++;

      console.error("FAIL:", answer);
      console.error("Distractors:", distractors);
      console.error("Errors:", errors);

    } else {

      console.log("PASS:", answer, "→", distractors);

    }
  }

  console.log("--------------------------------");
  console.log("TOTAL TESTS:", totalTests);
  console.log("FAILURES:", failures);
  console.log("--------------------------------");

  if (failures === 0) {
    console.log("CERTIFICATION: PASS");
  } else {
    console.error("CERTIFICATION: FAIL");
  }

}

window.runDistractorCertification = runDistractorCertification;
