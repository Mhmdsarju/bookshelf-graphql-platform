import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
