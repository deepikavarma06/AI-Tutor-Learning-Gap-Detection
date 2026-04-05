import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizCompletionSummary = ({ score, conceptTested, totalQuestions }) => {
  const isHigh = score >= 85;
  const isMedium = score >= 70 && score < 85;
  
  let message = "Keep practicing! You'll get it next time.";
  let colorClass = "text-rose-500";
  let bgClass = "bg-rose-50 dark:bg-rose-950/20";
  
  if (isHigh) {
    message = "Outstanding! You've mastered this concept.";
    colorClass = "text-emerald-500";
    bgClass = "bg-emerald-50 dark:bg-emerald-950/20";
  } else if (isMedium) {
    message = "Good job! A little more practice to reach mastery.";
    colorClass = "text-amber-500";
    bgClass = "bg-amber-50 dark:bg-amber-950/20";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="border-none shadow-xl overflow-hidden">
        <div className={`h-32 ${bgClass} flex items-center justify-center`}>
          <Trophy className={`h-16 w-16 ${colorClass}`} />
        </div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
          <p className="text-muted-foreground mt-2">{message}</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex flex-col items-center justify-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                <circle 
                  cx="64" cy="64" r="60" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={377} 
                  strokeDashoffset={377 - (377 * score) / 100}
                  className={`${colorClass} transition-all duration-1000 ease-out`} 
                />
              </svg>
              <span className="absolute text-3xl font-bold">{Math.round(score)}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {Math.round((score / 100) * totalQuestions)} out of {totalQuestions} correct
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" /> Concept Tested
            </h3>
            <div className="flex items-center justify-between bg-background p-3 rounded-lg border">
              <span className="font-medium">{conceptTested}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isHigh ? 'mastery-high' : isMedium ? 'mastery-medium' : 'mastery-low'
              }`}>
                {Math.round(score)}% Mastery
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/lessons">
              <RotateCcw className="mr-2 h-4 w-4" /> Back to Lessons
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/progress">
              View Progress <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default QuizCompletionSummary;