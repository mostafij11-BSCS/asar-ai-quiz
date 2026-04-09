// ── Quiz Engine: Gemini AI + Firestore ──
import { db } from "./firebase.js";
import {
  doc, collection, addDoc, updateDoc,
  increment, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const GEMINI_API_KEY = "AIzaSyDonA0YOrAC_WPLnAWFChlCxcrEIK1z70c"; // 🔑 Replace this
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$${GEMINI_API_KEY}`;

// ── Generate MCQs via Gemini ──
export async function generateQuestions(cls, subject, chapter, count = 10) {
  const prompt = `
You are an expert school teacher. Generate exactly $${count} multiple choice questions (MCQs) for:
- Class: $${cls}
- Subject: $${subject}
- Chapter: $${chapter}

Format your response as a valid JSON array ONLY, no explanation, no markdown:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Each question must have exactly 4 options
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Questions must be age-appropriate for $${cls} students
- Mix easy, medium, and hard questions
- Do NOT include any text outside the JSON array
`;

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
    })
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  // Clean and parse JSON
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ── Calculate XP based on score ──
export function calculateXP(correct, total, timeTaken) {
  const base = correct * 10;
  const bonus = timeTaken < 30 ? 5 : timeTaken < 60 ? 2 : 0; // speed bonus per question
  return base + (correct === total ? 20 : 0) + bonus; // perfect score bonus
}

// ── Save quiz attempt to Firestore ──
export async function saveAttempt(userId, { cls, subject, chapter, score, total, xpEarned, timeTaken, answers }) {
  // Save attempt sub-collection
  await addDoc(collection(db, "users", userId, "quizAttempts"), {
    class: cls, subject, chapter,
    score, total, xpEarned, timeTaken,
    answers, createdAt: serverTimestamp()
  });

  // Update user XP
  await updateDoc(doc(db, "users", userId), {
    xp: increment(xpEarned)
  });

  // Check and award achievements
  await checkAchievements(userId, score, total);
}

// ── Achievement checker ──
async function checkAchievements(userId, score, total) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  const user = snap.data();
  const achievements = user.achievements || [];
  const newAch = [];

  if (score === total && !achievements.includes("perfect_score"))
    newAch.push("perfect_score");
  if (user.xp >= 100 && !achievements.includes("xp_100"))
    newAch.push("xp_100");
  if (user.xp >= 500 && !achievements.includes("xp_500"))
    newAch.push("xp_500");

  if (newAch.length > 0) {
    await updateDoc(userRef, {
      achievements: [...achievements, ...newAch]
    });
  }
}
