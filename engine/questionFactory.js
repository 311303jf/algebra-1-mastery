/*
  Algebra OS — Question Factory Engine
  Version: 1.0
*/

const AlgebraQuestionFactory = (() => {

  const usedQuestions = new Set();

  const LESSON_CONFIG = {

    "1.1": {

      title: "Solving Simple Equations",

      objective:
        "Solve one-step equations using inverse operations.",

      allowedProblemTypes: [
        "one_step_addition",
        "one_step_subtraction",
        "one_step_multiplication",
        "one_step_division",
        "one_step_mixed",
        "real_world_one_step"
      ]

    }

  };

  function randInt(min, max) {

    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;

  }

  function choice(arr) {

    return arr[
      Math.floor(Math.random() * arr.length)
    ];

  }

  function shuffle(arr) {

    return [...arr].sort(
      () => Math.random() - 0.5
    );

  }

  function difficultyRange(difficulty) {

    if (difficulty === "support") {

      return {
        min: 1,
        max: 12,
        allowNegative: false
      };

    }

    if (difficulty === "challenge") {

      return {
        min: -20,
        max: 30,
        allowNegative: true
      };

    }

    return {
      min: -10,
      max: 20,
      allowNegative: true
    };

  }

  function uniqueKey(q) {

    return q.prompt + "|" + q.answer;

  }

  function createChoices(answer) {

    const distractors = new Set();

    distractors.add(answer + 1);
    distractors.add(answer - 1);
    distractors.add(-answer);

    if (answer !== 0) {

      distractors.add(answer + 2);

    } else {

      distractors.add(2);

    }

    const choices = shuffle([
      answer,
      ...Array.from(distractors)
    ])
    .filter(
      (v, i, arr) =>
        arr.indexOf(v) === i
    )
    .slice(0, 4);

    while (choices.length < 4) {

      const extra =
        answer + randInt(-6, 6);

      if (!choices.includes(extra)) {

        choices.push(extra);

      }

    }

    return shuffle(choices);

  }

  function oneStepAddition(
    difficulty = "core"
  ) {

    const r =
      difficultyRange(difficulty);

    const answer =
      randInt(r.min, r.max);

    const b = randInt(2, 15);

    const c = answer + b;

    return {

      lesson: "1.1",

      type: "one_step_addition",

      dok: 1,

      difficulty,

      prompt:
        `Solve: x + ${b} = ${c}`,

      equation:
        `x + ${b} = ${c}`,

      answer,

      choices:
        createChoices(answer),

      hint:
        `Subtract ${b} from both sides.`,

      explanation:
        `x + ${b} = ${c}. Subtract ${b} from both sides, so x = ${answer}.`

    };

  }

  function oneStepSubtraction(
    difficulty = "core"
  ) {

    const r =
      difficultyRange(difficulty);

    const answer =
      randInt(r.min, r.max);

    const b = randInt(2, 15);

    const c = answer - b;

    return {

      lesson: "1.1",

      type: "one_step_subtraction",

      dok: 1,

      difficulty,

      prompt:
        `Solve: x - ${b} = ${c}`,

      equation:
        `x - ${b} = ${c}`,

      answer,

      choices:
        createChoices(answer),

      hint:
        `Add ${b} to both sides.`,

      explanation:
        `x - ${b} = ${c}. Add ${b} to both sides, so x = ${answer}.`

    };

  }

  function oneStepMultiplication(
    difficulty = "core"
  ) {

    const r =
      difficultyRange(difficulty);

    let answer =
      randInt(r.min, r.max);

    if (answer === 0) {

      answer = randInt(2, 10);

    }

    const coefficient =
      choice([2,3,4,5,6,7,8,9]);

    const product =
      coefficient * answer;

    return {

      lesson: "1.1",

      type: "one_step_multiplication",

      dok: 1,

      difficulty,

      prompt:
        `Solve: ${coefficient}x = ${product}`,

      equation:
        `${coefficient}x = ${product}`,

      answer,

      choices:
        createChoices(answer),

      hint:
        `Divide both sides by ${coefficient}.`,

      explanation:
        `${coefficient}x = ${product}. Divide both sides by ${coefficient}, so x = ${answer}.`

    };

  }

  function oneStepDivision(
    difficulty = "core"
  ) {

    const r =
      difficultyRange(difficulty);

    let answer =
      randInt(r.min, r.max);

    if (answer === 0) {

      answer = randInt(2, 10);

    }

    const divisor =
      choice([2,3,4,5,6,7,8,9]);

    return {

      lesson: "1.1",

      type: "one_step_division",

      dok: 1,

      difficulty,

      prompt:
        `Solve: x ÷ ${divisor} = ${answer}`,

      equation:
        `x ÷ ${divisor} = ${answer}`,

      answer:
        answer * divisor,

      choices:
        createChoices(answer * divisor),

      hint:
        `Multiply both sides by ${divisor}.`,

      explanation:
        `x ÷ ${divisor} = ${answer}. Multiply both sides by ${divisor}, so x = ${answer * divisor}.`

    };

  }

  function realWorldOneStep(
    difficulty = "core"
  ) {

    const scenarios = [

      () => {

        const answer =
          randInt(5, 25);

        const added =
          randInt(3, 15);

        const total =
          answer + added;

        return {

          lesson: "1.1",

          type: "real_world_one_step",

          dok: 2,

          difficulty,

          prompt:
            `A student had some points in a math game. After earning ${added} more points, the student had ${total} points. How many points did the student have at first?`,

          equation:
            `x + ${added} = ${total}`,

          answer,

          choices:
            createChoices(answer),

          hint:
            `Write an equation: x + ${added} = ${total}.`,

          explanation:
            `Let x be the starting points. Subtract ${added} from both sides.`

        };

      }

    ];

    return choice(scenarios)();

  }

  function generateOne(
    lessonId = "1.1",
    options = {}
  ) {

    const difficulty =
      options.difficulty || "core";

    const config =
      LESSON_CONFIG[lessonId];

    if (!config) {

      throw new Error(
        `No lesson config found for ${lessonId}`
      );

    }

    const type =
      options.type ||
      choice(config.allowedProblemTypes);

    let generator;

    if (type === "one_step_addition") {

      generator = oneStepAddition;

    }

    else if (type === "one_step_subtraction") {

      generator = oneStepSubtraction;

    }

    else if (type === "one_step_multiplication") {

      generator = oneStepMultiplication;

    }

    else if (type === "one_step_division") {

      generator = oneStepDivision;

    }

    else if (type === "real_world_one_step") {

      generator = realWorldOneStep;

    }

    else if (type === "one_step_mixed") {

      generator = choice([
        oneStepAddition,
        oneStepSubtraction,
        oneStepMultiplication,
        oneStepDivision
      ]);

    }

    else {

      throw new Error(
        `Unsupported type: ${type}`
      );

    }

    let attempts = 0;

    while (attempts < 50) {

      const question =
        generator(difficulty);

      const key =
        uniqueKey(question);

      if (!usedQuestions.has(key)) {

        usedQuestions.add(key);

        return question;

      }

      attempts++;

    }

    return generator(difficulty);

  }

  function generateSet(
    lessonId = "1.1",
    count = 5,
    options = {}
  ) {

    const questions = [];

    for (let i = 0; i < count; i++) {

      questions.push(
        generateOne(
          lessonId,
          options
        )
      );

    }

    return questions;

  }

  function resetSession() {

    usedQuestions.clear();

  }

  return {

    generateOne,

    generateSet,

    resetSession,

    LESSON_CONFIG

  };

})();
