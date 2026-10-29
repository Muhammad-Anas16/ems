import { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import {
  Activity,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { meterSchema } from "../schema/meterSchema";

const metersSchema = yup.array().of(meterSchema).required();

const PAGE_SIZE = 10;

const getRecords = (reading) => {
  const records = reading?.data?.response?.record;
  return Array.isArray(records) ? records : [];
};

const getReading = (reading, position = "first") => {
  const records = getRecords(reading);

  if (records.length === 0) return null;

  return position === "last" ? records[records.length - 1] : records[0];
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
};

const formatDateTime = (value) => {
  if (!value) return "Timestamp unavailable";

  // Preserve the API timestamp if it cannot be parsed.
  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatLabel = (value) =>
  String(value ?? "-")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const ReadingDisplay = ({ value, unit, timestamp, emphasis = false }) => {
  return (
    <div className="flex min-w-[145px] flex-col items-end gap-1.5">
      <div className="flex items-baseline justify-end gap-1.5">
        <span
          className={`font-mono text-sm font-semibold tabular-nums ${
            emphasis ? "text-white" : "text-zinc-200"
          }`}
        >
          {formatValue(value)}
        </span>

        {unit && (
          <span className="text-[11px] font-medium text-zinc-500">{unit}</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-1.5 text-right">
        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-zinc-600" />

        <span className="text-[11px] leading-4 text-zinc-500">
          {formatDateTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

const DataTables = ({ tableData = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const validData = useMemo(() => {
    try {
      return metersSchema.validateSync(
        Array.isArray(tableData) ? tableData : [],
        {
          strict: true,
          abortEarly: false,
        },
      );
    } catch (error) {
      console.error("Table data validation failed:", error.errors);
      return [];
    }
  }, [tableData]);

  const rows = useMemo(() => {
    return validData.map((meter, index) => {
      const fromRecord = getReading(meter.FromData, "first");
      const toRecord = getReading(meter.ToData, "last");

      const fromValue =
        fromRecord?.value !== undefined &&
        fromRecord?.value !== null &&
        fromRecord?.value !== ""
          ? Number(fromRecord.value)
          : null;

      const toValue =
        toRecord?.value !== undefined &&
        toRecord?.value !== null &&
        toRecord?.value !== ""
          ? Number(toRecord.value)
          : null;

      const difference =
        fromValue !== null &&
        toValue !== null &&
        Number.isFinite(fromValue) &&
        Number.isFinite(toValue)
          ? toValue - fromValue
          : null;

      return {
        id: `${meter.name}-${index}`,
        name: meter.name || "Unknown Meter",
        division: meter.division || "-",
        department: meter.department || "-",

        fromValue,
        fromTime: fromRecord?.time ?? null,
        fromUnit: fromRecord?.unit ?? null,

        toValue,
        toTime: toRecord?.time ?? null,
        toUnit: toRecord?.unit ?? null,

        difference,
        unit: toRecord?.unit ?? fromRecord?.unit ?? null,
      };
    });
  }, [validData]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return rows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [rows, safePage]);

  const startItem = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, rows.length);

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#101214] p-4 text-white sm:p-6">
      {/* Section heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            <Activity className="h-4 w-4" />
            Meter Overview
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-white">
            Energy Readings
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Compare readings and timestamps for each meter.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit rounded-full border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300"
        >
          {rows.length} {rows.length === 1 ? "Meter" : "Meters"}
        </Badge>
      </div>

      {/* Data table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#101214]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.025]">
                <TableHead className="h-12 min-w-[190px] pl-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Meter
                </TableHead>

                <TableHead className="h-12 min-w-[130px] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Division
                </TableHead>

                <TableHead className="h-12 min-w-[140px] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Department
                </TableHead>

                <TableHead className="h-12 min-w-[190px] text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  From
                </TableHead>

                <TableHead className="h-12 min-w-[190px] text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  To
                </TableHead>

                <TableHead className="h-12 min-w-[145px] pr-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Difference
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-white/[0.06] transition-colors hover:bg-white/[0.025]"
                  >
                    {/* Meter */}
                    <TableCell className="py-4 pl-4">
                      <span className="font-medium text-zinc-100">
                        {row.name}
                      </span>
                    </TableCell>

                    {/* Division */}
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className="rounded-md border-white/10 bg-white/[0.035] font-medium text-zinc-300"
                      >
                        {formatLabel(row.division)}
                      </Badge>
                    </TableCell>

                    {/* Department */}
                    <TableCell className="py-4 text-sm text-zinc-400">
                      {formatLabel(row.department)}
                    </TableCell>

                    {/* From reading and timestamp */}
                    <TableCell className="py-4 text-right">
                      <ReadingDisplay
                        value={row.fromValue}
                        unit={row.fromUnit}
                        timestamp={row.fromTime}
                      />
                    </TableCell>

                    {/* To reading and timestamp */}
                    <TableCell className="py-4 text-right">
                      <ReadingDisplay
                        value={row.toValue}
                        unit={row.toUnit}
                        timestamp={row.toTime}
                        emphasis
                      />
                    </TableCell>

                    {/* Difference */}
                    <TableCell className="py-4 pr-4 text-right">
                      {row.difference !== null ? (
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              row.difference > 0
                                ? "text-emerald-400"
                                : row.difference < 0
                                  ? "text-rose-400"
                                  : "text-zinc-300"
                            }`}
                          >
                            {row.difference > 0 ? "+" : ""}
                            {formatValue(row.difference)}
                          </span>

                          {row.unit && (
                            <span className="text-[11px] text-zinc-500">
                              {row.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-600">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableCell colSpan={6} className="h-36 text-center">
                    <div className="text-sm font-medium text-zinc-300">
                      No energy readings available
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      Apply filters to load meter data.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500">
          Showing <span className="font-medium text-zinc-300">{startItem}</span>
          {"–"}
          <span className="font-medium text-zinc-300">{endItem}</span>
          {" of "}
          <span className="font-medium text-zinc-300">{rows.length}</span>{" "}
          meters
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="h-9 border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-35"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="min-w-[85px] text-center text-xs text-zinc-400">
            Page <span className="font-medium text-white">{safePage}</span>
            {" of "}
            <span className="font-medium text-white">{totalPages}</span>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="h-9 border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-35"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DataTables;
