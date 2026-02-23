import Redis from 'ioredis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL || process.env.ENABLE_REDIS !== 'true') return null
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableReadyCheck: false,
    })
    redis.on('error', (err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[Redis] connection error, caching disabled:', err.message)
      }
      redis = null
    })
  }
  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis()
    if (!r) return null
    const val = await r.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    // silently fail
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return
    const keys = await r.keys(pattern)
    if (keys.length > 0) await r.del(...keys)
  } catch {
    // silently fail
  }
}
