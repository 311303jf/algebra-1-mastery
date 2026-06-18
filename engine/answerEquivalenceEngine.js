/*
==================================================
 Algebra OS — Universal Answer Equivalence Engine
 Version: 3301
 Purpose:
 - Accept mathematically equivalent student responses.
 - Support Recovery Tutor V3300.
 - Reusable for future Math OS courses.
==================================================
*/

const AlgebraAnswerEquivalenceEngine = (() => {

  function normalizeAnswer(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/x\s*=/g, "")
      .replace(/\s+/g, "")
      .replace(/[.,;:]/g, "")
      .trim();
  }

  const ALIASES = {
    quadraticfunction: [
      "quadratic",
      "quadraticfunction"
    ],

    linearfunction: [
      "linear",
      "linearfunction"
    ],

    exponentialfunction: [
      "exponential",
      "exponentialfunction"
    ],

    notafunction: [
      "notafunction",
      "notfunction",
      "notafunctions"
    ],

    nosolution: [
      "nosolution",
      "nosolutions",
      "noanswer",
      "none"
    ],

    allrealnumbers: [
      "allrealnumbers",
      "allreals",
      "everyrealnumber",
      "infinitelymanysolutions",
      "infinite solutions"
    ],

    "2": [
      "2",
      "two",
      "degree2",
      "exponent2",
      "highestexponentis2"
    ],

    "1": [
      "1",
      "one",
      "degree1",
      "exponent1",
      "highestexponentis1"
    ]
  };

  function getAcceptedForms(correctAnswer) {
    const correct = normalizeAnswer(correctAnswer);
    const aliases = ALIASES[correct] || [];

    return [...new Set([
      correct,
      ...aliases.map(normalizeAnswer)
    ])];
  }

  function areEquivalent(input, correctAnswer) {
    const value = normalizeAnswer(input);
    const correct = normalizeAnswer(correctAnswer);

    if (!value || !correct) return false;

    if (value === correct) return true;
    if (value.includes(correct)) return true;
    if (correct.includes(value)) return true;

    const accepted = getAcceptedForms(correctAnswer);

    if (accepted.includes(value)) return true;

    return accepted.some(alias => {
      return value.includes(alias) || alias.includes(value);
    });
  }

  return {
    normalizeAnswer,
    getAcceptedForms,
    areEquivalent
  };

})();

window.AlgebraAnswerEquivalenceEngine = AlgebraAnswerEquivalenceEngine;
