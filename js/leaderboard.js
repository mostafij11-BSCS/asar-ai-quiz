// ── Leaderboard: Fetch + Render ──
import { db } from "./firebase.js";
import {
  collection, getDocs, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

export async function fetchLeaderboard(limitCount = 20) {
  const q = query(
    collection(db, "users"),
    orderBy("xp", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({ rank: i + 1, ...d.data() }));
}

export function getRankBadge(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#$${rank}`;
}

export function getXPLevel(xp) {
  if (xp >= 1000) return { level: "Master", color: "#a78bfa" };
  if (xp >= 500)  return { level: "Expert", color: "#60a5fa" };
  if (xp >= 200)  return { level: "Advanced", color: "#34d399" };
  if (xp >= 100)  return { level: "Intermediate", color: "#fbbf24" };
  return { level: "Beginner", color: "#94a3b8" };
}
