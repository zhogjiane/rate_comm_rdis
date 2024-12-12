# Rate Limit Worker

基于 Cloudflare Worker 的通用限流服务，使用 Upstash Redis 作为存储。

## 功能特性

- 支持自定义限流规则
- 支持白名单管理
- 支持多个接口独立配置
- 原子性操作保证
- 实时限流状态查询

## 部署说明

1. 克隆仓库： 