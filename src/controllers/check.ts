import { Context } from 'hono'
import { RedisService } from '../services/redis'
import { Bindings } from '../types'
import { REDIS_KEYS } from '../constants'

export class CheckController {
  static async check(c: Context<{ Bindings: Bindings }>) {
    const redisService = new RedisService(c.env)
    const endpoint = c.req.path.replace('/check/', '')
    
    // 检查是否在白名单中
    const isWhitelisted = await redisService.isInWhitelist(endpoint)
    if (isWhitelisted) {
      return c.json({
        success: true,
        status: {
          isAllowed: true,
          current: 0,
          limit: -1,
          remaining: -1,
          window: -1,
          whitelisted: true
        }
      })
    }

    // 获取限流配置
    const config = await redisService.getRateLimitConfig(endpoint, c.env)
    
    // 检查限流状态
    const counterKey = REDIS_KEYS.COUNTER_PREFIX + endpoint
    const status = await redisService.rateLimiter(
      counterKey,
      config.limit,
      config.window
    )

    return c.json({
      success: true,
      status: {
        ...status,
        whitelisted: false
      }
    })
  }
} 