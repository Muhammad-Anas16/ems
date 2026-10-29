import BacNetData from "./BacNetData.js";

const getStructuredData = () => {
  const instances = [];

  Object.entries(BacNetData).forEach(([division, divisionData]) => {
    const departments = divisionData?.departments;

    if (!departments) return;

    Object.entries(departments).forEach(([department, meters]) => {
      Object.entries(meters).forEach(([instance, meter]) => {
        if (!meter || typeof meter !== "object") return;

        instances.push({
          name: meter.name ?? instance,
          division,
          department,
          instance,
          kwh: meter.kwh ?? null,
        });
      });
    });
  });

  return instances;
};

export default getStructuredData;
