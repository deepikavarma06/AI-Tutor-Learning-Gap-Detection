import { db } from "../lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

import lessons from "../data/lessons";
import quizzes from "../data/quizzes";
import concepts from "../data/concepts";
import userProgress from "../data/userProgress";

export async function seedAllCollections() {
  try {

    /* ---------- LESSONS ---------- */
    console.log("Seeding lessons...");
    for (const lesson of lessons) {
      await setDoc(doc(db, "lessons", lesson.id), lesson);
    }
    console.log("Lessons seeded successfully");



    /* ---------- QUIZZES ---------- */
    console.log("Seeding quizzes...");
    for (const quiz of quizzes) {

      if (quiz.id) {
        await setDoc(doc(db, "quizzes", quiz.id), quiz);
      } else {
        await addDoc(collection(db, "quizzes"), quiz);
      }

    }
    console.log("Quizzes seeded successfully");



    /* ---------- CONCEPTS ---------- */
    console.log("Seeding concepts...");
    for (const concept of concepts) {

      if (concept.id) {
        await setDoc(doc(db, "concepts", concept.id), concept);
      } else {
        await addDoc(collection(db, "concepts"), concept);
      }

    }
    console.log("Concepts seeded successfully");



    /* ---------- USER PROGRESS ---------- */
    console.log("Seeding user progress...");
    for (const progress of userProgress) {

      if (progress.id) {
        await setDoc(doc(db, "userProgress", progress.id), progress);
      } else {
        await addDoc(collection(db, "userProgress"), progress);
      }

    }
    console.log("User progress seeded successfully");


    alert("All collections seeded successfully!");

  } catch (error) {
    console.error("Seeding error:", error);
  }
}