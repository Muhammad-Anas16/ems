import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CalendarDays, Clock3, RotateCcw, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dateRangeSchema } from "../schema/dateRangeSchema.js";
import getStructuredData from "@/data/strutureData.js";

const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-[#151719] px-3 text-sm text-white outline-none [color-scheme:dark] focus:border-white/30";

const labelClass = "mb-2 block text-xs font-medium text-zinc-400";

const Field = ({ label, error, children }) => {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="min-w-0">
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>

      {children}

      {error && (
        <p role="alert" className="mt-1 text-xs text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
};

const formatLabel = (value) =>
  String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const HeroSection = ({ onApply, filterLoad }) => {
  const meters = useMemo(() => {
    const data = getStructuredData();
    return Array.isArray(data) ? data : [];
  }, []);

  const divisions = useMemo(
    () => [...new Set(meters.map((meter) => meter.division).filter(Boolean))],
    [meters],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(dateRangeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      fromDate: "",
      fromTime: "",
      toDate: "",
      toTime: "",
      division: divisions[0] ?? "",
      department: "all",
    },
  });

  const selectedDivision = watch("division");
  const selectedDepartment = watch("department");

  const departments = useMemo(() => {
    return [
      ...new Set(
        meters
          .filter((meter) => meter.division === selectedDivision)
          .map((meter) => meter.department)
          .filter(Boolean),
      ),
    ];
  }, [meters, selectedDivision]);

  useEffect(() => {
    if (
      selectedDepartment !== "all" &&
      !departments.includes(selectedDepartment)
    ) {
      setValue("department", "all", {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [departments, selectedDepartment, setValue]);

  const handleDivisionChange = () => {
    setValue("department", "all", {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  const submit = (formValues) => {
    const startDateTime = new Date(
      `${formValues.fromDate}T${formValues.fromTime}:00`,
    ).getTime();

    const endDateTime = new Date(
      `${formValues.toDate}T${formValues.toTime}:00`,
    ).getTime();

    const filteredData = meters.filter((meter) => {
      const matchesDivision = meter.division === formValues.division;

      const matchesDepartment =
        formValues.department === "all" ||
        meter.department === formValues.department;

      return matchesDivision && matchesDepartment;
    });

    const result = {
      ...formValues,
      startDateTime,
      endDateTime,
      data: filteredData,
    };

    if (typeof onApply === "function") {
      onApply(result);
    } else {
      console.log("Filtered EMS data:", result);
    }
  };

  const resetFields = () => {
    reset({
      fromDate: "",
      fromTime: "",
      toDate: "",
      toTime: "",
      division: divisions[0] ?? "",
      department: "all",
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101214] p-5 text-white sm:p-7">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          <Filter className="h-4 w-4" />
          Energy Monitoring
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Industrial Energy Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Select a date range, division and department to filter meter data.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
        {/* Start date and time */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <CalendarDays className="h-4 w-4" />
              From
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Start date" error={errors.fromDate}>
                <input
                  id="start-date"
                  type="date"
                  {...register("fromDate")}
                  aria-invalid={Boolean(errors.fromDate)}
                  className={inputClass}
                />
              </Field>

              <Field label="Start time" error={errors.fromTime}>
                <input
                  id="start-time"
                  type="time"
                  {...register("fromTime")}
                  aria-invalid={Boolean(errors.fromTime)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* End date and time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Clock3 className="h-4 w-4" />
              To
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="End date" error={errors.toDate}>
                <input
                  id="end-date"
                  type="date"
                  {...register("toDate")}
                  aria-invalid={Boolean(errors.toDate)}
                  className={inputClass}
                />
              </Field>

              <Field label="End time" error={errors.toTime}>
                <input
                  id="end-time"
                  type="time"
                  {...register("toTime")}
                  aria-invalid={Boolean(errors.toTime)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {errors.root?.message && (
          <p role="alert" className="text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        {/* Division and department */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Division" error={errors.division}>
            <select
              id="division"
              {...register("division", {
                onChange: handleDivisionChange,
              })}
              aria-invalid={Boolean(errors.division)}
              className={inputClass}
            >
              {divisions.length === 0 && (
                <option value="">No divisions available</option>
              )}

              {divisions.map((division) => (
                <option key={division} value={division}>
                  {formatLabel(division)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department" error={errors.department}>
            <select
              id="department"
              {...register("department")}
              aria-invalid={Boolean(errors.department)}
              className={inputClass}
            >
              <option value="all">All Departments</option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {formatLabel(department)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row">
          <Button
            type="submit"
            disabled={filterLoad || isSubmitting || divisions.length === 0}
            className={`h-11 rounded-lg px-6 font-semibold transition-all duration-200 ${
              filterLoad
                ? "cursor-progress bg-zinc-800 text-zinc-400"
                : divisions.length === 0 || isSubmitting
                  ? "cursor-progress bg-zinc-800 text-zinc-500"
                  : "cursor-pointer bg-white text-black hover:bg-zinc-200 active:scale-[0.98]"
            }`}
          >
            {filterLoad ? "Loading..." : "Apply Filters"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={resetFields}
            className="h-11 border-white/10 bg-transparent text-white hover:bg-white/[0.06] hover:text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </form>
    </section>
  );
};

export default HeroSection;
