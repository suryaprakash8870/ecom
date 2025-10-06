const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Extract bearer token from various request shapes (NextRequest / Node req)
const extractBearerToken = (requestOrReq) => {
  try {
    // Next.js App Router Request
    if (requestOrReq && typeof requestOrReq.headers?.get === 'function') {
      const header = requestOrReq.headers.get('authorization') || requestOrReq.headers.get('Authorization');
      if (!header) return null;
      const parts = header.split(' ');
      return parts.length === 2 ? parts[1] : null;
    }
    // Node/Express-like req
    const header = requestOrReq?.headers?.authorization || requestOrReq?.headers?.Authorization;
    if (!header) return null;
    const parts = header.split(' ');
    return parts.length === 2 ? parts[1] : null;
  } catch (e) {
    return null;
  }
};

// Helper for Next.js route handlers: returns { user } or { response }
const requireAuth = (request) => {
  const token = extractBearerToken(request);
  if (!token) {
    // Lazy import to avoid ESM import cycles in CJS file
    const { NextResponse } = require('next/server');
    return { response: NextResponse.json({ error: 'Access token required' }, { status: 401 }) };
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    const { NextResponse } = require('next/server');
    return { response: NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 }) };
  }
  return { user: decoded };
};

// Admin guard for Next.js handlers: pass decoded user
const ensureAdmin = (user) => {
  const { NextResponse } = require('next/server');
  if (!user || user.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }
  return {};
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  // Legacy
  authenticateToken: () => {},
  requireAdmin: () => {},
  // New helpers for Next App Router
  requireAuth,
  ensureAdmin,
};
