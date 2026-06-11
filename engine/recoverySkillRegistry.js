/*
  Algebra OS — Recovery Skill Registry
  Version: 1.0

  Purpose:
  - Central registry for scalable Recovery Tutor routing.
  - Maps problemType → tutor family + strategy.
  - No lesson-specific hardcoding.
*/

export const RECOVERY_SKILL_REGISTRY = {
  one_step_equation: {
    family: "linear_equation",
    strategy: "inverse_operation",
    operation: "mixed",
    tutor: "linear_equation_template"
  },

  one_step_addition_equation: {
    family: "linear_equation",
    strategy: "inverse_operation",
    operation: "addition",
    tutor: "linear_equation_template"
  },

  one_step_subtraction_equation: {
    family: "linear_equation",
    strategy: "inverse_operation",
    operation: "subtraction",
    tutor: "linear_equation_template"
  },

  one_step_multiplication_equation: {
    family: "linear_equation",
    strategy: "inverse_operation",
    operation: "multiplication",
    tutor: "linear_equation_template"
  },

  one_step_division_equation: {
    family: "linear_equation",
    strategy: "inverse_operation",
    operation: "division",
    tutor: "linear_equation_template"
  },

  two_step_equation: {
    family: "linear_equation",
    strategy: "inverse_operations_order",
    tutor: "two_step_equation"
  },

  multi_step_equation: {
    family: "linear_equation",
    strategy: "simplify_then_solve",
    tutor: "multi_step_template"
  },

  combine_like_terms: {
    family: "linear_equation",
    strategy: "simplify_then_solve",
    firstStep: "combine_like_terms",
    tutor: "multi_step_template"
  },

  combine_like_terms_equation: {
    family: "linear_equation",
    strategy: "simplify_then_solve",
    firstStep: "combine_like_terms",
    tutor: "multi_step_template"
  },

  distributive_property: {
    family: "linear_equation",
    strategy: "simplify_then_solve",
    firstStep: "distributive_property",
    tutor: "multi_step_template"
  },

  distributive_property_equation: {
    family: "linear_equation",
    strategy: "simplify_then_solve",
    firstStep: "distributive_property",
    tutor: "multi_step_template"
  },

  variables_both_sides: {
    family: "linear_equation",
    strategy: "move_variables_first",
    tutor: "variables_both_sides_template"
  },

  inequality: {
    family: "linear_inequality",
    strategy: "inverse_operation_with_symbol_rule",
    tutor: "generic_skill"
  },

  inequalities: {
    family: "linear_inequality",
    strategy: "inverse_operation_with_symbol_rule",
    tutor: "generic_skill"
  },

  one_step_inequality: {
    family: "linear_inequality",
    strategy: "inverse_operation_with_symbol_rule",
    tutor: "generic_skill"
  },

  one_step_inequalities: {
    family: "linear_inequality",
    strategy: "inverse_operation_with_symbol_rule",
    tutor: "generic_skill"
  },

  multi_step_inequality: {
    family: "linear_inequality",
    strategy: "simplify_then_solve_with_symbol_rule",
    tutor: "generic_skill"
  },

  multi_step_inequalities: {
    family: "linear_inequality",
    strategy: "simplify_then_solve_with_symbol_rule",
    tutor: "generic_skill"
  },

  compound_inequality: {
    family: "compound_inequality",
    strategy: "solve_each_part",
    tutor: "generic_skill"
  },

  compound_inequalities: {
    family: "compound_inequality",
    strategy: "solve_each_part",
    tutor: "generic_skill"
  },

  absolute_value_equation: {
    family: "absolute_value",
    strategy: "split_into_cases",
    tutor: "generic_skill"
  },

 absolute_value_equations: {
  family: "absolute_value",
  strategy: "split_into_cases",
  tutor: "generic_skill"
},

exponent_product_rule: {
  family: "exponents",
  strategy: "add_exponents",
  tutor: "exponent_template"
},

exponent_quotient_rule: {
  family: "exponents",
  strategy: "subtract_exponents",
  tutor: "exponent_template"
},

power_of_power: {
  family: "exponents",
  strategy: "multiply_exponents",
  tutor: "exponent_template"
},

scientific_notation: {
  family: "scientific_notation",
  strategy: "move_decimal",
  tutor: "scientific_notation_template"
},

polynomial_addition: {
  family: "polynomials",
  strategy: "combine_like_terms",
  tutor: "polynomial_template"
},

polynomial_multiplication: {
  family: "polynomials",
  strategy: "distribute_and_combine",
  tutor: "polynomial_template"
},

factoring_gcf: {
  family: "factoring",
  strategy: "greatest_common_factor",
  tutor: "factoring_template"
},

difference_of_squares: {
  family: "factoring",
  strategy: "difference_of_squares",
  tutor: "factoring_template"
},

quadratic_factoring: {
  family: "quadratics",
  strategy: "reverse_foil",
  tutor: "quadratic_template"
}

};
  
};

export function normalizeRecoverySkillKey(problemType) {
  return String(problemType || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

export function getRecoverySkillDefinition(problemType) {
  const key = normalizeRecoverySkillKey(problemType);
  return RECOVERY_SKILL_REGISTRY[key] || {
    family: "generic",
    strategy: "identify_skill",
    tutor: "generic_skill"
  };
}

export function getRecoveryTutorType(problemType) {
  return getRecoverySkillDefinition(problemType).tutor || "generic_skill";
}

export function isRegisteredRecoverySkill(problemType) {
  const key = normalizeRecoverySkillKey(problemType);
  return Object.prototype.hasOwnProperty.call(RECOVERY_SKILL_REGISTRY, key);
}

window.AlgebraRecoverySkillRegistry = {
  RECOVERY_SKILL_REGISTRY,
  normalizeRecoverySkillKey,
  getRecoverySkillDefinition,
  getRecoveryTutorType,
  isRegisteredRecoverySkill
};
