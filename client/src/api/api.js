// import axios from "axios";

// const create = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
//   timeout: 30000,
// });

// export const getTrendLogValues = async (instances) => {
//   const res = await create.post("/aurora/energylog", {
//     instances,
//   });

//   return res.data;
// };

// export const getEnergyLogValues = async (instances) => {
//   const res = await create.post("/aurora/energylog", {
//     instances,
//   });

//   return res.data;
// };

// export const getEnergyLogDataValues = async (
//   items,
//   startDate,
//   startTime = "00:00",
//   endTime = "23:59",
// ) => {
//   const res = await create.post("/aurora/energylog-data", {
//     items,
//     startDate,
//     endDate: startDate,
//     startTime,
//     endTime,
//   });

//   return res.data;
// };

import axios from "axios";

// Same-origin API for production.
// Vite proxy forwards /api requests during development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

export const getTrendLogValues = async (instances) => {
  const response = await api.post("/aurora/trendlog", {
    instances,
  });

  return response.data;
};

export const getEnergyLogValues = async (instances) => {
  const response = await api.post("/aurora/energylog", {
    instances,
  });

  return response.data;
};

/**
 * Fetch energylog readings for the exact selected range.
 * Dates: DD/MM/YYYY
 * Times: HH:MM (24-hour format)
 */
export const getEnergyLogDataValues = async (
  items,
  startDate,
  endDate,
  startTime = "00:00",
  endTime = "23:59",
) => {
  const response = await api.post("/aurora/energylog-data", {
    items,
    startDate,
    endDate,
    startTime,
    endTime,
  });

  return response.data;
};
