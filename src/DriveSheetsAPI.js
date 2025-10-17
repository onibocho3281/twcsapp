// DriveSheetsAPI.js

// Copy template sheet to a new sheet
export const createSheetFromTemplate = async (sheetName, accessToken) => {
  if (!accessToken) throw new Error("No Google OAuth token. Sign in first.");

  const templateId = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Your template sheet ID

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${templateId}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: sheetName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log("✅ Created new sheet:", data);
    return data; // returns {id, name, ...}
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};

// List all sheets of the logged-in user containing "Witcher Character Sheet"
export const listUserSheets = async (accessToken) => {
  if (!accessToken) throw new Error("No Google OAuth token. Sign in first.");

  try {
    const query = encodeURIComponent(
      "name contains 'Witcher Character Sheet' and mimeType='application/vnd.google-apps.spreadsheet'"
    );
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log("✅ User sheets:", data.files);
    return data.files; // array of {id, name}
  } catch (error) {
    console.error("❌ Error listing sheets:", error);
    throw error;
  }
};
