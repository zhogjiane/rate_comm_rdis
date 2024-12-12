// Redis 服务
import { Redis } from '@upstash/redis/cloudflare'
import { Bindings } from '../types'
import { REDIS_KEYS } from '../constants'

export class RedisService {
  private redis: Redis
  private static instance: Redis | null = null

  constructor(env: Bindings) {
    try {
      // 首先检查环境变量
      if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
        console.error('Redis 环境变量缺失:', {
          hasUrl: !!env.UPSTASH_REDIS_REST_URL,
          hasToken: !!env.UPSTASH_REDIS_REST_TOKEN
        })
        throw new Error('Redis 配置缺失: 请检查环境变量')
      }

      // 使用单例模式
      if (!RedisService.instance) {
        console.log('初始化 Redis 连接...')
        
        // 使用 Cloudflare Workers 专用的初始化方式
        RedisService.instance = new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN
        })
      }
      
      this.redis = RedisService.instance
    } catch (error) {
      console.error('Redis 连接初始化失败:', error)
      throw new Error(`Redis 连接初始��失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async isInWhitelist(endpoint: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(REDIS_KEYS.WHITELIST, endpoint)
      return result === 1
    } catch (error) {
      console.error('检查白名单失败:', error)
      throw new Error('检查白名单失败')
    }
  }

  async getRateLimitConfig(endpoint: string, env: Bindings) {
    try {
      const configKey = REDIS_KEYS.CONFIG_PREFIX + endpoint
      const config = await this.redis.hgetall<Record<string, string>>(configKey)
      
      if (config && config.limit && config.window) {
        return {
          limit: parseInt(config.limit),
          window: parseInt(config.window),
        }
      }

      return {
        limit: parseInt(env.DEFAULT_RATE_LIMIT),
        window: parseInt(env.DEFAULT_WINDOW),
      }
    } catch (error) {
      console.error('获取限流配置失败:', error)
      throw new Error('获取限流配置失败')
    }
  }

  async rateLimiter(key: string, limit: number, window: number) {
    try {
      const now = Date.now()
      const clearBefore = now - window * 1000

      // 使用 pipeline 来保证原子性
      const multi = this.redis.pipeline()
      multi.zremrangebyscore(key, 0, clearBefore)  // 清除过期的记录
      multi.zadd(key, { score: now, member: now.toString() })  // 添加新记录
      multi.zcard(key)  // 获取当前数量
      multi.expire(key, window)  // 设置过期时间

      const results = await multi.exec()
      const current = results[2] as number

      return {
        isAllowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        window
      }
    } catch (error) {
      console.error('限流检查失败:', error)
      throw new Error('限流检查失败')
    }
  }
} 