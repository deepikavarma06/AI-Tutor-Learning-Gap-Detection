import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useConceptMasteryUpdate } from "@/hooks/useConceptMasteryUpdate";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { Helmet } from "react-helmet";

import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  TrendingUp
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const PracticeSession = () => {

  const { conceptName } = useParams();
  const decodedConcept = decodeURIComponent(conceptName);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { updateMastery, isUpdating } = useConceptMasteryUpdate(currentUser);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [answers, setAnswers] = useState([]);

  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);

  // Fetch Questions from Firebase
  useEffect(() => {

    const fetchQuestions = async () => {

      try {

        const q = query(
          collection(db, "practice_questions"),
          where("concept_name", "==", decodedConcept)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (data.length === 0) {
          throw new Error("No practice questions found for this concept.");
        }

        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);

        setQuestions(shuffled);

      } catch (err) {

        console.error(err);
        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchQuestions();

  }, [decodedConcept]);


  const handleSelect = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };


  const handleCheck = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
  };


  const handleNext = async () => {

    const currentQ = questions[currentIndex];

    const isCorrect = selectedAnswer === currentQ.correct_answer;

    const newAnswers = [
      ...answers,
      {
        questionId: currentQ.id,
        studentAnswer: selectedAnswer,
        correctAnswer: currentQ.correct_answer,
        isCorrect
      }
    ];

    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {

      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);

    } else {

      await finishPractice(newAnswers);

    }

  };


  const finishPractice = async (finalAnswers) => {

    setIsFinished(true);

    const correctCount = finalAnswers.filter(a => a.isCorrect).length;

    const score = (correctCount / finalAnswers.length) * 100;

    try {

      await addDoc(collection(db, "practice_attempts"), {

        student_id: currentUser.uid,
        concept_name: decodedConcept,
        answers: finalAnswers,
        score: score,
        createdAt: new Date()

      });

      const masteryUpdate = await updateMastery(decodedConcept, score);

      setResults({
        score,
        correctCount,
        total: finalAnswers.length,
        masteryUpdate
      });

    } catch (err) {

      console.error("Error saving practice results:", err);

    }

  };


  if (loading) {

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );

  }


  if (error) {

    return (
      <div className="container mx-auto px-4 py-24 text-center">

        <h2 className="text-2xl font-bold text-destructive mb-4">Oops!</h2>

        <p className="text-muted-foreground mb-8">{error}</p>

        <Button
          onClick={() => navigate("/practice")}
          variant="outline"
        >
          Back to Practice Mode
        </Button>

      </div>
    );

  }


  if (isFinished && results) {

    const { score, masteryUpdate } = results;

    const isGood = score >= 70;

    return (

      <div className="container mx-auto px-4 py-12 max-w-2xl">

        <Helmet>
          <title>Practice Results - AI Math Tutor</title>
        </Helmet>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          <Card className="border-none shadow-xl">

            <CardHeader className="text-center">

              <CardTitle className="text-3xl font-bold">

                Practice Complete!

              </CardTitle>

            </CardHeader>

            <CardContent className="text-center space-y-6">

              <div className="text-5xl font-extrabold">

                {Math.round(score)}%

              </div>

              <p className="text-muted-foreground">

                {results.correctCount} / {results.total} correct

              </p>

              <div className="flex justify-center gap-3">

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Retake
                </Button>

                <Button asChild>

                  <Link to="/practice">

                    Back

                  </Link>

                </Button>

              </div>

            </CardContent>

          </Card>

        </motion.div>

      </div>

    );

  }


  const currentQ = questions[currentIndex];

  const progress = (currentIndex / questions.length) * 100;


  return (

    <div className="container mx-auto px-4 py-12 max-w-3xl">

      <Helmet>
        <title>{`Practice: ${decodedConcept}`}</title>
      </Helmet>

      <div className="mb-8">

        <Progress value={progress} />

      </div>

      <Card>

        <CardContent className="p-8">

          <h2 className="text-2xl mb-6">

            {currentQ.question_text}

          </h2>

          <div className="space-y-3">

            {currentQ.options.map((option, idx) => (

              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
              >

                {option}

              </Button>

            ))}

          </div>

          <div className="mt-6 text-right">

            {!isAnswered ? (

              <Button
                onClick={handleCheck}
                disabled={!selectedAnswer}
              >
                Check Answer
              </Button>

            ) : (

              <Button
                onClick={handleNext}
                disabled={isUpdating}
              >

                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "Finish"}

              </Button>

            )}

          </div>

        </CardContent>

      </Card>

    </div>

  );

};

export default PracticeSession;