// App.js
import React, { useState, useEffect } from "react";
import { signInWithGoogle, logout, auth, getOAuthToken } from "./firebase";
import { listCharacterSheets, createCharacterSheet, fetchSheetData } from "./DriveSheetsAPI";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [sheetData, setSheetData] = useState({});

  // Listen for auth state
  useEffect(() => {
    auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const idToken = await getOAuthToken();
        setToken(idToken);
        fetchSheets(idToken);
      } else {
        setUser(null);
        setToken(null);
        setSheets([]);
        setSheetData({});
      }
    });
  }, []);

  const fetchSheets = async (accessToken) => {
    try {
      const files = await listCharacterSheets(accessToken);
      setSheets(files);
    } catch (err) {
      console.error("❌ Error fetching sheets:", err);
    }
  };

  const handleNewSheet = async () => {
    if (!token || !user) {
      alert("Please sign in first");
      return;
    }
    const name = prompt("Enter character name:");
    if (!name) return;
    try {
      const newSheet = await createCharacterSheet(name, token);
      setSheets((prev) => [...prev, newSheet]);
      setSelectedSheetId(newSheet.id);
      fetchData(newSheet.id);
    } catch (err) {
      console.error("❌ Error creating sheet:", err);
    }
  };

  const fetchData = async (sheetId) => {
    if (!token) return;
    try {
      const data = await fetchSheetData(sheetId, token);
      setSheetData(data);
    } catch (err) {
      console.error("❌ Error fetching sheet data:", err);
    }
  };

  const handleSheetChange = (e) => {
    const sheetId = e.target.value;
    setSelectedSheetId(sheetId);
    fetchData(sheetId);
  };

  const handleInputChange = (rowKey, colKey, value) => {
    setSheetData((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [colKey]: value },
    }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>The Witcher TTRPG Character Sheet</h1>
        {!user ? (
          <button onClick={signInWithGoogle} className="auth-btn">Sign in with Google</button>
        ) : (
          <button onClick={logout} className="auth-btn">Sign out</button>
        )}
      </header>

      {user && (
        <section className="sheet-controls">
          <button onClick={handleNewSheet} className="new-sheet-btn">New Character Sheet</button>

          <select
            value={selectedSheetId}
            onChange={handleSheetChange}
            className="sheet-dropdown"
          >
            <option value="">Select Character Sheet</option>
            {sheets.map((sheet) => (
              <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
            ))}
          </select>
        </section>
      )}

      {selectedSheetId && (
        <section className="sheet-display">
          <h2>General</h2>
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Title (Protected)</th>
                <th>Editable</th>
                <th>Formula Output</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(sheetData).map((rowKey) => (
                <tr key={rowKey}>
                  <td>{sheetData[rowKey].protected}</td>
                  <td>
                    <input
                      type="text"
                      value={sheetData[rowKey].editable || ""}
                      onChange={(e) => handleInputChange(rowKey, "editable", e.target.value)}
                    />
                  </td>
                  <td>{sheetData[rowKey].formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default App;
