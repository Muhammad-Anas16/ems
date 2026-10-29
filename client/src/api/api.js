import axios from "axios";

const create = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Log

// export const getTrendLogValues = async (instances) => {
//   const res = await create.post("/aurora/trendlog", {
//     instances,
//   });

//   return res.data;
// };

export const getTrendLogValues = async (instances) => {
  try {
    const res = await create.post("/aurora/trendlog", {
      instances: instances.map(String),
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getEnergyLogValues = async (instances) => {
  const res = await create.post("/aurora/energylog", {
    instances,
  });

  return res.data;
};

// Log Data

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
