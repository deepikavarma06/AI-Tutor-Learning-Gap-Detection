const userProgress = {
  completedLessons: [],
  completedQuizzes: [],
  conceptScores: {}
};

export const completeLesson = (lessonId) => {
  if (!userProgress.completedLessons.includes(lessonId)) {
    userProgress.completedLessons.push(lessonId);
  }
};

export const completeQuiz = (conceptId, score) => {
  userProgress.completedQuizzes.push({
    conceptId,
    score,
    date: new Date()
  });

  userProgress.conceptScores[conceptId] = score;
};

export const getProgress = () => {
  return userProgress;
};

export default userProgress;