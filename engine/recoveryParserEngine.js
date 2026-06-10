/*
  Algebra OS — Recovery Parser Engine
  Version: 2300

  Purpose:
  - Parse current questions into reusable recovery structures.
  - Support automatic template tutors.
  - Avoid lesson-specific hardcoding.
*/

export function parseRecoveryQuestion(problemType, currentQuestion = null, skillDefinition = {}) {
  const text = getQuestionText(currentQuestion);
  const equation = extractEquation(text);

  return {
    problemType,
    family: skillDefinition.family || "generic",
    strategy: skillDefinition.strategy || "identify_skill",
    originalText: text,
    equation,
    detected: detectStructure(problemType, equation, skillDefinition),
    parsedAt: new Date().toISOString()
  };
}

function detectStructure(problemType, equation, skillDefinition = {}) {
  const family = skillDefinition.family || "generic";
  const strategy = skillDefinition.strategy || "identify_skill";
  const compact = normalizeEquation(equation);

  if (!compact) {
    return {
      type: "unknown",
      confidence: 0,
      reason: "No equation detected."
    };
  }

  if (family === "absolute_value" && compact.includes("|")) {
    return {
      type: "absolute_value_equation",
      confidence: 0.9,
      strategy
    };
  }

  if (family === "compound_inequality") {
    return {
      type: "compound_inequality",
      confidence: 0.85,
      strategy
    };
  }

  if (family === "linear_inequality" && /[<>≤≥]/.test(compact)) {
    return {
      type: "linear_inequality",
      confidence: 0.85,
      strategy
    };
  }

  if (family === "linear_equation" && compact.includes("=")) {
    return {
      type: "linear_equation",
      confidence: 0.8,
      strategy
    };
  }

  return {
    type: "generic",
    confidence: 0.5,
    strategy
  };
}

function getQuestionText(currentQuestion) {
  if (typeof currentQuestion === "string") return currentQuestion;

  return (
    currentQuestion?.prompt ||
    currentQuestion?.question ||
    currentQuestion?.text ||
    ""
  );
}

function extractEquation(text) {
  const source = String(text || "")
    .replace(/Solve\s+for\s+x\.?/i, "")
    .replace(/Solve:/i, "")
    .replace(/Solve the inequality:/i, "")
    .replace(/Solve the compound inequality:/i, "")
    .trim();

  const patterns = [
    /-?\d*\s*\|[^|]+\|\s*=\s*-?\d+/i,
    /\|[^|]+\|\s*=\s*-?\d+/i,
    /-?\d+\s*[<≤]\s*[^<≤>≥]+\s*[<≤]\s*-?\d+/i,
    /[^<≤>≥]+\s*(?:<|>|≤|≥)\s*[^<≤>≥]+/i,
    /[^=]+=[^=]+/i
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[0].trim();
  }

  return "";
}

function normalizeEquation(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/−/g, "-")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
}

window.AlgebraRecoveryParserEngine = {
  parseRecoveryQuestion
};
