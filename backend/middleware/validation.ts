import { Request, Response, NextFunction } from 'express';

// In-memory sliding window rate limiter for AI requests
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 30; // Max AI calls per IP per 5 mins

export function aiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: 'Rate limit exceeded for AI analysis',
      message: `Too many AI requests. Please wait ${retryAfterSeconds} seconds before submitting again.`
    });
  }

  record.count++;
  next();
}

/**
 * Validates report input data
 */
export function validateReportInput(req: Request, res: Response, next: NextFunction) {
  const { title, description, location, imageData, citizenContact } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({
      error: 'Invalid title',
      message: 'Title must be at least 3 characters long.'
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      error: 'Title too long',
      message: 'Title must not exceed 200 characters.'
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({
      error: 'Invalid description',
      message: 'Description must be at least 10 characters to provide sufficient context for AI analysis.'
    });
  }

  if (description.length > 5000) {
    return res.status(400).json({
      error: 'Description too long',
      message: 'Description must not exceed 5000 characters.'
    });
  }

  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    return res.status(400).json({
      error: 'Invalid location',
      message: 'Location or landmark must be specified (at least 2 characters).'
    });
  }

  // Validate image if present
  if (imageData) {
    if (typeof imageData !== 'string') {
      return res.status(400).json({
        error: 'Invalid image format',
        message: 'Image data must be a base64 Data URL.'
      });
    }

    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({
        error: 'Invalid image mime type',
        message: 'Only image files (JPEG, PNG, WEBP) are supported.'
      });
    }

    // Rough check: Base64 string length for ~6MB limit is ~8MB of text
    if (imageData.length > 8 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Image too large',
        message: 'Image size exceeds maximum limit of 6MB.'
      });
    }
  }

  // Validate contact if provided
  if (citizenContact && typeof citizenContact === 'string') {
    const trimmed = citizenContact.trim();
    if (trimmed.length > 100) {
      return res.status(400).json({
        error: 'Contact info too long',
        message: 'Citizen contact information must be under 100 characters.'
      });
    }
  }

  next();
}

/**
 * Validates demonstration admin authorization
 */
export function validateDemoAdmin(req: Request, res: Response, next: NextFunction) {
  const pinHeader = req.headers['x-admin-pin'] as string;
  const pinBody = req.body?.adminPin as string;
  const expectedPin = process.env.ADMIN_DEMO_PIN || '1234';

  const providedPin = (pinHeader || pinBody || '').trim();

  // Clearly marked as demonstration authentication
  if (!providedPin || providedPin !== expectedPin) {
    return res.status(403).json({
      error: 'Unauthorized Admin Action',
      message: 'Invalid demonstration admin PIN. Please provide the demo PIN (default: "1234"). Note: This is a hackathon demonstration auth check.'
    });
  }

  next();
}
