import axios from "axios";

// const create = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api",
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
//   timeout: 30000,
// });

const create = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

export const getTrendLogValues = async (instances) => {
  const res = await create.post("/aurora/energylog", {
    instances,
  });

  return res.data;
};

export const getEnergyLogValues = async (instances) => {
  const res = await create.post("/aurora/energylog", {
    instances,
  });

  return res.data;
};

export const getEnergyLogDataValues = async (
  items,
  startDate,
  startTime = "00:00",
  endTime = "23:59",
) => {
  const res = await create.post("/aurora/energylog-data", {
    items,
    startDate,
    endDate: startDate,
    startTime,
    endTime,
  });

  return res.data;
};
