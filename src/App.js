// App.js
import React, { useState } from "react";
import { signInWithGoogle, logout, auth, provider } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [message, setMessage] = useState("");

  const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // your template Google Sheet ID

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result);
      
      // Get Google OAuth access token
      const credential = window.google?.auth?.GoogleAuthProvider
        ? window.google.auth.GoogleAuthProvider.credentialFromResult(result)
        : null;

      const token = result.stsTokenManager?.accessToken; // fallback if using Firebase v10
      if (!token) {
        console.warn("⚠️ No Google OAuth token, using ID token might fail.");
      }
      setAccessToken(token);
      setMessage(`Logged in as ${result.displayName}`);
    } catch (error) {
      console.error("Login failed:", error);
      setMessage("Login failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken("");
    setMessage("Logged out");
  };

  const createNewCharacter = async () => {
    if (!accessToken) {
      setMessage("⚠️ No Google Auth token. Sign in first.");
      return;
    }
    if (!characterName) {
      setMessage("⚠️ Enter a character name first.");
      return;
    }

    try {
      setMessage("Creating new character sheet...");
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${TEMPLATE_ID}/copy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: characterName }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const newSheetId = data.id;
      const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;
      setMessage(`✅ Sheet created! Open it here: ${newSheetUrl}`);
      window.open(newSheetUrl, "_blank");
    } catch (error) {
      console.error("❌ Error creating sheet:", error);
      setMessage(`Error creating sheet: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>
      <p>{message}</p>

      {!user ? (
        <button onClick={handleLogin} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
          Sign in with Google
        </button>
      ) : (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
            Logout
          </button>

          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              placeholder="Enter character name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              style={{ padding: "0.5rem", fontSize: "1rem", width: "100%", marginBottom: "0.5rem" }}
            />
            <button onClick={createNewCharacter} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
              New Character Sheet
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
