// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create provider with required scopes
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive"); // full Drive access
provider.addScope("https://www.googleapis.com/auth/spreadsheets"); // full Sheets access

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // Extract the OAuth access token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    console.log("✅ Signed in user:", result.user);
    console.log("🔑 OAuth token:", accessToken);
    return { user: result.user, accessToken };
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    console.log("👋 Signed out");
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
};

export { auth, provider };
