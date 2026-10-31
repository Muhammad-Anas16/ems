import { useState } from "react";
import { getTrendLogDataValues, getTrendLogValues } from "@/api/api";
import {
  filterInstances,
  filterTrendLogDataValues,
} from "@/components/functions/filterFunction";
import { dateFormat } from "@/components/functions/formatFunctions";
import DataTable from "@/components/dashbaord/dataTable";
import HeroSection from "@/components/dashbaord/HeroSection";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState({});

  const handleApply = async (result) => {
    const { data, division, department, fromDate, fromTime, toDate, toTime } =
      result;

    const meters = data || [];

    const instances = [...new Set(meters.map((meter) => String(meter.kwh)))];

    if (!instances.length) return;

    setLoading(true);

    try {
      const response = await getTrendLogValues(instances);
      const filter = filterInstances(response);

      const from_TrendLogData = await getTrendLogDataValues(
        filter,
        dateFormat(fromDate),
        fromTime,
      );

      const to_TrendLogData = await getTrendLogDataValues(
        filter,
        dateFormat(toDate),
        toTime,
      );

      setTableData({
        division: division,
        department: department,
        from: filterTrendLogDataValues(from_TrendLogData, response),
        to: filterTrendLogDataValues(to_TrendLogData, response),
      });
    } catch {
      // API error
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">
      <HeroSection onApply={handleApply} filterLoad={loading} />

      <DataTable data={tableData} />
    </main>
  );
};

export default DashboardPage;
