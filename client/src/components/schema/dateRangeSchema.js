import * as yup from "yup";

const dateSchema = yup
  .string()
  .required("Date is required.")
  .matches(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .test("valid-date", "Enter a valid date.", (value) => {
    if (!value) return true;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(0);

    date.setUTCHours(0, 0, 0, 0);
    date.setUTCFullYear(year, month - 1, day);

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  });

const timeSchema = yup
  .string()
  .required("Time is required.")
  .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.");

const combineDateTime = (date, time) =>
  new Date(`${date}T${time}:00`).getTime();

export const dateRangeSchema = yup
  .object({
    fromDate: dateSchema.label("Start date"),

    fromTime: timeSchema.label("Start time"),

    toDate: dateSchema
      .label("End date")
      .test(
        "end-date-after-start",
        "End date cannot be before the start date.",
        function (value) {
          const { fromDate } = this.parent;

          if (!fromDate || !value) return true;

          return value >= fromDate;
        },
      ),

    toTime: timeSchema
      .label("End time")
      .test(
        "end-after-start",
        "End date/time must be the same as or later than the start.",
        function (value) {
          const { fromDate, fromTime, toDate } = this.parent;

          if (!fromDate || !fromTime || !toDate || !value) {
            return true;
          }

          return (
            combineDateTime(toDate, value) >=
            combineDateTime(fromDate, fromTime)
          );
        },
      ),

    division: yup.string().required("Please select a division."),

    department: yup.string().required("Please select a department."),
  })
  .required();
