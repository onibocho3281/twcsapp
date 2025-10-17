// App.js
import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout, auth } from "./firebase";
import {
  fetchSheets,
  createSheetFromTemplate,
  fetchSheetValues,
  updateSheetValues,
} from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [generalTabData, setGeneralTabData] = useState({});
  const [editableData, setEditableData] = useState({}); // user inputs

  // --- Sign in handler ---
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setAccessToken(result.accessToken);
      console.log("Logged in:", result.user);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  // --- Sign out handler ---
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken("");
    setSheets([]);
    setSelectedSheetId("");
    setGeneralTabData({});
    setEditableData({});
  };

  // --- Fetch Witcher Character Sheets ---
  const loadSheets = async () => {
    if (!accessToken) return;
    try {
      const fetchedSheets = await fetchSheets(accessToken);
      setSheets(fetchedSheets);
    } catch (error) {
      console.error("❌ Error fetching sheets:", error);
    }
  };

  // --- Fetch General tab for selected sheet ---
  const loadGeneralTab = async (sheetId) => {
    if (!accessToken) return;
    try {
      const values = await fetchSheetValues(accessToken, sheetId, "General");
      setGeneralTabData(values);

      // Initialize editableData for the front-end
      setEditableData({ ...values });
    } catch (error) {
      console.error("❌ Error fetching General tab:", error);
    }
  };

  // --- Handle dropdown change ---
  const handleSheetSelect = (e) => {
    const sheetId = e.target.value;
    setSelectedSheetId(sheetId);
    loadGeneralTab(sheetId);
  };

  // --- Handle input change ---
  const handleInputChange = (key, value) => {
    setEditableData((prev) => ({ ...prev, [key]: value }));
  };

  // --- Save edited data back to Google Sheet ---
  const handleSave = async () => {
    if (!accessToken || !selectedSheetId) return;
    try {
      await updateSheetValues(accessToken, selectedSheetId, "General", editableData);
      alert("Sheet updated successfully!");
    } catch (error) {
      console.error("❌ Error updating sheet:", error);
      alert("Failed to update sheet.");
    }
  };

  // --- Create new character sheet ---
  const handleNewCharacter = async () => {
    if (!accessToken) return;
    const name = prompt("Enter character name:");
    if (!name) return;
    try {
      const newSheetId = await createSheetFromTemplate(accessToken, name);
      setSheets((prev) => [...prev, { id: newSheetId, name }]);
      setSelectedSheetId(newSheetId);
      loadGeneralTab(newSheetId);
    } catch (error) {
      console.error("❌ Error creating sheet:", error);
    }
  };

  // Load sheets after login
  useEffect(() => {
    if (accessToken) loadSheets();
  }, [accessToken]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>
          <hr />
          <button onClick={handleNewCharacter}>New Character Sheet</button>
          <div style={{ marginTop: "1rem" }}>
            <label>Select Character Sheet: </label>
            <select value={selectedSheetId} onChange={handleSheetSelect}>
              <option value="">--Choose a sheet--</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSheetId && (
            <div style={{ marginTop: "2rem" }}>
              <h2>General Tab</h2>
              {Object.keys(generalTabData).map((key) => (
                <div key={key} style={{ marginBottom: "0.5rem" }}>
                  <label>{key}: </label>
                  <input
                    type="text"
                    value={editableData[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />
                </div>
              ))}
              <button onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
