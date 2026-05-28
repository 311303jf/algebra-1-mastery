/*
  Algebra OS — Smart Hint Engine
  Version: 1.0
*/

const AlgebraHintEngine = (() => {

  function getOperationFromType(type) {
    if (type === "one_step_addition") {
      return "addition";
    }

    if (type === "one_step_subtraction") {
      return "subtraction";
    }

    if (type === "one_step_multiplication") {
      return "multiplication";
    }

    if (type === "one_step_division") {
      return "division";
    }

    if (type === "real_world_one_step") {
      return "real_world";
    }

    return "mixed";
  }

  function buildHints(question) {
    const operation = getOperationFromType(question.type);

    if (operation === "addition") {
      return [
        "Look at the equation. What number is being added to x?",
        "To undo addition, use subtraction.",
        question.hint,
        `Rewrite the step: ${question.equation} → subtract from both sides.`,
        `The solution is x = ${question.answer}.`
      ];
    }

    if (operation === "subtraction") {
      return [
        "Look at the equation. What number is being subtracted from x?",
        "To undo subtraction, use addition.",
        question.hint,
        `Rewrite the step: ${question.equation} → add to both sides.`,
        `The solution is x = ${question.answer}.`
      ];
    }

    if (operation === "multiplication") {
      return [
        "Look at the coefficient attached to x.",
        "To undo multiplication, use division.",
        question.hint,
        `Divide both sides to isolate x.`,
        `The solution is x = ${question.answer}.`
      ];
    }

    if (operation === "division") {
      return [
        "Look at the number x is being divided by.",
        "To undo division, use multiplication.",
        question.hint,
        `Multiply both sides to isolate x.`,
        `The solution is x = ${question.answer}.`
      ];
    }

    if (operation === "real_world") {
      return [
        "First, identify what x represents in the story.",
        "Write the equation from the situation.",
        question.hint,
        "Now use the inverse operation to isolate x.",
        `The solution is x = ${question.answer}.`
      ];
    }

    return [
      "Identify the operation attached to x.",
      "Use the inverse operation.",
      question.hint,
      "Keep both sides balanced.",
      `The solution is x = ${question.answer}.`
    ];
  }

  function getHint(question, level = 0) {
    const hints = buildHints(question);

    if (level < 0) {
      return hints[0];
    }

    if (level >= hints.length) {
      return hints[hints.length - 1];
    }

    return hints[level];
  }

  function getTotalHints(question) {
    return buildHints(question).length;
  }

  return {
    buildHints,
    getHint,
    getTotalHints
  };

})();
