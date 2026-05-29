/* ============================================================
   Algebra OS — Question QualityGate Engine 1.0
   File: engine/questionQualityGate.js
   ============================================================ */

function hasBadText(value){
  if(value === undefined || value === null) return true;

  const text = String(value);

  return (
    text.includes("undefined") ||
    text.includes("NaN") ||
    text.includes("Infinity")
  );
}

function validateQuestion(question){
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
      new Set(question.choices.map(choice => String(choice)));

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

  return {
    valid: errors.length === 0,
    errors
  };
}

function assertValidQuestion(question){
  const result = validateQuestion(question);

  if(!result.valid){
    console.warn(
      "QuestionQualityGate failed:",
      result.errors,
      question
    );
  }

  return result.valid;
}

window.AlgebraQuestionQualityGate = {
  validateQuestion,
  assertValidQuestion
};
