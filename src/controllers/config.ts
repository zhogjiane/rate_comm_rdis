import { Context } from 'hono'
import { RedisService } from '../services/redis'
import { Bindings } from '../types'
import { REDIS_KEYS } from '../constants'
import { RateLimitConfig, RateLimitConfigSchema } from '../schemas'

export class ConfigController {
  static async set(c: Context<{ Bindings: Bindings }>) {
    const redisService = new RedisService(c.env)
    const data = await c.req.json()
    const result = RateLimitConfigSchema.safeParse(data)
    
    if (!result.success) {
      return c.json({
        success: false,
        message: '请求参数验证失败',
        errors: result.error.errors
      }, 400)
    }

    const { endpoint, limit, window } = result.data
    const configKey = REDIS_KEYS.CONFIG_PREFIX + endpoint
    
    await redisService['redis'].hset(configKey, {
      limit: limit.toString(),
      window: window.toString()
    })

    return c.json({
      success: true,
      message: '限流配置已更新',
      data: { endpoint, limit, window }
    })
  }

  static async get(c: Context<{ Bindings: Bindings }>) {
    const redisService = new RedisService(c.env)
    const endpoint = c.req.path.replace('/config/', '')
    const config = await redisService.getRateLimitConfig(endpoint, c.env)

    return c.json({
      success: true,
      data: {
        endpoint,
        ...config
      }
    })
  }
} 