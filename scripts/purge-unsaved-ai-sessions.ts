import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { purgeUnsavedUserAiSessions } from '../server/controllers/userAiSessionsController';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const result = await purgeUnsavedUserAiSessions(rootDir);
console.log(
  `[purge-unsaved-ai-sessions] removed=${result.removed} keptSaved=${result.kept} root=${rootDir}`,
);
