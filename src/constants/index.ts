// 常量定义
export const REDIS_KEYS = {
  WHITELIST: 'ratelimit:whitelist',
  CONFIG_PREFIX: 'ratelimit:config:',
  COUNTER_PREFIX: 'ratelimit:counter:'
} as const 