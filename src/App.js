// App.js
import React, { useState, useEffect } from "react";
import { signInWithGoogle, logout } from "./firebase";
import { createSheetFromTemplate, listUserSheets } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [newName, setNewName] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");

  // Fetch user sheets after login
  const fetchSheets = async (token) => {
    try {
      const files = await listUserSheets(token);
      setSheets(files);
    } catch (error) {
      console.error("❌ Error fetching sheets:", error);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      const { user, accessToken } = await signInWithGoogle();
      setUser(user);
      setAccessToken(accessToken);
      await fetchSheets(accessToken);
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSheets([]);
    setSelectedSheet("");
  };

  // Create new sheet
  const handleCreate = async () => {
    if (!newName.trim()) {
      alert("Please enter a character name!");
      return;
    }
    if (!accessToken) {
      alert("No Google Auth token. Sign in first!");
      return;
    }

    try {
      const sheet = await createSheetFromTemplate(newName, accessToken);
      setSheets((prev) => [...prev, sheet]);
      setNewName("");
      setSelectedSheet(sheet.id);
      console.log("📝 New sheet created:", sheet);
    } catch (error) {
      console.error("❌ Error creating sheet:", error);
      alert("Failed to create sheet. See console.");
    }
  };

  // Handle sheet selection
  const handleSelect = (e) => {
    setSelectedSheet(e.target.value);
    console.log("📂 Selected sheet ID:", e.target.value);
    // Here you could load the sheet data if desired
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheets</h1>

      {!user ? (
        <button onClick={handleLogin} style={{ marginBottom: "1rem" }}>
          Sign in with Google
        </button>
      ) : (
        <>
          <p>Welcome, {user.displayName}!</p>
          <button onClick={handleLogout} style={{ marginBottom: "1rem" }}>
            Logout
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="New character name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={handleCreate} style={{ marginLeft: "0.5rem" }}>
              New Character Sheet
            </button>
          </div>

          <div>
            <label htmlFor="sheets">Your Character Sheets: </label>
            <select
              id="sheets"
              value={selectedSheet}
              onChange={handleSelect}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value="">-- Select a sheet --</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
