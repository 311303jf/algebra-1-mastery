import {
  parseRecoveryQuestion
} from "./recoveryParserEngine.js?v=2300";
/*
  Algebra OS — Recovery Template Engine
  Version: 2200

  Purpose:
  - Generate reusable Recovery Tutor templates from registry definitions.
  - Reduce lesson-specific hardcoding.
  - Provide automatic generic tutors for skills not yet supported by custom parsers.
*/

export function buildTemplateRecoveryLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null) {
  const tutorType = skillDefinition.tutor || "generic_skill";
  const parsed = parseRecoveryQuestion(problemType, currentQuestion, skillDefinition);

if (skillDefinition.family === "linear_inequality") {
  return buildLinearInequalityTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (skillDefinition.family === "compound_inequality") {
  return buildCompoundInequalityTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (skillDefinition.family === "absolute_value") {
  return buildAbsoluteValueTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

if (tutorType === "generic_skill") {
  return buildGenericTemplateLesson(
    problemType,
    skillDefinition,
    metadata,
    currentQuestion,
    parsed
  );
}

return null;

function buildGenericTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);
  const strategyName = formatStrategyName(skillDefinition.strategy || "identify_skill");

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
  problemType,
  family: skillDefinition.family || "generic",
  strategy: skillDefinition.strategy || "identify_skill",
  tutorType: "generic_skill_template",
  parsed
},
    conceptSummary: [
      `This skill belongs to the ${formatSkillName(skillDefinition.family || "general math")} family.`,
      `The main strategy is: ${strategyName}.`,
      "Read the problem carefully, identify what is being asked, and choose the method that matches the skill."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is trying to solve before identifying the skill and the first correct strategy.",
    tutorDialogue: [
      {
        id: "identify_skill",
        tutor: `<div><strong>Skill:</strong> ${escapeHtml(skillName)}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "The skill and strategy",
          "A random answer",
          "The longest answer choice",
          "A number to guess"
        ],
        expected: ["The skill and strategy"],
        explanation: `Correct. First identify the skill and the strategy: <strong>${escapeHtml(strategyName)}</strong>.`,
        theory: "Before solving, match the problem to the correct skill. This prevents using the wrong procedure."
      },
      {
        id: "choose_strategy",
        tutor: `<div><strong>Strategy:</strong> ${escapeHtml(strategyName)}</div><div style="margin-top:8px;">What should you do next?</div>`,
        choices: [
          "Apply the matching strategy carefully",
          "Skip the steps",
          "Change the problem",
          "Ignore the given information"
        ],
        expected: ["Apply the matching strategy carefully"],
        explanation: "Correct. Use the matching strategy and check each step.",
        theory: "Every skill has a strategy. Good algebra starts by choosing the right strategy before calculating."
      }
    ],
    workedExample: [
      `Skill: ${skillName}.`,
      `Strategy: ${strategyName}.`,
      "Step 1: Identify what the question is asking.",
      "Step 2: Choose the matching strategy.",
      "Step 3: Solve carefully and check the answer."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: `What should you identify first when practicing ${skillName}?`,
        answer: "The skill and strategy"
      },
      {
        prompt: `What should you apply after identifying the skill?`,
        answer: "The matching strategy"
      }
    ],
    source: "recoveryTemplateEngine_v2200"
  };
}

function formatSkillName(value) {
  return String(value || "skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function formatStrategyName(value) {
  return String(value || "identify_skill")
    .replace(/_/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.AlgebraRecoveryTemplateEngine = {
  buildTemplateRecoveryLesson
};
