// App.js
import React, { useState, useEffect } from "react";
import { signInWithGoogle, logout, auth } from "./firebase";

const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Your template sheet

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [currentSheetId, setCurrentSheetId] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [userSheets, setUserSheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Track auth state
  useEffect(() => {
    auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken(true);
        setAccessToken(token);
        await listUserSheets(token);
      } else {
        setAccessToken(null);
      }
    });
  }, []);

  // Sign in handler
  const handleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      console.log("Logged in:", signedInUser);
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setCurrentSheetId(null);
    setSheetData([]);
  };

  // Create new sheet with character name
  const handleCreateSheet = async () => {
    if (!accessToken) return alert("Sign in first!");
    if (!characterName) return alert("Enter a character name.");

    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${TEMPLATE_ID}/copy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: characterName }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newSheet = await response.json();
      setCurrentSheetId(newSheet.id);
      await fetchSheetData(newSheet.id);
      await listUserSheets(accessToken);
      alert("Character sheet created!");
    } catch (error) {
      console.error("❌ Error creating sheet:", error);
      alert("Failed to create sheet. Check console.");
    }
    setLoading(false);
  };

  // Fetch data from a sheet
  const fetchSheetData = async (sheetId) => {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/General!A1:AI73`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setSheetData(data.values || []);
    } catch (error) {
      console.error("❌ Failed to fetch sheet data:", error);
    }
  };

  // Update the current sheet with changes
  const handleUpdateSheet = async () => {
    if (!currentSheetId) return alert("No sheet selected");
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${currentSheetId}/values/General!A1:AI73?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: sheetData }),
        }
      );
      alert("Sheet updated successfully!");
    } catch (error) {
      console.error("❌ Failed to update sheet:", error);
      alert("Failed to update sheet. Check console.");
    }
  };

  // List sheets owned by user
  const listUserSheets = async (token) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and 'me' in owners&fields=files(id,name)`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setUserSheets(data.files || []);
    } catch (error) {
      console.error("❌ Failed to list user sheets:", error);
    }
  };

  // Handle selecting a sheet
  const handleSelectSheet = async (sheetId) => {
    setCurrentSheetId(sheetId);
    await fetchSheetData(sheetId);
  };

  // Handle editing a cell
  const handleCellChange = (row, col, value) => {
    const updatedData = [...sheetData];
    updatedData[row][col] = value;
    setSheetData(updatedData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>
      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>

          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Enter character name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
            <button onClick={handleCreateSheet} disabled={loading}>
              {loading ? "Creating..." : "New Character Sheet"}
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h3>Your Sheets</h3>
            <select
              onChange={(e) => handleSelectSheet(e.target.value)}
              value={currentSheetId || ""}
            >
              <option value="">Select a sheet</option>
              {userSheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>

          {sheetData.length > 0 && (
            <div style={{ marginTop: "20px", overflowX: "auto" }}>
              <table border="1">
                <tbody>
                  {sheetData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex}>
                          <input
                            value={cell}
                            onChange={(e) =>
                              handleCellChange(rowIndex, colIndex, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleUpdateSheet} style={{ marginTop: "10px" }}>
                Save Changes
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
