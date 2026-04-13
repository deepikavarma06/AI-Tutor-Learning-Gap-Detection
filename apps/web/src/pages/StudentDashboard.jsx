import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { getRecommendedLesson } from '@/lib/LessonRecommendationEngine';
import { useConceptMasterySync } from '@/hooks/useConceptMasterySync';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet';
import { BookOpen, Target, Trophy, AlertCircle, Sparkles, ArrowRight, Clock, Dumbbell } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import DashboardHeader from "@/components/DashboardHeader";


const StudentDashboard = () => {
  const { currentUser } = useAuth();
  useConceptMasterySync(currentUser);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overallMastery: 0,
    quizzesCompleted: 0,
    totalQuestions: 0,
    averageScore: 0,
    currentStreak: 0,
    weakConcepts: [],
    recommendedLesson: null,
    recentAttempts: [],
    practiceHistory: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {

        const masteryQuery = query(
          collection(db, "concept_mastery"),
          where("student_id", "==", currentUser.uid),
          orderBy("mastery_percentage")
        );

        const attemptsQuery = query(
          collection(db, "quiz_attempts"),
          where("student_id", "==", currentUser.uid),
          orderBy("created", "desc"),
          limit(5)
        );

        const lessonsQuery = query(
          collection(db, "lessons")
        );

        const practiceQuery = query(
          collection(db, "practice_attempts"),
          where("student_id", "==", currentUser.uid),
          orderBy("created", "desc"),
          limit(5)
        );

        const allAttemptsQuery = query(
          collection(db, "quiz_attempts"),
          where("student_id", "==", currentUser.uid)
        );

        const [
          masterySnap,
          attemptsSnap,
          lessonsSnap,
          practiceSnap,
          allAttemptsSnap
        ] = await Promise.all([
          getDocs(masteryQuery),
          getDocs(attemptsQuery),
          getDocs(lessonsQuery),
          getDocs(practiceQuery),
          getDocs(allAttemptsQuery)
        ]);

        const masteryRecords = masterySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const attempts = attemptsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const lessons = lessonsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const practiceAttempts = practiceSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const allAttempts = allAttemptsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const overallMastery =
          masteryRecords.length > 0
            ? Math.round(
                masteryRecords.reduce(
                  (acc, curr) => acc + curr.mastery_percentage,
                  0
                ) / masteryRecords.length
              )
            : 0;

        const weakConcepts = masteryRecords
          .filter(r => r.mastery_percentage < 70)
          .slice(0, 3);

        const recommendation = getRecommendedLesson(
          masteryRecords,
          lessons
        );

        let totalQuestions = 0;
        let totalScore = 0;

        allAttempts.forEach(a => {
          totalQuestions += a.answers?.length || 0;
          totalScore += a.score;
        });

        const averageScore =
          allAttempts.length > 0
            ? totalScore / allAttempts.length
            : 0;

        const recentConcept = [...masteryRecords].sort(
          (a, b) =>
            new Date(b.updated) - new Date(a.updated)
        )[0];

        const currentStreak = recentConcept
          ? recentConcept.streak_count
          : 0;

        setStats({
          overallMastery,
          quizzesCompleted: allAttempts.length,
          totalQuestions,
          averageScore,
          currentStreak,
          weakConcepts,
          recommendedLesson: recommendation,
          recentAttempts: attempts,
          practiceHistory: practiceAttempts
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }

  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
            
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet>
          <title>Dashboard - AI Math Tutor</title>
        </Helmet>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {currentUser?.displayName || 'Student'}!</h1>
            <p className="text-muted-foreground mt-2">Here's your personalized learning overview.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/lessons">Browse Lessons</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/practice"><Dumbbell className="mr-2 h-4 w-4" /> Practice Mode</Link>
            </Button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary text-primary-foreground border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-primary-foreground/80 text-sm font-medium">Overall Progress</p>
                  <p className="text-3xl font-bold">{stats.overallMastery}%</p>
                </div>
                <Trophy className="h-5 w-5 text-primary-foreground/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Quizzes Done</p>
                  <p className="text-3xl font-bold">{stats.quizzesCompleted}</p>
                </div>
                <BookOpen className="h-5 w-5 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Avg. Score</p>
                  <p className="text-3xl font-bold">{Math.round(stats.averageScore)}%</p>
                </div>
                <Target className="h-5 w-5 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Current Streak</p>
                  <p className="text-3xl font-bold">{stats.currentStreak}</p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Recommendation & Weak Concepts */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Recommendation Card */}
            <Card className="border-primary/20 shadow-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">AI Recommended Next Step</span>
                </div>
                <CardTitle className="text-2xl">{stats.recommendedLesson?.lesson?.title || "Explore New Topics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {stats.recommendedLesson?.reasoning || "You're doing great! Browse the library to find your next challenge."}
                </p>
                {stats.recommendedLesson?.lesson ? (
                  <Button size="lg" asChild>
                    <Link to={`/quiz/${stats.recommendedLesson.lesson.id}`}>
                      Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/lessons">Browse Library</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    Focus Areas
                  </CardTitle>
                  <CardDescription>Concepts that need a little more practice</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/practice">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stats.weakConcepts.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {stats.weakConcepts.map((concept) => (
                      <div key={concept.id} className="flex flex-col p-4 rounded-xl border bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{concept.concept_name}</span>
                          <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400">
                            Practice Available
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold mastery-low">
                            {Math.round(concept.mastery_percentage)}% Mastery
                          </span>
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={`/practice/${encodeURIComponent(concept.concept_name)}`}>Practice</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    <Trophy className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="font-medium">No weak concepts detected!</p>
                    <p className="text-sm mt-1">You're mastering everything you try.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent Activity & Practice History */}
          <div className="space-y-8">
            
            {/* Practice History */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5 text-accent" />
                  Recent Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.practiceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {stats.practiceHistory.map((attempt) => (
                      <div key={attempt.id} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {attempt.concept_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(attempt.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2 shrink-0 bg-accent/10 text-accent border-accent/20">
                          {Math.round(attempt.score)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No practice sessions yet.</p>
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <Link to="/practice">Start Practicing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz Activity */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Recent Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentAttempts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {attempt.concepts_tested?.[0] || 'Math Quiz'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(attempt.created).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Badge variant={attempt.score >= 80 ? 'default' : attempt.score >= 60 ? 'secondary' : 'destructive'} className="ml-2 shrink-0">
                          {Math.round(attempt.score)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No recent quizzes.</p>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t">
                  <Button variant="ghost" className="w-full text-sm" asChild>
                    <Link to="/progress">View Full History</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;