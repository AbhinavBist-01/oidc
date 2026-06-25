const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`> Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('==================================================');
    console.log('       OIDC Server & Frontend Runner Script       ');
    console.log('==================================================\n');

    // 1. Check Docker & Start Postgres DB
    console.log('[1/4] Checking Database Container...');
    try {
      execSync('docker compose up -d', { stdio: 'inherit' });
      console.log('Database container is up and running.\n');
    } catch (error) {
      console.warn('⚠️ Warning: Could not run "docker compose up -d". Make sure Docker is running and installed, or that your PostgreSQL database is running manually.\n');
    }

    // 2. Ensure Dependencies are Installed
    console.log('[2/4] Verifying dependencies...');
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log('Root node_modules missing. Installing root dependencies...');
      await runCommand('pnpm', ['install']);
    }
    if (!fs.existsSync(path.join(__dirname, 'frontend', 'node_modules'))) {
      console.log('Frontend node_modules missing. Installing frontend dependencies...');
      await runCommand('pnpm', ['install'], { cwd: path.join(__dirname, 'frontend') });
    }
    console.log('Dependencies verified.\n');

    // 3. Database migrations
    console.log('[3/4] Running database migrations...');
    try {
      await runCommand('pnpm', ['run', 'db:generate']);
      await runCommand('pnpm', ['run', 'db:migrate']);
      console.log('Database migrations completed successfully.\n');
    } catch (err) {
      console.warn('⚠️ Warning: Database migration failed. Attempting drizzle-kit push as a fallback...');
      try {
        await runCommand('pnpm', ['exec', 'drizzle-kit', 'push']);
        console.log('Database schema pushed successfully.\n');
      } catch (pushErr) {
        console.error('❌ Error: Database schema push failed as well:', pushErr.message);
      }
    }

    // 4. Run frontend and backend together
    console.log('[4/4] Starting Frontend & Backend Dev Servers...');
    console.log('Starting concurrently. Press Ctrl+C to stop both servers.\n');

    // Start concurrently
    await runCommand('pnpm', ['run', 'dev:all']);

  } catch (error) {
    console.error('Error running script:', error.message);
    process.exit(1);
  }
}

main();
