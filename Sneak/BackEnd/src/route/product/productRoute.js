import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    updateStock
} from '../../controller/index.js';
import { authenticateToken } from '../../middleware/token-middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', getAllProducts); // Dedicated search endpoint (uses same logic)
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin routes (protected with authentication)
router.post('/', authenticateToken, createProduct);
router.put('/:id', authenticateToken, updateProduct);
router.patch('/:id/stock', authenticateToken, updateStock);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
