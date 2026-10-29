const getInstanceParameters = (
  energylogs,
  selectedInstances,
  selectedParameter,
) => {
  if (
    !Array.isArray(energylogs) ||
    !Array.isArray(selectedInstances) ||
    selectedParameter === "" ||
    selectedParameter === null ||
    selectedParameter === undefined
  ) {
    return [];
  }

  const instanceSet = new Set(
    selectedInstances.map((instance) => String(instance)),
  );

  const parameterCode = String(selectedParameter);
  const result = [];

  energylogs.forEach((item) => {
    if (!instanceSet.has(String(item.instance))) {
      return;
    }

    const parameters = Array.isArray(item.parameter)
      ? item.parameter
      : [item.parameter];

    const hasParameter = parameters.some(
      (parameter) => String(parameter) === parameterCode,
    );

    if (hasParameter) {
      result.push({
        instance: Number(item.instance),
        parameter: Number(parameterCode),
      });
    }
  });

  return result;
};

export default getInstanceParameters;
