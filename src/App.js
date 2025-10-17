import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout } from "./firebase";
import { listSheets, createSheetFromTemplate, fetchSheetGeneralTab } from "./DriveSheetsAPI";

const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Replace with your template sheet ID

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [generalData, setGeneralData] = useState([]);

  const handleSignIn = async () => {
    try {
      const { user, token } = await signInWithGoogle();
      setUser(user);
      setAccessToken(token);
      fetchSheets(token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSheets([]);
    setSelectedSheetId("");
    setGeneralData([]);
  };

  const fetchSheets = async (token) => {
    try {
      const files = await listSheets(token);
      setSheets(files);
      console.log("📄 Fetched Witcher sheets:", files);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSheet = async () => {
    if (!accessToken) {
      alert("No Google Auth token. Sign in first.");
      return;
    }

    const newName = prompt("Enter new character name:");
    if (!newName) return;

    try {
      const newSheet = await createSheetFromTemplate(accessToken, TEMPLATE_ID, newName);
      console.log("✅ Created new sheet:", newSheet);
      setSheets((prev) => [...prev, newSheet]);
      setSelectedSheetId(newSheet.id);
      await loadGeneralTab(newSheet.id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGeneralTab = async (sheetId) => {
    try {
      const data = await fetchSheetGeneralTab(accessToken, sheetId);
      setGeneralData(data);
      console.log("📊 General tab data:", data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSheetSelect = async (e) => {
    const sheetId = e.target.value;
    setSelectedSheetId(sheetId);
    if (sheetId) await loadGeneralTab(sheetId);
    else setGeneralData([]);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>

          <div style={{ marginTop: "20px" }}>
            <button onClick={handleCreateSheet}>New Character Sheet</button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>
              Select Sheet:{" "}
              <select value={selectedSheetId} onChange={handleSheetSelect}>
                <option value="">-- Choose a sheet --</option>
                {sheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {generalData.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h2>General Tab Data</h2>
              <table border="1" cellPadding="5">
                <tbody>
                  {generalData.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
