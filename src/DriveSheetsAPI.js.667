// DriveSheetsAPI.js

// Functions to interact with Google Drive & Sheets API
// Requires OAuth accessToken passed from firebase.js sign-in

const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const TEMPLATE_SHEET_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Your template

export const listUserSheets = async (accessToken) => {
  try {
    const res = await fetch(
      `${DRIVE_API}?q=name contains 'Witcher Character Sheet' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
    throw error;
  }
};

export const createSheetFromTemplate = async (accessToken, characterName) => {
  try {
    const res = await fetch(`${DRIVE_API}/${TEMPLATE_SHEET_ID}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: characterName }),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data; // {id, name, ...}
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};
