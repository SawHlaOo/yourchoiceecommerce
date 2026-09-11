import { z } from "zod";

export const flagSchema = z.object({
  key: z.string().trim().min(2).regex(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "Use lowercase words separated by _ or -"),
  enabled: z.boolean().optional(),
});
