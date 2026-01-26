import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Normalize name for comparison (lowercase, trim, remove accents)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ') // Normalize spaces
}

// Get client IP from Vercel headers
function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string') {
    return realIp
  }
  return 'unknown'
}

// Key prefixes for RSVP entries
const RSVP_KEY_PREFIX = 'rsvp:'
const RSVP_IP_PREFIX = 'rsvp_ip:'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Check if Redis is configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(200).json({
      success: true,
      configured: false,
      message: 'Redis not configured - RSVP tracking disabled',
    })
  }

  try {
    const clientIP = getClientIP(req)

    // GET: Check if a name or IP has already submitted
    if (req.method === 'GET') {
      const { name } = req.query

      // Check by IP first (works even without name)
      const ipKey = `${RSVP_IP_PREFIX}${clientIP}`
      const ipData = await redis.get(ipKey) as string | null

      if (!name || typeof name !== 'string') {
        // No name provided, just check IP
        return res.status(200).json({
          success: true,
          hasSubmitted: !!ipData,
          submittedName: ipData ? JSON.parse(ipData).name : null,
          checkedBy: 'ip',
        })
      }

      const normalizedName = normalizeName(name)
      const nameKey = `${RSVP_KEY_PREFIX}${normalizedName}`
      const nameExists = await redis.exists(nameKey)

      return res.status(200).json({
        success: true,
        hasSubmitted: nameExists === 1 || !!ipData,
        nameMatch: nameExists === 1,
        ipMatch: !!ipData,
        name: name.trim(),
        submittedName: ipData ? JSON.parse(ipData).name : null,
      })
    }

    // POST: Register a new RSVP submission
    if (req.method === 'POST') {
      const { name, attendance, guests, song } = req.body

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
        })
      }

      const normalizedName = normalizeName(name)
      const nameKey = `${RSVP_KEY_PREFIX}${normalizedName}`
      const ipKey = `${RSVP_IP_PREFIX}${clientIP}`

      // Check if name already submitted
      const nameExists = await redis.exists(nameKey)
      if (nameExists === 1) {
        return res.status(409).json({
          success: false,
          alreadySubmitted: true,
          error: 'This name has already submitted an RSVP',
        })
      }

      // Check if IP already submitted (but allow - just warn)
      const ipData = await redis.get(ipKey) as string | null

      // Store the RSVP record
      const rsvpData = {
        name: name.trim(),
        attendance: attendance || 'yes',
        guests: guests || 1,
        song: song || '',
        ip: clientIP,
        submittedAt: new Date().toISOString(),
      }

      // Store by name (primary key)
      await redis.set(nameKey, JSON.stringify(rsvpData))
      
      // Store by IP (for quick lookup) - only if IP is valid and not already used
      if (clientIP !== 'unknown' && !ipData) {
        await redis.set(ipKey, JSON.stringify({ name: name.trim(), submittedAt: rsvpData.submittedAt }))
      }

      return res.status(200).json({
        success: true,
        registered: true,
        message: 'RSVP registered successfully',
        ipAlreadyUsed: !!ipData, // Let client know if same IP submitted before
      })
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  } catch (error: any) {
    console.error('RSVP API error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    })
  }
}
