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

import lessonsData from "@/data/math_topics.json";
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
        /* ---------- 1. FETCH MASTERY (CONCEPTS) ---------- */
        const masteryQuery = query(
          collection(db, "concepts"), // Corrected collection name
          where("student_id", "==", currentUser.uid)
        );

        const masterySnapshot = await getDocs(masteryQuery);

        // Map data and lookup clean names for the chart
        const masteryRes = masterySnapshot.docs.map(doc => {
          const data = doc.data();
          const lessonLookup = lessonsData.find(l => l.id === data.concept_name);
          return {
            id: doc.id,
            ...data,
            // Use clean title for the chart axis
            display_name: lessonLookup ? lessonLookup.title : data.concept_name 
          };
        }).sort((a, b) => b.mastery_percentage - a.mastery_percentage);

        /* ---------- 2. FETCH ALL ATTEMPTS (QUIZZES) ---------- */
        const attemptsQuery = query(
          collection(db, "quizzes"), // Corrected collection name
          where("student_id", "==", currentUser.uid)
        );

        const attemptsSnapshot = await getDocs(attemptsQuery);
        const attemptsRes = attemptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMasteryData(masteryRes);

        /* ---------- 3. STATS CALCULATION ---------- */
        let totalQuestions = 0;
        let totalScore = 0;

        attemptsRes.forEach(attempt => {
          totalQuestions += attempt.answers?.length || 0;
          totalScore += (attempt.score || 0);
        });

        const overallProgress = masteryRes.length > 0
            ? masteryRes.reduce((acc, curr) => acc + (curr.mastery_percentage || 0), 0) / masteryRes.length
            : 0;

        const highestStreak = masteryRes.length > 0
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
    if (percentage >= 85) return '#4f46e5'; // Indigo-600
    if (percentage >= 70) return '#f59e0b'; // Amber-500
    return '#ef4444'; // Red-500
  };

  const getMasteryClass = (percentage) => {
    if (percentage >= 85) return 'bg-indigo-100 text-indigo-700';
    if (percentage >= 70) return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 pb-12">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet><title>My Progress - AI Math Tutor</title></Helmet>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning Progress</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your mastery and performance across all topics.
          </p>
        </div>

        {/* ---------- QUICK STATS ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                <Target className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Overall Mastery</p>
              <h3 className="text-2xl font-bold text-slate-900">{Math.round(stats.overallProgress)}%</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                <Brain className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Quizzes Taken</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalQuizzes}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-amber-50 rounded-full text-amber-500">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Avg. Score</p>
              <h3 className="text-2xl font-bold text-slate-900">{Math.round(stats.averageScore)}%</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-rose-50 rounded-full text-rose-600">
                <Activity className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Best Streak</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.highestStreak} 🔥</h3>
            </CardContent>
          </Card>
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* CHART */}
          <Card className="lg:col-span-2 shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Concept Mastery Overview</CardTitle>
              <CardDescription>Visualizing your current skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              {masteryData.length > 0 ? (
                <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={masteryData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="display_name" 
                        type="category" 
                        width={120} 
                        tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${Math.round(value)}%`, 'Mastery']}
                      />
                      <Bar dataKey="mastery_percentage" radius={[0, 6, 6, 0]} barSize={25}>
                        {masteryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.mastery_percentage)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-2xl">
                  <Target className="h-12 w-12 mb-4 opacity-20" />
                  <p>Complete quizzes to unlock your progress chart!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* TOPIC LIST */}
          <Card className="shadow-sm border-slate-100 h-fit">
            <CardHeader>
              <CardTitle>Topic Breakdown</CardTitle>
              <CardDescription>Detailed skill analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {masteryData.length > 0 ? (
                masteryData.map((concept) => (
                  <div key={concept.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-700">{concept.display_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getMasteryClass(concept.mastery_percentage)}`}>
                        {Math.round(concept.mastery_percentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={concept.mastery_percentage} 
                      // We merge all styles into this one single className attribute
                      className={`h-2 bg-slate-100 [&>div]:transition-all [&>div]:${
                        concept.mastery_percentage >= 85 ? 'bg-indigo-600' : 
                        concept.mastery_percentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                       <span>Score: {Math.round(concept.mastery_percentage)}/100</span>
                       {concept.streak_count > 0 && <span className="text-amber-600">🔥 {concept.streak_count} Streak</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-8 italic">No concepts mastered yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ProgressPage;