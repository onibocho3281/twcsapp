// DriveSheetsAPI.js

export const listSheets = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw await response.json();
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("❌ Error fetching sheets:", error);
    throw error;
  }
};

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

    if (!response.ok) {
      throw await response.json();
    }

    const sheet = await response.json();
    return sheet;
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};
