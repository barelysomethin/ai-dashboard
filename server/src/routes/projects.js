import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { simulateDeployment } from '../utils/simulator.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to generate a random 7-character hexadecimal commit hash
function generateCommitHash() {
  return Math.random().toString(16).substring(2, 9);
}

// GET /api/projects - List all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
});

// GET /api/projects/:id - Get project details with deployment history
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Fetch project details error:', error);
    res.status(500).json({ error: 'Failed to retrieve project details' });
  }
});

// POST /api/projects - Create a project & trigger initial deployment
router.post('/', authenticateToken, async (req, res) => {
  const { name, description, modelProvider, environment } = req.body;

  if (!name || !description || !modelProvider || !environment) {
    return res.status(400).json({ error: 'Missing required project fields' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        modelProvider,
        environment,
        status: 'Deploying',
        cpuUsage: 0.0,
        memoryUsage: 0.0,
        apiCalls: 0
      }
    });

    // Create the initial deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId: project.id,
        version: 'v1.0.0',
        commitHash: generateCommitHash(),
        status: 'Deploying'
      }
    });

    // Run the background simulation of logs and state updates
    simulateDeployment(deployment.id, project.id);

    // Return the project including the pending deployment info
    res.status(201).json({
      ...project,
      deployments: [deployment]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project settings
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, modelProvider, environment } = req.body;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name || project.name,
        description: description || project.description,
        modelProvider: modelProvider || project.modelProvider,
        environment: environment || project.environment
      }
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project successfully deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
