// DriveSheetsAPI.js

// Only fetch sheets whose names contain "Witcher Character Sheet"
export const listSheets = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name contains 'Witcher Character Sheet' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) throw await response.json();

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
    throw error;
  }
};

// Copy a template sheet to a new sheet
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
        body: JSON.stringify({ name: `Witcher Character Sheet - ${newName}` }),
      }
    );

    if (!response.ok) throw await response.json();

    return await response.json();
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};

// Fetch "General" tab values from a given sheet
export const fetchSheetGeneralTab = async (accessToken, sheetId) => {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/General!A:Z`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
