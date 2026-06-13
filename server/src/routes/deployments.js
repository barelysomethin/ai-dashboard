import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { simulateDeployment } from '../utils/simulator.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/deployments/:id - Get deployment details and log stream
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const deployment = await prisma.deployment.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json(deployment);
  } catch (error) {
    console.error('Fetch deployment error:', error);
    res.status(500).json({ error: 'Failed to retrieve deployment details' });
  }
});

// POST /api/deployments/:projectId/redeploy - Trigger project redeployment
router.post('/:projectId/redeploy', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Determine next version tag
    let nextVersion = 'v1.0.0';
    if (project.deployments && project.deployments.length > 0) {
      const currentVer = project.deployments[0].version; // e.g. "v1.0.4"
      const verRegex = /^v(\d+)\.(\d+)\.(\d+)$/;
      const match = currentVer.match(verRegex);
      if (match) {
        const major = parseInt(match[1], 10);
        const minor = parseInt(match[2], 10);
        const patch = parseInt(match[3], 10);
        nextVersion = `v${major}.${minor}.${patch + 1}`;
      } else {
        nextVersion = currentVer + '.1';
      }
    }

    // Update project state to Deploying
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Deploying' }
    });

    // Create new deployment
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        version: nextVersion,
        commitHash: Math.random().toString(16).substring(2, 9),
        status: 'Deploying'
      }
    });

    // Start logs and status updates
    simulateDeployment(deployment.id, projectId);

    res.status(201).json(deployment);
  } catch (error) {
    console.error('Redeploy error:', error);
    res.status(500).json({ error: 'Failed to trigger redeployment' });
  }
});

export default router;
