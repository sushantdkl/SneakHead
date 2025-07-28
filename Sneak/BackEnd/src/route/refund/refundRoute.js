import express from 'express';
import { createRefundRequest, getAllRefunds, getUserRefunds, updateRefundStatus, deleteRefund } from '../../controller/refund/refundController.js';
import { authenticateToken, isAdmin } from '../../middleware/token-middleware.js';

const router = express.Router();

// Create refund request (user)
router.post('/', authenticateToken, createRefundRequest);

// Get all refunds (admin only)
router.get('/', authenticateToken, isAdmin, getAllRefunds);

// Get user's refunds
router.get('/user/:userId', authenticateToken, getUserRefunds);

// Update refund status (admin only)
router.put('/:id/status', authenticateToken, isAdmin, updateRefundStatus);

// Delete refund (admin only)
router.delete('/:id', authenticateToken, isAdmin, deleteRefund);

export default router; 