/*
 Algebra OS Formula Engine
*/

const AlgebraFormulaEngine = (() => {

  const registry = {

    one_step_addition_equation: [
      {
        title: "One-Step Addition",
        formula: "x + a = b",
        note: "Subtract a from both sides."
      }
    ],

    one_step_subtraction_equation: [
      {
        title: "One-Step Subtraction",
        formula: "x - a = b",
        note: "Add a to both sides."
      }
    ],

    one_step_multiplication_equation: [
      {
        title: "One-Step Multiplication",
        formula: "ax = b",
        note: "Divide both sides by a."
      }
    ],

    one_step_division_equation: [
      {
        title: "One-Step Division",
        formula: "x ÷ a = b",
        note: "Multiply both sides by a."
      }
    ],

    multi_step_equation: [
      {
        title: "Multi-Step Equations",
        formula: "ax + b = c",
        note: "Subtract b, then divide by a."
      }
    ],

    combine_like_terms_equation: [
      {
        title: "Combine Like Terms",
        formula: "3x + 4x = 7x",
        note: "Add or subtract coefficients."
      }
    ],

    distributive_property_equation: [
      {
        title: "Distributive Property",
        formula: "a(x+b)=ax+ab",
        note: "Multiply the outside factor by every term inside."
      }
    ],

    variables_both_sides: [
      {
        title: "Variables on Both Sides",
        formula: "ax + b = cx + d",
        note: "Move variables to one side."
      }
    ],

    slope: [
      {
        title: "Slope Formula",
        formula: "m = (y₂ - y₁) ÷ (x₂ - x₁)",
        note: "Find slope between two points."
      }
    ],

    slope_intercept: [
      {
        title: "Slope-Intercept Form",
        formula: "y = mx + b",
        note: "m = slope, b = y-intercept"
      }
    ],

    functions: [
      {
        title: "Function Evaluation",
        formula: "f(x)",
        note: "Substitute x into the function."
      }
    ],

    systems: [
      {
        title: "Systems",
        formula: "Solution = Point of Intersection",
        note: "Where both equations are true."
      }
    ],

    exponent_rules: [
      {
        title: "Exponent Rules",
        formula: "aᵐ × aⁿ = aᵐ⁺ⁿ",
        note: "Add exponents when bases match."
      }
    ],

    factoring: [
      {
        title: "Factoring",
        formula: "x² + bx + c",
        note: "Find two numbers that multiply to c and add to b."
      }
    ],

    quadratics: [
      {
        title: "Quadratic Formula",
        formula: "x = (-b ± √(b² - 4ac)) ÷ 2a",
        note: "Use for ax² + bx + c = 0."
      }
    ]
  };

  function getFormulasForLesson(lesson){

    const formulas = [];

    (lesson.problemTypes || []).forEach(type => {

      if(registry[type]){
        formulas.push(...registry[type]);
      }

    });

    return formulas;
  }

  return {
    getFormulasForLesson
  };

})();

window.AlgebraFormulaEngine = AlgebraFormulaEngine;
