import React, { useState, useEffect } from "react";
import { signInWithGoogle, signOutUser, getOAuthToken } from "./firebase";
import {
  listCharacterSheets,
  createCharacterSheet,
  getGeneralTabData,
  updateCellValue,
} from "./DriveSheetsAPI";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      const oauthToken = await getOAuthToken();
      setToken(oauthToken);
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setToken(null);
    setSheets([]);
    setSelectedSheet("");
    setSheetData([]);
  };

  const loadSheets = async () => {
    if (!token) return;
    try {
      const files = await listCharacterSheets(token);
      setSheets(files);
    } catch (err) {
      console.error("❌ Error fetching sheets:", err);
    }
  };

  const loadSheetData = async (sheetId) => {
    if (!token || !sheetId) return;
    setLoading(true);
    try {
      const data = await getGeneralTabData(sheetId, token);
      setSheetData(data);
    } catch (err) {
      console.error("❌ Error fetching sheet data:", err);
    }
    setLoading(false);
  };

  const handleSelectSheet = (e) => {
    const id = e.target.value;
    setSelectedSheet(id);
    loadSheetData(id);
  };

  const handleCreateSheet = async () => {
    if (!token) return alert("Sign in first!");
    try {
      const name = prompt("Enter new character name:");
      if (!name) return;
      const newSheet = await createCharacterSheet(name, token);
      await loadSheets();
      setSelectedSheet(newSheet.id);
      await loadSheetData(newSheet.id);
    } catch (err) {
      console.error("❌ Error creating sheet:", err);
    }
  };

  const handleInputChange = async (rowIndex, value) => {
    if (!token || !selectedSheet) return;
    try {
      const range = `General!L${rowIndex + 1}`;
      await updateCellValue(selectedSheet, range, value, token);
      const updated = [...sheetData];
      updated[rowIndex][1] = value;
      setSheetData(updated);
    } catch (err) {
      console.error("❌ Error updating cell:", err);
    }
  };

  useEffect(() => {
    if (token) loadSheets();
  }, [token]);

  return (
    <div className="app-container">
      <h1 className="app-title">⚔️ Witcher Character Manager</h1>

      {!user ? (
        <button className="btn-primary" onClick={handleSignIn}>
          Sign in with Google
        </button>
      ) : (
        <>
          <div className="top-bar">
            <select
              value={selectedSheet}
              onChange={handleSelectSheet}
              className="dropdown"
            >
              <option value="">Select Character</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>

            <button className="btn-red" onClick={handleCreateSheet}>
              + New Character
            </button>

            <button className="btn-grey" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          {loading ? (
            <p className="loading">Loading...</p>
          ) : sheetData.length > 0 ? (
            <div className="sheet-container">
              {sheetData.map((row, i) => {
                const label = row[0];
                const editable = row[1] || "";
                const formula = row[2] || "";
                if (!label) return null;
                return (
                  <div key={i} className="sheet-row">
                    <label>{label}</label>
                    <input
                      value={editable}
                      onChange={(e) => handleInputChange(i, e.target.value)}
                    />
                    <div className="formula">{formula}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-selection">
              No character selected. Choose one above.
            </p>
          )}
        </>
      )}
    </div>
  );
}
