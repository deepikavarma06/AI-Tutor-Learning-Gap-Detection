import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const progress = [
  {
    userId: "student_001",
    lessonId: "alg_01",
    accuracy: 40,
    completed: false,
    recommended: false
  },
  {
    userId: "student_001",
    lessonId: "dec_01",
    accuracy: 70,
    completed: true,
    recommended: true
  },
  {
    userId: "student_001",
    lessonId: "frac_01",
    accuracy: 30,
    completed: false,
    recommended: false
  }
];

async function seedUserProgress() {
  try {
    for (let item of progress) {
      await addDoc(collection(db, "userProgress"), item);
    }
    console.log("User progress added");
  } catch (error) {
    console.error("Error:", error);
  }
}

seedUserProgress();