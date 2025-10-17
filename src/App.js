// App.js
import React, { useState, useEffect } from "react";
import { auth, signInWithGoogle, logout } from "./firebase";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Get Google OAuth access token
        const token = await getGoogleOAuthToken(currentUser);
        setAccessToken(token);
      } else {
        setAccessToken(null);
      }
    });
    return unsubscribe;
  }, []);

  // Helper: get Google OAuth access token from currentUser
  const getGoogleOAuthToken = async (currentUser) => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive");
    provider.addScope("https://www.googleapis.com/auth/spreadsheets");

    // Reauthenticate silently to get token
    const result = await auth.signInWithPopup(provider).catch((err) => {
      console.error("Error fetching OAuth token:", err);
      return null;
    });

    if (!result) return null;

    const credential = GoogleAuthProvider.credentialFromResult(result);
    return credential?.accessToken || null;
  };

  const handleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      console.log("Logged in:", loggedUser);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Create a new character sheet by copying the template
  const handleCreateSheet = async () => {
    if (!accessToken) return alert("No Google OAuth token. Sign in first.");

    setLoading(true);
    try {
      // Your template sheet ID here
      const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ";

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${TEMPLATE_ID}/copy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `${user.displayName} - Witcher Character Sheet`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error creating sheet: ${await response.text()}`);
      }

      const newSheet = await response.json();
      window.open(`https://docs.google.com/spreadsheets/d/${newSheet.id}`, "_blank");
    } catch (error) {
      console.error("❌ Error creating sheet:", error);
      alert("Failed to create sheet. Check console.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>
          <br />
          <br />
          <button onClick={handleCreateSheet} disabled={loading}>
            {loading ? "Creating..." : "New Character Sheet"}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
