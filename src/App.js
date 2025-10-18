import React, { useState, useEffect } from "react";
import { signInWithGoogle, signOutUser, getOAuthToken } from "./firebase";
import {
  listCharacterSheets,
  createCharacterSheet,
  getGeneralTabData,
  updateCellValue,
} from "./DriveSheetsAPI";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Sign in handler ---
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      const oauthToken = await getOAuthToken();
      console.log("🔑 OAuth token:", oauthToken);
      setToken(oauthToken);
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
    }
  };

  // --- Sign out handler ---
  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setToken(null);
    setSheets([]);
    setSelectedSheet("");
    setSheetData([]);
  };

  // --- Load all Witcher sheets after login ---
  const loadSheets = async () => {
    if (!token) return;
    try {
      const files = await listCharacterSheets(token);
      setSheets(files);
      console.log("📜 Sheets loaded:", files);
    } catch (err) {
      console.error("❌ Error fetching sheets:", err);
    }
  };

  // --- Load sheet data (General tab, cols J–M) ---
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

  // --- Handle sheet selection ---
  const handleSelectSheet = (e) => {
    const id = e.target.value;
    setSelectedSheet(id);
    loadSheetData(id);
  };

  // --- Create new sheet ---
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

  // --- Update editable cell ---
  const handleInputChange = async (rowIndex, value) => {
    if (!token || !selectedSheet) return;
    try {
      const label = sheetData[rowIndex][0]; // column J (title)
      const range = `General!L${rowIndex + 1}`; // editable cell
      await updateCellValue(selectedSheet, range, value, token);
      const updated = [...sheetData];
      updated[rowIndex][1] = value; // column L
      setSheetData(updated);
    } catch (err) {
      console.error("❌ Error updating cell:", err);
    }
  };

  useEffect(() => {
    if (token) loadSheets();
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        color: "#eee",
        fontFamily: "'Cinzel', serif",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          color: "#b00",
          textShadow: "0 0 8px #f00",
          marginBottom: "1rem",
          fontSize: "2rem",
        }}
      >
        ⚔️ Witcher Character Manager
      </h1>

      {!user ? (
        <button
          onClick={handleSignIn}
          style={{
            background: "linear-gradient(90deg, #700, #b00)",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Sign in with Google
        </button>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <select
              value={selectedSheet}
              onChange={handleSelectSheet}
              style={{
                backgroundColor: "#111",
                color: "#fff",
                border: "1px solid #b00",
                padding: "0.5rem",
                borderRadius: "6px",
              }}
            >
              <option value="">Select Character</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleCreateSheet}
              style={{
                backgroundColor: "#b00",
                color: "#fff",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              + New Character
            </button>

            <button
              onClick={handleSignOut}
              style={{
                backgroundColor: "#333",
                color: "#fff",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>

          {loading ? (
            <p style={{ color: "#888" }}>Loading...</p>
          ) : sheetData.length > 0 ? (
            <div
              style={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "1.5rem",
                width: "90%",
                maxWidth: "700px",
                boxShadow: "0 0 15px #a00a",
              }}
            >
              {sheetData.map((row, i) => {
                const label = row[0]; // col J
                const editable = row[1] || ""; // col L
                const formula = row[2] || ""; // col M
                if (!label) return null;
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <label>{label}</label>
                    <input
                      value={editable}
                      onChange={(e) =>
                        handleInputChange(i, e.target.value)
                      }
                      style={{
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                        border: "1px solid #b00",
                        padding: "0.4rem",
                        borderRadius: "6px",
                      }}
                    />
                    <div
                      style={{
                        textAlign: "right",
                        color: "#aaa",
                      }}
                    >
                      {formula}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#666" }}>
              No character selected. Choose one above.
            </p>
          )}
        </>
      )}
    </div>
  );
}
