// DriveSheetsAPI.js
const TEMPLATE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // <-- your template ID

// --- List Witcher Character Sheets ---
export async function fetchSheets(accessToken) {
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
    console.error("❌ Error fetching sheets:", await response.text());
    throw new Error("Failed to fetch sheets");
  }

  const data = await response.json();
  console.log("📄 Sheets found:", data.files);
  return data.files;
}

// --- Create new sheet from template ---
export async function createSheetFromTemplate(accessToken, characterName) {
  const metadata = {
    name: `Witcher Character Sheet - ${characterName}`,
  };

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${TEMPLATE_ID}/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!response.ok) {
    console.error("❌ Error creating sheet:", await response.text());
    throw new Error("Failed to create sheet");
  }

  const data = await response.json();
  console.log("✅ Created new sheet:", data);
  return data.id;
}

// --- Fetch values from the General tab ---
export async function fetchSheetValues(accessToken, sheetId, sheetName) {
  const range = `${sheetName}!A1:Z100`; // adjust if needed
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    console.error("❌ Error fetching sheet values:", await response.text());
    throw new Error("Failed to fetch sheet values");
  }

  const data = await response.json();
  console.log("📘 Raw sheet data:", data);

  // Transform rows into a key:value object
  const values = data.values || [];
  const obj = {};

  // Assuming the first column is a label and the second column is a value
  values.forEach((row) => {
    const key = row[0];
    const val = row[1];
    if (key) obj[key] = val || "";
  });

  return obj;
}

// --- Update editable cells in General tab ---
export async function updateSheetValues(accessToken, sheetId, sheetName, updatedData) {
  // Convert back to 2D array format: [ [key, value], ... ]
  const values = Object.entries(updatedData).map(([key, val]) => [key, val]);

  const body = {
    range: `${sheetName}!A1:B${values.length}`,
    majorDimension: "ROWS",
    values: values,
  };

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A1:B${values.length}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    console.error("❌ Error updating sheet:", await response.text());
    throw new Error("Failed to update sheet");
  }

  const result = await response.json();
  console.log("✅ Sheet updated:", result);
  return result;
}
