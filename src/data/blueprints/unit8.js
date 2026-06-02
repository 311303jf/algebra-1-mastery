export const UNIT_8_BLUEPRINT = {
  id: "unit-8",
  title: "Factoring",
  quarter: "Q3",
  order: 8,
  status: "expansion",
  frozen: false,
  lessons: [
    {
      id: "8.1",
      title: "Greatest Common Factor",
      objective: "Factor polynomial expressions using the greatest common factor.",
      allowedProblemTypes: [
        "factor_gcf_monomial",
        "factor_gcf_polynomial",
        "factor_gcf_with_negative",
        "factor_gcf_application"
      ]
    },
    {
      id: "8.2",
      title: "Factoring Trinomials (a = 1)",
      objective: "Factor quadratic trinomials with leading coefficient equal to 1.",
      allowedProblemTypes: [
        "factor_trinomial_a1",
        "factor_trinomial_positive_c",
        "factor_trinomial_negative_c",
        "identify_factor_pair"
      ]
    },
    {
      id: "8.3",
      title: "Factoring Trinomials (a ≠ 1)",
      objective: "Factor quadratic trinomials with leading coefficient other than 1.",
      allowedProblemTypes: [
        "factor_trinomial_a_not_1",
        "factor_by_grouping_quadratic",
        "factor_ac_method",
        "identify_equivalent_factored_form"
      ]
    },
    {
      id: "8.4",
      title: "Factoring Special Cases",
      objective: "Factor difference of squares and perfect square trinomials.",
      allowedProblemTypes: [
        "factor_difference_of_squares",
        "factor_perfect_square_trinomial",
        "identify_special_factoring_pattern",
        "mixed_special_factoring"
      ]
    },
    {
      id: "8.5",
      title: "Solving Quadratics by Factoring",
      objective: "Solve quadratic equations using factoring and the zero product property.",
      allowedProblemTypes: [
        "solve_quadratic_by_factoring",
        "zero_product_property",
        "quadratic_factoring_word_problem",
        "identify_quadratic_solutions"
      ]
    }
  ]
};
