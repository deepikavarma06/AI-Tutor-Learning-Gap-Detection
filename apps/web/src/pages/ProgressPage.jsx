import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Target, Zap, Activity } from 'lucide-react';

import DashboardHeader from "@/components/DashboardHeader";

const ProgressPage = () => {

  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [masteryData, setMasteryData] = useState([]);

  const [stats, setStats] = useState({
    overallProgress: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    averageScore: 0,
    highestStreak: 0
  });


  useEffect(() => {

    const fetchProgressData = async () => {

      try {

        /* ---------- CONCEPT MASTERY ---------- */

        const masteryQuery = query(
          collection(db, "concept_mastery"),
          where("student_id", "==", currentUser.uid),
          orderBy("mastery_percentage", "desc")
        );

        const masterySnapshot = await getDocs(masteryQuery);

        const masteryRes = masterySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


        /* ---------- QUIZ ATTEMPTS ---------- */

        const attemptsQuery = query(
          collection(db, "quiz_attempts"),
          where("student_id", "==", currentUser.uid)
        );

        const attemptsSnapshot = await getDocs(attemptsQuery);

        const attemptsRes = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


        setMasteryData(masteryRes);


        /* ---------- STATS CALCULATION ---------- */

        let totalQuestions = 0;
        let totalScore = 0;

        attemptsRes.forEach(attempt => {
          totalQuestions += attempt.answers?.length || 0;
          totalScore += attempt.score;
        });


        const overallProgress =
          masteryRes.length > 0
            ? masteryRes.reduce((acc, curr) => acc + curr.mastery_percentage, 0) / masteryRes.length
            : 0;


        const highestStreak =
          masteryRes.length > 0
            ? Math.max(...masteryRes.map(m => m.streak_count || 0))
            : 0;


        setStats({
          overallProgress,
          totalQuizzes: attemptsRes.length,
          totalQuestions,
          averageScore: attemptsRes.length > 0 ? totalScore / attemptsRes.length : 0,
          highestStreak
        });

      } catch (error) {

        console.error("Error fetching progress data:", error);

      } finally {

        setLoading(false);

      }

    };


    if (currentUser) {
      fetchProgressData();
    }

  }, [currentUser]);


  const getBarColor = (percentage) => {
    if (percentage >= 85) return 'hsl(var(--primary))';
    if (percentage >= 70) return '#f59e0b';
    return '#ef4444';
  };


  const getMasteryClass = (percentage) => {
    if (percentage >= 85) return 'mastery-high';
    if (percentage >= 70) return 'mastery-medium';
    return 'mastery-low';
  };


  if (loading) {

    return (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <Skeleton className="h-10 w-64" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-96" />
      </div>
    );

  }


  return (
    <>
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">

        <Helmet>
          <title>My Progress - AI Math Tutor</title>
        </Helmet>


        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Learning Progress</h1>
          <p className="text-muted-foreground mt-2">
            Track your mastery across all mathematical concepts.
          </p>
        </div>


        {/* ---------- QUICK STATS ---------- */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Target className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-muted-foreground">Overall Mastery</p>

              <h3 className="text-2xl font-bold">
                {Math.round(stats.overallProgress)}%
              </h3>
            </CardContent>
          </Card>


          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                <Brain className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>

              <h3 className="text-2xl font-bold">{stats.totalQuizzes}</h3>
            </CardContent>
          </Card>


          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                <Zap className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>

              <h3 className="text-2xl font-bold">
                {Math.round(stats.averageScore)}%
              </h3>
            </CardContent>
          </Card>


          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-rose-500/10 rounded-full text-rose-500">
                <Activity className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-muted-foreground">Best Streak</p>

              <h3 className="text-2xl font-bold">{stats.highestStreak}</h3>
            </CardContent>
          </Card>

        </div>


        {/* ---------- MAIN CONTENT ---------- */}

        <div className="grid lg:grid-cols-3 gap-8">


          {/* ---------- CHART ---------- */}

          <Card className="lg:col-span-2">

            <CardHeader>
              <CardTitle>Concept Mastery Overview</CardTitle>
              <CardDescription>Your performance across different topics</CardDescription>
            </CardHeader>

            <CardContent>

              {masteryData.length > 0 ? (

                <div className="h-[400px] w-full">

                  <ResponsiveContainer width="100%" height="100%">

                    <BarChart
                      data={masteryData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >

                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />

                      <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />

                      <YAxis dataKey="concept_name" type="category" width={100} tick={{ fontSize: 12 }} />

                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        formatter={(value) => [`${Math.round(value)}%`, 'Mastery']}
                      />

                      <Bar dataKey="mastery_percentage" radius={[0, 4, 4, 0]}>

                        {masteryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBarColor(entry.mastery_percentage)}
                          />
                        ))}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              ) : (

                <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                  No data available yet. Take some quizzes to see your chart!
                </div>

              )}

            </CardContent>

          </Card>


          {/* ---------- TOPIC BREAKDOWN ---------- */}

          <Card>

            <CardHeader>
              <CardTitle>Topic Breakdown</CardTitle>
              <CardDescription>Detailed view of your skills</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {masteryData.length > 0 ? (

                masteryData.map((concept) => (

                  <div key={concept.id} className="space-y-2">

                    <div className="flex justify-between items-center">

                      <span className="font-medium text-sm">
                        {concept.concept_name}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${getMasteryClass(concept.mastery_percentage)}`}
                      >
                        {Math.round(concept.mastery_percentage)}%
                      </span>

                    </div>


                    <Progress
                      value={concept.mastery_percentage}
                      className="h-2"
                      indicatorColor={
                        concept.mastery_percentage >= 85
                          ? 'bg-emerald-500'
                          : concept.mastery_percentage >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }
                    />


                    <div className="flex justify-between text-xs text-muted-foreground">

                      <span>{concept.attempt_count} attempts</span>

                      {concept.streak_count > 0 && (
                        <span className="flex items-center text-amber-600 dark:text-amber-400">
                          <Zap className="h-3 w-3 mr-1" />
                          {concept.streak_count} streak
                        </span>
                      )}

                    </div>

                  </div>

                ))

              ) : (

                <p className="text-sm text-muted-foreground text-center py-8">
                  Complete lessons to build your mastery profile.
                </p>

              )}

            </CardContent>

          </Card>

        </div>

      </div>
    </>

  );

};

export default ProgressPage;