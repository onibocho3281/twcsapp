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
  const [general, setGeneral] = useState({}); // key -> value map
  const [loading, setLoading] = useState(false);

  // Listen to firebase auth changes (keeps user state in sync if needed)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u || null);
      // note: we don't auto-get token here; signInWithGoogle returns token directly
    });
    return () => unsub();
  }, []);

  // Sign in and fetch sheets
  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { user, accessToken: token } = await signInWithGoogle();
      setUser(user);
      setAccessToken(token);
      console.log("signed in user:", user, "token ok:", !!token);
      if (!token) alert("Warning: no Google OAuth token received. Drive access will fail.");
      await loadSheets(token);
    } catch (err) {
      console.error("Sign-in error:", err);
      alert("Sign-in failed — check console.");
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

  // Get list of Witcher sheets
  const loadSheets = async (token = accessToken) => {
    if (!token) {
      console.warn("No token in loadSheets");
      return;
    }
    try {
      setLoading(true);
      const files = await listWitcherSheets(token);
      setSheets(files);
      console.log("Loaded sheets:", files);
    } catch (err) {
      console.error("loadSheets error:", err);
      alert("Failed to list sheets. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Create new character sheet from template
  const handleCreateNew = async () => {
    if (!accessToken) {
      alert("Sign in first.");
      return;
    }
    const name = prompt("Enter character name (e.g. Geralt of Rivia):");
    if (!name) return;

    try {
      setLoading(true);
      const created = await createSheetFromTemplate(accessToken, name);
      // created is the file object; ensure we add it to list and select it
      setSheets((s) => [...s, { id: created.id, name: created.name }]);
      setSelectedSheetId(created.id);
      // load General tab object
      const obj = await fetchGeneralTabAsObject(accessToken, created.id);
      setGeneral(obj);
      alert("Sheet created and loaded.");
    } catch (err) {
      console.error("create error:", err);
      alert("Failed to create sheet (see console).");
    } finally {
      setLoading(false);
    }
  };

  // When a sheet is selected, load its General tab
  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedSheetId(id);
    if (!id) {
      setGeneral({});
      return;
    }
    if (!accessToken) {
      alert("No access token; please sign out and sign in again.");
      return;
    }
    try {
      setLoading(true);
      const obj = await fetchGeneralTabAsObject(accessToken, id);
      setGeneral(obj);
      console.log("Loaded General for", id, obj);
    } catch (err) {
      console.error("fetchGeneral error:", err);
      alert("Failed to load General tab. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Update a key's value locally
  const handleChange = (key, value) => {
    setGeneral((prev) => ({ ...prev, [key]: value }));
  };

  // Save the whole General object back to sheet (A:B)
  const handleSave = async () => {
    if (!accessToken || !selectedSheetId) return alert("Sign in and select a sheet first.");
    try {
      setLoading(true);
      await updateGeneralTabFromObject(accessToken, selectedSheetId, general);
      alert("Saved successfully — formulas in other cells remain intact.");
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
        <div>
          <button onClick={handleSignIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
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
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedSheetId ? (
            <div style={{ marginTop: 20 }}>
              <h2>General (editable)</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.keys(general).length === 0 && <div>(No entries in General A:B)</div>}
                {Object.entries(general).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 300 }}>{k}</div>
                    <input
                      style={{ flex: 1, padding: 6 }}
                      value={v}
                      onChange={(e) => handleChange(k, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save General to Sheet"}
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
