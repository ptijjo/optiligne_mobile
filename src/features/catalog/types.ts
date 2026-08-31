import { z } from 'zod';

export const routeSchema = z.object({
  id: z.string(),
  shortName: z.string(),
  longName: z.string(),
  routeType: z.number(),
});

export const tripSchema = z.object({
  id: z.string(),
  headsign: z.string(),
  routeId: z.string(),
  departureSec: z.number().int().nonnegative().default(0),
});

export const stopSchema = z.object({
  stopId: z.string(),
  name: z.string(),
  sequence: z.number().int(),
  arrivalSec: z.number().int().nonnegative(),
  departureSec: z.number().int().nonnegative(),
});

export const routesSchema = z.array(routeSchema);
export const tripsSchema = z.array(tripSchema);
export const stopsSchema = z.array(stopSchema);

export type Route = z.infer<typeof routeSchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Stop = z.infer<typeof stopSchema>;
