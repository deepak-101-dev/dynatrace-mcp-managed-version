import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Environment validation schema with defaults
const envSchema = z.object({
  DYNATRACE_API_TOKEN: z.string().min(1, 'DYNATRACE_API_TOKEN is required'),
  DYNATRACE_ENV_URL: z.string().url('DYNATRACE_ENV_URL must be a valid URL'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_DEBUG_LOGGING: z.string().transform(val => val === 'true').default('true'),
  MCP_SERVER_NAME: z.string().default('dynatrace-mcp'),
  MCP_SERVER_VERSION: z.string().default('1.0.0'),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error(' Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = parseEnv();

// Export individual config objects for better organization
export const dynatraceConfig = {
  apiToken: env.DYNATRACE_API_TOKEN,
  envUrl: env.DYNATRACE_ENV_URL,
} as const;


export const loggingConfig = {
  level: env.LOG_LEVEL,
  enableDebug: env.ENABLE_DEBUG_LOGGING,
} as const;

export const serverConfig = {
  name: env.MCP_SERVER_NAME,
  version: env.MCP_SERVER_VERSION,
} as const;
