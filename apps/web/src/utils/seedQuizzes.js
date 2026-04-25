import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import quizzes from "../data/quizzes";

export async function seedQuizzes() {
  try {
    console.log("Uploading quizzes...");

    for (const quiz of quizzes) {

      // skip if id missing
      if (!quiz.id) {
        console.warn("Skipping quiz with missing id:", quiz);
        continue;
      }

      await setDoc(doc(db, "quizzes", quiz.id), quiz);

      console.log("Uploaded:", quiz.id);
    }

    console.log("All quizzes uploaded successfully!");
    alert("Quizzes seeded successfully!");

  } catch (error) {
    console.error("Quiz seed error:", error);
  }
}