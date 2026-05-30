export const UNIT_3_BLUEPRINT = {
  id: "unit-3",
  title: "Graphing Linear Functions",
  quarter: "Q1",
  order: 3,
  status: "expansion",
  frozen: false,
  lessons: [
    {
      id: "3.1",
      title: "Linear Functions",
      standard: "MA.912.AR.2.4",
      objective: "Students will identify and interpret linear functions.",
      essentialQuestion: "How can you recognize a linear function?",
      skills: [
        "identify constant rate of change",
        "recognize linear patterns",
        "connect linear tables, graphs, and equations"
      ],
      problemTypes: ["rate_of_change", "multiple_representations"],
      allowedProblemTypes: ["rate_of_change", "multiple_representations"],
      dokLevels: [2, 3],
      difficultyRange: { min: 2, max: 4 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["2.5"],
      unlockAfter: "2.5"
    },
    {
      id: "3.2",
      title: "Slope from Graphs and Tables",
      standard: "MA.912.AR.2.4",
      objective: "Students will calculate slope from graphs, tables, and ordered pairs.",
      essentialQuestion: "How does slope describe the steepness of a line?",
      skills: [
        "calculate slope from two points",
        "find slope from a table",
        "interpret positive, negative, zero, and undefined slope"
      ],
      problemTypes: ["slope", "slope_from_table", "slope_from_graph"],
      allowedProblemTypes: ["slope", "slope_from_table", "slope_from_graph"],
      dokLevels: [2, 3],
      difficultyRange: { min: 2, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.1"],
      unlockAfter: "3.1"
    },
    {
      id: "3.3",
      title: "Slope-Intercept Form",
      standard: "MA.912.AR.2.5",
      objective: "Students will interpret and use slope-intercept form.",
      essentialQuestion: "How do slope and y-intercept define a line?",
      skills: [
        "identify slope",
        "identify y-intercept",
        "write linear equations in slope-intercept form"
      ],
      problemTypes: ["slope_intercept"],
      allowedProblemTypes: ["slope_intercept"],
      dokLevels: [2, 3],
      difficultyRange: { min: 2, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.2"],
      unlockAfter: "3.2"
    },
    {
      id: "3.4",
      title: "Graphing Linear Equations",
      standard: "MA.912.AR.2.5",
      objective: "Students will graph linear equations using slope and intercepts.",
      essentialQuestion: "How can an equation be used to graph a line?",
      skills: [
        "graph using slope and y-intercept",
        "graph using intercepts",
        "interpret linear graphs"
      ],
      problemTypes: ["graph_linear_function", "slope_intercept"],
      allowedProblemTypes: ["graph_linear_function", "slope_intercept"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.3"],
      unlockAfter: "3.3"
    },
    {
      id: "3.5",
      title: "Transformations of Linear Functions",
      standard: "MA.912.F.2.1",
      objective: "Students will describe how changes in a linear function affect its graph.",
      essentialQuestion: "How do transformations change a linear function?",
      skills: [
        "identify vertical shifts",
        "identify slope changes",
        "compare transformed linear functions"
      ],
      problemTypes: ["multiple_representations"],
      allowedProblemTypes: ["multiple_representations"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.4"],
      unlockAfter: "3.4"
    },
    {
      id: "3.6",
      title: "Graphing Absolute Value Functions",
      standard: "MA.912.AR.4.3",
      objective: "Students will graph and interpret absolute value functions.",
      essentialQuestion: "How is an absolute value graph different from a linear graph?",
      skills: [
        "identify the vertex",
        "graph absolute value functions",
        "interpret transformations of absolute value functions"
      ],
      problemTypes: ["absolute_value_functions"],
      allowedProblemTypes: ["absolute_value_functions"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.5"],
      unlockAfter: "3.5"
    }
  ]
};
