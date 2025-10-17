// App.js
import React, { useState } from "react";
import { signInWithGoogle, logout } from "./firebase";
import { createSheetFromTemplate } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const { user, accessToken } = await signInWithGoogle();
      setUser(user);
      setAccessToken(accessToken || "");
      setMessage(`Logged in as ${user.displayName}`);
    } catch (error) {
      setMessage("Login failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken("");
    setMessage("Logged out");
  };

  const handleCreateSheet = async () => {
    if (!characterName) {
      setMessage("Please enter a character name");
      return;
    }

    try {
      const sheet = await createSheetFromTemplate(characterName, accessToken);
      setMessage(`Character sheet created: ${sheet.name}`);
      // Optionally, open the new sheet
      window.open(`https://docs.google.com/spreadsheets/d/${sheet.id}`, "_blank");
    } catch (error) {
      setMessage(`Failed to create sheet: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleLogin} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Sign in with Google
        </button>
      ) : (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
            Logout
          </button>

          <div>
            <input
              type="text"
              placeholder="Enter character name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              style={{ padding: "0.5rem", marginRight: "0.5rem" }}
            />
            <button onClick={handleCreateSheet} style={{ padding: "0.5rem 1rem" }}>
              New Character Sheet
            </button>
          </div>
        </>
      )}

      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}
    </div>
  );
}

export default App;
