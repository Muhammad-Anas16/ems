import * as yup from "yup";

export const meterSchema = yup
  .object({
    name: yup.string().default("Unknown Meter"),
    division: yup.string().default("-"),
    department: yup.string().default("-"),
    FromData: yup.mixed().nullable().default(null),
    ToData: yup.mixed().nullable().default(null),
  })
  .required();
