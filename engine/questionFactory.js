/*
  Algebra OS — Question Factory Engine
  Version: 2.0
  Curriculum-driven, no hardcoded lesson config
*/

const AlgebraQuestionFactory = (() => {

  const usedQuestions = new Set();
  const usedFingerprints = new Set();

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function difficultyRange(difficulty) {
    if (difficulty === "support") {
      return { min: 1, max: 12, allowNegative: false };
    }

    if (difficulty === "challenge") {
      return { min: -20, max: 30, allowNegative: true };
    }

    return { min: -10, max: 20, allowNegative: true };
  }

  function uniqueKey(q) {
    return q.prompt + "|" + q.answer;
  }

  function questionFingerprint(q) {
    return [
      q.lesson,
      q.type,
      q.dok,
      q.difficulty
    ].join("|");
  }

  function isTooSimilar(q) {
    return usedFingerprints.has(questionFingerprint(q));
  }

  function rememberQuestion(q) {
    usedQuestions.add(uniqueKey(q));
    usedFingerprints.add(questionFingerprint(q));
  }

  function createChoices(answer) {
    const choices = new Set();
    choices.add(answer);

    const candidates = [
      answer + 1,
      answer - 1,
      answer + 2,
      answer - 2,
      -answer,
      answer + 5,
      answer - 5
    ];

    for (const candidate of candidates) {
      if (candidate !== answer && Number.isFinite(candidate)) {
        choices.add(candidate);
      }

      if (choices.size === 4) break;
    }

    while (choices.size < 4) {
      const extra = answer + randInt(-10, 10);

      if (extra !== answer && Number.isFinite(extra)) {
        choices.add(extra);
      }
    }

    const finalChoices = shuffle(Array.from(choices));

    if (!finalChoices.includes(answer)) {
      throw new Error("Quality Control Failed: correct answer missing.");
    }

    if (new Set(finalChoices).size !== finalChoices.length) {
      throw new Error("Quality Control Failed: duplicate choices.");
    }

    if (finalChoices.length !== 4) {
      throw new Error("Quality Control Failed: must have 4 choices.");
    }

    return finalChoices;
  }

  function normalizeType(type) {
    return type.replace("_equation", "");
  }

  function oneStepAddition(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const b = randInt(2, 15);
    const c = answer + b;

    return {
      lesson: lessonId,
      type: "one_step_addition",
      dok: 1,
      difficulty,
      prompt: `Solve: x + ${b} = ${c}`,
      equation: `x + ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Subtract ${b} from both sides.`,
      explanation: `Subtract ${b} from both sides. x = ${answer}.`
    };
  }

  function oneStepSubtraction(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const b = randInt(2, 15);
    const c = answer - b;

    return {
      lesson: lessonId,
      type: "one_step_subtraction",
      dok: 1,
      difficulty,
      prompt: `Solve: x - ${b} = ${c}`,
      equation: `x - ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Add ${b} to both sides.`,
      explanation: `Add ${b} to both sides. x = ${answer}.`
    };
  }

  function oneStepMultiplication(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    let answer = randInt(r.min, r.max);
    if (answer === 0) answer = randInt(2, 10);

    const coefficient = choice([2,3,4,5,6,7,8,9]);
    const product = coefficient * answer;

    return {
      lesson: lessonId,
      type: "one_step_multiplication",
      dok: 1,
      difficulty,
      prompt: `Solve: ${coefficient}x = ${product}`,
      equation: `${coefficient}x = ${product}`,
      answer,
      choices: createChoices(answer),
      hint: `Divide both sides by ${coefficient}.`,
      explanation: `Divide both sides by ${coefficient}. x = ${answer}.`
    };
  }

  function oneStepDivision(difficulty = "core", lessonId = "1.1") {
    const r = difficultyRange(difficulty);
    let answer = randInt(r.min, r.max);
    if (answer === 0) answer = randInt(2, 10);

    const divisor = choice([2,3,4,5,6,7,8,9]);
    const dividend = answer * divisor;

    return {
      lesson: lessonId,
      type: "one_step_division",
      dok: 1,
      difficulty,
      prompt: `Solve: x ÷ ${divisor} = ${answer}`,
      equation: `x ÷ ${divisor} = ${answer}`,
      answer: dividend,
      choices: createChoices(dividend),
      hint: `Multiply both sides by ${divisor}.`,
      explanation: `Multiply both sides by ${divisor}. x = ${dividend}.`
    };
  }

  function realWorldOneStep(difficulty = "core", lessonId = "1.1") {
    const answer = randInt(5, 25);
    const added = randInt(3, 15);
    const total = answer + added;

    return {
      lesson: lessonId,
      type: "real_world_one_step",
      dok: 2,
      difficulty,
      prompt: `A student had some points in a math game. After earning ${added} more points, the student had ${total} points. How many points did the student have at first?`,
      equation: `x + ${added} = ${total}`,
      answer,
      choices: createChoices(answer),
      hint: `Write an equation: x + ${added} = ${total}.`,
      explanation: `Subtract ${added} from both sides. x = ${answer}.`
    };
  }

  function multiStepEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2,3,4,5,6,7,8]);
    const b = randInt(2, 15);
    const c = a * answer + b;

    return {
      lesson: lessonId,
      type: "multi_step_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}x + ${b} = ${c}`,
      equation: `${a}x + ${b} = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `First subtract ${b}, then divide by ${a}.`,
      explanation: `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}. x = ${answer}.`
    };
  }

  function combineLikeTermsEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2,3,4,5,6]);
    const b = choice([2,3,4,5,6]);
    const c = randInt(2, 12);
    const combined = a + b;
    const total = combined * answer + c;

    return {
      lesson: lessonId,
      type: "combine_like_terms_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}x + ${b}x + ${c} = ${total}`,
      equation: `${a}x + ${b}x + ${c} = ${total}`,
      answer,
      choices: createChoices(answer),
      hint: `Combine like terms first: ${a}x + ${b}x = ${combined}x.`,
      explanation: `Combine like terms: ${combined}x + ${c} = ${total}. Then solve. x = ${answer}.`
    };
  }

  function distributivePropertyEquation(difficulty = "core", lessonId = "1.2") {
    const r = difficultyRange(difficulty);
    const answer = randInt(r.min, r.max);
    const a = choice([2,3,4,5]);
    const b = randInt(2, 8);
    const c = a * (answer + b);

    return {
      lesson: lessonId,
      type: "distributive_property_equation",
      dok: 2,
      difficulty,
      prompt: `Solve: ${a}(x + ${b}) = ${c}`,
      equation: `${a}(x + ${b}) = ${c}`,
      answer,
      choices: createChoices(answer),
      hint: `Divide both sides by ${a}, then subtract ${b}.`,
      explanation: `Divide by ${a}: x + ${b} = ${c / a}. Subtract ${b}. x = ${answer}.`
    };
  }

  function getGenerator(type) {
    const normalized = normalizeType(type);

    if (normalized === "one_step_addition") return oneStepAddition;
    if (normalized === "one_step_subtraction") return oneStepSubtraction;
    if (normalized === "one_step_multiplication") return oneStepMultiplication;
    if (normalized === "one_step_division") return oneStepDivision;
    if (normalized === "real_world_one_step") return realWorldOneStep;

    if (normalized === "multi_step") return multiStepEquation;
    if (normalized === "multi_step_equation") return multiStepEquation;
    if (normalized === "combine_like_terms") return combineLikeTermsEquation;
    if (normalized === "combine_like_terms_equation") return combineLikeTermsEquation;
    if (normalized === "distributive_property") return distributivePropertyEquation;
    if (normalized === "distributive_property_equation") return distributivePropertyEquation;

    throw new Error(`Unsupported problem type: ${type}`);
  }

  function generateOne(lessonId = "1.1", options = {}) {
    const difficulty = options.difficulty || "core";
    const curriculumProblemTypes = options.problemTypes || [];

    if (!curriculumProblemTypes.length) {
      throw new Error(`No problem types provided for lesson ${lessonId}`);
    }

    let attempts = 0;

    while (attempts < 50) {
      const type = options.type || choice(curriculumProblemTypes);
      const generator = getGenerator(type);
      const question = generator(difficulty, lessonId);
      const key = uniqueKey(question);

      if (!usedQuestions.has(key) && !isTooSimilar(question)) {
        rememberQuestion(question);
        return question;
      }

      attempts++;
    }

    const fallbackType = choice(curriculumProblemTypes);
    const fallbackGenerator = getGenerator(fallbackType);
    return fallbackGenerator(difficulty, lessonId);
  }

  function generateSet(lessonId = "1.1", count = 5, options = {}) {
    const questions = [];

    for (let i = 0; i < count; i++) {
      questions.push(generateOne(lessonId, options));
    }

    return questions;
  }

  function resetSession() {
    usedQuestions.clear();
    usedFingerprints.clear();
  }

  return {
    generateOne,
    generateSet,
    resetSession
  };

})();

window.AlgebraQuestionFactory = AlgebraQuestionFactory;
