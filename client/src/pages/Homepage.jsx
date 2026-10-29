import { useState } from "react";
import { getEnergyLogDataValues, getEnergyLogValues } from "@/api/api";
import HeroSection from "@/components/home/HeroSection";
import getInstanceParameters from "@/lib/getInstanceParameters";
import DataTables from "@/components/home/tables";

const formatDate = (value) => {
  if (!value) return "";

  const input = String(value).trim();
  const ymdMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  const dmyMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmyMatch) return input;

  return "";
};

const formatTime = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;
  }

  const input = String(value).trim();
  const match = input.match(/(?:T|\s|^)(\d{2}):(\d{2})/);

  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return "";

  return `${match[1]}:${match[2]}`;
};

const toComparableDate = (value) => {
  if (!value) return "";

  const input = String(value).trim();
  const ymdMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }

  const dmyMatch = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month}-${day}`;
  }

  return "";
};

// API response mein instance ID ke mutabiq reading dhoondta hai.
const findReadingForInstance = (response, instance) => {
  const payload = response?.data ?? response;
  const visited = new Set();

  const instanceKeys = [
    "instance",
    "instanceId",
    "instance_id",
    "meterInstance",
    "meter_instance",
  ];

  const search = (value) => {
    if (!value || typeof value !== "object" || visited.has(value)) {
      return null;
    }

    visited.add(value);

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = search(item);
        if (found !== null) return found;
      }

      return null;
    }

    const matchingInstance = instanceKeys.some(
      (key) =>
        value[key] !== undefined && String(value[key]) === String(instance),
    );

    if (matchingInstance) {
      return value;
    }

    for (const child of Object.values(value)) {
      const found = search(child);
      if (found !== null) return found;
    }

    return null;
  };

  return search(payload);
};

const Homepage = () => {
  const [savedData, setSavedData] = useState([]);
  const [selectedParameter, setSelectedParameter] = useState("0");
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [filterLoad, setFilterLoad] = useState(false);

  const handleApply = async (result, options = {}) => {
    const meters = Array.isArray(result?.data) ? result.data : [];

    const dateRange = options.useSavedRange
      ? selectedDateRange
      : {
          fromDate: result?.fromDate,
          toDate: result?.toDate,
          startDateTime: result?.startDateTime,
          endDateTime: result?.endDateTime,
        };

    setErrorMessage("");

    if (!dateRange) {
      setErrorMessage("Pehle From aur To date/time select karein.");
      return;
    }

    if (meters.length === 0) {
      setErrorMessage("Selected filters ke liye koi meter nahi mila.");
      return;
    }

    const fromDate = formatDate(dateRange.fromDate);
    const toDate = formatDate(dateRange.toDate);
    const startTime = formatTime(dateRange.startDateTime);
    const endTime = formatTime(dateRange.endDateTime);

    if (!fromDate || !toDate || !startTime || !endTime) {
      setErrorMessage("From/To date ya time missing ya invalid hai.");
      console.error("Invalid date/time range:", dateRange);
      return;
    }

    const comparableFromDate = toComparableDate(fromDate);
    const comparableToDate = toComparableDate(toDate);

    if (
      comparableFromDate &&
      comparableToDate &&
      comparableToDate < comparableFromDate
    ) {
      setErrorMessage("To date, From date se pehle nahi ho sakti.");
      return;
    }

    if (comparableFromDate === comparableToDate && endTime < startTime) {
      setErrorMessage(
        "Same date ke liye To time, From time ke barabar ya uske baad hona chahiye.",
      );
      return;
    }

    setSelectedDateRange(dateRange);
    setLoading(true);

    try {
      const instances = [
        ...new Set(
          meters
            .map((item) => item?.kwh)
            .filter(
              (instance) =>
                instance !== null &&
                instance !== undefined &&
                String(instance).trim() !== "",
            )
            .map(String),
        ),
      ];

      if (instances.length === 0) {
        throw new Error(
          "Selected meters mein valid instance IDs nahi milin. item.kwh check karein.",
        );
      }

      setFilterLoad(true);

      // Step 1: Instance metadata fetch karein.
      const metadata = await getEnergyLogValues(instances);

      const energylogs =
        metadata?.data?.response?.energylog ??
        metadata?.response?.energylog ??
        [];

      if (!Array.isArray(energylogs)) {
        throw new Error("Energylog metadata ka response format invalid hai.");
      }

      // Step 2: Selected parameter ke instances nikaalein.
      const filteredParameters = getInstanceParameters(
        energylogs,
        instances,
        selectedParameter,
      );

      setRequestData(filteredParameters);

      if (filteredParameters.length === 0) {
        setSavedData([]);
        setErrorMessage(
          "Selected parameter ke liye matching instances nahi mile.",
        );
        return;
      }

      // Step 3: From aur To readings fetch karein.
      const [fromResponse, toResponse] = await Promise.all([
        getEnergyLogDataValues(filteredParameters, fromDate, startTime),
        getEnergyLogDataValues(filteredParameters, toDate, endTime),
      ]);

      // Step 4: Har meter ka data ek hi state mein save karein.
      const nextSavedData = meters.map((meter) => {
        const instance = meter?.kwh;

        const matchingParameter = filteredParameters.find(
          (item) => String(item?.instance) === String(instance),
        );

        const parameterInstance = matchingParameter?.instance ?? instance;

        return {
          name: meter?.name ?? meter?.Name ?? "",
          division: meter?.division ?? meter?.Division ?? "",
          department:
            meter?.department ??
            meter?.deparment ??
            meter?.Department ??
            meter?.Deparment ??
            "",
          FromData: findReadingForInstance(fromResponse, parameterInstance),
          ToData: findReadingForInstance(toResponse, parameterInstance),
        };
      });

      setSavedData(nextSavedData);
      setFilterLoad(false);

      // console.log("Saved meter data:", nextSavedData);
    } catch (error) {
      console.error("Energylog request error:", error);

      setFilterLoad(false);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Energylog data fetch karte waqt error aaya.",
      );
    } finally {
      setLoading(false);
      setFilterLoad(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">
      <HeroSection onApply={handleApply} filterLoad={filterLoad} />
      <DataTables tableData={savedData} />

      {loading && (
        <p className="text-sm text-zinc-400">
          Energylog data load ho raha hai...
        </p>
      )}

      {errorMessage && (
        <p role="alert" className="text-sm text-amber-400">
          {errorMessage}
        </p>
      )}
    </main>
  );
};

export default Homepage;
