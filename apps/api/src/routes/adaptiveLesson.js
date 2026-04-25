import express from "express";
import { generateQuiz } from "../utils/aiTutor.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const { topic } = req.body;

    const quiz = await generateQuiz(topic);

    res.json({
      success: true,
      questions: quiz
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate quiz"
    });

  }

});

export default router;