import { z } from 'zod';

export const guidanceStateSchema = z.enum(['on_route', 'off_route', 'ambiguous', 'arrived']);

export type GuidanceState = z.infer<typeof guidanceStateSchema>;

export const lineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
});

export const mapStopSchema = z.object({
  name: z.string(),
  lon: z.number(),
  lat: z.number(),
  arrivalSec: z.number().int().nonnegative().optional().default(0),
  sequence: z.number().int().nonnegative().optional().default(0),
});

export const startSessionSchema = z.object({
  sessionId: z.string(),
  tripId: z.string(),
  shape: lineStringSchema.optional(),
  stops: z.array(mapStopSchema).optional().default([]),
});

export type StartSession = z.infer<typeof startSessionSchema>;
