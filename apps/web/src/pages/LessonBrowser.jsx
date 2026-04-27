import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { BookOpen, PlayCircle, Search, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getRecommendedLesson } from "@/lib/LessonRecommendationEngine";
import lessonsData from "@/data/math_topics.json";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

const LessonBrowser = () => {
  const { currentUser } = useAuth();
  const [masteryRecords, setMasteryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. FETCH MASTERY DATA
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
        setLoading(false);
      }
    };

    if (currentUser) fetchMastery();
  }, [currentUser]);

  // 2. FILTER LOGIC
  const filteredLessons = lessonsData.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. AI RECOMMENDATION
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

  if (loading) return <div className="p-10 text-center font-bold">Loading your curriculum...</div>;

  return (
    <div className="min-h-screen bg-slate-50/30">
      <Helmet><title>Browse Lessons - AI Math Tutor</title></Helmet>
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lesson Library</h1>
            <p className="text-muted-foreground mt-1">Search topics and improve your math skills with AI.</p>
          </div>

          {/* Search Bar UI */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search topics (e.g. Algebra, Calculus)..."
              className="pl-10 py-6 rounded-2xl border-slate-200 focus-visible:ring-indigo-600 shadow-sm bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => {
              const isAIRecommended = lesson.id === recommendedId;

              return (
                <Card
                  key={lesson.id}
                  className={`flex flex-col h-full border-2 transition-all duration-300 rounded-[2rem] hover:-translate-y-1 hover:shadow-xl bg-white overflow-hidden ${
                    isAIRecommended ? "border-indigo-600 ring-4 ring-indigo-50" : "border-slate-100"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex gap-2 items-center mb-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      {isAIRecommended && (
                        <Badge className="bg-indigo-600 text-white flex items-center gap-1 border-none px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" />
                          AI Recommended
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{lesson.title}</CardTitle>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">
                        {lesson.category}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {lesson.description}
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl py-6 font-bold shadow-md shadow-indigo-100">
                      <Link to={`/study/${lesson.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" /> Start Learning 
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl py-6">
                      <Link to={`/quiz/${lesson.id}`} state={{ topic: lesson.title }}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Take Quiz Directly
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-100 inline-block p-4 rounded-full mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">No topics found matching "{searchQuery}"</p>
              <Button 
                variant="link" 
                onClick={() => setSearchQuery("")}
                className="text-indigo-600"
              >
                Clear search and view all lessons
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonBrowser;