// DriveSheetsAPI.js
// Handles creating a copy of the template Google Sheet

const TEMPLATE_SHEET_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // your template sheet

export const createNewCharacterSheet = async (accessToken, sheetName = "New Witcher Character Sheet") => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${TEMPLATE_SHEET_ID}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: sheetName }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(JSON.stringify(err));
    }

    const data = await response.json();
    console.log("✅ New Sheet Created:", data);
    return data; // contains id, name, etc.
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};
