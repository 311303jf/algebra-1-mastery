/* ============================================================
   Algebra OS — Curriculum Expander 1.0A
   File: engine/curriculumExpander.js

   ARCHITECTURE DECISION:
   - Unit 1 is frozen and certified.
   - Unit 1 already includes equations, inequalities, compound inequalities,
     and absolute value equations.
   - Therefore Unit 2 will NOT duplicate inequalities.
   - Unit 2 starts with Functions and Relations.
   ============================================================ */

export const ALGEBRA_OS_MASTER_UNITS = [
  {
    id: "unit-2",
    title: "Functions and Relations",
    quarter: "Q1",
    order: 2,
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
        skills: [
          "interpret f(x)",
          "substitute input values",
          "evaluate functions"
        ],
        problemTypes: ["function_notation"],
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
        dokLevels: [2, 3],
        difficultyRange: { min: 2, max: 5 },
        realWorldRequired: true,
        eocRigor: "medium",
        prerequisites: ["2.4"],
        unlockAfter: "2.4"
      }
    ]
  },

  {
    id: "unit-3",
    title: "Graphing Linear Functions",
    quarter: "Q1",
    order: 3,
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
        dokLevels: [2, 3],
        difficultyRange: { min: 3, max: 5 },
        realWorldRequired: true,
        eocRigor: "medium",
        prerequisites: ["3.5"],
        unlockAfter: "3.5"
      }
        ]
  },

  {
    id: "unit-4",
    title: "Writing Linear Functions",
    quarter: "Q2",
    order: 4,
    lessons: [
      {
        id: "4.1",
        title: "Writing Linear Equations from Slope and y-intercept",
        standard: "MA.912.AR.2.5",
        objective: "Students will write linear equations using slope and y-intercept.",
        essentialQuestion: "How can slope and y-intercept be used to write a linear equation?",
        skills: ["identify slope", "identify y-intercept", "write y = mx + b"],
        problemTypes: ["slope_intercept"],
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
        skills: ["find slope from graph", "identify y-intercept", "write a linear equation"],
        problemTypes: ["slope_from_graph", "slope_intercept", "graph_linear_function"],
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
        skills: ["find rate of change", "identify initial value", "write linear equations"],
        problemTypes: ["slope_from_table", "rate_of_change", "slope_intercept"],
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
        skills: ["interpret scatter plots", "identify association", "use lines of fit"],
        problemTypes: ["scatter_plots"],
        dokLevels: [2, 3],
        difficultyRange: { min: 3, max: 5 },
        realWorldRequired: true,
        eocRigor: "medium",
        prerequisites: ["4.4"],
        unlockAfter: "4.4"
      }
    ]
  }
];


export function expandCurriculum(existingCurriculum) {
  const curriculum = structuredClone(existingCurriculum);

  if (!curriculum.units) curriculum.units = [];

  ALGEBRA_OS_MASTER_UNITS.forEach(newUnit => {
    const exists = curriculum.units.some(unit => unit.id === newUnit.id);
    if (!exists) {
      curriculum.units.push(newUnit);
    }
  });

  curriculum.units.sort((a, b) => (a.order || 0) - (b.order || 0));

  return curriculum;
}

window.AlgebraCurriculumExpander = {
  ALGEBRA_OS_MASTER_UNITS,
  expandCurriculum
};
