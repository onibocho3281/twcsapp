// App.js
import React, { useEffect, useState } from 'react';
import { signInWithGoogle, logout, getOAuthToken } from './firebase';
import { listCharacterSheets, createCharacterSheet, fetchSheetData } from './DriveSheetsAPI';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetData, setSheetData] = useState({});

  // Fetch sheets when user logs in
  useEffect(() => {
    if (user) {
      const fetchSheets = async () => {
        try {
          const sheetsList = await listCharacterSheets(await getOAuthToken());
          setSheets(sheetsList);
        } catch (err) {
          console.error('❌ Error fetching sheets:', err);
        }
      };
      fetchSheets();
    }
  }, [user]);

  // Fetch sheet data when selection changes
  useEffect(() => {
    if (selectedSheet) {
      const fetchData = async () => {
        try {
          const data = await fetchSheetData(selectedSheet.id, await getOAuthToken());
          setSheetData(data);
        } catch (err) {
          console.error('❌ Error fetching sheet data:', err);
        }
      };
      fetchData();
    }
  }, [selectedSheet]);

  const handleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setSheets([]);
    setSelectedSheet(null);
    setSheetData({});
  };

  const handleNewSheet = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }
    try {
      const newSheet = await createCharacterSheet(await getOAuthToken(), `${user.displayName}'s Witcher Sheet`);
      setSheets((prev) => [...prev, newSheet]);
      setSelectedSheet(newSheet);
    } catch (err) {
      console.error('❌ Error creating sheet:', err);
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button className="auth-button" onClick={handleSignIn}>
          Sign in with Google
        </button>
      ) : (
        <div className="controls">
          <div>
            <select
              className="sheet-dropdown"
              value={selectedSheet ? selectedSheet.id : ''}
              onChange={(e) =>
                setSelectedSheet(sheets.find((sheet) => sheet.id === e.target.value))
              }
            >
              <option value="">Select a Character Sheet</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
            <button className="new-sheet-button" onClick={handleNewSheet}>
              New Character Sheet
            </button>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {selectedSheet && sheetData.general && (
        <div className="sheet-form">
          {Object.entries(sheetData.general).map(([key, value]) => (
            <div key={key} className="form-row">
              <label className="form-label">{key}</label>
              <input
                className="form-input"
                value={value}
                onChange={(e) =>
                  setSheetData((prev) => ({
                    ...prev,
                    general: { ...prev.general, [key]: e.target.value },
                  }))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
