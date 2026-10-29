import db from "./config.js";

// Database se current IP read karo.
export const getIPAddress = () => {
  return db
    .prepare(
      `
    SELECT ip, updated_at
    FROM configurationAddress
    WHERE id = 1
  `,
    )
    .get();
};

// Database mein IP update karo.
export const updateIPAddress = (ip) => {
  const result = db
    .prepare(
      `
    UPDATE configurationAddress
    SET ip = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `,
    )
    .run(ip);

  if (result.changes === 0) {
    throw new Error("IP configuration was not found.");
  }

  return getIPAddress();
};

