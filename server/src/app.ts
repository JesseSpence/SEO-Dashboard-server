import express from 'express';
import cors from 'cors';
import { config } from './env';
import routes from './routes';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Analytics Dashboard Backend running on port ${config.port}`);
  console.log(`📊 Auth mode: ${config.authMode}`);
  console.log(`🔗 GSC Site URL: ${config.siteUrl}`);
  console.log(`📈 GA4 Property ID: ${config.ga4PropertyId}`);
  console.log(`⏰ Cache TTL: ${config.cacheTtlSeconds}s`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /health                    - Health check`);
  console.log(`  GET  /api/gsc/top              - Top pages from GSC`);
  console.log(`  GET  /api/gsc/queries          - Top queries for a page`);
  console.log(`  GET  /api/gsc/daily            - Daily search data`);
  console.log(`  GET  /api/ga4/pages            - GA4 pages aggregate`);
  console.log(`  GET  /api/ga4/metrics           - GA4 site metrics`);
  console.log(`  GET  /api/scoreboard           - Update priority scoreboard`);
  console.log(`  POST /api/cache/clear          - Clear cache`);
  console.log(`  GET  /api/cache/stats          - Cache statistics`);
  console.log('');
  console.log('Example requests:');
  console.log(`  curl http://localhost:${config.port}/health`);
  console.log(`  curl "http://localhost:${config.port}/api/gsc/top?limit=50"`);
  console.log(`  curl "http://localhost:${config.port}/api/ga4/pages?start=2024-01-01&end=2024-01-31"`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

