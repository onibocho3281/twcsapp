// src/App.js
import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout, auth } from "./firebase";
import {
  listWitcherSheets,
  createSheetFromTemplate,
  fetchGeneralTabAsObject,
  updateGeneralTabFromObject,
} from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [general, setGeneral] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { user, accessToken: token } = await signInWithGoogle();
      setUser(user);
      setAccessToken(token);
      await loadSheets(token);
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Sign-in failed — see console.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSheets([]);
    setSelectedSheetId("");
    setGeneral({});
  };

  const loadSheets = async (token = accessToken) => {
    if (!token) return;
    try {
      setLoading(true);
      const files = await listWitcherSheets(token);
      setSheets(files);
    } catch (err) {
      console.error("loadSheets error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!accessToken) return alert("Sign in first.");
    const name = prompt("Enter character name:");
    if (!name) return;

    try {
      setLoading(true);
      const created = await createSheetFromTemplate(accessToken, name);
      setSheets((s) => [...s, { id: created.id, name: created.name }]);
      setSelectedSheetId(created.id);
      const obj = await fetchGeneralTabAsObject(accessToken, created.id);
      setGeneral(obj);
      alert("Sheet created and loaded!");
    } catch (err) {
      console.error("create error:", err);
      alert("Failed to create sheet — see console.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedSheetId(id);
    if (!id || !accessToken) return;
    try {
      setLoading(true);
      const obj = await fetchGeneralTabAsObject(accessToken, id);
      setGeneral(obj);
    } catch (err) {
      console.error("fetchGeneral error:", err);
      alert("Failed to load General tab — see console.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setGeneral((prev) => ({
      ...prev,
      [key]: { ...prev[key], editable: value },
    }));
  };

  const handleSave = async () => {
    if (!accessToken || !selectedSheetId) return alert("Sign in and select a sheet first.");
    try {
      setLoading(true);
      await updateGeneralTabFromObject(accessToken, selectedSheetId, general);
      alert("Saved successfully — formulas in M remain intact.");
    } catch (err) {
      console.error("save error:", err);
      alert("Save failed — see console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 1000, margin: "auto" }}>
      <h1>The Witcher TTRPG — Character Sheets</h1>

      {!user ? (
        <button onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Signed in:</strong> {user.displayName}
            </div>
            <div>
              <button onClick={handleCreateNew} disabled={loading}>New Character Sheet</button>{" "}
              <button onClick={() => loadSheets()} disabled={loading}>Refresh List</button>{" "}
              <button onClick={handleLogout}>Sign out</button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>
              Select sheet:
              <select value={selectedSheetId} onChange={handleSelect} style={{ marginLeft: 8 }}>
                <option value="">-- choose --</option>
                {sheets.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedSheetId ? (
            <div style={{ marginTop: 20 }}>
              <h2>General — (L editable, J labels, M formulas)</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(general).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 250, fontWeight: "bold" }}>{k}</div>
                    <input
                      style={{ width: 200, padding: 6 }}
                      value={v.editable}
                      onChange={(e) => handleChange(k, e.target.value)}
                    />
                    <div style={{
                      minWidth: 150,
                      padding: "6px 8px",
                      backgroundColor: "#f3f3f3",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    }}>
                      {v.formula}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Inputs"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>(Select a sheet to load its General tab)</div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
