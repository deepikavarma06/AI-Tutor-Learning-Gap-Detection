import { useState, useEffect } from "react";
import { db } from "@/lib/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { calculateConceptMastery } from "@/lib/ConceptMasteryCalculator.js";

export const useConceptMasterySync = (currentUser) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const attemptsQuery = query(
      collection(db, "quiz_attempts"),
      where("student_id", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(attemptsQuery, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type !== "added") return;

        setIsSyncing(true);

        try {
          const attempt = change.doc.data();

          const masteryData = calculateConceptMastery(attempt);
          if (!masteryData) return;

          const masteryQuery = query(
            collection(db, "concept_mastery"),
            where("student_id", "==", currentUser.uid),
            where("concept_name", "==", masteryData.concept_name)
          );

          const masterySnapshot = await getDocs(masteryQuery);

          const isPerfectScore = masteryData.mastery_percentage === 100;

          if (!masterySnapshot.empty) {
            const recordDoc = masterySnapshot.docs[0];
            const record = recordDoc.data();

            const newAttemptCount = record.attempt_count + 1;

            const newMastery =
              (record.mastery_percentage * record.attempt_count +
                masteryData.mastery_percentage) /
              newAttemptCount;

            const newStreak = isPerfectScore ? record.streak_count + 1 : 0;

            await updateDoc(doc(db, "concept_mastery", recordDoc.id), {
              mastery_percentage: newMastery,
              attempt_count: newAttemptCount,
              streak_count: newStreak
            });
          } else {
            await addDoc(collection(db, "concept_mastery"), {
              student_id: currentUser.uid,
              concept_name: masteryData.concept_name,
              mastery_percentage: masteryData.mastery_percentage,
              attempt_count: 1,
              streak_count: isPerfectScore ? 1 : 0
            });
          }
        } catch (err) {
          console.error("Error syncing concept mastery:", err);
          setSyncError(err);
        } finally {
          setIsSyncing(false);
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { isSyncing, syncError };
};