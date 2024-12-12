// 白名单控制器
import { Context } from 'hono'
import { RedisService } from '../services/redis'
import { Bindings } from '../types'
import { REDIS_KEYS } from '../constants'
import { WhitelistConfig, WhitelistConfigSchema } from '../schemas'

export class WhitelistController {
  static async add(c: Context<{ Bindings: Bindings }>) {
    const redisService = new RedisService(c.env)
    const data = await c.req.json()
    const result = WhitelistConfigSchema.safeParse(data)
    
    if (!result.success) {
      return c.json({
        success: false,
        message: '请求参数验证失败',
        errors: result.error.errors
      }, 400)
    }

    const { endpoint, description = '' } = result.data

    const multi = redisService['redis'].pipeline()
    multi.sadd(REDIS_KEYS.WHITELIST, endpoint)
    if (description) {
      multi.hset(`${REDIS_KEYS.WHITELIST}:meta`, { [endpoint]: description })
    }
    await multi.exec()

    return c.json({
      success: true,
      message: '接口已经添加到白名单',
      endpoint,
      description,
    })
  }

  static async list(c: Context<{ Bindings: Bindings }>) {
    try {
      const redisService = new RedisService(c.env)
      const redis = redisService['redis']
      
      // 获取所有白名单 endpoints
      const endpoints = await redis.smembers(REDIS_KEYS.WHITELIST)
      if (!endpoints) {
        return c.json({
          success: true,
          data: []
        })
      }
      
      // 获取描述信息
      let descriptions = {}
      try {
        descriptions = await redis.hgetall(`${REDIS_KEYS.WHITELIST}:meta`) || {}
      } catch (error) {
        console.error('获取描述信息失败:', error)
        // 如果获取描述失败，继续使用空对象
      }
      
      const whitelist = endpoints.map(endpoint => ({
        endpoint,
        description: descriptions?.[endpoint] || ''
      }))

      return c.json({
        success: true,
        data: whitelist
      })
    } catch (error) {
      console.error('获取白名单列表失败:', error)
      const message = error instanceof Error ? error.message : '未知错误'
      return c.json({
        success: false,
        message: `获取白名单列表失败: ${message}`,
        error: message
      }, 500)
    }
  }

  static async remove(c: Context<{ Bindings: Bindings }>) {
    const redisService = new RedisService(c.env)
    const endpoint = c.req.path.replace('/whitelist/', '')
    
    const multi = redisService['redis'].pipeline()
    multi.srem(REDIS_KEYS.WHITELIST, endpoint)
    multi.hdel(`${REDIS_KEYS.WHITELIST}:meta`, endpoint)
    await multi.exec()

    return c.json({
      success: true,
      message: '接口已从白名单移除',
      endpoint
    })
  }

  // ... 其他白名单相关方法
} 