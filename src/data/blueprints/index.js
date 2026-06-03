import { UNIT_1_BLUEPRINT } from "./unit1.js";
import { UNIT_2_BLUEPRINT } from "./unit2.js";
import { UNIT_3_BLUEPRINT } from "./unit3.js";
import { UNIT_4_BLUEPRINT } from "./unit4.js";
import { UNIT_5_BLUEPRINT } from "./unit5.js";

import { UNIT_6_BLUEPRINT } from "./unit6.js";
import { UNIT_7_BLUEPRINT } from "./unit7.js";
import { UNIT_8_BLUEPRINT } from "./unit8.js";
import { UNIT_9_BLUEPRINT } from "./unit9.js";

export const CURRICULUM_BLUEPRINTS = {
  course: {
    id: "algebra-1",
    title: "Algebra 1",
    state: "Florida BEST",
    platform: "Algebra OS",
    version: "2.0.0"
  },

  units: [
    UNIT_1_BLUEPRINT,
    UNIT_2_BLUEPRINT,
    UNIT_3_BLUEPRINT,
    UNIT_4_BLUEPRINT,
    UNIT_5_BLUEPRINT,
    UNIT_6_BLUEPRINT,
    UNIT_7_BLUEPRINT,
    UNIT_8_BLUEPRINT,
    UNIT_9_BLUEPRINT
  ]
};
