// 路由定义
import { Hono } from 'hono'
import { Bindings } from '../types'
import { WhitelistController } from '../controllers/whitelist'
import { ConfigController } from '../controllers/config'
import { CheckController } from '../controllers/check'

export function createRouter() {
  const app = new Hono<{ Bindings: Bindings }>()

  // 健康检查
  app.get('/health', (c) => c.json({ status: 'ok' }))

  // 白名单相关路由
  app.post('/whitelist', WhitelistController.add)
  app.get('/whitelist', WhitelistController.list)
  app.delete('/whitelist/*', WhitelistController.remove)

  // 限流配置相关路由
  app.post('/config', ConfigController.set)
  app.get('/config/*', ConfigController.get)

  // 限流检查路由
  app.get('/check/*', CheckController.check)

  return app
} 