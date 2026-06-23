import { defineConfig } from 'prisma/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, '../api/prisma/schema.prisma'),
});
