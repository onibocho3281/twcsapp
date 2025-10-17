import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout, auth } from "./firebase";
import {
  listSheets,
  createSheet,
  getSheetValues,
  updateSheetValue,
} from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    // Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const token = await u.getIdToken(); // ID token (can use for server verification)
        setAccessToken(token);
        fetchSheets(token);
      } else {
        setUser(null);
        setSheets([]);
        setSheetData([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSheets = async (token) => {
    try {
      const files = await listSheets(token);
      setSheets(files);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSheetSelect = async (sheet) => {
    setSelectedSheet(sheet);
    try {
      const values = await getSheetValues(accessToken, sheet.id);
      setSheetData(values);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCellChange = async (rowIndex, colIndex, value) => {
    const updatedData = [...sheetData];
    updatedData[rowIndex][colIndex] = value;
    setSheetData(updatedData);

    try {
      const range = `General!${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
      await updateSheetValue(accessToken, selectedSheet.id, range, [[value]]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSheet = async () => {
    const name = prompt("Enter new character sheet name:");
    if (!name) return;
    const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Replace with your General template ID
    try {
      const newSheet = await createSheet(accessToken, name, TEMPLATE_ID);
      fetchSheets(accessToken);
      setSelectedSheet(newSheet);
      const values = await getSheetValues(accessToken, newSheet.id);
      setSheetData(values);
    } catch (error) {
      console.error(error);
      alert("Error creating sheet. See console.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>
      {!user ? (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      ) : (
        <>
          <div>
            <span>Welcome, {user.displayName} </span>
            <button onClick={logout}>Sign out</button>
          </div>
          <hr />
          <button onClick={handleCreateSheet}>New Character Sheet</button>
          <div style={{ marginTop: "20px" }}>
            <label>Select Sheet: </label>
            <select
              onChange={(e) =>
                handleSheetSelect(sheets.find((s) => s.id === e.target.value))
              }
              value={selectedSheet?.id || ""}
            >
              <option value="" disabled>
                -- Choose --
              </option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>

          {sheetData.length > 0 && (
            <table border="1" cellPadding="3" style={{ marginTop: "20px" }}>
              <tbody>
                {sheetData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={cell || ""}
                          onChange={(e) =>
                            handleCellChange(rowIndex, colIndex, e.target.value)
                          }
                          style={{ width: "80px" }}
                        />
                      </td>
                    ))}
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
