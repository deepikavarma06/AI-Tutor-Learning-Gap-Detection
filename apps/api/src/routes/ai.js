import { Router } from "express";
import { analyzeWeakConcepts } from "../utils/aiTutor.js";

const router = Router();

router.post("/analyze", async (req, res) => {

  const { answers } = req.body;

  try {

    const analysis = await analyzeWeakConcepts(answers);

    res.json({
      recommendation: analysis
    });

  } catch (error) {

    res.status(500).json({
      error: "Analysis failed"
    });

  }

});

export default router;