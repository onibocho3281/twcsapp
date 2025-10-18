// src/DriveSheetsAPI.js
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // <-- confirm/replace

// List only Witcher Character Sheets (name contains)
export async function listWitcherSheets(accessToken) {
  if (!accessToken) throw new Error("No access token provided to listWitcherSheets");

  const q = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and name contains 'Witcher Character Sheet'"
  );

  const url = `${DRIVE_API}?q=${q}&fields=files(id,name)&pageSize=200`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("listWitcherSheets failed:", txt);
    throw new Error(txt || "Failed to list sheets");
  }

  const data = await res.json();
  return data.files || [];
}

// Create a sheet from template; returns the created sheet object (id, name, ...)
export async function createSheetFromTemplate(accessToken, newName) {
  if (!accessToken) throw new Error("No access token provided to createSheetFromTemplate");

  const url = `${DRIVE_API}/${TEMPLATE_ID}/copy`;
  const body = { name: `Witcher Character Sheet - ${newName}` };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("createSheetFromTemplate failed:", txt);
    throw new Error(txt || "Failed to create sheet from template");
  }

  const data = await res.json();
  // data contains id, name, etc.
  return data;
}

// Fetch General tab and return key->value object
// Assumes General tab has "label" in column A and "value" in column B
export async function fetchGeneralTabAsObject(accessToken, sheetId) {
  if (!accessToken) throw new Error("No access token provided to fetchGeneralTabAsObject");

  const range = encodeURIComponent("General!A1:B500"); // adjust rows if needed
  const url = `${SHEETS_API_BASE}/${sheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("fetchGeneralTabAsObject failed:", txt);
    throw new Error(txt || "Failed to fetch General tab");
  }

  const data = await res.json();
  const rows = data.values || [];

  const obj = {};
  rows.forEach((r) => {
    const label = r[0];
    const value = r[1] ?? "";
    if (label) obj[label] = value;
  });

  return obj;
}

// Update only A:B rows corresponding to key order in the provided object
// This writes the exact 2-column area from A1 down to A{n}:B{n}
export async function updateGeneralTabFromObject(accessToken, sheetId, dataObject) {
  if (!accessToken) throw new Error("No access token provided to updateGeneralTabFromObject");

  const entries = Object.entries(dataObject); // [ [label, value], ... ]
  if (entries.length === 0) return null;

  // Create 2D array rows
  const values = entries.map(([k, v]) => [k, v]);

  const range = `General!A1:B${values.length}`;
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

  if (!res.ok) {
    const txt = await res.text();
    console.error("updateGeneralTabFromObject failed:", txt);
    throw new Error(txt || "Failed to update General tab");
  }

  return await res.json();
}
