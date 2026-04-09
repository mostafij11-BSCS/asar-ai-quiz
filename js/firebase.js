import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5a6t3Do98JIwfI_LeZVjjffIQiiU3iFM",
  authDomain: "gen-lang-client-0610922790.firebaseapp.com",
  projectId: "gen-lang-client-0610922790",
  storageBucket: "gen-lang-client-0610922790.firebasestorage.app",
  messagingSenderId: "1076942900643",
  appId: "1:1076942900643:web:de30967e7948a174af9e16",
  databaseId: "ai-studio-06e9dece-1365-4706-a354-58769ad3b05a"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
