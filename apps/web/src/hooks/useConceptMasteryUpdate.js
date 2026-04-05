import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc
} from "firebase/firestore";
import { toast } from "sonner";

export const useConceptMasteryUpdate = (currentUser) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMastery = async (conceptName, practiceScore) => {
    if (!currentUser) return null;

    setIsUpdating(true);

    try {
      const masteryQuery = query(
        collection(db, "concept_mastery"),
        where("student_id", "==", currentUser.uid),
        where("concept_name", "==", conceptName)
      );

      const masterySnapshot = await getDocs(masteryQuery);

      let newMastery = practiceScore;
      let record = null;

      if (!masterySnapshot.empty) {
        const recordDoc = masterySnapshot.docs[0];
        record = recordDoc.data();

        newMastery =
          record.mastery_percentage * 0.7 + practiceScore * 0.3;

        await updateDoc(doc(db, "concept_mastery", recordDoc.id), {
          mastery_percentage: newMastery,
          attempt_count: record.attempt_count + 1,
          streak_count: practiceScore >= 80 ? record.streak_count + 1 : 0
        });
      } else {
        await addDoc(collection(db, "concept_mastery"), {
          student_id: currentUser.uid,
          concept_name: conceptName,
          mastery_percentage: newMastery,
          attempt_count: 1,
          streak_count: practiceScore >= 80 ? 1 : 0
        });
      }

      return {
        previousMastery: record ? record.mastery_percentage : 0,
        newMastery,
        improved: newMastery > (record ? record.mastery_percentage : 0)
      };
    } catch (error) {
      console.error("Error updating concept mastery:", error);
      toast.error("Failed to update mastery progress.");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateMastery, isUpdating };
};