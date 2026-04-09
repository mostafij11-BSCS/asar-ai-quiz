// ── Profile: Load + Update ──
import { db, storage } from "./firebase.js";
import {
  doc, getDoc, updateDoc, collection,
  getDocs, orderBy, query
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

export async function loadProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function loadAttempts(uid) {
  const q = query(
    collection(db, "users", uid, "quizAttempts"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function updateUsername(uid, newUsername, lastChange) {
  // Enforce 30-day cooldown
  if (lastChange) {
    const last = new Date(lastChange);
    const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 30) {
      const daysLeft = Math.ceil(30 - diff);
      return { success: false, msg: `You can change username in $${daysLeft} day(s).` };
    }
  }
  await updateDoc(doc(db, "users", uid), {
    username: newUsername,
    lastUsernameChange: new Date().toISOString()
  });
  return { success: true };
}

export async function uploadPhoto(uid, file, type = "photo") {
  const path = `users/$${uid}/$${type}_${Date.now()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  const field = type === "photo" ? "photoUrl" : "bannerUrl";
  await updateDoc(doc(db, "users", uid), { [field]: url });
  return url;
}

export const ACHIEVEMENTS = {
  perfect_score: { icon: "🎯", label: "Perfect Score", desc: "Got 100% in a quiz" },
  xp_100:        { icon: "⚡", label: "XP Milestone 100", desc: "Reached 100 XP" },
  xp_500:        { icon: "🔥", label: "XP Milestone 500", desc: "Reached 500 XP" },
  speed_demon:   { icon: "💨", label: "Speed Demon", desc: "Completed quiz under 60 seconds" },
  first_quiz:    { icon: "🎓", label: "First Quiz", desc: "Completed your first quiz" }
};
