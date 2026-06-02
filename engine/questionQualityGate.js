/* ============================================================
   Algebra OS — Question QualityGate Engine 2.1 Semantic
   File: engine/questionQualityGate.js

   Purpose:
   - Validate question structure
   - Validate answer/choices quality
   - Prevent cross-domain distractors
   - Reject mathematically equivalent duplicate choices
   ============================================================ */

function hasBadText(value){
  if(value === undefined || value === null) return true;

  const text = String(value);

  return (
    text.trim() === "" ||
    text.includes("undefined") ||
    text.includes("NaN") ||
    text.includes("Infinity")
  );
}

function normalize(value){
  return String(value || "").toLowerCase().trim();
}

function hasAny(text, keywords){
  const t = normalize(text);
  return keywords.some(word => t.includes(word));
}

function formatSemanticNumber(n){
  n = Number(n);

  if(Object.is(n, -0)) n = 0;
  if(Number.isInteger(n)) return String(n);

  const rounded = Number(n.toFixed(6));
  if(Number.isInteger(rounded)) return String(rounded);

  return String(rounded);
}

function normalizeChoiceForEquivalence(choice){
  const text = String(choice || "").trim();

  if(/^x\s*=/.test(text) && text.includes(",")){
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if(nums.length === 2){
      nums.sort((a,b) => a - b);
      return `x=${formatSemanticNumber(nums[0])},x=${formatSemanticNumber(nums[1])}`;
    }
  }

  if(text.startsWith("{") && text.endsWith("}")){
    const nums = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];

    if(nums.length > 1){
      nums.sort((a,b) => a - b);
      return "{" + nums.map(formatSemanticNumber).join(",") + "}";
    }
  }

  return text.replace(/\s+/g, "").toLowerCase();
}

function validateEquivalentChoices(question, errors){
  if(!question || !Array.isArray(question.choices)) return;

  const normalizedChoices =
    question.choices.map(normalizeChoiceForEquivalence);

  const uniqueNormalized = new Set(normalizedChoices);

  if(uniqueNormalized.size !== normalizedChoices.length){
    errors.push(
      "Equivalent duplicate choices found. Example: x = -8, x = -12 and x = -12, x = -8 represent the same solution set."
    );
  }
}

function isInequalityText(text){
  const t = String(text || "");

  return (
    /[<>≤≥]/.test(t) ||
    /\b(and|or)\b/i.test(t) ||
    /\bno solution\b/i.test(t) ||
    /\ball real numbers\b/i.test(t)
  );
}

function isAssociationText(text){
  return hasAny(text, [
    "positive association",
    "negative association",
    "no association",
    "linear association",
    "nonlinear association"
  ]);
}

function getExpectedChoiceFamily(problemType){
  const type = normalize(problemType);

  if(type.includes("inequality")) return "inequality";
  if(type.includes("absolute_value_equation")) return "equation";
  if(type.includes("equation")) return "equation";
  if(type.includes("scatter")) return "association";
  if(type.includes("slope") || type.includes("graph_linear") || type.includes("linear_function")) return "linear";
  if(type.includes("domain") || type.includes("range") || type.includes("function") || type.includes("relations")) return "function";

  return "general";
}

function validateChoiceFamily(question, errors){
  if(!question || !Array.isArray(question.choices)) return;

  const expected = getExpectedChoiceFamily(question.problemType);

  if(expected === "general") return;

  const choices = question.choices.map(String);

  if(expected === "inequality"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(invalidAssociationChoices.length > 0){
      errors.push("Inequality question contains association/scatter-plot choices.");
    }

    const inequalityLikeCount =
      choices.filter(choice => isInequalityText(choice)).length;

    if(inequalityLikeCount < 3){
      errors.push("Inequality question choices are not mostly inequality-style answers.");
    }

    if(!isInequalityText(question.answer)){
      errors.push("Inequality question answer is not an inequality-style answer.");
    }
  }

  if(expected === "equation"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(invalidAssociationChoices.length > 0){
      errors.push("Equation question contains association/scatter-plot choices.");
    }
  }

  if(expected === "association"){
    const associationCount =
      choices.filter(choice => isAssociationText(choice)).length;

    if(associationCount < 2){
      errors.push("Scatter plot question choices do not match association-style answers.");
    }
  }
}

function validateQuestionAlignment(question, lesson){
  const errors = [];

  if(!lesson || !question) return errors;

  const allowed =
    lesson.allowedProblemTypes ||
    lesson.problemTypes ||
    lesson.problem_types ||
    [];

  if(Array.isArray(allowed) && allowed.length){
    if(!allowed.includes(question.problemType)){
      errors.push(
        `Problem type ${question.problemType} is not allowed for lesson ${lesson.id}.`
      );
    }
  }

  return errors;
}

function validateQuestion(question, lesson = null){
  const errors = [];

  if(!question){
    errors.push("Question object is missing.");
    return { valid:false, errors };
  }

  if(!question.prompt || hasBadText(question.prompt)){
    errors.push("Invalid or missing prompt.");
  }

  if(!question.answer || hasBadText(question.answer)){
    errors.push("Invalid or missing answer.");
  }

  if(!Array.isArray(question.choices)){
    errors.push("Choices must be an array.");
  }else{
    if(question.choices.length !== 4){
      errors.push("Question must have exactly 4 choices.");
    }

    const uniqueChoices =
      new Set(question.choices.map(choice => String(choice).trim()));

    if(uniqueChoices.size !== question.choices.length){
      errors.push("Duplicate choices found.");
    }

    validateEquivalentChoices(question, errors);

    if(!question.choices.map(String).includes(String(question.answer))){
      errors.push("Correct answer is missing from choices.");
    }

    question.choices.forEach(choice => {
      if(hasBadText(choice)){
        errors.push("Invalid choice text found.");
      }
    });
  }

  if(!question.problemType || hasBadText(question.problemType)){
    errors.push("Missing problemType.");
  }

  if(!Array.isArray(question.hintSteps) || question.hintSteps.length === 0){
    errors.push("Missing hintSteps.");
  }

  if(!Array.isArray(question.solutionSteps) || question.solutionSteps.length === 0){
    errors.push("Missing solutionSteps.");
  }

  if(!question.misconception || hasBadText(question.misconception)){
    errors.push("Missing misconception.");
  }

  validateChoiceFamily(question, errors);
  errors.push(...validateQuestionAlignment(question, lesson));

  return {
    valid: errors.length === 0,
    errors
  };
}

function assertValidQuestion(question, lesson = null){
  const result = validateQuestion(question, lesson);

  if(!result.valid){
    console.warn("QuestionQualityGate failed:", result.errors, question, lesson);
  }

  return result.valid;
}

window.AlgebraQuestionQualityGate = {
  validateQuestion,
  assertValidQuestion,
  normalizeChoiceForEquivalence
};
