// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Firebase config (replace with your actual values or environment variables)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign-in helper returning user and OAuth access token
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken; // OAuth token for Drive/Sheets API
    console.log("✅ Signed in user:", result.user);
    return { user: result.user, accessToken };
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    throw error;
  }
};

// Logout helper
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("👋 Signed out");
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
};

// Export auth and provider if needed
export { auth, provider };
