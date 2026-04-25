import { db } from "../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

import lessons from "../data/lessons";
import quizzes from "../data/quizzes";

export async function seedFirestore() {
  try {
    console.log("Uploading lessons...");

    for (const lesson of lessons) {
      await setDoc(doc(db, "lessons", lesson.id), lesson);
    }

    console.log("Lessons uploaded");

    console.log("Uploading quizzes...");

    for (const quiz of quizzes) {
      await setDoc(doc(db, "quizzes", quiz.id), quiz);
    }

    console.log("Quizzes uploaded");

    alert("Database seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}