const BASE_URL = "http://localhost:3001";

export async function generateQuiz(topic) {
  const res = await fetch(`${BASE_URL}/quiz/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ topic })
  });

  return res.json();
}

export async function analyzeAnswers(answers) {
  const res = await fetch(`${BASE_URL}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answers })
  });

  return res.json();
}