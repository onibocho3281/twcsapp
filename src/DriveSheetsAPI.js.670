// src/DriveSheetsAPI.js
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Replace if needed

// List Witcher Character Sheets
export async function listWitcherSheets(accessToken) {
  if (!accessToken) throw new Error("No access token provided to listWitcherSheets");

  const q = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and name contains 'Witcher Character Sheet'"
  );
  const url = `${DRIVE_API}?q=${q}&fields=files(id,name)&pageSize=200`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.files || [];
}

// Create new sheet from template
export async function createSheetFromTemplate(accessToken, newName) {
  if (!accessToken) throw new Error("No access token provided to createSheetFromTemplate");

  const res = await fetch(`${DRIVE_API}/${TEMPLATE_ID}/copy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: `Witcher Character Sheet - ${newName}` }),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Fetch General tab (J: label, L: editable, M: formula)
export async function fetchGeneralTabAsObject(accessToken, sheetId) {
  if (!accessToken) throw new Error("No access token provided to fetchGeneralTabAsObject");

  const range = encodeURIComponent("General!J1:M500");
  const url = `${SHEETS_API_BASE}/${sheetId}/values/${range}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const rows = data.values || [];

  // Build structured object: label (J), editable (L), formula result (M)
  const obj = {};
  rows.forEach((r) => {
    const label = r[0];
    const editable = r[2] ?? ""; // L column (index 2 since J=0, K=1, L=2, M=3)
    const formula = r[3] ?? "";  // M column (index 3)
    if (label) obj[label] = { editable, formula };
  });

  return obj;
}

// Update only editable (L) column
export async function updateGeneralTabFromObject(accessToken, sheetId, dataObject) {
  if (!accessToken) throw new Error("No access token provided to updateGeneralTabFromObject");

  const entries = Object.entries(dataObject);
  if (entries.length === 0) return null;

  // Each row updates only column L
  const values = entries.map(([_, { editable }]) => [editable]);

  const range = `General!L1:L${values.length}`;
  const url = `${SHEETS_API_BASE}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const body = { range, majorDimension: "ROWS", values };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
