import SendResponse from "../../helper/SendResponse.js";

import {
  getTrendlog,
  getTrendlogDataBatch,
  getEnergylog,
  getEnergylogDataBatch,
} from "../../aurora/service.js";

const handleError = (res, error) => {
  const message = error?.message || "Unexpected server error.";
  console.error("Aurora API error:", message);

  return SendResponse(res, 502, false, null, message);
};

const getDateOptions = (body = {}) => {
  const { host, startDate, endDate, startTime, endTime } = body;

  return {
    ...(host === undefined ? {} : { host }),
    ...(startDate === undefined ? {} : { startDate }),
    ...(endDate === undefined ? {} : { endDate }),
    ...(startTime === undefined ? {} : { startTime }),
    ...(endTime === undefined ? {} : { endTime }),
  };
};

const validateInstances = (instances) =>
  Array.isArray(instances) &&
  instances.length > 0 &&
  instances.every(
    (instance) =>
      instance !== undefined &&
      instance !== null &&
      String(instance).trim() !== "",
  );

const validateEnergyItems = (items) =>
  Array.isArray(items) &&
  items.length > 0 &&
  items.every(
    (item) =>
      item &&
      item.instance !== undefined &&
      item.instance !== null &&
      String(item.instance).trim() !== "" &&
      item.parameter !== undefined &&
      item.parameter !== null &&
      String(item.parameter).trim() !== "",
  );

export const fetchTrendlogs = async (req, res) => {
  try {
    const instances = req.method === "POST" ? req.body?.instances : undefined;

    if (instances !== undefined && !validateInstances(instances)) {
      return SendResponse(
        res,
        400,
        false,
        null,
        "Provide a valid non-empty instances array.",
      );
    }

    const data = await getTrendlog(instances);

    return SendResponse(
      res,
      200,
      true,
      data,
      "Trendlog list retrieved successfully.",
    );
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchTrendlogData = async (req, res) => {
  try {
    const { instances } = req.body ?? {};

    if (!validateInstances(instances)) {
      return SendResponse(
        res,
        400,
        false,
        null,
        "Provide a non-empty instances array.",
      );
    }

    const results = await getTrendlogDataBatch({
      instances,
      ...getDateOptions(req.body),
    });

    const allSucceeded = results.every((item) => item.success);

    return SendResponse(
      res,
      allSucceeded ? 200 : 207,
      allSucceeded,
      results,
      allSucceeded
        ? "All trendlog readings retrieved successfully."
        : "Trendlog retrieval completed with some failures.",
    );
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchEnergylogs = async (req, res) => {
  try {
    const instances = req.method === "POST" ? req.body?.instances : undefined;

    if (instances !== undefined && !validateInstances(instances)) {
      return SendResponse(
        res,
        400,
        false,
        null,
        "Provide a valid non-empty instances array.",
      );
    }

    const data = await getEnergylog(instances);

    return SendResponse(
      res,
      200,
      true,
      data,
      "Energylog list retrieved successfully.",
    );
  } catch (error) {
    return handleError(res, error);
  }
};

export const fetchEnergylogData = async (req, res) => {
  try {
    const { items } = req.body ?? {};

    if (!validateEnergyItems(items)) {
      return SendResponse(
        res,
        400,
        false,
        null,
        "Provide a non-empty items array containing instance and parameter.",
      );
    }

    const results = await getEnergylogDataBatch({
      items,
      ...getDateOptions(req.body),
    });

    const allSucceeded = results.every((item) => item.success);

    return SendResponse(
      res,
      allSucceeded ? 200 : 207,
      allSucceeded,
      results,
      allSucceeded
        ? "All energylog readings retrieved successfully."
        : "Energylog retrieval completed with some failures.",
    );
  } catch (error) {
    return handleError(res, error);
  }
};
