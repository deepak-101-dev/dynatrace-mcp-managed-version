import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Bootstrap environment variables with explicit path resolution
// This ensures .env is loaded regardless of the working directory when the MCP server runs
// Use __dirname equivalent for ESM to find the actual script location
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const envPath = resolve(projectRoot, '.env');

// Load environment variables from the project root .env file
config({ path: envPath });

// Optional: Log for debugging (can be removed in production)
// if (process.env.ENABLE_DEBUG_LOGGING === 'true') {
//   console.error(`🔧 Bootstrap: Loading .env from ${envPath}`);
//   console.error(`🔧 Bootstrap: DYNATRACE_ENV_URL loaded: ${process.env.DYNATRACE_ENV_URL ? '✅' : '❌'}`);
// }