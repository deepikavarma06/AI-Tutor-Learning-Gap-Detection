export function getRecommendedLesson(masteryData, allLessons) {
  // 1. If the student is new (no quiz data), recommend the first lesson
  if (!masteryData || masteryData.length === 0) {
    return { lesson: allLessons[0], reasoning: "Let's start with the basics!"};
  }

  // 2. Identify the first topic the student hasn't mastered yet (< 80%)
  for (let lesson of allLessons) {
    const progress = masteryData.find(
      (m) => m.concept_name === lesson.id
    );

    // If they haven't tried it, or mastery is low, this is the recommendation
    if (!progress || progress.mastery_percentage < 80) {
      return { 
        lesson, 
        reasoning: !progress 
          ? `You're ready for ${lesson.title}!`
          : `Let's perfect your ${lesson.title} skills.`
      };
    }
  }

  // 3. Fallback: If everything is mastered, show the last lesson
  return { lesson: allLessons[0], reasoning: "Review your advanced skills." };
}