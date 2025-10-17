// App.js
import React, { useState } from "react";
import { signInWithGoogle, logout } from "./firebase";

const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Sign-in handler ---
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setAccessToken(result.accessToken);
    } catch (error) {
      console.error("Sign-in failed:", error);
      alert("Sign-in failed. Check console for details.");
    }
  };

  // --- Sign-out handler ---
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // --- Create new character sheet ---
  const handleCreateSheet = async () => {
    if (!accessToken) return alert("No Google Auth token. Sign in first.");

    setLoading(true);
    try {
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
}

export default App;
