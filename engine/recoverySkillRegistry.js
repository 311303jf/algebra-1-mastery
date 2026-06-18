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

   product_rule_exponents: {
    family: "exponents",
    strategy: "add_exponents",
    tutor: "exponent_template"
  },

  quotient_rule_exponents: {
    family: "exponents",
    strategy: "subtract_exponents",
    tutor: "exponent_template"
  },

  power_rule_exponents: {
    family: "exponents",
    strategy: "multiply_exponents",
    tutor: "exponent_template"
  },

  power_of_product: {
    family: "exponents",
    strategy: "distribute_power",
    tutor: "exponent_template"
  },

  power_of_quotient: {
    family: "exponents",
    strategy: "distribute_power",
    tutor: "exponent_template"
  },

  factoring: {
    family: "factoring",
    strategy: "find_two_numbers",
    tutor: "factoring_template"
  },

  identify_special_factoring_pattern: {
    family: "factoring",
    strategy: "recognize_pattern",
    tutor: "factoring_template"
  },

  mixed_special_factoring: {
    family: "factoring",
    strategy: "recognize_pattern",
    tutor: "factoring_template"
  },

  solve_quadratic_by_factoring: {
    family: "quadratics",
    strategy: "factor_and_zero_product",
    tutor: "quadratic_template"
  },

  zero_product_property: {
    family: "quadratics",
    strategy: "zero_product",
    tutor: "quadratic_template"
  },

  quadratic_factoring_word_problem: {
    family: "quadratics",
    strategy: "context_root",
    tutor: "quadratic_template"
  },

  quadratic_number_of_solutions: {
    family: "quadratics",
    strategy: "analyze_roots",
    tutor: "quadratic_template"
  },

  interpret_quadratic_roots: {
    family: "quadratics",
    strategy: "meaningful_root",
    tutor: "quadratic_template"
  },

  quadratic_formula_real_solutions: {
    family: "quadratics",
    strategy: "quadratic_formula",
    tutor: "quadratic_template"
  },

  identify_quadratic_function: {
    family: "quadratic_functions",
    strategy: "identify_highest_exponent",
    tutor: "quadratic_function_teacher"
  },

  quadratic_table_pattern: {
    family: "quadratic_functions",
    strategy: "identify_second_differences",
    tutor: "quadratic_function_teacher"
  },

  quadratic_graph_shape: {
    family: "quadratic_functions",
    strategy: "identify_parabola_shape",
    tutor: "quadratic_function_teacher"
  },

  linear_vs_quadratic_vs_exponential: {
    family: "function_classification",
    strategy: "compare_function_families",
    tutor: "function_classification_teacher"
  },

  quadratic_vertex: {
    family: "quadratic_graphs",
    strategy: "identify_vertex",
    tutor: "quadratic_graph_teacher"
  },

  axis_of_symmetry: {
    family: "quadratic_graphs",
    strategy: "identify_axis_of_symmetry",
    tutor: "quadratic_graph_teacher"
  },

  quadratic_y_intercept: {
    family: "quadratic_graphs",
    strategy: "identify_y_intercept",
    tutor: "quadratic_graph_teacher"
  },

  quadratic_x_intercepts: {
    family: "quadratic_graphs",
    strategy: "identify_x_intercepts",
    tutor: "quadratic_graph_teacher"
  },

  vertex_form_features: {
    family: "quadratic_graphs",
    strategy: "read_vertex_form",
    tutor: "quadratic_graph_teacher"
  },

  standard_form_features: {
    family: "quadratic_graphs",
    strategy: "read_standard_form",
    tutor: "quadratic_graph_teacher"
  },

  factored_form_features: {
    family: "quadratic_graphs",
    strategy: "read_factored_form",
    tutor: "quadratic_graph_teacher"
  },

    vertex_form_identify_vertex: {
    family: "vertex_form",
    strategy: "identify_vertex",
    tutor: "vertex_form_teacher"
  },

  vertex_form_transformations: {
    family: "vertex_form",
    strategy: "analyze_transformations",
    tutor: "vertex_form_teacher"
  },

  vertex_form_graph_features: {
    family: "vertex_form",
    strategy: "read_graph_features",
    tutor: "vertex_form_teacher"
  },

  write_vertex_form_from_graph: {
    family: "vertex_form",
    strategy: "write_vertex_form",
    tutor: "vertex_form_teacher"
  },

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
