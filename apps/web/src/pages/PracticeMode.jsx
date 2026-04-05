import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";

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
import { Target, ArrowRight, Dumbbell } from "lucide-react";

const PracticeMode = () => {

  const { currentUser } = useAuth();

  const [weakConcepts, setWeakConcepts] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const fetchWeakConcepts = async () => {

      try {

        const conceptsQuery = query(
          collection(db, "concept_mastery"),
          where("student_id", "==", currentUser.uid),
          where("mastery_percentage", "<", 70),
          orderBy("mastery_percentage", "asc")
        );

        const snapshot = await getDocs(conceptsQuery);

        const concepts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setWeakConcepts(concepts);

      }

      catch (error) {

        console.error("Error fetching weak concepts:", error);

      }

      finally {

        setLoading(false);

      }

    };

    if (currentUser) {
      fetchWeakConcepts();
    }

  }, [currentUser]);



  return (

    <div className="container mx-auto px-4 py-12 max-w-5xl">

      <Helmet>
        <title>Practice Mode - AI Math Tutor</title>
      </Helmet>



      <div className="mb-10 text-center max-w-2xl mx-auto">

        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
          <Dumbbell className="h-8 w-8"/>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Targeted Practice
        </h1>

        <p className="text-lg text-muted-foreground">
          Focus on the areas where you need the most improvement. These
          concepts have been identified by our AI as your best opportunities
          for growth.
        </p>

      </div>



      {loading ? (

        <div className="grid md:grid-cols-2 gap-6">

          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-48 rounded-2xl"/>
          ))}

        </div>

      ) : weakConcepts.length > 0 ? (

        <div className="grid md:grid-cols-2 gap-6">

          {weakConcepts.map((concept) => (

            <Card
              key={concept.id}
              className="flex flex-col h-full border-rose-200 dark:border-rose-900/50 shadow-sm hover:shadow-md transition-all"
            >

              <CardHeader className="pb-4">

                <div className="flex justify-between items-start mb-2">

                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">

                    <Target className="h-5 w-5"/>

                    <span className="text-sm font-semibold uppercase tracking-wider">
                      Focus Area
                    </span>

                  </div>

                  <span className="text-2xl font-bold text-foreground">
                    {Math.round(concept.mastery_percentage)}%
                  </span>

                </div>

                <CardTitle className="text-2xl">
                  {concept.concept_name}
                </CardTitle>

              </CardHeader>



              <CardContent className="flex-grow flex flex-col justify-between space-y-6">

                <div className="space-y-2">

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Current Mastery</span>
                    <span>Goal: 70%+</span>
                  </div>

                  <Progress
                    value={concept.mastery_percentage}
                    className="h-2"
                    indicatorColor="bg-rose-500"
                  />

                </div>



                <Button className="w-full group" size="lg" asChild>

                  <Link to={`/practice/${encodeURIComponent(concept.concept_name)}`}>

                    Start Practice Session

                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>

                  </Link>

                </Button>

              </CardContent>

            </Card>

          ))}

        </div>

      ) : (

        <Card className="text-center py-16 border-dashed bg-muted/30">

          <CardContent>

            <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4 text-emerald-600 dark:text-emerald-400">
              <Target className="h-8 w-8"/>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              You're all caught up!
            </h2>

            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You don't have any weak concepts right now. Keep taking lessons
              to discover new challenges.
            </p>

            <Button asChild>
              <Link to="/lessons">
                Browse Lessons
              </Link>
            </Button>

          </CardContent>

        </Card>

      )}

    </div>

  );

};

export default PracticeMode;