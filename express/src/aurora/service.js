import "dotenv/config";

import { getIPAddress } from "../db/model.js";
import XmlToJsonConvertor from "../helper/XmlToJsonConvertor.js";

import {
  buildGetTrendlogBody,
  buildGetTrendlogDataBody,
  buildGetEnergylogBody,
  buildGetEnergylogDataBody,
} from "./body.js";

const getApiUrl = (action) => {
  const ip = getIPAddress()?.ip;

  if (!ip) {
    throw new Error("Optergy IP address is missing from SQLite.");
  }

  return `http://${ip}/AuroraAPI.xml?${action}`;
};

const findTag = (value, targetTag) => {
  if (!value || typeof value !== "object") return undefined;

  for (const [key, child] of Object.entries(value)) {
    if (key.toLowerCase() === targetTag.toLowerCase()) return child;
  }

  for (const child of Object.values(value)) {
    const result = findTag(child, targetTag);
    if (result !== undefined) return result;
  }

  return undefined;
};

const callAuroraApi = async (action, body) => {
  const timeoutMs = Number(process.env.SERVER_TIMEOUT_MS) || 15000;

  let response;

  try {
    response = await fetch(getApiUrl(action), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/xml, text/xml",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error(`Optergy API timed out after ${timeoutMs} ms.`);
    }

    throw new Error(`Could not connect to Optergy: ${error.message}`);
  }

  const xml = await response.text();

  if (!response.ok) {
    throw new Error(`Optergy returned HTTP ${response.status}.`);
  }

  const data = XmlToJsonConvertor(xml);
  const apiError = findTag(data, "error");

  if (apiError !== undefined && apiError !== null && apiError !== "") {
    throw new Error(
      `Optergy API error: ${
        typeof apiError === "object"
          ? JSON.stringify(apiError)
          : String(apiError)
      }`,
    );
  }

  return data;
};

const normalizeInstances = (instances) => {
  if (instances === undefined) return null;

  if (!Array.isArray(instances) || instances.length === 0) {
    throw new Error("instances must be a non-empty array.");
  }

  for (const instance of instances) {
    if (
      instance === undefined ||
      instance === null ||
      String(instance).trim() === ""
    ) {
      throw new Error("Every instance must have a valid value.");
    }
  }

  return new Set(instances.map(String));
};

// Filters metadata objects by their instance field.
// The exact XML structure must be confirmed using a real API response.
const filterMetadataByInstances = (value, wanted) => {
  if (Array.isArray(value)) {
    const hasInstanceObjects = value.some(
      (item) =>
        item &&
        typeof item === "object" &&
        Object.keys(item).some((key) => key.toLowerCase() === "instance"),
    );

    if (hasInstanceObjects) {
      return value.filter((item) => {
        const key = Object.keys(item).find(
          (name) => name.toLowerCase() === "instance",
        );

        return key && wanted.has(String(item[key]));
      });
    }

    return value
      .map((item) => filterMetadataByInstances(item, wanted))
      .filter((item) => item !== undefined);
  }

  if (!value || typeof value !== "object") return value;

  const instanceKey = Object.keys(value).find(
    (key) => key.toLowerCase() === "instance",
  );

  if (instanceKey && !wanted.has(String(value[instanceKey]))) {
    return undefined;
  }

  const result = {};

  for (const [key, child] of Object.entries(value)) {
    if (key.toLowerCase() === "count" && instanceKey) {
      result[key] = child;
      continue;
    }

    const filtered = filterMetadataByInstances(child, wanted);

    if (filtered !== undefined) {
      result[key] = filtered;
    }
  }

  return result;
};

export const getTrendlog = async (instances) => {
  const data = await callAuroraApi("getTrendlog", buildGetTrendlogBody());
  const wanted = normalizeInstances(instances);

  return wanted ? filterMetadataByInstances(data, wanted) : data;
};

export const getTrendlogData = (options) =>
  callAuroraApi("getTrendlogData", buildGetTrendlogDataBody(options));

export const getEnergylog = async (instances) => {
  const data = await callAuroraApi("getEnergylog", buildGetEnergylogBody());
  const wanted = normalizeInstances(instances);

  return wanted ? filterMetadataByInstances(data, wanted) : data;
};

export const getEnergylogData = (options) =>
  callAuroraApi("getEnergylogData", buildGetEnergylogDataBody(options));

export const getTrendlogDataBatch = async ({ instances, ...options } = {}) => {
  if (!Array.isArray(instances) || instances.length === 0) {
    throw new Error("instances must be a non-empty array.");
  }

  const results = [];

  for (const instance of instances) {
    try {
      const data = await getTrendlogData({ ...options, instance });
      results.push({ instance, success: true, data });
    } catch (error) {
      results.push({ instance, success: false, error: error.message });
    }
  }

  return results;
};

export const getEnergylogDataBatch = async ({ items, ...options } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items must be a non-empty array.");
  }

  const results = [];

  for (const item of items) {
    const { instance, parameter, host } = item ?? {};

    try {
      const data = await getEnergylogData({
        ...options,
        ...(host === undefined ? {} : { host }),
        instance,
        parameter,
      });

      results.push({ instance, parameter, success: true, data });
    } catch (error) {
      results.push({
        instance: instance ?? null,
        parameter: parameter ?? null,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};
