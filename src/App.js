// App.js
import React, { useState, useEffect } from "react";
import { signInWithGoogle, getOAuthToken } from "./firebase";
import {
  listCharacterSheets,
  createCharacterSheet,
  fetchSheetData,
} from "./DriveSheetsAPI";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [oauthToken, setOauthToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    if (oauthToken) loadSheets();
  }, [oauthToken]);

  async function handleSignIn() {
    const signedInUser = await signInWithGoogle();
    setUser(signedInUser);

    const token = await getOAuthToken();
    setOauthToken(token);
  }

  async function loadSheets() {
    const files = await listCharacterSheets(oauthToken);
    setSheets(files);
    if (files.length > 0) setSelectedSheetId(files[0].id);
  }

  async function handleCreateSheet() {
    const name = prompt("Enter character name:");
    if (!name) return;
    try {
      const id = await createCharacterSheet(oauthToken, name);
      alert("New sheet created!");
      setSelectedSheetId(id);
      await loadSheets();
    } catch (err) {
      alert("Failed to create sheet.");
    }
  }

  async function handleFetchSheet() {
    if (!selectedSheetId) return;
    const data = await fetchSheetData(selectedSheetId, oauthToken);
    setSheetData(data);
  }

  return (
    <div className="app-container">
      <h1>The Witcher TTRPG Character Sheet</h1>
      {!user ? (
        <button className="btn" onClick={handleSignIn}>
          Sign in with Google
        </button>
      ) : (
        <>
          <div className="sheet-controls">
            <select
              value={selectedSheetId}
              onChange={(e) => setSelectedSheetId(e.target.value)}
            >
              {sheets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="btn" onClick={handleCreateSheet}>
              New Character Sheet
            </button>
            <button className="btn" onClick={handleFetchSheet}>
              Load Sheet
            </button>
          </div>

          {sheetData.length > 0 && (
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Value</th>
                  <th>Formula</th>
                </tr>
              </thead>
              <tbody>
                {sheetData.map((row, i) => (
                  <tr key={i}>
                    <td>{row[0]}</td>
                    <td contentEditable>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default App;
