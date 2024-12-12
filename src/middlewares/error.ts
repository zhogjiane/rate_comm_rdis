import { Context, Next } from 'hono'
import { Bindings } from '../types'

export async function errorHandler(c: Context<{ Bindings: Bindings }>, next: Next) {
  try {
    await next()
  } catch (error) {
    console.error(error)
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : '服务器内部错误',
    }, 500)
  }
} 