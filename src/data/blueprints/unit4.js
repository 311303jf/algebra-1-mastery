export const UNIT_4_BLUEPRINT = {
  id: "unit-4",
  title: "Writing Linear Functions",
  quarter: "Q2",
  order: 4,
  status: "expansion",
  frozen: false,
  lessons: [
    {
      id: "4.1",
      title: "Writing Linear Equations from Slope and y-intercept",
      standard: "MA.912.AR.2.5",
      objective: "Students will write linear equations using slope and y-intercept.",
      essentialQuestion: "How can slope and y-intercept be used to write a linear equation?",
      skills: ["identify slope", "identify y-intercept", "write y = mx + b"],
      problemTypes: ["slope_intercept"],
      allowedProblemTypes: ["slope_intercept"],
      dokLevels: [1, 2],
      difficultyRange: { min: 2, max: 4 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["3.6"],
      unlockAfter: "3.6"
    },
    {
      id: "4.2",
      title: "Writing Linear Equations from Graphs",
      standard: "MA.912.AR.2.5",
      objective: "Students will write linear equations from graphs.",
      essentialQuestion: "How can a graph be used to write an equation of a line?",
      skills: [
        "find slope from graph",
        "identify y-intercept",
        "write a linear equation"
      ],
      problemTypes: ["slope_from_graph", "slope_intercept", "graph_linear_function"],
      allowedProblemTypes: ["slope_from_graph", "slope_intercept", "graph_linear_function"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["4.1"],
      unlockAfter: "4.1"
    },
    {
      id: "4.3",
      title: "Writing Linear Equations from Two Points",
      standard: "MA.912.AR.2.5",
      objective: "Students will write linear equations using two points.",
      essentialQuestion: "How can two points determine a line?",
      skills: ["calculate slope", "use points", "write linear equations"],
      problemTypes: ["slope", "slope_intercept"],
      allowedProblemTypes: ["slope", "slope_intercept"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["4.2"],
      unlockAfter: "4.2"
    },
    {
      id: "4.4",
      title: "Writing Linear Equations from Tables",
      standard: "MA.912.AR.2.5",
      objective: "Students will write linear equations from tables.",
      essentialQuestion: "How can patterns in a table help write a linear equation?",
      skills: [
        "find rate of change",
        "identify initial value",
        "write linear equations"
      ],
      problemTypes: ["slope_from_table", "rate_of_change", "slope_intercept"],
      allowedProblemTypes: ["slope_from_table", "rate_of_change", "slope_intercept"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["4.3"],
      unlockAfter: "4.3"
    },
    {
      id: "4.5",
      title: "Scatter Plots and Lines of Fit",
      standard: "MA.912.DP.1.2",
      objective: "Students will interpret scatter plots and lines of fit.",
      essentialQuestion: "How can scatter plots show relationships between data?",
      skills: [
        "interpret scatter plots",
        "identify association",
        "use lines of fit"
      ],
      problemTypes: ["scatter_plots"],
      allowedProblemTypes: ["scatter_plots"],
      dokLevels: [2, 3],
      difficultyRange: { min: 3, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["4.4"],
      unlockAfter: "4.4"
    }
  ]
};
