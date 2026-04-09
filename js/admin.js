// ── Admin: Manage Questions, Students, Events ──
import { db } from "./firebase.js";
import {
  collection, doc, addDoc, setDoc, getDocs,
  deleteDoc, updateDoc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getSession } from "./auth.js";

const ADMIN_EMAIL = "afrajahme2@gmail.com";

export function isAdmin() {
  const user = getSession();
  return user && (user.role === "admin" || user.studentId === "ADMIN");
}

export function requireAdmin() {
  if (!isAdmin()) { window.location.href = "index.html"; }
}

// ── Questions ──
export async function addQuestion(data) {
  return await addDoc(collection(db, "questions"), {
    ...data, createdAt: serverTimestamp()
  });
}

export async function getQuestions() {
  const snap = await getDocs(collection(db, "questions"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteQuestion(id) {
  await deleteDoc(doc(db, "questions", id));
}

// ── Admin Students (bulk upload) ──
export async function uploadStudents(students) {
  const results = [];
  for (const s of students) {
    await setDoc(doc(db, "admin_students", s.studentId), {
      ...s, createdAt: new Date().toISOString()
    });
    results.push(s.studentId);
  }
  return results;
}

export async function getAdminStudents() {
  const snap = await getDocs(collection(db, "admin_students"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Events ──
export async function addEvent(data) {
  return await addDoc(collection(db, "events"), {
    ...data, createdAt: serverTimestamp()
  });
}

export async function getEvents() {
  const q = query(collection(db, "events"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}
