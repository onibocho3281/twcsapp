// DriveSheetsAPI.js

const TEMPLATE_SHEET_ID = "1mUHQy9NsT1FFWfer78xGyPePQI21gAgXqos_fjAQTAQ"; // Your template sheet

export const createSheetFromTemplate = async (name, accessToken) => {
  if (!accessToken) throw new Error("No Google Auth token. Sign in first.");

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${TEMPLATE_SHEET_ID}/copy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log("✅ Sheet created:", data);
    return data; // returns the new sheet object
  } catch (error) {
    console.error("❌ Error creating sheet:", error);
    throw error;
  }
};
