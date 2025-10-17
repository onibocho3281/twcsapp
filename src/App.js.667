// App.js
import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout } from "./firebase";
import { listUserSheets, createSheetFromTemplate } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [newCharName, setNewCharName] = useState("");

  // Fetch user's sheets
  const fetchSheets = async (token) => {
    try {
      const files = await listUserSheets(token);
      setSheets(files);
    } catch (err) {
      console.error("❌ Error fetching sheets:", err);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setAccessToken(result.accessToken);
      await fetchSheets(result.accessToken);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken("");
    setSheets([]);
    setSelectedSheet("");
  };

  const handleCreateSheet = async () => {
    if (!accessToken) {
      alert("Sign in first!");
      return;
    }
    if (!newCharName.trim()) {
      alert("Enter a character name!");
      return;
    }
    try {
      const newSheet = await createSheetFromTemplate(accessToken, newCharName);
      setSheets([...sheets, newSheet]);
      setSelectedSheet(newSheet.id);
      setNewCharName("");
      alert(`Sheet created: ${newSheet.name}`);
    } catch (err) {
      console.error("❌ Error creating sheet:", err);
      alert("Failed to create sheet. Check console.");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleLogin}>Sign in with Google</button>
      ) : (
        <div>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleLogout}>Sign out</button>

          <hr />

          <h2>Create New Character</h2>
          <input
            type="text"
            placeholder="Character Name"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
          />
          <button onClick={handleCreateSheet}>New Character Sheet</button>

          <h2>My Character Sheets</h2>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
          >
            <option value="">-- Select Sheet --</option>
            {sheets.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>
                {sheet.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default App;
