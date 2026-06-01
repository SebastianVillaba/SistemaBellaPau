import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import routes from './routes';
import { logger } from './utils/logger';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

const ip = process.env.DB_SERVER;

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Error no controlado');
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;