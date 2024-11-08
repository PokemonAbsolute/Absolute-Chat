import { z } from 'zod';

import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DATABASE_HOST: z.string(),
    DATABASE: z.string(),
    DATABASE_TABLE: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),

    BOT_NAME: z.string(),
    BOT_COLOR: z.string(),
    BOT_LOG_CHANNEL: z.string().optional(),
    BOT_DEPLOY_COMMANDS: z.string().transform((value) => {
        value = value.toLowerCase();
        if (value == 'true') return true;
        if (value == 'false') return false;
        throw new Error(`Invalid boolean value: ${value}`);
    }),
});

const parsedEnv = envSchema.safeParse(process.env);

export const validateEnvironment = () => {
    if (!parsedEnv.success) {
        console.error('Invalid environment variables:', parsedEnv.error.format());
        process.exit(1);
    }
};

export const config = parsedEnv.data as z.infer<typeof envSchema>;
