import { useState } from "react";
import { getTrendLogValues } from "@/api/api";
import HeroSection from "@/components/home/HeroSection";

const DashboardPage = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleApply = async (result) => {
    const meters = Array.isArray(result?.data) ? result.data : [];

    setErrorMessage("");
    setMetadata(null);

    if (meters.length === 0) {
      setErrorMessage("Selected filters ke liye koi meter nahi mila.");
      console.warn("No meters found:", result);
      return;
    }

    const instances = [
      ...new Set(
        meters
          .map((meter) => meter?.kwh)
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
      setErrorMessage("Valid instance IDs nahi milin.");
      console.error("Meter objects:", meters);
      return;
    }

    setLoading(true);

    try {
      const response = await getTrendLogValues(instances);
      const filter = (response?.data.response.trendlog).map(
        (item) => item.instance,
      );

      console.log(filter);
      console.log(response?.data.response.trendlog);

      setMetadata(response);
    } catch (error) {
      console.error("getTrendLogValues API error:", error);
      console.error("Error response:", error?.response?.data);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Trend log data fetch nahi ho saka.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-black p-4 text-white sm:p-6">
      <HeroSection onApply={handleApply} filterLoad={loading} />

      <section className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
        <div className="border-b border-zinc-700 px-4 py-3">
          <h2 className="text-lg font-semibold">Trend Log API Response</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Sirf getTrendLogValues API ka response.
          </p>
        </div>

        <div className="p-4">
          {loading && (
            <p className="text-sm text-zinc-400">
              Trend log data load ho raha hai...
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-red-700/50 bg-red-950/30 p-3 text-sm text-red-400"
            >
              {errorMessage}
            </p>
          )}

          {!loading && !errorMessage && metadata === null && (
            <p className="text-sm text-zinc-400">
              Filters select karein aur Apply par click karein.
            </p>
          )}

          {metadata !== null && (
            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-zinc-800 bg-black p-4 text-xs leading-6 text-green-400 sm:text-sm">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
