import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getUserOrders,
    getOrderAnalytics
} from '../../controller/index.js';
import { authenticateToken } from '../../middleware/token-middleware.js';

const router = express.Router();

// User routes (protected with auth middleware)
router.post('/', authenticateToken, createOrder);
router.get('/user/:userId', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);
router.patch('/:id/cancel', authenticateToken, cancelOrder);

// Admin routes (protected with auth middleware - admin check will be in controller)
router.get('/', authenticateToken, getAllOrders);
router.patch('/:id/status', authenticateToken, updateOrderStatus);
router.get('/analytics/summary', authenticateToken, getOrderAnalytics);

export default router;
