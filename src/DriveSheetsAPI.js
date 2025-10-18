// DriveSheetsAPI.js
// Functions for interacting with Google Sheets and Drive

const BASE_URL = "https://www.googleapis.com/drive/v3/files";

export async function listCharacterSheets(oauthToken) {
  try {
    const res = await fetch(
      `${BASE_URL}?q=name contains 'Witcher Character Sheet' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${oauthToken}`,
        },
      }
    );

    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error("❌ Error fetching sheets:", err);
    return [];
  }
}

export async function createCharacterSheet(oauthToken, sheetName) {
  try {
    // Copy template sheet (replace TEMPLATE_SHEET_ID with your template)
    const TEMPLATE_SHEET_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ";

    const res = await fetch(`${BASE_URL}/${TEMPLATE_SHEET_ID}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: sheetName }),
    });

    if (!res.ok) throw await res.json();
    const newSheet = await res.json();
    return newSheet.id;
  } catch (err) {
    console.error("❌ Error creating sheet:", err);
    throw err;
  }
}

export async function fetchSheetData(sheetId, oauthToken) {
  try {
    const range = "General!J:L"; // J = protected titles, L = editable, M = formulas
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?majorDimension=ROWS`,
      {
        headers: { Authorization: `Bearer ${oauthToken}` },
      }
    );

    if (!res.ok) throw await res.json();
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error("❌ Error fetching sheet data:", err);
    return [];
  }
}
