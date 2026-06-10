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
}

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
function buildLinearInequalityTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "linear_inequality",
      strategy: skillDefinition.strategy || "inverse_operation_with_symbol_rule",
      tutorType: "linear_inequality_template",
      parsed
    },
    conceptSummary: [
      "Solve inequalities like equations using inverse operations.",
      "Keep the inequality balanced by doing the same operation to both sides.",
      "If you multiply or divide by a negative number, reverse the inequality symbol."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is forgetting to reverse the inequality symbol when multiplying or dividing by a negative number.",
    tutorDialogue: [
      {
        id: "identify_symbol_rule",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "linear inequality")}</div><div style="margin-top:8px;">What special rule must we remember for inequalities?</div>`,
        choices: [
          "Reverse the symbol when multiplying or dividing by a negative",
          "Always reverse the symbol",
          "Never reverse the symbol",
          "Change the variable"
        ],
        expected: ["Reverse the symbol when multiplying or dividing by a negative"],
        explanation: "Correct. The inequality symbol reverses only when multiplying or dividing by a negative number.",
        theory: "Inequalities follow equation steps, but negative multiplication or division changes the direction of the inequality."
      },
      {
        id: "solve_carefully",
        tutor: `<div><strong>Strategy:</strong> Use inverse operations and check the symbol.</div><div style="margin-top:8px;">What should you do after isolating the variable?</div>`,
        choices: [
          "Check whether the inequality symbol should reverse",
          "Ignore the symbol",
          "Make the answer an equation",
          "Guess the direction"
        ],
        expected: ["Check whether the inequality symbol should reverse"],
        explanation: "Correct. Always check whether the final operation required reversing the inequality symbol.",
        theory: "The most common inequality error is a correct number with the wrong inequality direction."
      }
    ],
    workedExample: [
      "Identify the operation attached to the variable.",
      "Use inverse operations to isolate the variable.",
      "If multiplying or dividing by a negative number, reverse the inequality symbol.",
      "Check the solution direction."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "When do you reverse an inequality symbol?",
        answer: "When multiplying or dividing by a negative"
      },
      {
        prompt: "Should you reverse the symbol when adding or subtracting?",
        answer: "No"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
  };
}

function buildCompoundInequalityTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "compound_inequality",
      strategy: skillDefinition.strategy || "solve_each_part",
      tutorType: "compound_inequality_template",
      parsed
    },
    conceptSummary: [
      "A compound inequality combines two inequalities.",
      "AND means the solution must satisfy both parts.",
      "OR means the solution can satisfy either part.",
      "Solve each part carefully and interpret the solution set."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is confusing AND with OR, or solving only one side of the compound inequality.",
    tutorDialogue: [
      {
        id: "identify_and_or",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "compound inequality")}</div><div style="margin-top:8px;">What should you identify first?</div>`,
        choices: [
          "Whether it is AND or OR",
          "Only the largest number",
          "Only the first inequality",
          "The answer without solving"
        ],
        expected: ["Whether it is AND or OR"],
        explanation: "Correct. First decide whether the compound inequality uses AND or OR.",
        theory: "AND and OR create different solution sets. AND usually means overlap; OR usually means either region."
      },
      {
        id: "solve_each_part",
        tutor: `<div><strong>Strategy:</strong> Solve each part carefully.</div><div style="margin-top:8px;">What should you do after solving both parts?</div>`,
        choices: [
          "Interpret the solution set",
          "Ignore one side",
          "Change OR into AND",
          "Always choose no solution"
        ],
        expected: ["Interpret the solution set"],
        explanation: "Correct. After solving, interpret whether the answer is an overlap or separate regions.",
        theory: "For AND, look for values that satisfy both. For OR, include values that satisfy either inequality."
      }
    ],
    workedExample: [
      "Identify whether the statement uses AND or OR.",
      "Solve each inequality carefully.",
      "Apply the inequality reversal rule if needed.",
      "Interpret the final solution set."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "What does AND mean in a compound inequality?",
        answer: "Both parts must be true"
      },
      {
        prompt: "What does OR mean in a compound inequality?",
        answer: "Either part can be true"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
  };
}

function buildAbsoluteValueTemplateLesson(problemType, skillDefinition = {}, metadata = {}, currentQuestion = null, parsed = null) {
  const skillName = formatSkillName(problemType);

  return {
    title: `Recovery Tutor: ${skillName}`,
    diagnostic: {
      problemType,
      family: skillDefinition.family || "absolute_value",
      strategy: skillDefinition.strategy || "split_into_cases",
      tutorType: "absolute_value_template",
      parsed
    },
    conceptSummary: [
      "Absolute value represents distance from zero.",
      "After the absolute value expression is isolated, create two cases.",
      "One case uses the positive value and the other uses the negative value.",
      "If an absolute value equals a negative number, there is no solution."
    ],
    misconception:
      metadata?.misconception ||
      "A common mistake is solving only the positive case and forgetting the negative case.",
    tutorDialogue: [
      {
        id: "identify_cases",
        tutor: `<div><strong>Problem:</strong> ${escapeHtml(parsed?.originalText || "absolute value equation")}</div><div style="margin-top:8px;">What should you do after isolating the absolute value?</div>`,
        choices: [
          "Create two cases",
          "Solve only one equation",
          "Drop the absolute value without cases",
          "Always answer no solution"
        ],
        expected: ["Create two cases"],
        explanation: "Correct. Absolute value equations usually split into two cases: positive and negative.",
        theory: "Because distance can be positive in two directions, absolute value equations can have two solutions."
      },
      {
        id: "check_negative_target",
        tutor: `<div><strong>Important Check:</strong> Absolute value cannot equal a negative number.</div><div style="margin-top:8px;">What happens if |expression| = -5?</div>`,
        choices: [
          "No solution",
          "Two solutions",
          "One solution",
          "Every number works"
        ],
        expected: ["No solution"],
        explanation: "Correct. An absolute value cannot be negative, so the equation has no solution.",
        theory: "Absolute value is distance, and distance is never negative."
      }
    ],
    workedExample: [
      "Isolate the absolute value expression.",
      "Check whether it equals a negative number.",
      "If it is nonnegative, create two equations.",
      "Solve both equations and check both answers."
    ],
    video: null,
    recoveryPractice: [
      {
        prompt: "How many cases do you usually create for an absolute value equation?",
        answer: "Two"
      },
      {
        prompt: "Can an absolute value equal a negative number?",
        answer: "No"
      }
    ],
    source: "recoveryTemplateEngine_v2400"
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
