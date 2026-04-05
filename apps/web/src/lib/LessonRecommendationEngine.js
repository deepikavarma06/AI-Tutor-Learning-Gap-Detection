export const getRecommendedLesson = (conceptMasteryData = [], lessonsData = []) => {
  if (!lessonsData || lessonsData.length === 0) return null;

  // 1. Identify weak concepts (<70% mastery)
  const weakConcepts = conceptMasteryData
    .filter(c => c.mastery_percentage < 70)
    .sort((a, b) => a.mastery_percentage - b.mastery_percentage);

  if (weakConcepts.length > 0) {
    const weakest = weakConcepts[0];
    const recommendedLesson = lessonsData.find(l => l.topic.toLowerCase() === weakest.concept_name.toLowerCase());
    
    if (recommendedLesson) {
      return {
        lesson: recommendedLesson,
        reasoning: `You scored ${Math.round(weakest.mastery_percentage)}% on ${weakest.concept_name} - let's practice more to build a stronger foundation!`
      };
    }
  }

  // 2. For untried concepts, recommend foundational topics in order
  const topicOrder = ['Fractions', 'Decimals', 'Percentages', 'Basic Algebra', 'Geometry Basics', 'Exponents', 'Linear Equations'];
  const attemptedTopics = conceptMasteryData.map(c => c.concept_name.toLowerCase());
  
  for (const topic of topicOrder) {
    if (!attemptedTopics.includes(topic.toLowerCase())) {
      const recommendedLesson = lessonsData.find(l => l.topic.toLowerCase() === topic.toLowerCase());
      if (recommendedLesson) {
        return {
          lesson: recommendedLesson,
          reasoning: `Ready for something new? Let's dive into ${topic} next.`
        };
      }
    }
  }

  // 3. If all attempted and >70%, recommend the one with lowest mastery or a hard difficulty lesson
  const lowestMastery = [...conceptMasteryData].sort((a, b) => a.mastery_percentage - b.mastery_percentage)[0];
  if (lowestMastery) {
    const recommendedLesson = lessonsData.find(l => l.topic.toLowerCase() === lowestMastery.concept_name.toLowerCase() && l.difficulty_level === 'hard');
    if (recommendedLesson) {
      return {
        lesson: recommendedLesson,
        reasoning: `You're doing great! Let's challenge your ${lowestMastery.concept_name} skills with a harder lesson.`
      };
    }
  }

  // Fallback
  return {
    lesson: lessonsData[0],
    reasoning: "Keep up the great work! Here's a lesson to continue your journey."
  };
};