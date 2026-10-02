import { z } from "zod";

const optionalText = z.string().nullish().catch(undefined);
export const rawSiteSchema = z.object({
  domain: z.string(),
  url: optionalText,
  title: optionalText,
  ai_summary: optionalText,
  category: optionalText,
  ai_categories: z.array(z.string()).nullish().catch(undefined),
  ai_source: optionalText,
  dr: z.number().finite().min(0).max(100).nullish().catch(undefined),
  went_live: optionalText,
  first_seen: optionalText,
  tld: optionalText,
  http_status: z.number().int().min(100).max(599).nullish().catch(undefined),
});

export const searchEnvelopeSchema = z
  .object({
    ok: z.literal(true),
    index: z.literal("sites"),
    total: z.number().int().nonnegative(),
    count: z.number().int().min(0).max(100),
    from: z.number().int().nonnegative(),
    size: z.number().int().min(1).max(100),
    results: z.array(z.unknown()),
  })
  .refine(
    (data) => data.count === data.results.length,
    "Inconsistent result count",
  );

export const statsSchema = z.object({
  ok: z.literal(true),
  generated_at: z.string().datetime({ offset: true }),
  ai_startups: z.object({
    total: z.number().int().nonnegative(),
    today: z.number().int().nonnegative(),
  }),
});
