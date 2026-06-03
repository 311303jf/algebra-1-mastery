/*
  Algebra OS — Recovery Lesson Engine
  Version: 1.1 Interactive Tutor
  GitHub Pages compatible. No API required.
*/

const AlgebraRecoveryLessonEngine = (() => {
  const VIDEO_LIBRARY = {
    /*
      Add teacher-approved video links later:
      one_step_addition_equation: {
        title: "One-Step Addition Equations",
        url: "https://..."
      }
    */
  };

  const TITLES = {
    one_step_addition_equation: "One-Step Addition Equations",
    one_step_subtraction_equation: "One-Step Subtraction Equations",
    one_step_multiplication_equation: "One-Step Multiplication Equations",
    one_step_division_equation: "One-Step Division Equations",
    one_step_equation: "One-Step Equations",
    two_step_equation: "Two-Step Equations",
    multi_step_equation: "Multi-Step Equations",
    variables_both_sides: "Variables on Both Sides",
    distributive_property_equation: "Distributive Property Equations",
    combine_like_terms_equation: "Combine Like Terms Equations",
    inequalities: "Inequalities",
    compound_inequalities: "Compound Inequalities",
    absolute_value_equations: "Absolute Value Equations",
    quadratic_graph_shape: "Quadratic Graph Shape",
    quadratic_table_pattern: "Quadratic Table Patterns",
    identify_quadratic_function: "Identifying Quadratic Functions",
    linear_vs_quadratic_vs_exponential: "Linear vs Quadratic vs Exponential"
  };

  const LESSONS = {
    one_step_addition_equation: {
      conceptSummary: [
        "A one-step addition equation has x plus a number.",
        "To isolate x, use the inverse operation.",
        "The inverse of addition is subtraction."
      ],
      tutorDialogue: [
        {
          tutor: "Let's solve x + 8 = 16. What operation is attached to x?",
          expected: ["addition", "add", "+"],
          explanation: "In x + 8 = 16, the + 8 means addition is attached to x.",
          theory: "When a number is added to x, we undo it with subtraction."
        },
        {
          tutor: "What is the inverse operation of addition?",
          expected: ["subtraction", "subtract", "-"],
          explanation: "The inverse of addition is subtraction.",
          theory: "Inverse operations undo each other. Addition and subtraction are inverse operations."
        },
        {
          tutor: "Subtract 8 from both sides. What is 16 - 8?",
          expected: ["8", "x=8", "x = 8"],
          explanation: "16 - 8 = 8, so x = 8.",
          theory: "Whatever you do to one side of an equation, you must do to the other side."
        }
      ],
      workedExample: [
        "x + 8 = 16",
        "Subtract 8 from both sides.",
        "x + 8 - 8 = 16 - 8",
        "x = 8"
      ],
      recoveryPractice: [
        { prompt: "Solve: x + 5 = 12", answer: "x = 7" },
        { prompt: "Solve: x + 9 = 20", answer: "x = 11" }
      ]
    },
    one_step_subtraction_equation: {
      conceptSummary: [
        "A one-step subtraction equation has x minus a number.",
        "To isolate x, use the inverse operation.",
        "The inverse of subtraction is addition."
      ],
      tutorDialogue: [
        {
          tutor: "Let's solve x - 6 = 10. What operation is attached to x?",
          expected: ["subtraction", "subtract", "-"],
          explanation: "In x - 6 = 10, the - 6 means subtraction is attached to x.",
          theory: "When a number is subtracted from x, we undo it with addition."
        },
        {
          tutor: "What is the inverse operation of subtraction?",
          expected: ["addition", "add", "+"],
          explanation: "The inverse of subtraction is addition.",
          theory: "Inverse operations undo each other. Subtraction and addition are inverse operations."
        },
        {
          tutor: "Add 6 to both sides. What is 10 + 6?",
          expected: ["16", "x=16", "x = 16"],
          explanation: "10 + 6 = 16, so x = 16.",
          theory: "Adding 6 cancels the - 6 on the left side."
        }
      ],
      workedExample: [
        "x - 6 = 10",
        "Add 6 to both sides.",
        "x - 6 + 6 = 10 + 6",
        "x = 16"
      ],
      recoveryPractice: [
        { prompt: "Solve: x - 4 = 9", answer: "x = 13" },
        { prompt: "Solve: x - 7 = 5", answer: "x = 12" }
      ]
    },
    one_step_multiplication_equation: {
      conceptSummary: [
        "A one-step multiplication equation has a coefficient multiplying x.",
        "To isolate x, use the inverse operation.",
        "The inverse of multiplication is division."
      ],
      tutorDialogue: [
        {
          tutor: "Let's solve 4x = 20. What operation connects 4 and x?",
          expected: ["multiplication", "multiply", "times", "×", "*"],
          explanation: "4x means 4 is multiplying x.",
          theory: "When x is multiplied by a coefficient, divide by that coefficient to isolate x."
        },
        {
          tutor: "What is the inverse operation of multiplication?",
          expected: ["division", "divide", "÷", "/"],
          explanation: "The inverse of multiplication is division.",
          theory: "Division undoes multiplication."
        },
        {
          tutor: "Divide both sides by 4. What is 20 ÷ 4?",
          expected: ["5", "x=5", "x = 5"],
          explanation: "20 ÷ 4 = 5, so x = 5.",
          theory: "Dividing both sides by 4 keeps the equation balanced."
        }
      ],
      workedExample: [
        "4x = 20",
        "Divide both sides by 4.",
        "4x ÷ 4 = 20 ÷ 4",
        "x = 5"
      ],
      recoveryPractice: [
        { prompt: "Solve: 3x = 18", answer: "x = 6" },
        { prompt: "Solve: 5x = 35", answer: "x = 7" }
      ]
    },
    one_step_division_equation: {
      conceptSummary: [
        "A one-step division equation has x divided by a number.",
        "To isolate x, use the inverse operation.",
        "The inverse of division is multiplication."
      ],
      tutorDialogue: [
        {
          tutor: "Let's solve x ÷ 4 = 6. What operation is attached to x?",
          expected: ["division", "divide", "÷", "/"],
          explanation: "x ÷ 4 means x is divided by 4.",
          theory: "When x is divided by a number, multiply by that number to undo division."
        },
        {
          tutor: "What is the inverse operation of division?",
          expected: ["multiplication", "multiply", "times", "×", "*"],
          explanation: "The inverse of division is multiplication.",
          theory: "Multiplication undoes division."
        },
        {
          tutor: "Multiply both sides by 4. What is 6 × 4?",
          expected: ["24", "x=24", "x = 24"],
          explanation: "6 × 4 = 24, so x = 24.",
          theory: "Multiplying both sides by 4 keeps the equation balanced."
        }
      ],
      workedExample: [
        "x ÷ 4 = 6",
        "Multiply both sides by 4.",
        "x ÷ 4 × 4 = 6 × 4",
        "x = 24"
      ],
      recoveryPractice: [
        { prompt: "Solve: x ÷ 3 = 7", answer: "x = 21" },
        { prompt: "Solve: x ÷ 5 = 8", answer: "x = 40" }
      ]
    }
  };

  function title(problemType) {
    return TITLES[problemType] || String(problemType || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function fallback(problemType) {
    const t = title(problemType);
    return {
      conceptSummary: [
        `This recovery lesson reviews ${t}.`,
        "Slow down and identify what the problem is asking.",
        "Follow the hint steps before trying another independent question."
      ],
      tutorDialogue: [
        {
          tutor: `Let's review ${t} together. What should you identify first?`,
          expected: ["key information", "what the problem is asking", "operation", "pattern", "structure"],
          explanation: "Start by identifying the key information and what the problem asks.",
          theory: "Good problem solving begins by identifying the structure before choosing a procedure."
        },
        {
          tutor: "Should you guess, or should you follow the steps?",
          expected: ["follow the steps", "steps", "follow steps"],
          explanation: "Correct. Follow the steps.",
          theory: "Following steps helps prevent careless errors."
        }
      ],
      workedExample: [
        "Read the problem carefully.",
        "Identify the key information.",
        "Use the correct algebraic procedure.",
        "Check your answer."
      ],
      recoveryPractice: [
        { prompt: "Complete one similar guided problem using the steps above.", answer: "Teacher check" },
        { prompt: "Complete a second similar guided problem using the same method.", answer: "Teacher check" }
      ]
    };
  }

  function generateRecoveryLesson(problemType, metadata = {}, currentQuestion = null) {
    const base = LESSONS[problemType] || fallback(problemType);
    const tutorDialogue = (base.tutorDialogue || []).map(turn => {
      if (Array.isArray(turn)) {
        return {
          tutor: `${turn[0]}: ${turn[1]}`,
          expected: ["yes", "ok", "ready"],
          explanation: "Good. Continue with the guided review.",
          theory: "Take your time and follow each step."
        };
      }

      return {
        tutor: turn.tutor || "Let's work through this step.",
        expected: Array.isArray(turn.expected) ? turn.expected : [String(turn.expected || "").trim()].filter(Boolean),
        explanation: turn.explanation || "Good. Continue to the next step.",
        theory: turn.theory || "Use the concept summary and worked example to guide your reasoning."
      };
    });

    return {
      problemType,
      title: title(problemType),
      conceptSummary: base.conceptSummary,
      tutorDialogue,
      workedExample: currentQuestion?.solutionSteps?.length ? currentQuestion.solutionSteps : base.workedExample,
      hintSteps: Array.isArray(metadata.hintSteps) ? metadata.hintSteps : [],
      misconception: metadata.misconception || "Students often rush and skip the setup step.",
      recoveryPractice: base.recoveryPractice,
      video: VIDEO_LIBRARY[problemType] || null
    };
  }

  function key(lessonId, problemType) {
    return `algebra_recovery_${lessonId}_${problemType}`;
  }

  function loadRecoveryState(lessonId, problemType) {
    try {
      return JSON.parse(localStorage.getItem(key(lessonId, problemType)) || "null") || {
        opened: false,
        recoveryCorrectStreak: 0,
        completed: false
      };
    } catch {
      return { opened: false, recoveryCorrectStreak: 0, completed: false };
    }
  }

  function saveRecoveryState(lessonId, problemType, state) {
    localStorage.setItem(key(lessonId, problemType), JSON.stringify(state));
    return state;
  }

  function markRecoveryOpened(lessonId, problemType) {
    const state = loadRecoveryState(lessonId, problemType);
    state.opened = true;
    return saveRecoveryState(lessonId, problemType, state);
  }

  function recordRecoveryPractice(lessonId, problemType, isCorrect) {
    const state = loadRecoveryState(lessonId, problemType);
    state.recoveryCorrectStreak = isCorrect ? state.recoveryCorrectStreak + 1 : 0;
    if (state.recoveryCorrectStreak >= 2) state.completed = true;
    return saveRecoveryState(lessonId, problemType, state);
  }

  function resetRecoveryState(lessonId, problemType) {
    return saveRecoveryState(lessonId, problemType, {
      opened: false,
      recoveryCorrectStreak: 0,
      completed: false
    });
  }

  function loadTutorState(lessonId, problemType) {
    const state = loadRecoveryState(lessonId, problemType);
    if (typeof state.tutorStep !== "number") state.tutorStep = 0;
    if (typeof state.tutorAttempts !== "number") state.tutorAttempts = 0;
    if (state.tutorCompleted !== true) state.tutorCompleted = false;
    return state;
  }

  function recordTutorAnswer(lessonId, problemType, isCorrect, totalSteps) {
    const state = loadTutorState(lessonId, problemType);

    if (isCorrect) {
      state.tutorStep += 1;
      state.tutorAttempts = 0;
    } else {
      state.tutorAttempts += 1;
    }

    if (state.tutorStep >= totalSteps) {
      state.tutorCompleted = true;
    }

    return saveRecoveryState(lessonId, problemType, state);
  }

  return {
    generateRecoveryLesson,
    loadRecoveryState,
    loadTutorState,
    recordTutorAnswer,
    markRecoveryOpened,
    recordRecoveryPractice,
    resetRecoveryState,
    title
  };
})();

window.AlgebraRecoveryLessonEngine = AlgebraRecoveryLessonEngine;
