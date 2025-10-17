// DriveSheetsAPI.js
export const listSheets = async (accessToken) => {
  try {
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=100",
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

export const createSheet = async (accessToken, name, templateId) => {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${templateId}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};

export const getSheetValues = async (accessToken, sheetId, range = "General!A1:AI73") => {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.values || [];
  } catch (error) {
    console.error("❌ Error fetching sheet values:", error);
    throw error;
  }
};

export const updateSheetValue = async (accessToken, sheetId, range, values) => {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      }
    );
    if (!res.ok) throw await res.json();
    return await res.json();
  } catch (error) {
    console.error("❌ Error updating sheet value:", error);
    throw error;
  }
};
