/**
 * Consent Management Routes
 */

import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { Logger } from '../utils/logger';
import { ConsentService } from '../services/consent.service';
import { ConsentType } from '@prisma/client';

const router = Router();

// Get user consents
router.get('/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const consents = await ConsentService.getUserConsents(req.userId);
    res.json(consents);
  } catch (error) {
    Logger.error('Error fetching consents', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Grant consent
router.post('/consents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { consentType, consentText } = req.body;

    if (!consentType || !Object.values(ConsentType).includes(consentType)) {
      return res.status(400).json({ message: 'Invalid consent type' });
    }

    const text = consentText || ConsentService.getConsentText(consentType);

    const consent = await ConsentService.recordConsent(
      req.userId!,
      consentType,
      text,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({ message: 'Consent recorded', consent });
  } catch (error) {
    Logger.error('Error recording consent', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Revoke consent
router.delete('/consents/:type', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const consentType = req.params.type as ConsentType;
    if (!Object.values(ConsentType).includes(consentType)) {
      return res.status(400).json({ message: 'Invalid consent type' });
    }

    await ConsentService.revokeConsent(req.userId!, consentType);
    res.json({ message: 'Consent revoked' });
  } catch (error) {
    Logger.error('Error revoking consent', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

// Check consent
router.get('/consents/:type', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const consentType = req.params.type as ConsentType;
    if (!Object.values(ConsentType).includes(consentType)) {
      return res.status(400).json({ message: 'Invalid consent type' });
    }

    const hasConsent = await ConsentService.hasConsent(req.userId!, consentType);
    res.json({ hasConsent });
  } catch (error) {
    Logger.error('Error checking consent', { error, userId: req.userId });
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

