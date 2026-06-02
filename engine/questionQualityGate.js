/* ============================================================
   Algebra OS — Question QualityGate Engine 2.0
   File: engine/questionQualityGate.js

   Purpose:
   - Validate question structure
   - Validate answer/choices quality
   - Prevent cross-domain distractors
   - Reject misaligned questions before students see them
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

function isInequalityText(text){
  const t = String(text || "");

  return (
    /[<>≤≥]/.test(t) ||
    /\b(and|or)\b/i.test(t) ||
    /\bno solution\b/i.test(t) ||
    /\ball real numbers\b/i.test(t)
  );
}

function isEquationText(text){
  const t = String(text || "");
  return /=/.test(t) && !/[<>≤≥]/.test(t);
}

function isCoordinateText(text){
  const t = String(text || "");
  return /\(\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\)/.test(t);
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

function isFunctionText(text){
  return hasAny(text, [
    "function",
    "not a function",
    "domain",
    "range",
    "f("
  ]);
}

function getExpectedChoiceFamily(problemType){
  const type = normalize(problemType);

  if(type.includes("inequality")){
    return "inequality";
  }

  if(type.includes("absolute_value_equation")){
    return "equation";
  }

  if(type.includes("equation")){
    return "equation";
  }

  if(type.includes("scatter")){
    return "association";
  }

  if(
    type.includes("slope") ||
    type.includes("graph_linear") ||
    type.includes("linear_function")
  ){
    return "linear";
  }

  if(
    type.includes("domain") ||
    type.includes("range") ||
    type.includes("function") ||
    type.includes("relations")
  ){
    return "function";
  }

  return "general";
}

function validateChoiceFamily(question, errors){
  if(!question || !Array.isArray(question.choices)) return;

  const expected = getExpectedChoiceFamily(question.problemType);

  if(expected === "general") return;

  const choices = question.choices.map(String);
  const prompt = String(question.prompt || "");

  if(expected === "inequality"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(invalidAssociationChoices.length > 0){
      errors.push(
        "Inequality question contains association/scatter-plot choices."
      );
    }

    const inequalityLikeCount =
      choices.filter(choice => isInequalityText(choice)).length;

    if(inequalityLikeCount < 3){
      errors.push(
        "Inequality question choices are not mostly inequality-style answers."
      );
    }

    if(!isInequalityText(question.answer)){
      errors.push(
        "Inequality question answer is not an inequality-style answer."
      );
    }
  }

  if(expected === "equation"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(invalidAssociationChoices.length > 0){
      errors.push(
        "Equation question contains association/scatter-plot choices."
      );
    }
  }

  if(expected === "association"){
    const associationCount =
      choices.filter(choice => isAssociationText(choice)).length;

    if(associationCount < 2){
      errors.push(
        "Scatter plot question choices do not match association-style answers."
      );
    }
  }

  if(expected === "function"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(
      invalidAssociationChoices.length > 0 &&
      !normalize(question.problemType).includes("scatter")
    ){
      errors.push(
        "Function question contains scatter-plot association distractors."
      );
    }
  }

  if(expected === "linear"){
    const invalidAssociationChoices =
      choices.filter(choice => isAssociationText(choice));

    if(
      invalidAssociationChoices.length > 0 &&
      !normalize(prompt).includes("scatter")
    ){
      errors.push(
        "Linear question contains scatter-plot association distractors."
      );
    }
  }
}

function validateQuestionAlignment(question, lesson){
  const errors = [];

  if(!lesson || !question) return errors;

  const allowed =
    lesson.allowedProblemTypes ||
    lesson.problemTypes ||
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
    return {
      valid:false,
      errors
    };
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

  errors.push(
    ...validateQuestionAlignment(question, lesson)
  );

  return {
    valid: errors.length === 0,
    errors
  };
}

function assertValidQuestion(question, lesson = null){
  const result = validateQuestion(question, lesson);

  if(!result.valid){
    console.warn(
      "QuestionQualityGate failed:",
      result.errors,
      question,
      lesson
    );
  }

  return result.valid;
}

window.AlgebraQuestionQualityGate = {
  validateQuestion,
  assertValidQuestion
};
