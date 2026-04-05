import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizInterface = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleSelect = (index) => {
    if (isSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
    
    const newAnswers = [...answers, {
      question_id: currentQuestion.question_id || `q-${currentIndex}`,
      selected_answer_index: selectedAnswer,
      correct_answer_index: currentQuestion.correct_answer_index,
      is_correct: isCorrect
    }];
    
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-8 leading-snug">
                {currentQuestion.question_text}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQuestion.correct_answer_index;
                  
                  let buttonClass = "w-full justify-start h-auto py-4 px-6 text-left text-base font-normal transition-all duration-200 border-2 ";
                  
                  if (!isSubmitted) {
                    buttonClass += isSelected 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-muted bg-background hover:border-primary/50 hover:bg-muted/50";
                  } else {
                    if (isCorrect) {
                      buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200";
                    } else {
                      buttonClass += "border-muted bg-background opacity-50";
                    }
                  }

                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => handleSelect(idx)}
                      disabled={isSubmitted}
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{option}</span>
                        {isSubmitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                        {isSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {isSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-xl border ${
                    selectedAnswer === currentQuestion.correct_answer_index 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200' 
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200'
                  }`}
                >
                  <p className="font-medium mb-1">
                    {selectedAnswer === currentQuestion.correct_answer_index ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-sm opacity-90">{currentQuestion.explanation}</p>
                </motion.div>
              )}

              <div className="mt-8 flex justify-end">
                {!isSubmitted ? (
                  <Button 
                    size="lg" 
                    onClick={handleSubmit} 
                    disabled={selectedAnswer === null}
                    className="w-full sm:w-auto"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={handleNext}
                    className="w-full sm:w-auto group"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizInterface;