// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyDV_HoPmrCNww5fsSjJJMA3GVufauqK69g",
  authDomain: "twcsapp.firebaseapp.com",
  projectId: "twcsapp",
  storageBucket: "twcsapp.firebasestorage.app",
  messagingSenderId: "311095679563",
  appId: "1:311095679563:web:5ff0bee71a9d7be52ccbce",
  measurementId: "G-M0FF3J9TVL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Google Provider with Drive & Sheets scopes ---
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

// --- Sign-in function ---
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log("✅ Signed in user:", result.user);
    return {
      user: result.user,
      accessToken: credential?.accessToken || null,
    };
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    throw error;
  }
};

// --- Sign-out function ---
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("👋 Signed out");
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
};

// Export auth and provider for optional direct use
export { auth, provider };
