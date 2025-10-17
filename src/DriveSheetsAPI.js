// src/DriveSheetsAPI.js

// Google Drive API endpoint to copy the Witcher sheet template
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";

export const copyTemplateSheet = async (accessToken) => {
  const TEMPLATE_FILE_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // your template

  try {
    const response = await fetch(`${DRIVE_API_URL}/${TEMPLATE_FILE_ID}/copy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Witcher Character Sheet - ${new Date().toLocaleString()}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.id; // Return the ID of the new sheet
  } catch (err) {
    console.error("Error copying template:", err);
    throw err;
  }
};
