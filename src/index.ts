import { Hono } from 'hono'
import { createRouter } from './routes'
import { errorHandler } from './middlewares/error'

// 创建主应用实例
const app = new Hono()

// 添加错误处理中间件
app.use('*', errorHandler)

// 添加路由
const router = createRouter()
app.route('/', router)

export default app 