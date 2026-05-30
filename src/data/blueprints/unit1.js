export const UNIT_1_BLUEPRINT = {
  id: "unit-1",
  title: "Expressions, Equations, and Inequalities",
  quarter: "Q1",
  order: 1,
  status: "certified",
  frozen: true,
  lessons: [
    {
      id: "1.1",
      title: "One-Step Equations",
      objective: "Solve one-step linear equations in one variable.",
      allowedProblemTypes: [
        "one_step_equation"
      ]
    },
    {
      id: "1.2",
      title: "Multi-Step Equations",
      objective: "Solve multi-step linear equations in one variable.",
      allowedProblemTypes: [
        "multi_step_equation",
        "multi_step_distributive",
        "combine_like_terms_equation"
      ]
    },
    {
      id: "1.3",
      title: "Variables on Both Sides",
      objective: "Solve linear equations with variables on both sides.",
      allowedProblemTypes: [
        "variables_both_sides",
        "variables_both_sides_distributive"
      ]
    },
    {
      id: "1.4",
      title: "Inequalities",
      objective: "Solve and graph one-step linear inequalities.",
      allowedProblemTypes: [
        "one_step_inequality",
        "graph_inequality"
      ]
    },
    {
      id: "1.5",
      title: "Multi-Step Inequalities",
      objective: "Solve and graph multi-step linear inequalities.",
      allowedProblemTypes: [
        "multi_step_inequality",
        "multi_step_inequality_distributive"
      ]
    },
    {
      id: "1.6",
      title: "Compound Inequalities",
      objective: "Solve and graph compound inequalities joined by AND or OR.",
      allowedProblemTypes: [
        "compound_inequality_and",
        "compound_inequality_or"
      ]
    },
    {
      id: "1.7",
      title: "Absolute Value Equations",
      objective: "Solve absolute value equations, including equations with no solution.",
      allowedProblemTypes: [
        "absolute_value_equation",
        "absolute_value_equation_scaled",
        "absolute_value_equation_no_solution"
      ]
    }
  ]
};
