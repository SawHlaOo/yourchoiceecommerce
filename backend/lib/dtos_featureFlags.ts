import { z } from "zod";

const normalizeFlagKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const flagSchema = z.object({
  key: z
    .string()
    .transform((value) => normalizeFlagKey(value))
    .pipe(z.string().min(2).regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "Use lowercase words separated by _ or -")),
  enabled: z.boolean().optional(),
});
