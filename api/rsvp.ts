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

// Key prefix for RSVP entries
const RSVP_KEY_PREFIX = 'rsvp:'

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
    // GET: Check if a name has already submitted
    if (req.method === 'GET') {
      const { name } = req.query

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
        })
      }

      const normalizedName = normalizeName(name)
      const key = `${RSVP_KEY_PREFIX}${normalizedName}`
      const exists = await redis.exists(key)

      return res.status(200).json({
        success: true,
        hasSubmitted: exists === 1,
        name: name.trim(),
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
      const key = `${RSVP_KEY_PREFIX}${normalizedName}`

      // Check if already submitted
      const exists = await redis.exists(key)
      if (exists === 1) {
        return res.status(409).json({
          success: false,
          alreadySubmitted: true,
          error: 'You have already submitted your RSVP',
        })
      }

      // Store the RSVP record
      const rsvpData = {
        name: name.trim(),
        attendance: attendance || 'yes',
        guests: guests || 1,
        song: song || '',
        submittedAt: new Date().toISOString(),
      }

      // Store with no expiration (permanent)
      await redis.set(key, JSON.stringify(rsvpData))

      return res.status(200).json({
        success: true,
        registered: true,
        message: 'RSVP registered successfully',
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
