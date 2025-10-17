// src/App.js
import React, { useState } from "react";
import { signInWithGoogle, logout } from "./firebase";
import { copyTemplateSheet } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetUrl, setSheetUrl] = useState(null);

  const handleLogin = async () => {
    try {
      setError(null);
      const { user, token } = await signInWithGoogle();
      setUser(user);
      setAccessToken(token);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Check console for details.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSheetUrl(null);
  };

  const handleNewCharacter = async () => {
    if (!accessToken) return setError("Missing access token");
    setLoading(true);
    setError(null);
    try {
      const newSheetId = await copyTemplateSheet(accessToken);
      const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;
      setSheetUrl(newSheetUrl);
      window.open(newSheetUrl, "_blank");
    } catch (err) {
      console.error("Error creating sheet:", err);
      setError(`Error creating sheet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px", fontFamily: "sans-serif" }}>
      <h1>🧙 Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
          Sign in with Google
        </button>
      ) : (
        <>
          <p>Signed in as {user.displayName}</p>
          <button onClick={handleLogout} style={{ marginRight: "10px" }}>
            Logout
          </button>
          <button onClick={handleNewCharacter} disabled={loading}>
            {loading ? "Creating..." : "New Character"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {sheetUrl && (
        <p>
          <a href={sheetUrl} target="_blank" rel="noreferrer">
            Open New Sheet
          </a>
        </p>
      )}
    </div>
  );
}

export default App;
