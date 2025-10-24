export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ],

  rpc: {
    base: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
  },

  coinbaseMpc: {
    apiKey: process.env.COINBASE_MPC_API_KEY!,
    network: process.env.COINBASE_MPC_NETWORK || 'base-mainnet'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  security: {
    jwtSecret: process.env.JWT_SECRET!,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};