import { guidanceStateSchema, type GuidanceState } from '@/features/guidance/types';
import { z } from 'zod';

export const guidanceMessageSchema = z.object({
  type: z.literal('guidance'),
  frac: z.number(),
  offset_m: z.number(),
  next_stop: z.unknown(),
  delay_s: z.number(),
  state: guidanceStateSchema,
});

export type GuidanceMessage = {
  type: 'guidance';
  frac: number;
  offset_m: number;
  next_stop: string;
  delay_s: number;
  state: GuidanceState;
};

export function parseGuidanceMessage(raw: string): GuidanceMessage | null {
  try {
    const json: unknown = JSON.parse(raw);
    const parsed = guidanceMessageSchema.safeParse(json);
    if (!parsed.success) {
      return null;
    }
    const next = parsed.data.next_stop;
    return {
      type: 'guidance',
      frac: parsed.data.frac,
      offset_m: parsed.data.offset_m,
      next_stop: typeof next === 'string' ? next : '',
      delay_s: parsed.data.delay_s,
      state: parsed.data.state,
    };
  } catch {
    return null;
  }
}

export function isValidPosition(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
