import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode
} from '../../controller/index.js';

const router = express.Router();

// All cart routes should be protected with auth middleware
router.get('/:userId', getCart);
router.post('/:userId/items', addToCart);
router.put('/:userId/items/:itemId', updateCartItem);
router.delete('/:userId/items/:itemId', removeFromCart);
router.delete('/:userId', clearCart);
router.post('/:userId/promo', applyPromoCode);
router.delete('/:userId/promo', removePromoCode);

export default router;
