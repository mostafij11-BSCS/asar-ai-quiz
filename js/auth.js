// ── Auth: Login, Register, Session ──
import { db } from "./firebase.js";
import {
  collection, doc, getDoc, getDocs,
  setDoc, query, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// ── Save session to localStorage ──
export function saveSession(user) {
  localStorage.setItem("asar_user", JSON.stringify(user));
}

// ── Get current session ──
export function getSession() {
  const s = localStorage.getItem("asar_user");
  return s ? JSON.parse(s) : null;
}

// ── Clear session (logout) ──
export function logout() {
  localStorage.removeItem("asar_user");
  window.location.href = "login.html";
}

// ── Require login (redirect if not logged in) ──
export function requireLogin() {
  const user = getSession();
  if (!user) { window.location.href = "login.html"; return null; }
  return user;
}

// ── Hash password (simple SHA-256 via Web Crypto) ──
export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Check if studentId exists in admin_students ──
export async function verifyAdminStudent(studentId, phone) {
  const ref = doc(db, "admin_students", studentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { valid: false, msg: "Student ID not found." };
  const data = snap.data();
  if (data.phone && data.phone !== phone)
    return { valid: false, msg: "Phone number does not match." };
  return { valid: true, data };
}

// ── Register new student ──
export async function registerStudent({ studentId, phone, username, password, name, grade, roll }) {
  // Check username uniqueness
  const uq = query(collection(db, "users"), where("username", "==", username));
  const uSnap = await getDocs(uq);
  if (!uSnap.empty) return { success: false, msg: "Username already taken." };

  // Check if already registered
  const existing = query(collection(db, "users"), where("studentId", "==", studentId));
  const eSnap = await getDocs(existing);
  if (!eSnap.empty) return { success: false, msg: "Student already registered." };

  const uid = studentId + "_" + Date.now();
  const hashedPw = await hashPassword(password);

  const userData = {
    uid, username, name, studentId, grade: grade || "",
    roll: roll || "", phone, password: hashedPw,
    xp: 0, achievements: [], role: "student",
    photoUrl: "", bannerUrl: "", isBanned: false,
    consecutiveWrongAnswers: 0,
    lastUsernameChange: null,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", uid), userData);
  return { success: true, user: userData };
}

// ── Login student ──
export async function loginStudent(username, password) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return { success: false, msg: "Username not found." };

  const user = snap.docs[0].data();
  if (user.isBanned) return { success: false, msg: "Your account has been banned." };

  const hashedPw = await hashPassword(password);
  if (user.password !== hashedPw) return { success: false, msg: "Incorrect password." };

  return { success: true, user };
}
