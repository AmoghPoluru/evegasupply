#!/usr/bin/env node
/**
 * Generate Payload types - runs via Next.js/tsx to ensure proper module resolution
 */
import { generateTypes } from 'payload/node';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../src/payload.config.ts');

const configModule = await import(pathToFileURL(configPath).href);
let config = configModule.default;
if (config && typeof config.then === 'function') {
  config = await config;
}

await generateTypes(config, { log: true });
console.log('Types generated successfully at src/payload-types.ts');
