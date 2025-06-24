const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(4329).json({ error: 'Too many requests' });
  }
};

app.use(rateLimiterMiddleware);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Service routes
const services = {
  'user-service': process.env.USER_SERVICE_URL || 'http://user-service:3001',
  'post-service': process.env.POST_SERVICE_URL || 'http://post-service:3002',
  'connection-service': process.env.CONNECTION_SERVICE_URL || 'http://connection-service:3003',
  'chat-service': process.env.CHAT_SERVICE_URL || 'http://chat-service:3004',
  'media-service': process.env.MEDIA_SERVICE_URL || 'http://media-service:3005',
  'analytics-service': process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3006',
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3007',
  'search-service': process.env.SEARCH_SERVICE_URL || 'http://search-service:3008'
};

// Proxy configuration
const createProxy = (target, requiresAuth = true) => {
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api/[^/]+': '', // Remove service prefix
    },
    onProxyReq: (proxyReq, req, res) => {
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(503).json({ error: 'Service temporarily unavailable' });
    }
  });

  return requiresAuth ? [authenticateToken, proxy] : [proxy];
};

// Public routes (no authentication required)
app.use('/api/auth', createProxy(services['user-service'], false));
app.use('/api/health', createProxy(services['user-service'], false));

// Protected routes (authentication required)
app.use('/api/users', createProxy(services['user-service']));
app.use('/api/posts', createProxy(services['post-service']));
app.use('/api/connections', createProxy(services['connection-service']));
app.use('/api/chat', createProxy(services['chat-service']));
app.use('/api/media', createProxy(services['media-service']));
app.use('/api/analytics', createProxy(services['analytics-service']));
app.use('/api/notifications', createProxy(services['notification-service']));
app.use('/api/search', createProxy(services['search-service']));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:');
  Object.keys(services).forEach(service => {
    console.log(`  - ${service}: ${services[service]}`);
  });
}); 