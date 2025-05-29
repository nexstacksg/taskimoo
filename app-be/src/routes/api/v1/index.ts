import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import testRoutes from './test';

const router = Router();

// Welcome message
router.get('/', (_req, res) => {
  res.json({
    message: 'API Template v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      test: '/api/v1/test'
    }
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/test', testRoutes);

export default router;