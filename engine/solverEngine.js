/*
  Algebra OS — Solver Engine
  Version: 1.0
*/

const AlgebraSolverEngine = (() => {

  function getOperationFromType(type) {
    if (type === "one_step_addition") return "addition";
    if (type === "one_step_subtraction") return "subtraction";
    if (type === "one_step_multiplication") return "multiplication";
    if (type === "one_step_division") return "division";
    return "mixed";
  }

  function extractNumbers(equation) {
    const nums = equation.match(/-?\d+/g);
    return nums ? nums.map(Number) : [];
  }

  function buildSteps(question) {
    const operation = getOperationFromType(question.type);
    const equation = question.equation;
    const answer = question.answer;
    const nums = extractNumbers(equation);

    if (operation === "addition") {
      const b = nums[0];

      return [
        equation,
        `x + ${b} - ${b} = ${nums[1]} - ${b}`,
        `x = ${answer}`
      ];
    }

    if (operation === "subtraction") {
      const b = nums[0];

      return [
        equation,
        `x - ${b} + ${b} = ${nums[1]} + ${b}`,
        `x = ${answer}`
      ];
    }

    if (operation === "multiplication") {
      const coefficient = nums[0];
      const product = nums[1];

      return [
        equation,
        `${coefficient}x ÷ ${coefficient} = ${product} ÷ ${coefficient}`,
        `x = ${answer}`
      ];
    }

    if (operation === "division") {
      const divisor = nums[0];
      const quotient = nums[1];

      return [
        equation,
        `x ÷ ${divisor} × ${divisor} = ${quotient} × ${divisor}`,
        `x = ${answer}`
      ];
    }

    return [
      equation,
      "Use the inverse operation.",
      `x = ${answer}`
    ];
  }

  function getStep(question, index = 0) {
    const steps = buildSteps(question);

    if (index < 0) {
      return steps[0];
    }

    if (index >= steps.length) {
      return steps[steps.length - 1];
    }

    return steps[index];
  }

  function getTotalSteps(question) {
    return buildSteps(question).length;
  }

  return {
    buildSteps,
    getStep,
    getTotalSteps
  };

})();
