// 类型定义
export type Bindings = {
  UPSTASH_REDIS_REST_URL: string
  UPSTASH_REDIS_REST_TOKEN: string
  DEFAULT_RATE_LIMIT: string
  DEFAULT_WINDOW: string
}

export interface RateLimitStatus {
  isAllowed: boolean
  current: number
  limit: number
  remaining: number
  window: number
  whitelisted?: boolean
} 