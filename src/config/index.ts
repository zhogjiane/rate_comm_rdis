export const config = {
  redis: {
    keyPrefix: {
      whitelist: 'ratelimit:whitelist',
      config: 'ratelimit:config:',
      counter: 'ratelimit:counter:',
    },
  },
} 