import 'dotenv/config';
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

import adaptiveLesson from "./src/routes/adaptiveLesson.js";
import { generateQuiz } from "./src/utils/aiTutor.js";

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

console.log("Key Check:", process.env.GROQ_API_KEY ? "Loaded" : "MISSING");

const app = express();
// 1. Better CORS configuration to ensure Frontend can talk to Backend
app.use(cors({
  origin: "http://localhost:3000", // Standard React Port
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Tutor Backend Running");
});

app.use("/api/adaptive-lesson", adaptiveLesson);

const PORT = process.env.PORT || 3001;

/* --- CHATBOT API --- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    // 1. Clean the history: Groq ONLY accepts 'user' and 'assistant' roles
    const messages = [
      { 
        role: "system", 
        content: "You are a helpful Math Tutor for CBIT students. Solve doubts step-by-step." 
      }
    ];

    // Add previous messages if they exist and are valid
    if (Array.isArray(history)) {
      history.slice(-5).forEach(msg => {
        if (msg.content && msg.role) {
          messages.push({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: String(msg.content)
          });
        }
      });
    }

    // Add the current user message
    messages.push({ role: "user", content: String(message) });

    // 2. Call Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile", // Use the active model
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I'm stumped. Try asking that again?";
    res.json({ reply });

  } catch (error) {
    // 3. LOOK AT YOUR BACKEND TERMINAL FOR THIS LOG
    console.error("CRITICAL BACKEND ERROR:", error.message);
    
    // Send the actual error message back to the frontend so we can see it
    res.status(500).json({ 
      reply: "Assistant Error: " + error.message 
    });
  }
});

/* --- QUIZ GENERATION API --- */
app.post("/quiz/generate", async (req, res) => {
  const { topic } = req.body;
  try {
    const questions = await generateQuiz(topic);
    const parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;

    res.json({
      concept_being_tested: topic,
      questions: parsedQuestions
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

/* GET version for manual testing in browser */
app.get("/api/quiz", async (req, res) => {
  const topic = req.query.topic || "algebra";
  try {
    const quiz = await generateQuiz(topic);
    const parsedQuiz = typeof quiz === "string" ? JSON.parse(quiz) : quiz;
    res.json({ concept_being_tested: topic, questions: parsedQuiz });
  } catch (error) {
    res.status(500).json({ error: "Quiz generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});