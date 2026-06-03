/*
  Algebra OS — Recovery Lesson Engine
  Version: 1.0
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
        ["Tutor", "Let's solve x + 8 = 16. What operation is attached to x?"],
        ["Student", "Addition."],
        ["Tutor", "Correct. The inverse of addition is subtraction. Subtract 8 from both sides."],
        ["Tutor", "16 - 8 = 8, so x = 8."]
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
        ["Tutor", "Let's solve x - 6 = 10. What operation is attached to x?"],
        ["Student", "Subtraction."],
        ["Tutor", "Correct. The inverse of subtraction is addition. Add 6 to both sides."],
        ["Tutor", "10 + 6 = 16, so x = 16."]
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
        ["Tutor", "Let's solve 4x = 20. What operation connects 4 and x?"],
        ["Student", "Multiplication."],
        ["Tutor", "Correct. The inverse of multiplication is division. Divide both sides by 4."],
        ["Tutor", "20 ÷ 4 = 5, so x = 5."]
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
        ["Tutor", "Let's solve x ÷ 4 = 6. What operation is attached to x?"],
        ["Student", "Division."],
        ["Tutor", "Correct. The inverse of division is multiplication. Multiply both sides by 4."],
        ["Tutor", "6 × 4 = 24, so x = 24."]
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
        ["Tutor", `Let's review ${t} together.`],
        ["Tutor", "First, identify the key information in the problem."],
        ["Tutor", "Next, choose the correct algebraic procedure."],
        ["Tutor", "Finally, check that your answer matches the question."]
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
    return {
      problemType,
      title: title(problemType),
      conceptSummary: base.conceptSummary,
      tutorDialogue: base.tutorDialogue,
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

  return {
    generateRecoveryLesson,
    loadRecoveryState,
    markRecoveryOpened,
    recordRecoveryPractice,
    resetRecoveryState,
    title
  };
})();

window.AlgebraRecoveryLessonEngine = AlgebraRecoveryLessonEngine;
