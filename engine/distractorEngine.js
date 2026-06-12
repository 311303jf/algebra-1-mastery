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

    case "point":
      return [];

    case "equation_solution":
      return [];

    case "inequality":
      return [];

    case "classification":
      return [];

    case "number":
      return [];

    default:
      return [];

  }

}


window.AlgebraDistractorEngine = {

  detectAnswerFamily,
  generateUniversalDistractors

};
