import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

export const healthSchema = z.object({
  status: z.literal('ok'),
});

export type Health = z.infer<typeof healthSchema>;

export function getHealth(): Promise<Health> {
  return api.get('/health', healthSchema);
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });
}
