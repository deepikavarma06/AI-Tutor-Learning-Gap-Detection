export const calculateConceptMastery = (quizAttempt, quizData) => {
  if (!quizAttempt || !quizData || !quizData.questions) return null;

  const conceptName = quizData.concept_being_tested;
  const totalQuestions = quizData.questions.length;
  
  if (totalQuestions === 0) return null;

  let correctCount = 0;
  const mistakePatterns = [];

  quizAttempt.answers.forEach((answer) => {
    if (answer.is_correct) {
      correctCount++;
    } else {
      // Simple mistake pattern tracking: record the question text or concept to identify recurring issues
      const question = quizData.questions.find(q => q.question_id === answer.question_id);
      if (question) {
        mistakePatterns.push({
          question_id: answer.question_id,
          topic: conceptName,
          selected: answer.selected_answer_index,
          correct: answer.correct_answer_index
        });
      }
    }
  });

  const masteryPercentage = (correctCount / totalQuestions) * 100;

  return {
    concept_name: conceptName,
    mastery_percentage: masteryPercentage,
    mistake_patterns: mistakePatterns
  };
};