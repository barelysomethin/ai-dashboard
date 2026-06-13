import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing tables to prevent duplicate key violations on re-seed
  await prisma.logEntry.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.deployment.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const devPassword = await bcrypt.hash('dev123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dashboard-ai.dev',
      name: 'Sarah Connor (Admin)',
      password: adminPassword,
      role: 'Admin'
    }
  });

  const developer = await prisma.user.create({
    data: {
      email: 'dev@dashboard-ai.dev',
      name: 'John Doe (Developer)',
      password: devPassword,
      role: 'Developer'
    }
  });

  console.log(`Users created: ${admin.email}, ${developer.email}`);

  // 2. Create Projects
  const projectsData = [
    {
      name: 'Llama 3 8B Instruct Fine-Tuning',
      description: 'Custom fine-tuned LLM for enterprise support chat, trained on internal customer service transcripts.',
      modelProvider: 'HuggingFace',
      status: 'Active',
      environment: 'Staging',
      cpuUsage: 14.2,
      memoryUsage: 8192.0,
      apiCalls: 24500
    },
    {
      name: 'Stable Diffusion XL API Endpoint',
      description: 'Text-to-image inference endpoint configured for micro-service art generation. Auto-scaling enabled.',
      modelProvider: 'Replicate',
      status: 'Active',
      environment: 'Production',
      cpuUsage: 78.5,
      memoryUsage: 16384.0,
      apiCalls: 189200
    },
    {
      name: 'Whisper Voice Transcriber v3',
      description: 'Real-time multi-lingual speech-to-text API for transcribing client meetings.',
      modelProvider: 'Custom',
      status: 'Failed',
      environment: 'Production',
      cpuUsage: 0.0,
      memoryUsage: 0.0,
      apiCalls: 4520
    },
    {
      name: 'BERT Sentiment Analysis Engine',
      description: 'High-throughput sentiment classifier for marketing feedback feeds.',
      modelProvider: 'Ollama',
      status: 'Deploying',
      environment: 'Staging',
      cpuUsage: 45.0,
      memoryUsage: 2048.0,
      apiCalls: 0
    }
  ];

  const projects = [];
  for (const proj of projectsData) {
    const createdProject = await prisma.project.create({ data: proj });
    projects.push(createdProject);
  }
  console.log(`Created ${projects.length} projects.`);

  // 3. Create Deployments and Logs for projects
  
  // Project 0: Llama 3 8B
  const p0 = projects[0];
  const d0_1 = await prisma.deployment.create({
    data: {
      projectId: p0.id,
      version: 'v1.0.0',
      commitHash: '8b3c9f2',
      status: 'Success',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3) // 3 days ago
    }
  });

  const d0_2 = await prisma.deployment.create({
    data: {
      projectId: p0.id,
      version: 'v1.1.0',
      commitHash: 'cd77e2a',
      status: 'Success',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  });

  await prisma.logEntry.createMany({
    data: [
      { deploymentId: d0_2.id, level: 'INFO', message: 'Deployment triggered via repository webhook.' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Fetching Git repository commit cd77e2a...' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Pulling model configuration files...' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Spinning up runtime environment with CUDA driver 12.1...' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Initializing weights loader from HuggingFace cache...' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Loading model tensors into VRAM (8.03 GB loaded)...' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Model compiled using PyTorch 2.3. Ready for requests.' },
      { deploymentId: d0_2.id, level: 'INFO', message: 'Health checks passed. Scaling pods: 1 active.' }
    ]
  });

  // Project 1: Stable Diffusion
  const p1 = projects[1];
  const d1_1 = await prisma.deployment.create({
    data: {
      projectId: p1.id,
      version: 'v2.0.1',
      commitHash: 'e44f12d',
      status: 'Success',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5)
    }
  });

  await prisma.logEntry.createMany({
    data: [
      { deploymentId: d1_1.id, level: 'INFO', message: 'Deployment init. Replicating master nodes.' },
      { deploymentId: d1_1.id, level: 'INFO', message: 'Pulling docker image sd-xl-inference:latest...' },
      { deploymentId: d1_1.id, level: 'INFO', message: 'Image successfully pulled.' },
      { deploymentId: d1_1.id, level: 'INFO', message: 'Attaching cluster storage mount volume /data/sd-weights' },
      { deploymentId: d1_1.id, level: 'INFO', message: 'Starting application server...' },
      { deploymentId: d1_1.id, level: 'INFO', message: 'SDXL service active. Endpoint: https://api.dashboard-ai.dev/v2/sdxl' }
    ]
  });

  // Project 2: Whisper Transcriber (Failed)
  const p2 = projects[2];
  const d2_1 = await prisma.deployment.create({
    data: {
      projectId: p2.id,
      version: 'v0.9.0',
      commitHash: 'bc889a7',
      status: 'Failed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  });

  await prisma.logEntry.createMany({
    data: [
      { deploymentId: d2_1.id, level: 'INFO', message: 'Initializing build environment.' },
      { deploymentId: d2_1.id, level: 'INFO', message: 'Pulling whisper-medium weights...' },
      { deploymentId: d2_1.id, level: 'WARN', message: 'Connection timeout while accessing model hub. Retrying...' },
      { deploymentId: d2_1.id, level: 'INFO', message: 'Model hub accessed. Resuming download.' },
      { deploymentId: d2_1.id, level: 'INFO', message: 'Unpacking weights to local cache (/root/.cache/whisper)' },
      { deploymentId: d2_1.id, level: 'ERROR', message: 'RuntimeError: CUDA Out of Memory during load stage.' },
      { deploymentId: d2_1.id, level: 'ERROR', message: 'Process exited with exit code 1. Deployment aborted.' }
    ]
  });

  // Project 3: BERT Sentiment Analysis (Deploying)
  const p3 = projects[3];
  const d3_1 = await prisma.deployment.create({
    data: {
      projectId: p3.id,
      version: 'v1.0.0',
      commitHash: 'fa221c9',
      status: 'Deploying',
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 mins ago
    }
  });

  await prisma.logEntry.createMany({
    data: [
      { deploymentId: d3_1.id, level: 'INFO', message: 'Deployment triggered.' },
      { deploymentId: d3_1.id, level: 'INFO', message: 'Cloning repository commit fa221c9...' },
      { deploymentId: d3_1.id, level: 'INFO', message: 'Building docker image bert-sentiment-engine:v1.0.0...' },
      { deploymentId: d3_1.id, level: 'INFO', message: 'Step 1/8: FROM node:18-alpine' },
      { deploymentId: d3_1.id, level: 'INFO', message: 'Step 2/8: WORKDIR /app' },
      { deploymentId: d3_1.id, level: 'INFO', message: 'Step 3/8: COPY package*.json ./' }
    ]
  });

  console.log('Deployments and logs seeded successfully.');

  // 4. Create default API keys
  await prisma.apiKey.create({
    data: {
      userId: admin.id,
      name: 'Default Admin CLI Key',
      token: 'db_live_589b21a8c4f92d137b82f1b8a92020e9',
      hint: 'db_live_589b...20e9'
    }
  });

  await prisma.apiKey.create({
    data: {
      userId: developer.id,
      name: 'Staging Webhook Trigger',
      token: 'db_live_ae1879c93a778e1b21908aaee8812c3f',
      hint: 'db_live_ae18...2c3f'
    }
  });

  console.log('API keys seeded.');
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
