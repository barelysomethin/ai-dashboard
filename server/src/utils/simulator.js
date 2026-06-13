import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOG_STEPS = [
  { level: 'INFO', message: 'Deployment run initiated by scheduler.' },
  { level: 'INFO', message: 'Pulling latest repository changes...' },
  { level: 'INFO', message: 'Verifying package dependencies and build configuration.' },
  { level: 'INFO', message: 'Setting up runtime environment (Ubuntu 22.04 + CUDA 12.0).' },
  { level: 'INFO', message: 'Downloading model weights from secure registry...' },
  { level: 'INFO', message: 'Transferred 4.2 GB of tensors in 3.1s (1.35 GB/s).' },
  { level: 'INFO', message: 'Verifying SHA256 checksum of model files: OK.' },
  { level: 'INFO', message: 'Compiling model graph with PyTorch compiler...' },
  { level: 'WARN', message: 'Tracer warning: Dynamic shape padding applied for optimized execution.' },
  { level: 'INFO', message: 'Allocating GPU memory pools...' },
  { level: 'INFO', message: 'Model loaded successfully. Starting model server on port 8080.' },
  { level: 'INFO', message: 'Running validation smoke test suite...' },
  { level: 'INFO', message: 'Smoke test response time: 142ms. StatusCode: 200 OK.' },
  { level: 'INFO', message: 'Deployment completed. Updating routing mesh.' }
];

export async function simulateDeployment(deploymentId, projectId) {
  try {
    // Start logs insertion
    let stepIndex = 0;
    
    const interval = setInterval(async () => {
      if (stepIndex >= LOG_STEPS.length) {
        clearInterval(interval);
        
        // Finalize deployment as Success
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { status: 'Success' }
        });

        // Set Project stats to Active and give realistic resources
        await prisma.project.update({
          where: { id: projectId },
          data: {
            status: 'Active',
            cpuUsage: parseFloat((10 + Math.random() * 40).toFixed(1)),
            memoryUsage: parseFloat((1024 + Math.random() * 6000).toFixed(1))
          }
        });
        
        console.log(`Simulation finished for deployment ${deploymentId} (Success).`);
        return;
      }

      // Add log entry
      const step = LOG_STEPS[stepIndex];
      await prisma.logEntry.create({
        data: {
          deploymentId,
          level: step.level,
          message: step.message,
          timestamp: new Date()
        }
      });

      stepIndex++;
    }, 800); // Send log every 800ms to complete in ~11 seconds

  } catch (error) {
    console.error(`Error during deployment simulation of ${deploymentId}:`, error);
    
    // Fail deployment in database
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'Failed' }
    });
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'Failed', cpuUsage: 0.0, memoryUsage: 0.0 }
    });
  }
}

// Fluctuates CPU and Memory usages of Active projects to make dashboard UI charts feel alive
export function startMetricsSimulation() {
  setInterval(async () => {
    try {
      const activeProjects = await prisma.project.findMany({
        where: { status: 'Active' }
      });

      for (const project of activeProjects) {
        // Random drift of CPU +/- 5%
        const cpuDrift = (Math.random() - 0.5) * 8;
        const newCpu = Math.max(2.0, Math.min(98.0, project.cpuUsage + cpuDrift));

        // Random drift of memory +/- 128MB
        const memDrift = (Math.random() - 0.5) * 256;
        const newMem = Math.max(512.0, Math.min(24576.0, project.memoryUsage + memDrift));

        // Randomly increment API calls
        const apiIncrement = Math.floor(Math.random() * 5) + 1;

        await prisma.project.update({
          where: { id: project.id },
          data: {
            cpuUsage: parseFloat(newCpu.toFixed(1)),
            memoryUsage: parseFloat(newMem.toFixed(1)),
            apiCalls: project.apiCalls + apiIncrement
          }
        });
      }
    } catch (error) {
      // Fail silently in background
    }
  }, 5000); // Every 5 seconds
}
