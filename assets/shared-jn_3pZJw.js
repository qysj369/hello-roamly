import { eJ as url, et as string, dL as number, by as datetime } from "./index-DwV1qlqh.js";
const nonEmptyStringSchema = string().trim().min(1);
const isoDateTimeSchema = datetime({ offset: true });
const userIdSchema = nonEmptyStringSchema.max(128);
nonEmptyStringSchema.max(128);
const guestSessionIdSchema = nonEmptyStringSchema.max(128);
const countryCodeSchema = string().trim().length(2).regex(/^[A-Z]{2}$/, "须为两位大写国家/地区代码，如 CN、JP");
const httpUrlSchema = url({ protocol: /^https?$/ });
const nonNegativeIntSchema = number().int().min(0);
const positiveIntSchema = number().int().min(1);
export {
  nonNegativeIntSchema as a,
  countryCodeSchema as c,
  guestSessionIdSchema as g,
  httpUrlSchema as h,
  isoDateTimeSchema as i,
  nonEmptyStringSchema as n,
  positiveIntSchema as p,
  userIdSchema as u
};
