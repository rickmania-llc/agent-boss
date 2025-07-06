const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ClaudeAgentSpawner {
  constructor() {
    this.agents = new Map();
  }

  async spawnAgent(agentId, workspacePath) {
    console.log(`Spawning Claude agent: ${agentId}`);

    // Ensure workspace exists
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    // Create a simple instruction file
    const instructions = `
# Test Agent Instructions

You are agent ${agentId}. Your task is to:

1. Create a file called "agent-info.txt" with your agent ID: "${agentId}"
2. Wait for 5 seconds
3. Create a file called "completed.txt" with content "Task completed by ${agentId}"
4. Type "exit" to close the session

Use the current directory for all file operations.
    `;

    fs.writeFileSync(path.join(workspacePath, 'INSTRUCTIONS.md'), instructions);

    // Spawn Claude process WITHOUT --print flag to allow tool execution
    const claudeProcess = spawn(
      'claude',
      [
        '--dangerously-skip-permissions',
        'Please read the INSTRUCTIONS.md file and complete all tasks. Remember to type "exit" when done.',
      ],
      {
        cwd: workspacePath,
        env: {
          ...process.env,
          AGENT_ID: agentId,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    // Auto-exit after 15 seconds to prevent hanging
    const exitTimer = setTimeout(() => {
      if (this.agents.has(agentId)) {
        console.log(`[${agentId}] Auto-exiting after timeout`);
        claudeProcess.stdin.write('exit\n');
      }
    }, 15000);

    // Capture stdout
    claudeProcess.stdout.on('data', data => {
      console.log(`[${agentId}] STDOUT: ${data}`);
    });

    // Capture stderr
    claudeProcess.stderr.on('data', data => {
      console.error(`[${agentId}] STDERR: ${data}`);
    });

    // Handle exit
    claudeProcess.on('exit', code => {
      console.log(`[${agentId}] Process exited with code ${code}`);
      clearTimeout(exitTimer);
      this.agents.delete(agentId);

      // Check what files were created
      const files = fs.readdirSync(workspacePath);
      console.log(`[${agentId}] Files in workspace:`, files);
    });

    // Store process reference
    this.agents.set(agentId, {
      process: claudeProcess,
      pid: claudeProcess.pid,
      startTime: new Date(),
    });

    console.log(`Agent ${agentId} started with PID: ${claudeProcess.pid}`);
    return claudeProcess.pid;
  }

  listAgents() {
    console.log('\nActive Agents:');
    this.agents.forEach((agent, id) => {
      console.log(`- ${id}: PID ${agent.pid}, started at ${agent.startTime}`);
    });
  }

  stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      console.log(`Stopping agent ${agentId} (PID: ${agent.pid})`);
      agent.process.stdin.write('exit\n');
      setTimeout(() => {
        if (this.agents.has(agentId)) {
          agent.process.kill('SIGTERM');
        }
      }, 1000);
    } else {
      console.log(`Agent ${agentId} not found`);
    }
  }
}

// Test the spawner
async function test() {
  const spawner = new ClaudeAgentSpawner();

  // Clean up old workspace files
  const workspace1 = path.join(__dirname, 'workspaces-fixed', 'agent1');
  const workspace2 = path.join(__dirname, 'workspaces-fixed', 'agent2');

  // Spawn first agent
  await spawner.spawnAgent('test-agent-1', workspace1);

  // Wait a bit and spawn another
  setTimeout(async () => {
    await spawner.spawnAgent('test-agent-2', workspace2);

    // List active agents
    spawner.listAgents();
  }, 2000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    spawner.agents.forEach((agent, id) => {
      spawner.stopAgent(id);
    });
    setTimeout(() => process.exit(), 2000);
  });
}

// Run the test
test().catch(console.error);
