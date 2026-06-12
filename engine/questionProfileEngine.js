/*
==================================================
 Algebra OS — Question Profile Engine
 Version: 3100
==================================================
*/

function getQuestionProfileForLesson(lesson = {}) {
  const dok = Array.isArray(lesson.dokLevels) ? lesson.dokLevels : [];
  const objective = String(lesson.objective || "").toLowerCase();

  if (objective.includes("interpret") || dok.includes(4)) {
    return {
      procedural: 30,
      conceptual: 20,
      application: 20,
      interpretation: 30
    };
  }

  if (objective.includes("model") || objective.includes("real-world")) {
    return {
      procedural: 35,
      conceptual: 15,
      application: 35,
      interpretation: 15
    };
  }

  if (dok.includes(3)) {
    return {
      procedural: 45,
      conceptual: 20,
      application: 25,
      interpretation: 10
    };
  }

  return {
    procedural: 60,
    conceptual: 20,
    application: 10,
    interpretation: 10
  };
}

function chooseQuestionMode(profile = {}) {
  const entries = Object.entries(profile);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  let roll = Math.random() * total;

  for (const [mode, weight] of entries) {
    roll -= Number(weight || 0);
    if (roll <= 0) return mode;
  }

  return "procedural";
}

window.AlgebraQuestionProfileEngine = {
  getQuestionProfileForLesson,
  chooseQuestionMode
};
