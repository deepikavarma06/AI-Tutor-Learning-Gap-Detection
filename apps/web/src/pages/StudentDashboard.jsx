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
import { BookOpen, Target, Trophy, AlertCircle, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import lessonsData from "@/data/math_topics.json";
import DashboardHeader from "@/components/DashboardHeader";

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  useConceptMasterySync(currentUser);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overallMastery: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    currentStreak: 0,
    weakConcepts: [],
    recommendedLesson: null,
    recentAttempts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Mastery Records (No limit to get accurate overall average)
        const masteryQuery = query(
          collection(db, "concepts"), 
          where("student_id", "==", currentUser.uid)
        );

        // 2. Fetch RECENT Quizzes (Limited to 5 for the UI list)
        const recentAttemptsQuery = query(
          collection(db, "quizzes"), 
          where("student_id", "==", currentUser.uid),
          orderBy("created", "desc"),
          limit(5)
        );

        // 3. Fetch ALL Quizzes (To get the total count correctly)
        const allQuizzesQuery = query(
          collection(db, "quizzes"),
          where("student_id", "==", currentUser.uid)
        );

        const [masterySnap, recentSnap, allQuizzesSnap] = await Promise.all([
          getDocs(masteryQuery),
          getDocs(recentAttemptsQuery),
          getDocs(allQuizzesQuery)
        ]);

        const masteryRecords = masterySnap.docs.map(doc => doc.data());
        const recentQuizzes = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalQuizCount = allQuizzesSnap.size;

        // CALCULATIONS
        const overallMastery = masteryRecords.length > 0
          ? Math.round(
              masteryRecords.reduce((acc, curr) => acc + (Number(curr.mastery_percentage) || 0), 0) / masteryRecords.length
            )
          : 0;

        const averageScore = allQuizzesSnap.docs.length > 0
          ? Math.round(
              allQuizzesSnap.docs.reduce((acc, curr) => acc + (curr.data().score || 0), 0) / allQuizzesSnap.docs.length
            )
          : 0;

        const currentStreak = masteryRecords.length > 0 
          ? Math.max(...masteryRecords.map(m => m.streak_count || 0)) 
          : 0;

        const weakConcepts = masteryRecords
          .filter(r => r.mastery_percentage < 70)
          .sort((a, b) => a.mastery_percentage - b.mastery_percentage)
          .slice(0, 3);

        const recommendation = getRecommendedLesson(masteryRecords, lessonsData);

        setStats({
          overallMastery,
          quizzesCompleted: totalQuizCount,
          averageScore,
          currentStreak,
          weakConcepts,
          recommendedLesson: recommendation,
          recentAttempts: recentQuizzes
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchDashboardData();
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
    <div className="min-h-screen bg-slate-50/30 pb-12">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet><title>Dashboard - AI Math Tutor</title></Helmet>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {currentUser?.displayName || 'Student'}!</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's your unified learning overview.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-indigo-600 text-white border-none shadow-lg">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Mastery</p>
                <p className="text-3xl font-bold">{stats.overallMastery}%</p>
              </div>
              <Trophy className="h-8 w-8 text-indigo-400" />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Quizzes Done</p>
                <p className="text-3xl font-bold text-slate-800">{stats.quizzesCompleted}</p>
              </div>
              <BookOpen className="h-8 w-8 text-slate-200" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Score</p>
                <p className="text-3xl font-bold text-slate-800">{stats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-slate-200" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Day Streak</p>
                <p className="text-3xl font-bold text-amber-500">{stats.currentStreak} 🔥</p>
              </div>
              <Sparkles className="h-8 w-8 text-amber-100" />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* AI Recommendation Card */}
            <Card className="border-indigo-100 shadow-md relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Recommended Next Step</span>
                </div>
                <CardTitle className="text-2xl text-slate-900">{stats.recommendedLesson?.lesson?.title || "Explore Topics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 mb-6 text-lg">
                  {stats.recommendedLesson?.reasoning || "Ready for a new challenge? Browse our library!"}
                </p>
                {stats.recommendedLesson?.lesson && (
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8" asChild>
                    <Link to={`/study/${stats.recommendedLesson.lesson.id}`} state={{ topicName: stats.recommendedLesson.lesson.title }}>
                      Start Lesson <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Focus Areas Card */}
            <Card className="shadow-sm border-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <AlertCircle className="h-5 w-5 text-rose-500" /> Focus Areas
                </CardTitle>
                <CardDescription>Targeted concepts to improve your mastery.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.weakConcepts.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {stats.weakConcepts.map((concept) => {
                      const lessonInfo = lessonsData.find(l => l.id === concept.concept_name);
                      const displayName = lessonInfo ? lessonInfo.title : concept.concept_name;
                      return (
                        <div key={concept.concept_name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800">{displayName}</p>
                            <p className="text-xs font-bold text-rose-600">{Math.round(concept.mastery_percentage)}% Mastery</p>
                          </div>
                          <Button size="sm" asChild variant="outline" className="rounded-lg border-rose-100 hover:bg-rose-50">
                            <Link to={`/quiz/${concept.concept_name}`} state={{ topicName: displayName }}>Improve</Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center py-6 text-slate-400 font-medium italic">No gaps detected. Excellent work!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Quizzes List */}
          <Card className="shadow-sm border-slate-100 h-fit bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <Clock className="h-5 w-5 text-slate-400" /> Recent Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentAttempts.map((attempt) => {
                  const lessonInfo = lessonsData.find(l => l.id === attempt.topic);
                  const displayName = lessonInfo ? lessonInfo.title : (attempt.topic || 'Math Quiz');
                  return (
                    <div key={attempt.id} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{displayName}</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                          {new Date(attempt.created?.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="rounded-lg font-bold" variant={attempt.score >= 70 ? "secondary" : "destructive"}>
                        {Math.round(attempt.score)}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;