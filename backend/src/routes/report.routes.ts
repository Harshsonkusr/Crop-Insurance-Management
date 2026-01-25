import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// Get claim statistics by status (Admin only)
router.get('/claims-by-status', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const claimStats = await prisma.claim.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    res.json(claimStats.map((c) => ({ status: c.status, count: c._count.status })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claims by insurer (Admin only)
router.get('/claims-by-insurer', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const grouped = await prisma.claim.groupBy({
      by: ['assignedToId'],
      where: { assignedToId: { not: null } },
      _count: { assignedToId: true },
    });

    const providerIds = grouped.map((g) => g.assignedToId!).filter(Boolean);
    const subscribers = await prisma.insurer.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(subscribers.map((p) => [p.id, p.name]));

    res.json(
      grouped.map((g) => ({
        insurerName: nameMap.get(g.assignedToId!) || 'Unknown',
        count: g._count.assignedToId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claims by farmer (Admin only)
router.get('/claims-by-farmer', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const grouped = await prisma.claim.groupBy({
      by: ['farmerId'],
      _count: { farmerId: true },
    });

    const farmerIds = grouped.map((g) => g.farmerId);
    const farmers = await prisma.user.findMany({
      where: { id: { in: farmerIds } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(farmers.map((f) => [f.id, f.name]));

    res.json(
      grouped.map((g) => ({
        farmerName: nameMap.get(g.farmerId) || 'Unknown',
        count: g._count.farmerId,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claims over time (Admin only)
router.get('/claims-over-time', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const claims = await prisma.claim.groupBy({
      by: ['dateOfClaim'],
      _count: { dateOfClaim: true },
    });
    const normalized = claims
      .filter((c) => c.dateOfClaim)
      .map((c) => ({
        date: c.dateOfClaim!.toISOString().slice(0, 10),
        count: c._count.dateOfClaim,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get average claim resolution time (Admin only)
router.get('/average-resolution-time', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const resolved = await prisma.claim.findMany({
      where: { status: 'resolved', dateOfClaim: { not: null as any }, resolutionDate: { not: null as any } },
      select: { dateOfClaim: true, resolutionDate: true },
    });

    const times = resolved
      .filter((c) => c.dateOfClaim && c.resolutionDate)
      .map((c) => c.resolutionDate!.getTime() - c.dateOfClaim!.getTime());

    const averageTimeInDays =
      times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length / (1000 * 60 * 60 * 24) : 0;

    res.json({ averageResolutionTimeInDays: averageTimeInDays });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
