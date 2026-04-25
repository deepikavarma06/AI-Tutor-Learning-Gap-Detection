import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const concepts = [
  {
    lessonId: "alg_01",
    title: "Introduction to Algebra",
    explanation: "Algebra uses symbols and letters to represent numbers in equations."
  },
  {
    lessonId: "alg_02",
    title: "Linear Equations",
    explanation: "A linear equation is an equation between two variables that gives a straight line."
  },
  {
    lessonId: "dec_01",
    title: "Decimal Basics",
    explanation: "Decimals represent fractions with denominator powers of 10."
  },
  {
    lessonId: "exp_01",
    title: "Exponents",
    explanation: "Exponents represent repeated multiplication of a number."
  },
  {
    lessonId: "frac_01",
    title: "Fractions",
    explanation: "Fractions represent parts of a whole."
  },
  {
    lessonId: "geo_01",
    title: "Basic Geometry",
    explanation: "Geometry deals with shapes, sizes and properties of space."
  },
  {
    lessonId: "geo_02",
    title: "Angles",
    explanation: "Angles are formed when two lines meet at a point."
  },
  {
    lessonId: "int_01",
    title: "Integers",
    explanation: "Integers include positive numbers, negative numbers and zero."
  },
  {
    lessonId: "per_01",
    title: "Percentages",
    explanation: "Percent means per hundred."
  },
  {
    lessonId: "pro_01",
    title: "Proportions",
    explanation: "A proportion states that two ratios are equal."
  },
  {
    lessonId: "proba_01",
    title: "Probability",
    explanation: "Probability measures the likelihood of an event occurring."
  },
  {
    lessonId: "rat_01",
    title: "Ratios",
    explanation: "A ratio compares two quantities."
  }
];

async function seedConcepts() {
  try {
    for (let concept of concepts) {
      await addDoc(collection(db, "concepts"), concept);
    }
    console.log("Concepts added successfully");
  } catch (error) {
    console.error("Error adding concepts:", error);
  }
}

seedConcepts();