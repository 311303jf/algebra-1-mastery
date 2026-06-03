/*
  Algebra OS — QA Audit Engine
  Version: 1.0 Coverage + Distribution Audit

  Purpose:
  - Audit lesson objective coverage.
  - Every allowedProblemType must appear.
  - Each allowedProblemType must represent at least MIN_DISTRIBUTION_PERCENT
    of generated questions.
*/

export const AlgebraQAAuditEngine = (() => {

  const DEFAULT_AUDIT_COUNT = 100;
  const MIN_DISTRIBUTION_PERCENT = 15;

  function getLessonProblemTypes(lesson){
    return (
      lesson.problemTypes ||
      lesson.allowedProblemTypes ||
      lesson.problem_types ||
      []
    );
  }

  function buildEmptyCounts(problemTypes){
    const counts = {};
    problemTypes.forEach(type => {
      counts[type] = 0;
    });
    return counts;
  }

  function auditLessonCoverage({
    lesson,
    generateQuestionForLesson,
    validateQuestionForQA = null,
    count = DEFAULT_AUDIT_COUNT
  }){
    const problemTypes = getLessonProblemTypes(lesson);
    const counts = buildEmptyCounts(problemTypes);
    const errors = [];

    let generated = 0;
    let qualityFailures = 0;

    if(!lesson){
      return {
        lessonId: "unknown",
        title: "Unknown lesson",
        generated: 0,
        coveragePercent: 0,
        distributionPass: false,
        coveragePass: false,
        pass: false,
        counts: {},
        errors: [{
          message: "Missing lesson object.",
          example: "{}"
        }]
      };
    }

    if(!Array.isArray(problemTypes) || problemTypes.length === 0){
      return {
        lessonId: lesson.id,
        title: lesson.title,
        generated: 0,
        coveragePercent: 0,
        distributionPass: false,
        coveragePass: false,
        pass: false,
        counts: {},
        errors: [{
          message: "Lesson has no problemTypes or allowedProblemTypes.",
          example: JSON.stringify(lesson, null, 2)
        }]
      };
    }

    for(let i = 0; i < count; i++){
      let q = null;

      try{
        q = generateQuestionForLesson(lesson);
        generated++;

        if(counts[q.problemType] === undefined){
          counts[q.problemType] = 0;
        }

        counts[q.problemType] += 1;

        if(typeof validateQuestionForQA === "function"){
          const qErrors = validateQuestionForQA(q, lesson);

          if(qErrors.length){
            qualityFailures++;

            if(errors.length < 8){
              errors.push({
                message: "Quality failure: " + qErrors.join(" | "),
                example: JSON.stringify(q, null, 2)
              });
            }
          }
        }

      }catch(error){
        generated++;
        qualityFailures++;

        if(errors.length < 8){
          errors.push({
            message: "Generation failure: " + error.message,
            example: JSON.stringify({
              lessonId: lesson.id,
              lessonTitle: lesson.title
            }, null, 2)
          });
        }
      }
    }

    const coveredTypes =
      problemTypes.filter(type => Number(counts[type] || 0) > 0);

    const missingTypes =
      problemTypes.filter(type => Number(counts[type] || 0) === 0);

    const coveragePercent =
      problemTypes.length
        ? Math.round((coveredTypes.length / problemTypes.length) * 100)
        : 0;

    const distributionIssues = [];

    problemTypes.forEach(type => {
      const typeCount = Number(counts[type] || 0);
      const pct = generated > 0 ? Math.round((typeCount / generated) * 100) : 0;

      if(pct < MIN_DISTRIBUTION_PERCENT){
        distributionIssues.push({
          type,
          count: typeCount,
          percent: pct
        });
      }
    });

    if(missingTypes.length){
      errors.push({
        message: "Coverage failure: missing problemTypes: " + missingTypes.join(", "),
        example: JSON.stringify({ counts }, null, 2)
      });
    }

    if(distributionIssues.length){
      errors.push({
        message:
          "Distribution failure: each problemType must be at least " +
          MIN_DISTRIBUTION_PERCENT +
          "% of generated questions.",
        example: JSON.stringify(distributionIssues, null, 2)
      });
    }

    const coveragePass = missingTypes.length === 0;
    const distributionPass = distributionIssues.length === 0;
    const qualityPass = qualityFailures === 0;
    const pass = coveragePass && distributionPass && qualityPass;

    return {
      lessonId: lesson.id,
      title: lesson.title,
      generated,
      qualityFailures,
      coveragePercent,
      distributionPass,
      coveragePass,
      qualityPass,
      pass,
      counts,
      missingTypes,
      distributionIssues,
      errors
    };
  }

  function auditLessons({
    lessons,
    generateQuestionForLesson,
    validateQuestionForQA = null,
    count = DEFAULT_AUDIT_COUNT
  }){
    return lessons.map(lesson =>
      auditLessonCoverage({
        lesson,
        generateQuestionForLesson,
        validateQuestionForQA,
        count
      })
    );
  }

  return {
    DEFAULT_AUDIT_COUNT,
    MIN_DISTRIBUTION_PERCENT,
    getLessonProblemTypes,
    auditLessonCoverage,
    auditLessons
  };

})();

window.AlgebraQAAuditEngine = AlgebraQAAuditEngine;
