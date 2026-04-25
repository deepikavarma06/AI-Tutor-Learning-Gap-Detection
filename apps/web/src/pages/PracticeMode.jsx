import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";

import { getRecommendedLesson } from '@/lib/LessonRecommendationEngine';
import lessonsData from "@/data/math_topics.json";

import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet";
import { Target, ArrowRight, Dumbbell, Sparkles } from "lucide-react";

import DashboardHeader from "@/components/DashboardHeader";

const PracticeMode = () => {

  const { currentUser } = useAuth();

  const [weakConcepts, setWeakConcepts] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchPracticeData = async () => {

      try {
        setLoading(true);

        const allConceptsQuery = query(
          collection(db, "concepts"),
          where("student_id", "==", currentUser.uid)
        );

        const snapshot = await getDocs(allConceptsQuery);
        const allMasteryData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const weakOnes = allMasteryData
          .filter(c => c.mastery_percentage < 70)
          .sort((a, b) => a.mastery_percentage - b.mastery_percentage);
        
        setWeakConcepts(weakOnes);

        const recResult = getRecommendedLesson(allMasteryData, lessonsData);
        if (recResult && recResult.lesson) {
          setRecommended(recResult.lesson);
        } else if (lessonsData.length > 0) {
          setRecommended(lessonsData[0]); // Fallback to first lesson
        }

      }

      catch (error) {

        console.error("Error fetching weak concepts:", error);
        if (lessonsData.length > 0) setRecommended(lessonsData[0]);
      }finally {
        setLoading(false);
      }

    };

    if (currentUser) {
      fetchPracticeData();
    }

  }, [currentUser]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }
  
  return (
    <>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Helmet><title>Practice Mode - AI Math Tutor</title></Helmet>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <>
            <DashboardHeader />
            <div>
              {/* dashboard content */}
            </div>
          </>
        </div>

        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
            <Dumbbell className="h-8 w-8"/>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Targeted Practice</h1>
          <p className="text-lg text-muted-foreground">
            {weakConcepts.length > 0 
              ? "Focus on these areas to bridge your learning gaps." 
              : "You've mastered your current topics! Start your next challenge below."}
          </p>
        </div>

        <div className="space-y-10">
          {/* --- SECTION 1: AI RECOMMENDED LESSON --- */}
          {recommended && (
            <Card className="border-indigo-200 bg-white shadow-lg overflow-hidden relative border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Sparkles className="h-5 w-5"/>
                  <span className="text-xs font-bold uppercase tracking-widest">AI Recommended Next Step</span>
                </div>
                <CardTitle className="text-2xl text-slate-900">{recommended.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <p className="text-slate-500 max-w-lg">{recommended.description}</p>
                 <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 py-6 px-8 rounded-xl shrink-0">
                   <Link to={`/quiz/${recommended.id}`} state={{ topicName: recommended.title }}>
                     Start Quiz <ArrowRight className="ml-2 h-4 w-4"/>
                   </Link>
                 </Button>
              </CardContent>
            </Card>
          )}
          {/* --- SECTION 2: WEAK CONCEPTS (GAP DETECTION) --- */}
          {weakConcepts.length > 0 && (
            <div className="pt-10 border-t border-slate-200">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <Target className="h-5 w-5 text-rose-500" />
                Areas for Improvement
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {weakConcepts.map((concept) => {
                  const lessonInfo = lessonsData.find(l => l.id === concept.concept_name);
                  const displayName = lessonInfo ? lessonInfo.title : concept.concept_name;

                  return (
                    <Card key={concept.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded">Focus Required</span>
                          <span className="font-bold text-slate-900">{Math.round(concept.mastery_percentage)}%</span>
                        </div>
                        <CardTitle className="text-lg">{concept.concept_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={concept.mastery_percentage} className="h-2 mb-6" indicatorColor="bg-rose-500" />
                        <Button variant="outline" className="w-full py-5 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold" asChild>
                          <Link to={`/quiz/${concept.concept_name}`} state={{ topicName: displayName }}>
                            Resume Practice
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PracticeMode;