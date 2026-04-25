import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { BookOpen, Sparkles } from "lucide-react";

// 1. ADD THESE IMPORTS
import { useAuth } from "@/contexts/AuthContext.jsx";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getRecommendedLesson } from "@/lib/LessonRecommendationEngine";
import lessonsData from "@/data/math_topics.json";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

const LessonBrowser = () => {
  const { currentUser } = useAuth(); // Get current user
  const [lessons, setLessons] = useState([]);
  const [masteryRecords, setMasteryRecords] = useState([]); // Store mastery from Firebase
  const [loading, setLoading] = useState(true);

  // 2. FETCH MASTERY DATA FROM FIREBASE
  useEffect(() => {
    const fetchMastery = async () => {
      try {
        const q = query(
          collection(db, "concepts"), 
          where("student_id", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setMasteryRecords(data);
      } catch (err) {
        console.error("Error fetching mastery:", err);
      } finally {
        setLessons(lessonsData);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchMastery();
    }
  }, [currentUser]);

  // 3. CALCULATE THE DYNAMIC RECOMMENDATION
  const recommendation = getRecommendedLesson(masteryRecords, lessonsData);
  const recommendedId = recommendation?.lesson?.id;

  const getDifficultyColor = (level) => {
    const l = level?.toLowerCase();
    switch (l) {
      case "easy": return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "medium": return "text-amber-700 bg-amber-100 border-amber-200";
      case "hard": return "text-rose-700 bg-rose-100 border-rose-200";
      default: return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  if (loading) return <div className="p-10 text-center">Loading lessons...</div>;

  return (
    
    <div className="min-h-screen bg-slate-50/30">
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet><title>Browse Lessons - AI Math Tutor</title></Helmet>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <>
            <DashboardHeader />
            <div>
              {/* dashboard content */}
            </div>
          </>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lesson Library</h1>
          <p className="text-muted-foreground mt-2">Explore topics and improve your math skills.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            // REPLACE manual check with AI recommendation check
            const isAIRecommended = lesson.id === recommendedId;

            return (
              <Card
                key={lesson.id}
                className={`flex flex-col h-full border-2 transition-all duration-300 rounded-3xl hover:-translate-y-1 hover:shadow-xl bg-white ${
                  isAIRecommended ? "border-indigo-600 ring-2 ring-indigo-100" : "border-slate-100"
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex gap-2 items-center mb-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>

                    {/* DYNAMIC BADGE logic */}
                    {isAIRecommended && (
                      <Badge className="bg-indigo-600 text-white flex items-center gap-1 border-none px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        AI Recommended
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-900">{lesson.title || "Lesson"}</CardTitle>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{lesson.category}</p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-sm text-slate-500 leading-relaxed">{lesson.description}</p>
                </CardContent>

                <CardFooter className="mt-auto pt-6 px-6 pb-6">
                  
                  <Button className="w-full py-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" asChild>
                    <Link to={`/quiz/${lesson.id}`} state={{ topic: lesson.title }}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Link>
                  </Button>

                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LessonBrowser;