// DriveSheetsAPI.js

// List all Witcher Character Sheets in the user's Google Drive
export const listSheets = async (accessToken) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and name contains 'Witcher Character Sheet'&fields=files(id,name)&pageSize=100",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw await response.json();
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
    throw error;
  }
};

// Create a new sheet from a template
export const createSheetFromTemplate = async (accessToken, templateId, newName) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${templateId}/copy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      }
    );

    if (!response.ok) throw await response.json();
    const data = await response.json();
    console.log("✅ New sheet created:", data);
    return data;
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};

// Fetch the "General" tab from a sheet
export const fetchSheetGeneralTab = async (accessToken, sheetId) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/General!A:Z`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw await response.json();
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error("❌ Error fetching General tab:", error);
    throw error;
  }
};

// Update the "General" tab in a sheet
export const updateSheetGeneralTab = async (accessToken, sheetId, values) => {
  try {
    const body = {
      range: "General!A:Z",
      majorDimension: "ROWS",
      values: values,
    };

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/General!A:Z?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) throw await response.json();
    const data = await response.json();
    console.log("✅ General tab updated:", data);
    return data;
  } catch (error) {
    console.error("❌ Error updating General tab:", error);
    throw error;
  }
};
