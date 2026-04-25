import express from "express";
import { generateQuiz } from "../utils/aiTutor.js";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {

    const { topic } = req.body;

    const quiz = await generateQuiz(topic);

    res.json({
      concept_being_tested: topic,
      questions: quiz
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Quiz generation failed"
    });

  }
});

export default router;