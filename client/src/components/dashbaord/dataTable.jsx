import React, { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

const DataTable = ({ data }) => {
  const tableData = useMemo(() => {
    if (!data || !Array.isArray(data.from) || !Array.isArray(data.to)) {
      return [];
    }

    // TO records ko instance ke according map kar rahe hain
    const toMap = new Map(data.to.map((item) => [String(item.instance), item]));

    // FROM records ko same instance ke TO record se match kar rahe hain
    return data.from.map((fromItem, index) => {
      const toItem = toMap.get(String(fromItem.instance));

      const fromValue =
        typeof fromItem.record === "number"
          ? fromItem.record
          : Array.isArray(fromItem.record)
            ? Number(fromItem.record[0]?.value ?? 0)
            : 0;

      const toValue =
        typeof toItem?.record === "number"
          ? toItem.record
          : Array.isArray(toItem?.record)
            ? Number(toItem.record[0]?.value ?? 0)
            : 0;

      return {
        sno: index + 1,
        name: fromItem.name || toItem?.name || "Unknown Meter",
        instance: fromItem.instance,
        division: data.division,
        department: data.department,
        fromValue,
        toValue,
        difference: toValue - fromValue,
      };
    });
  }, [data]);

  const formatValue = (value) => {
    return Number(value).toLocaleString("en-US", {
      maximumFractionDigits: 3,
    });
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#101214] text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
            Energy Monitoring
          </div>

          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Meter Comparison
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Compare meter readings between selected dates and times.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="border-white/10 bg-[#151719] px-3 py-1 text-zinc-300"
          >
            {data?.division || "N/A"}
          </Badge>

          <Badge
            variant="outline"
            className="border-white/10 bg-[#151719] px-3 py-1 text-zinc-300"
          >
            {data?.department || "N/A"}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-[#151719] hover:bg-[#151719]">
              <TableHead className="w-16 whitespace-nowrap text-zinc-400">
                S.No
              </TableHead>

              <TableHead className="min-w-[260px] text-zinc-400">
                Meter Name
              </TableHead>

              <TableHead className="whitespace-nowrap text-zinc-400">
                Division
              </TableHead>

              <TableHead className="whitespace-nowrap text-zinc-400">
                Department
              </TableHead>

              <TableHead className="whitespace-nowrap text-right text-zinc-400">
                From
              </TableHead>

              <TableHead className="whitespace-nowrap text-right text-zinc-400">
                To
              </TableHead>

              <TableHead className="whitespace-nowrap text-right text-zinc-400">
                From - To
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableData.length > 0 ? (
              tableData.map((item) => (
                <TableRow
                  key={item.instance}
                  className="border-white/[0.07] transition-colors hover:bg-white/[0.03]"
                >
                  <TableCell className="font-medium tabular-nums text-zinc-500">
                    {item.sno}
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-zinc-200">
                      {/* {item.name} */}
                      {item.name.split(" - ")[0]}
                    </div>

                    <div className="mt-1 text-xs text-zinc-500">
                      Instance: {item.instance}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap capitalize text-zinc-300">
                    {item.division}
                  </TableCell>

                  <TableCell className="whitespace-nowrap capitalize text-zinc-300">
                    {item.department}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right font-mono tabular-nums text-zinc-300">
                    {formatValue(item.fromValue)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right font-mono tabular-nums text-zinc-300">
                    {formatValue(item.toValue)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right">
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        item.difference > 0
                          ? "text-emerald-400"
                          : item.difference < 0
                            ? "text-red-400"
                            : "text-zinc-400"
                      }`}
                    >
                      {formatValue(item.difference)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-zinc-500"
                >
                  No meter data available. Apply filters to load readings.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-white/[0.08] px-5 py-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {tableData.length} meter{tableData.length !== 1 ? "s" : ""}
        </span>

        <span>Matched using meter instance IDs</span>
      </div>
    </section>
  );
};

export default DataTable;
