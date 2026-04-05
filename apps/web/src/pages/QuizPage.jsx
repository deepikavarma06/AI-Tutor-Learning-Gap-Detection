import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import QuizInterface from '@/components/QuizInterface.jsx';
import QuizCompletionSummary from '@/components/QuizCompletionSummary.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc } from "firebase/firestore";

const QuizPage = () => {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {

    const fetchQuiz = async () => {
      try {

        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
          throw new Error("Quiz not found");
        }

        const record = {
          id: quizSnap.id,
          ...quizSnap.data()
        };

        if (!record.questions || record.questions.length === 0) {
          throw new Error("This quiz has no questions.");
        }

        setQuiz(record);

      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. It may not exist.");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }

  }, [quizId]);



  const handleQuizComplete = async (answers) => {

    try {

      const correctCount = answers.filter(a => a.is_correct).length;
      const score = (correctCount / answers.length) * 100;

      setFinalScore(score);
      setCompleted(true);

      await addDoc(collection(db, "quiz_attempts"), {

        student_id: currentUser.uid,
        quiz_id: quiz.id,
        answers: answers,
        score: score,
        concepts_tested: [quiz.concept_being_tested],
        created: new Date()

      });

      toast.success("Quiz submitted successfully!");

    } catch (err) {

      console.error("Error saving quiz attempt:", err);
      toast.error("Failed to save your results. Please check your connection.");

    }
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }



  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Oops!</h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <button
          onClick={() => navigate('/lessons')}
          className="text-primary hover:underline"
        >
          Return to Lessons
        </button>
      </div>
    );
  }



  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 py-12">

      <Helmet>
        <title>{`Quiz: ${quiz.concept_being_tested} - AI Math Tutor`}</title>
      </Helmet>

      <div className="container mx-auto px-4">

        {!completed ? (

          <QuizInterface
            questions={quiz.questions}
            onComplete={handleQuizComplete}
          />

        ) : (

          <QuizCompletionSummary
            score={finalScore}
            conceptTested={quiz.concept_being_tested}
            totalQuestions={quiz.questions.length}
          />

        )}

      </div>
    </div>
  );
};

export default QuizPage;