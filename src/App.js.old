// App.js
import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { createCharacterSheet } from "./DriveSheetsAPI";

const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // replace with your public template sheet ID

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      localStorage.setItem("googleAccessToken", accessToken);
      setUser({ ...result.user, accessToken });
      setStatus("Signed in successfully");
    } catch (err) {
      console.error(err);
      setStatus("Sign-in failed: " + err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("googleAccessToken");
    setUser(null);
    setStatus("Signed out");
  };

  const handleNewCharacter = async () => {
    try {
      setStatus("Creating new character...");
      const data = await createCharacterSheet(
        TEMPLATE_ID,
        user.accessToken,
        user.displayName
      );

      // Open the new sheet in a new tab
      window.open(`https://docs.google.com/spreadsheets/d/${data.id}`, "_blank");
      setStatus(`New sheet created: ${data.name}`);
    } catch (err) {
      console.error(err);
      setStatus("Error creating sheet: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>The Witcher TTRPG Character Sheet</h1>

      {!user ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <>
          <p>Signed in as: {user.displayName}</p>
          <button onClick={handleSignOut}>Sign out</button>
          <button onClick={handleNewCharacter} style={{ marginLeft: "10px" }}>
            New Character
          </button>
        </>
      )}

      <p style={{ marginTop: "20px" }}>{status}</p>
    </div>
  );
}

export default App;
