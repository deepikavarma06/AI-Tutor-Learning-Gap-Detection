import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getRecommendedLesson } from "@/lib/LessonRecommendationEngine";

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

        const masteryQuery = query(
          collection(db, "concept_mastery"),
          where("student_id", "==", currentUser.uid)
        );

        const masterySnapshot = await getDocs(masteryQuery);

        const masteryData = masterySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


        /* ---------------- STORE LESSONS ---------------- */

        setLessons(lessonsData);


        /* ---------------- BUILD MASTERY MAP ---------------- */

        const map = {};

        masteryData.forEach(m => {
          map[m.concept_name.toLowerCase()] = m.mastery_percentage;
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

      }

      catch (error) {

        console.error("Error fetching lessons data:", error);

      }

      finally {

        setLoading(false);

      }

    };

    if (currentUser) {
      fetchData();
    }

  }, [currentUser]);



  /* ---------------- DIFFICULTY COLOR ---------------- */

  const getDifficultyColor = (level) => {

    switch (level) {

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

    const mastery = masteryMap[topic.toLowerCase()];

    if (mastery === undefined) return null;

    let badgeClass = "mastery-low";

    if (mastery >= 85) badgeClass = "mastery-high";
    else if (mastery >= 70) badgeClass = "mastery-medium";

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-semibold border ${badgeClass}`}
      >
        {Math.round(mastery)}% Mastery
      </span>
    );
  };



  return (

    <div className="container mx-auto px-4 py-8 max-w-7xl">

      <Helmet>
        <title>Browse Lessons - AI Math Tutor</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lesson Library</h1>
        <p className="text-muted-foreground mt-2">
          Explore topics and improve your math skills.
        </p>
      </div>


      {loading ? (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-56 rounded-2xl"/>
          ))}

        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {lessons.map((lesson) => {

            const isRecommended = lesson.id === recommendedId;

            return (

              <Card
                key={lesson.id}
                className={`flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isRecommended ? "ring-2 ring-primary shadow-md" : ""
                }`}
              >

                <CardHeader className="pb-4">

                  <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">

                    <div className="flex gap-2 items-center">

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${getDifficultyColor(
                          lesson.difficulty_level
                        )}`}
                      >
                        {lesson.difficulty_level}
                      </span>

                      {isRecommended && (

                        <Badge
                          variant="default"
                          className="bg-primary text-primary-foreground flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3"/>
                          Recommended
                        </Badge>

                      )}

                    </div>

                    {getMasteryBadge(lesson.topic)}

                  </div>

                  <CardTitle className="line-clamp-2 text-xl">
                    {lesson.title}
                  </CardTitle>

                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    {lesson.topic}
                  </p>

                </CardHeader>



                <CardContent className="flex-grow">

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {lesson.description ||
                      "Learn the fundamentals of this topic with interactive examples and practice questions."}
                  </p>

                </CardContent>



                <CardFooter className="mt-auto pt-4 border-t bg-muted/10">

                  <Button
                    className="w-full"
                    asChild
                    variant={isRecommended ? "default" : "outline"}
                  >

                    <Link to={`/quiz/${lesson.id}`}>

                      <BookOpen className="mr-2 h-4 w-4"/>

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

  );

};

export default LessonBrowser;