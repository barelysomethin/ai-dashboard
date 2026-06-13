import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats - Get aggregated analytics for top card grids
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: 'Active' }
    });
    const deployingProjects = await prisma.project.count({
      where: { status: 'Deploying' }
    });
    const failedProjects = await prisma.project.count({
      where: { status: 'Failed' }
    });

    const projects = await prisma.project.findMany();
    
    // Aggregate values
    const totalApiCalls = projects.reduce((sum, p) => sum + p.apiCalls, 0);
    
    const activeList = projects.filter(p => p.status === 'Active');
    const avgCpu = activeList.length > 0
      ? parseFloat((activeList.reduce((sum, p) => sum + p.cpuUsage, 0) / activeList.length).toFixed(1))
      : 0.0;
    
    const avgMemory = activeList.length > 0
      ? parseFloat((activeList.reduce((sum, p) => sum + p.memoryUsage, 0) / activeList.length).toFixed(1))
      : 0.0;

    res.json({
      projects: {
        total: totalProjects,
        active: activeProjects,
        deploying: deployingProjects,
        failed: failedProjects
      },
      metrics: {
        totalApiCalls,
        avgCpuUsage: avgCpu,
        avgMemoryUsage: avgMemory
      }
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to compile dashboard metrics' });
  }
});

export default router;
