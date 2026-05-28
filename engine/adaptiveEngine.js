/*
  Algebra OS — Adaptive Engine
  Version: 1.0
*/

const AlgebraAdaptiveEngine = (() => {

  function getPerformance(correct, attempted) {

    if (attempted <= 0) {

      return 0;

    }

    return correct / attempted;

  }

  function getDifficulty(correct, attempted) {

    const rate =
      getPerformance(correct, attempted);

    if (attempted < 3) {

      return "core";

    }

    if (rate < 0.50) {

      return "support";

    }

    if (rate >= 0.85) {

      return "challenge";

    }

    return "core";

  }

  function getCoachMessage(
    difficulty,
    correct,
    attempted
  ) {

    const rate = Math.round(
      getPerformance(correct, attempted) * 100
    );

    if (attempted === 0) {

      return
      "Start with the first question. Focus on the inverse operation.";

    }

    if (difficulty === "support") {

      return
      `You are at ${rate}% accuracy. Let's slow down and practice with simpler numbers.`;

    }

    if (difficulty === "challenge") {

      return
      `Excellent work: ${rate}% accuracy. You are ready for a challenge set.`;

    }

    return
    `You are at ${rate}% accuracy. Keep practicing at the core level.`;

  }

  function getHintPolicy(difficulty) {

    if (difficulty === "support") {

      return {

        showHintEarly: true,

        hintMessage:
          "Hint recommended: identify the operation attached to x first."

      };

    }

    if (difficulty === "challenge") {

      return {

        showHintEarly: false,

        hintMessage:
          "Try solving independently before using a hint."

      };

    }

    return {

      showHintEarly: false,

      hintMessage:
        "Use a hint if you feel stuck."

    };

  }

  function getXPValue(difficulty) {

    if (difficulty === "support") {

      return 15;

    }

    if (difficulty === "challenge") {

      return 35;

    }

    return 25;

  }

  function createAdaptiveProfile(
    correct,
    attempted
  ) {

    const difficulty =
      getDifficulty(correct, attempted);

    return {

      difficulty,

      accuracy: Math.round(
        getPerformance(correct, attempted) * 100
      ),

      coachMessage:
        getCoachMessage(
          difficulty,
          correct,
          attempted
        ),

      hintPolicy:
        getHintPolicy(difficulty),

      xpValue:
        getXPValue(difficulty)

    };

  }

  return {

    getPerformance,

    getDifficulty,

    getCoachMessage,

    getHintPolicy,

    getXPValue,

    createAdaptiveProfile

  };

})();
