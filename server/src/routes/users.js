import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to generate a mock secure API token
function generateToken() {
  const chars = 'abcdef0123456789';
  let tokenHash = '';
  for (let i = 0; i < 32; i++) {
    tokenHash += chars[Math.floor(Math.random() * chars.length)];
  }
  return `db_live_${tokenHash}`;
}

// GET /api/users/keys - List user API keys
router.get('/keys', authenticateToken, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        hint: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(keys);
  } catch (error) {
    console.error('Fetch keys error:', error);
    res.status(500).json({ error: 'Failed to retrieve API keys' });
  }
});

// POST /api/users/keys - Generate a new API key
router.post('/keys', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'API Key name is required' });
  }

  try {
    const rawToken = generateToken();
    const hint = `${rawToken.substring(0, 14)}...${rawToken.substring(rawToken.length - 4)}`;

    const newKey = await prisma.apiKey.create({
      data: {
        userId: req.user.id,
        name,
        token: rawToken,
        hint
      }
    });

    // Send the raw token back once. It won't be retrievable again in full.
    res.status(201).json({
      id: newKey.id,
      name: newKey.name,
      token: rawToken, // Raw token sent ONLY once
      hint: newKey.hint,
      createdAt: newKey.createdAt
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// DELETE /api/users/keys/:id - Revoke an API key
router.delete('/keys/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const key = await prisma.apiKey.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await prisma.apiKey.delete({ where: { id } });
    res.json({ message: 'API key successfully revoked' });
  } catch (error) {
    console.error('Revoke key error:', error);
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

export default router;
