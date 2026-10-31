import { isIP } from "node:net";
import { getIPAddress, updateIPAddress } from "../../db/model.js";
import SendResponse from "../../helper/SendResponse.js";

export const getHealth = (req, res) => {
  return SendResponse(
    res,
    200,
    true,
    { status: "running" },
    "Express server is running.",
  );
};

export const getIP = (req, res) => {
  try {
    const configuration = getIPAddress();

    return SendResponse(
      res,
      200,
      true,
      configuration,
      "IP configuration retrieved successfully.",
    );
  } catch (error) {
    console.error("Get IP failed:", error.message);

    return SendResponse(
      res,
      500,
      false,
      null,
      "Could not retrieve IP configuration.",
    );
  }
};

export const updateIP = (req, res) => {
  const { ip } = req.body ?? {};

  if (typeof ip !== "string" || isIP(ip) !== 4) {
    return SendResponse(
      res,
      400,
      false,
      null,
      "Please provide a valid IPv4 address.",
    );
  }

  try {
    const configuration = updateIPAddress(ip);

    return SendResponse(
      res,
      200,
      true,
      configuration,
      "IP address updated successfully.",
    );
  } catch (error) {
    console.error("Update IP failed:", error.message);

    return SendResponse(
      res,
      500,
      false,
      null,
      "Could not update IP configuration.",
    );
  }
};
