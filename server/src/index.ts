import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.PORT;

app.listen(port, () => {
  logger.info({ port, env: env.NODE_ENV }, `API escuchando en http://localhost:${port}`);
});