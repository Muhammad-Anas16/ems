import { createHash } from "node:crypto";

const DEFAULTS = {
  host: 100,
  startDate: "01/01/2025",
  endDate: "31/12/2050",
  startTime: "00:00",
  endTime: "23:59",
};

const getAuthenticationHash = () => {
  const password = process.env.SERVER_IP_PASSWORD;

  if (!password) {
    throw new Error("SERVER_IP_PASSWORD is missing from .env.");
  }

  return createHash("md5").update(password, "utf8").digest("hex");
};

const buildBaseBody = () => ({
  authentication: getAuthenticationHash(),
});

const validateRequired = (value, name) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`${name} is required.`);
  }
};

const validateHost = (host) => {
  if (!Number.isInteger(Number(host)) || Number(host) < 0) {
    throw new Error("host must be a non-negative integer.");
  }
};

const validateDate = (value, name) => {
  if (typeof value !== "string" || !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    throw new Error(`${name} must use DD/MM/YYYY format.`);
  }

  const [day, month, year] = value.split("/").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`${name} is not a valid calendar date.`);
  }
};

const validateTime = (value, name) => {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${name} must use 24-hour HH:MM format.`);
  }
};

const buildDateRange = ({
  startDate = DEFAULTS.startDate,
  endDate = DEFAULTS.endDate,
  startTime = DEFAULTS.startTime,
  endTime = DEFAULTS.endTime,
} = {}) => {
  validateDate(startDate, "startDate");
  validateDate(endDate, "endDate");
  validateTime(startTime, "startTime");
  validateTime(endTime, "endTime");

  const dateKey = (value) => {
    const [day, month, year] = value.split("/");
    return `${year}${month}${day}`;
  };

  if (dateKey(startDate) > dateKey(endDate)) {
    throw new Error("startDate cannot be later than endDate.");
  }

  if (startDate === endDate && startTime > endTime) {
    throw new Error("startTime cannot be later than endTime on the same date.");
  }

  return { startDate, endDate, startTime, endTime };
};

export const buildGetTrendlogBody = () => new URLSearchParams(buildBaseBody());

export const buildGetTrendlogDataBody = ({
  host = DEFAULTS.host,
  instance,
  ...dateOptions
} = {}) => {
  validateRequired(instance, "instance");
  validateHost(host);

  return new URLSearchParams({
    ...buildBaseBody(),
    host: String(host),
    instance: String(instance),
    ...buildDateRange(dateOptions),
  });
};

export const buildGetEnergylogBody = () => new URLSearchParams(buildBaseBody());

export const buildGetEnergylogDataBody = ({
  host = DEFAULTS.host,
  instance,
  parameter,
  ...dateOptions
} = {}) => {
  validateRequired(instance, "instance");
  validateRequired(parameter, "parameter");
  validateHost(host);

  if (!Number.isInteger(Number(parameter)) || Number(parameter) < 0) {
    throw new Error("parameter must be a non-negative integer.");
  }

  return new URLSearchParams({
    ...buildBaseBody(),
    host: String(host),
    instance: String(instance),
    parameter: String(parameter),
    ...buildDateRange(dateOptions),
  });
};
