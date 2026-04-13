import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getRecommendedLesson } from "@/lib/LessonRecommendationEngine";
import DashboardHeader from "@/components/DashboardHeader";

import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { BookOpen, Sparkles } from "lucide-react";

/**
 * Mastery Badge CSS Classes (Add these to your global CSS or index.css)
 * .mastery-low { @apply bg-rose-50 text-rose-600 border-rose-100; }
 * .mastery-medium { @apply bg-amber-50 text-amber-600 border-amber-100; }
 * .mastery-high { @apply bg-emerald-50 text-emerald-600 border-emerald-100; }
 */

const LessonBrowser = () => {
  const { currentUser } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [masteryMap, setMasteryMap] = useState({});
  const [recommendedId, setRecommendedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* ---------------- FETCH LESSONS ---------------- */
        const lessonsQuery = query(
          collection(db, "lessons"),
          orderBy("created", "desc")
        );

        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        /* ---------------- FETCH MASTERY ---------------- */
        let masteryData = [];
        if (currentUser) {
          const masteryQuery = query(
            collection(db, "concept_mastery"),
            where("student_id", "==", currentUser.uid)
          );

          const masterySnapshot = await getDocs(masteryQuery);
          masteryData = masterySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        /* ---------------- STORE LESSONS ---------------- */
        setLessons(lessonsData);

        /* ---------------- BUILD MASTERY MAP ---------------- */
        const map = {};
        masteryData.forEach(m => {
          if (m.concept_name) {
            map[m.concept_name.toLowerCase()] = m.mastery_percentage;
          }
        });
        setMasteryMap(map);

        /* ---------------- RECOMMENDATION ---------------- */
        const recommendation = getRecommendedLesson(
          masteryData,
          lessonsData
        );

        if (recommendation && recommendation.lesson) {
          setRecommendedId(recommendation.lesson.id);
        }
      } catch (error) {
        console.error("Error fetching lessons data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  /* ---------------- DIFFICULTY COLOR ---------------- */
  const getDifficultyColor = (level) => {
    const l = level?.toLowerCase();
    switch (l) {
      case "easy":
        return "text-emerald-700 bg-emerald-100/50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20";
      case "medium":
        return "text-amber-700 bg-amber-100/50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20";
      case "hard":
        return "text-rose-700 bg-rose-100/50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  /* ---------------- MASTERY BADGE ---------------- */
  const getMasteryBadge = (topic) => {
    if (!topic) return null;
    const mastery = masteryMap[topic.toLowerCase()];
    if (mastery === undefined) return null;

    let badgeStyles = "bg-rose-50 text-rose-600 border-rose-100"; // Low
    if (mastery >= 85) badgeStyles = "bg-emerald-50 text-emerald-600 border-emerald-100"; // High
    else if (mastery >= 70) badgeStyles = "bg-amber-50 text-amber-600 border-amber-100"; // Medium

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${badgeStyles}`}>
        {Math.round(mastery)}% Mastery
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet>
          <title>Browse Lessons - AI Math Tutor</title>
        </Helmet>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lesson Library</h1>
          <p className="text-muted-foreground mt-2">
            Explore topics and improve your math skills with personalized guidance.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              const isRecommended = lesson.id === recommendedId;

              return (
                <Card
                  key={lesson.id}
                  className={`flex flex-col h-full border-2 transition-all duration-300 rounded-3xl hover:-translate-y-1 hover:shadow-xl ${
                    isRecommended ? "border-primary shadow-md bg-white" : "border-slate-100 bg-white"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                      <div className="flex gap-2 items-center">
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${getDifficultyColor(
                            lesson.difficulty_level
                          )}`}
                        >
                          {lesson.difficulty_level}
                        </span>

                        {isRecommended && (
                          <Badge
                            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 border-none px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider"
                          >
                            <Sparkles className="h-3 w-3" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      {getMasteryBadge(lesson.topic)}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl font-bold text-slate-900">
                      {lesson.title}
                    </CardTitle>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                      {lesson.topic}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {lesson.description ||
                        "Learn the fundamentals of this topic with interactive examples and practice questions."}
                    </p>
                  </CardContent>

                  <CardFooter className="mt-auto pt-6 px-6 pb-6">
                    <Button
                      className={`w-full py-6 rounded-xl font-bold transition-all ${
                        isRecommended 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" 
                        : "bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50"
                      }`}
                      asChild
                    >
                      <Link to={`/quiz/${lesson.id}`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Lesson Quiz
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonBrowser;