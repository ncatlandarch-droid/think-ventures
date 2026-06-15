/* ============================================================
   THINK! VENTURES -- Firebase Configuration
   Static site integration using Firebase Compat SDK
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCRqSV1SV1CQIUx74g9PpOdyA1IpLjkISk",
  authDomain: "think--ventures.firebaseapp.com",
  projectId: "think--ventures",
  storageBucket: "think--ventures.firebasestorage.app",
  messagingSenderId: "627781114340",
  appId: "1:627781114340:web:b6fde873cfa00970904ff1",
  measurementId: "G-B6789Q2W3P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;

// Admin email(s) -- users with these emails get admin role on first login
const ADMIN_EMAILS = ['chris@think-ventures.org'];

console.log('[Firebase] Initialized for Think! Ventures');
