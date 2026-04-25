import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuizInterface from "@/components/QuizInterface.jsx";
import QuizCompletionSummary from "@/components/QuizCompletionSummary.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

// Firebase and Auth Imports
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth(); // Crucial for identifying the student

  // Topic passed from lesson page for UI display
  const topicName = location.state?.topic || quizId;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const displayTopicName = location.state?.topicName || quizId;

  // 1. GENERATE QUIZ ON LOAD
  useEffect(() => {
    const generateQuiz = async () => {
      try {
        const res = await fetch("http://localhost:3001/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: displayTopicName })
        });

        const data = await res.json();
        const quizQuestions = data.questions || data.quiz;
    
        // Ensure questions are in object format
        const parsedQuestions = typeof quizQuestions === "string" 
          ? JSON.parse(quizQuestions) 
          : quizQuestions;

        setQuiz({
          concept_being_tested: quizId,
          questions: parsedQuestions
        });

        setLoading(false);
      } catch (error) {
        console.error("Quiz generation error:", error);
        setLoading(false);
      }
    };

    if (displayTopicName) {
      generateQuiz();
    }
  }, [displayTopicName]);

  // 2. HANDLE COMPLETION & DATA PERSISTENCE
  const handleQuizComplete = async (answers) => {
    // Calculate Score
    const correctCount = answers.filter(a => a.is_correct).length;
    const score = (correctCount / answers.length) * 100;

    setFinalScore(score);
    setCompleted(true);

    try {

      // --- STREAK CALCULATION LOGIC ---
      const conceptRef = doc(db, "concepts", `${currentUser.uid}_${quizId}`);
      const conceptSnap = await getDoc(conceptRef);
      
      let newStreak = 1;

      if (conceptSnap.exists()) {
        const data = conceptSnap.data();
        const lastActivity = data.last_updated?.toDate();
        
        if (lastActivity) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const lastDate = new Date(lastActivity);
          lastDate.setHours(0, 0, 0, 0);

          const diffInTime = today.getTime() - lastDate.getTime();
          const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));

          if (diffInDays === 1) {
            // Practiced yesterday, increment streak
            newStreak = (data.streak_count || 0) + 1;
          } else if (diffInDays === 0) {
            // Already practiced today, maintain current streak
            newStreak = data.streak_count || 1;
          } else {
            // Missed a day or more, reset to 1
            newStreak = 1;
          }
        }
      }
      

      // B. Update/Create Mastery record for "Gap Detection"
      // Using a unique ID (UID + Topic) ensures only one mastery record per concept
      await setDoc(conceptRef, {
        student_id: currentUser.uid,
        concept_name: quizId,
        mastery_percentage: score,
        streak_count: newStreak, // Saving the calculated streak
        last_updated: serverTimestamp()
      }, { merge: true });

      // A. Save the individual quiz attempt for "Recent Activity"
      await addDoc(collection(db, "quizzes"), {
        student_id: currentUser.uid,
        topic: quizId,
        topic_name: topicName,
        score: score,
        created: serverTimestamp(),
        answers: answers
      });

      console.log(`Saved! New Streak: ${newStreak}`);

      // C. Prepare mistakes for AI Adaptive Analysis
      const mistakes = answers
        .filter(a => !a.is_correct)
        .map(a => ({
          question: a.question_id,
          studentAnswer: a.selected_answer_index,
          correctAnswer: a.correct_answer_index
        }));

      // Only trigger adaptive logic if there are mistakes
      if (mistakes.length > 0) {
        await fetch("http://localhost:3001/api/adaptive-lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mistakes })
        });
      }

    } catch (err) {
      console.error("Failed to update student profile:", err);
    }
  };

  // 3. RENDER STATES
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-red-500 font-bold text-2xl">Quiz generation failed</h2>
        <p className="text-gray-500">Please check your backend connection.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>{`Quiz: ${topicName}`}</title>
      </Helmet>

      <div className="container mx-auto px-4 max-w-3xl">
        {!completed ? (
          <QuizInterface
            questions={quiz.questions}
            onComplete={handleQuizComplete}
          />
        ) : (
          <QuizCompletionSummary
            score={finalScore}
            conceptTested={topicName}
            totalQuestions={quiz.questions.length}
          />
        )}
      </div>
    </div>
  );
};

export default QuizPage;