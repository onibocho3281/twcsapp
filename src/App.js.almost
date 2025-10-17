// App.js
import React, { useState } from "react";
import { signInWithGoogle, logout, auth } from "./firebase";
import { createNewCharacterSheet } from "./DriveSheetsAPI";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (error) {
      alert("Sign-in failed, check console for details.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleCreateSheet = async () => {
    if (!user) {
      alert("You must sign in first!");
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken(/* forceRefresh */ true);
      const newSheet = await createNewCharacterSheet(token, `${user.displayName} - Witcher Sheet`);
      alert(`Sheet created! ID: ${newSheet.id}`);
      window.open(`https://docs.google.com/spreadsheets/d/${newSheet.id}`, "_blank");
    } catch (error) {
      alert("Failed to create sheet, see console.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>
      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleCreateSheet} disabled={loading}>
            {loading ? "Creating..." : "New Character Sheet"}
          </button>
          <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default App;
