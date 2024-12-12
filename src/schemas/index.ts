// Schema 定义
import { z } from 'zod'

export const RateLimitConfigSchema = z.object({
  endpoint: z.string(),
  limit: z.number().int().positive(),
  window: z.number().int().positive(),
})

export const WhitelistConfigSchema = z.object({
  endpoint: z.string(),
  description: z.string().optional(),
})

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>
export type WhitelistConfig = z.infer<typeof WhitelistConfigSchema> 