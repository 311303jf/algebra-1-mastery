/*
  Algebra OS — Curriculum Engine
  Version: 1.0
*/

const AlgebraCurriculumEngine = (() => {

  async function loadCurriculum() {
    const response = await fetch("curriculum/algebra1.json");

    if (!response.ok) {
      throw new Error("Could not load curriculum/algebra1.json");
    }

    return await response.json();
  }

  function getTopics(curriculum) {
    return curriculum.topics || [];
  }

  function getTopic(curriculum, topicId) {
    return getTopics(curriculum).find(
      topic => topic.topic === topicId
    );
  }

  function getLessonsByTopic(curriculum, topicId) {
    const topic = getTopic(curriculum, topicId);

    if (!topic) {
      return [];
    }

    return topic.lessons || [];
  }

  function getLesson(curriculum, lessonId) {
    const topics = getTopics(curriculum);

    for (const topic of topics) {
      const lesson = (topic.lessons || []).find(
        item => item.lesson === lessonId
      );

      if (lesson) {
        return {
          ...lesson,
          topic: topic.topic,
          topicTitle: topic.title,
          topicBenchmark: topic.benchmark || []
        };
      }
    }

    return null;
  }

  function getNextLesson(curriculum, lessonId) {
    const allLessons = [];

    getTopics(curriculum).forEach(topic => {
      (topic.lessons || []).forEach(lesson => {
        allLessons.push({
          ...lesson,
          topic: topic.topic,
          topicTitle: topic.title
        });
      });
    });

    const index = allLessons.findIndex(
      lesson => lesson.lesson === lessonId
    );

    if (index === -1 || index === allLessons.length - 1) {
      return null;
    }

    return allLessons[index + 1];
  }

  function getPreviousLesson(curriculum, lessonId) {
    const allLessons = [];

    getTopics(curriculum).forEach(topic => {
      (topic.lessons || []).forEach(lesson => {
        allLessons.push({
          ...lesson,
          topic: topic.topic,
          topicTitle: topic.title
        });
      });
    });

    const index = allLessons.findIndex(
      lesson => lesson.lesson === lessonId
    );

    if (index <= 0) {
      return null;
    }

    return allLessons[index - 1];
  }

  function calculateTopicMastery(topicId) {
    if (topicId === "1") {
      const lesson11Correct =
        Number(localStorage.getItem("lesson11_correct") || 0);

      const lesson11Mastery =
        Math.round((lesson11Correct / 5) * 100);

      return Math.round(lesson11Mastery / 5);
    }

    return 0;
  }

  function isLessonUnlocked(lessonId) {
    if (lessonId === "1.1") {
      return true;
    }

    if (lessonId === "1.2") {
      const lesson11Correct =
        Number(localStorage.getItem("lesson11_correct") || 0);

      const mastery =
        Math.round((lesson11Correct / 5) * 100);

      return mastery >= 80;
    }

    return false;
  }

  function getLessonStatus(lessonId) {
    if (lessonId === "1.1") {
      const correct =
        Number(localStorage.getItem("lesson11_correct") || 0);

      const mastery =
        Math.round((correct / 5) * 100);

      if (mastery >= 80) {
        return "complete";
      }

      if (mastery > 0) {
        return "in_progress";
      }

      return "open";
    }

    if (isLessonUnlocked(lessonId)) {
      return "open";
    }

    return "locked";
  }

  return {
    loadCurriculum,
    getTopics,
    getTopic,
    getLessonsByTopic,
    getLesson,
    getNextLesson,
    getPreviousLesson,
    calculateTopicMastery,
    isLessonUnlocked,
    getLessonStatus
  };

})();
