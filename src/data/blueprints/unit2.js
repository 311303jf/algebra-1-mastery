export const UNIT_2_BLUEPRINT = {
  id: "unit-2",
  title: "Functions and Relations",
  quarter: "Q1",
  order: 2,
  status: "expansion",
  frozen: false,
  lessons: [
    {
      id: "2.1",
      title: "Relations and Functions",
      standard: "MA.912.F.1.1",
      objective: "Students will determine whether a relation represents a function.",
      essentialQuestion: "What makes a relation a function?",
      skills: [
        "identify inputs and outputs",
        "determine whether each input has exactly one output",
        "analyze ordered pairs, tables, and mappings"
      ],
      problemTypes: ["relations_functions"],
      allowedProblemTypes: ["relations_functions"],
      dokLevels: [1, 2],
      difficultyRange: { min: 2, max: 3 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["1.7"],
      unlockAfter: "1.7"
    },
    {
      id: "2.2",
      title: "Domain and Range",
      standard: "MA.912.F.1.1",
      objective: "Students will identify the domain and range of a relation or function.",
      essentialQuestion: "How do domain and range describe a function?",
      skills: [
        "identify input values",
        "identify output values",
        "list domain and range from ordered pairs, tables, and graphs"
      ],
      problemTypes: ["domain_range"],
      allowedProblemTypes: ["domain_range"],
      dokLevels: [1, 2],
      difficultyRange: { min: 2, max: 4 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["2.1"],
      unlockAfter: "2.1"
    },
    {
      id: "2.3",
      title: "Function Notation",
      standard: "MA.912.F.1.2",
      objective: "Students will evaluate functions using function notation.",
      essentialQuestion: "What does function notation mean?",
      skills: ["interpret f(x)", "substitute input values", "evaluate functions"],
      problemTypes: ["function_notation"],
      allowedProblemTypes: ["function_notation"],
      dokLevels: [1, 2],
      difficultyRange: { min: 2, max: 4 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["2.2"],
      unlockAfter: "2.2"
    },
    {
      id: "2.4",
      title: "Multiple Representations of Functions",
      standard: "MA.912.F.1.5",
      objective: "Students will connect functions across tables, graphs, equations, and verbal descriptions.",
      essentialQuestion: "How can the same function be represented in different ways?",
      skills: [
        "match tables to equations",
        "match graphs to equations",
        "interpret verbal descriptions",
        "connect multiple representations"
      ],
      problemTypes: ["multiple_representations"],
      allowedProblemTypes: ["multiple_representations"],
      dokLevels: [2, 3],
      difficultyRange: { min: 2, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["2.3"],
      unlockAfter: "2.3"
    },
    {
      id: "2.5",
      title: "Rate of Change",
      standard: "MA.912.F.1.3",
      objective: "Students will calculate and interpret rate of change from tables, graphs, and ordered pairs.",
      essentialQuestion: "How does rate of change describe a relationship?",
      skills: [
        "calculate change in y",
        "calculate change in x",
        "find rate of change",
        "interpret rate of change in context"
      ],
      problemTypes: ["rate_of_change"],
      allowedProblemTypes: ["rate_of_change"],
      dokLevels: [2, 3],
      difficultyRange: { min: 2, max: 5 },
      realWorldRequired: true,
      eocRigor: "medium",
      prerequisites: ["2.4"],
      unlockAfter: "2.4"
    }
  ]
};
