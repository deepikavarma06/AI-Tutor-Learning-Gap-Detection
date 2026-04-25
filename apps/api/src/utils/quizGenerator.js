import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateQuiz(topic) {

  const prompt = `
Create 5 multiple choice quiz questions for students about ${topic}.

Return JSON format like:

[
 {
   "question": "...",
   "options": ["A","B","C","D"],
   "answer": "..."
 }
]
`;

  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192"
  });

  return response.choices[0].message.content;
}