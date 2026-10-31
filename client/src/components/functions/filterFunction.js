export const filterInstances = (response) => {
  const filter =
    response?.data?.response?.trendlog?.map((item) => item.instance) || [];

  return filter;
};

export const filterTrendLogDataValues = (data, response) => {
  const res1 = data?.data?.map((item) =>
    item?.data ? item.data.response : item,
  );

  const trendlogs = response?.data?.response?.trendlog || [];

  const result = res1?.map((item) => {
    const matchedMeter = trendlogs.find(
      (meter) => String(meter.instance) === String(item?.instance),
    );

    return {
      name: matchedMeter?.description || "",
      instance: item?.instance,
      record: item?.record === undefined ? 0 : item.record,
    };
  });

  return result || [];
};
