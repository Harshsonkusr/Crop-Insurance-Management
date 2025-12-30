/**
 * Session Management Routes
 * Multi-device session management
 */

import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { SessionService } from '../services/session.service';

const router = Router();

// Get all active sessions for current user
router.get('/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const sessions = await SessionService.getUserSessions(req.userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke a specific session
router.delete('/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await SessionService.revokeSession(req.params.sessionId, req.userId);
    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke all sessions (logout everywhere)
router.post('/sessions/revoke-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await SessionService.revokeAllSessions(req.userId);
    res.json({ message: 'All sessions revoked' });
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const result = await SessionService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: error.message || 'Invalid refresh token' });
  }
});

export default router;

