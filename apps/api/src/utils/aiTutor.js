import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateQuiz(topic) {

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `
You are a math quiz generator.

Return ONLY valid JSON.

Format:

[
 {
   "question_id": "q1",
   "question_text": "Question here",
   "options": ["A","B","C","D"],
   "correct_answer_index": 0,
   "explanation": "Short explanation"
 }
]

Rules:
- exactly 5 questions
- 4 options each
- correct_answer_index must be 0–3
- no extra text
`
      },
      {
        role: "user",
        content: `Create a quiz about ${topic}`
      }
    ]
  });

  const raw = completion.choices[0].message.content;

  console.log("AI RAW RESPONSE:", raw);

  const questions = JSON.parse(raw);

  return questions;
}