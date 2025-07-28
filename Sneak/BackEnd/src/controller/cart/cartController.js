import { Cart, CartItem, Product } from '../../models/index.js'

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Backend: Getting cart for user', userId);

        let cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'brand', 'price', 'originalPrice', 'images', 'stockQuantity', 'isActive']
                }]
            }]
        });

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ userId });
            console.log('Backend: Created empty cart for user', userId);
        } else {
            console.log('Backend: Found cart with items', { cartId: cart.id, itemCount: cart.CartItems?.length || 0 });
        }

        // Calculate cart totals
        let subtotal = 0;
        let totalItems = 0;

        if (cart.CartItems) {
            for (const item of cart.CartItems) {
                if (item.Product && item.Product.isActive) {
                    subtotal += item.price * item.quantity;
                    totalItems += item.quantity;
                }
            }
        }

        await cart.update({ 
            subtotal,
            totalItems 
        });

        console.log('Backend: Cart totals calculated', { subtotal, totalItems });

        res.status(200).json({
            success: true,
            data: cart,
            message: "Cart fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cart',
            message: error.message
        });
    }
};

/**
 * Add item to cart
 */
const addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity, size, color } = req.body;

        console.log('Backend: Adding to cart', { userId, productId, quantity, size, color });

        // Validation
        if (!productId || !quantity || quantity <= 0) {
            console.log('Backend: Validation failed', { productId, quantity });
            return res.status(400).json({
                success: false,
                message: "Invalid product ID or quantity"
            });
        }

        // Check if product exists and is active
        const product = await Product.findByPk(productId);
        if (!product || !product.isActive) {
            console.log('Backend: Product not found or inactive', { productId, product: product ? 'found' : 'not found' });
            return res.status(404).json({
                success: false,
                message: "Product not found or not available"
            });
        }

        console.log('Backend: Product found', { productId: product.id, name: product.name, stock: product.stockQuantity });

        // Check stock
        if (product.stockQuantity < quantity) {
            console.log('Backend: Insufficient stock', { requested: quantity, available: product.stockQuantity });
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            cart = await Cart.create({ userId });
            console.log('Backend: Created new cart', { cartId: cart.id, userId });
        } else {
            console.log('Backend: Found existing cart', { cartId: cart.id, userId });
        }

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            where: {
                cartId: cart.id,
                productId
            }
        });

        if (cartItem) {
            // Update existing item
            const newQuantity = cartItem.quantity + quantity;
            
            if (product.stockQuantity < newQuantity) {
                console.log('Backend: Insufficient stock for update', { current: cartItem.quantity, adding: quantity, total: newQuantity, available: product.stockQuantity });
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock for requested quantity"
                });
            }

            await cartItem.update({
                quantity: newQuantity,
                price: product.price // Update with current price
            });
            console.log('Backend: Updated existing cart item', { cartItemId: cartItem.id, newQuantity });
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cartId: cart.id,
                productId,
                quantity,
                size,
                color,
                price: product.price
            });
            console.log('Backend: Created new cart item', { cartItemId: cartItem.id, quantity, price: product.price });
        }

        // Get updated cart
        const updatedCart = await Cart.findByPk(cart.id, {
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'brand', 'price', 'originalPrice', 'images', 'stockQuantity', 'isActive']
                }]
            }]
        });

        console.log('Backend: Cart updated successfully', { cartId: cart.id, itemCount: updatedCart.CartItems?.length || 0 });

        res.status(200).json({
            success: true,
            data: updatedCart,
            message: "Item added to cart successfully"
        });

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add item to cart',
            message: error.message
        });
    }
};

/**
 * Update cart item quantity
 */
const updateCartItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        // Find cart item
        const cartItem = await CartItem.findOne({
            where: { id: itemId },
            include: [{
                model: Cart,
                where: { userId }
            }, {
                model: Product
            }]
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        // Check stock
        if (cartItem.Product.stockQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        await cartItem.update({
            quantity,
            price: cartItem.Product.price // Update with current price
        });

        // Get updated cart
        const updatedCart = await Cart.findByPk(cartItem.cartId, {
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'brand', 'price', 'originalPrice', 'images', 'stockQuantity', 'isActive']
                }]
            }]
        });

        res.status(200).json({
            success: true,
            data: updatedCart,
            message: "Cart item updated successfully"
        });

    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update cart item',
            message: error.message
        });
    }
};

/**
 * Remove item from cart
 */
const removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.params;

        // Find and delete cart item
        const cartItem = await CartItem.findOne({
            where: { id: itemId },
            include: [{
                model: Cart,
                where: { userId }
            }]
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }

        const cartId = cartItem.cartId;
        await cartItem.destroy();

        // Get updated cart
        const updatedCart = await Cart.findByPk(cartId, {
            include: [{
                model: CartItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'brand', 'price', 'originalPrice', 'images', 'stockQuantity', 'isActive']
                }]
            }]
        });

        res.status(200).json({
            success: true,
            data: updatedCart,
            message: "Item removed from cart successfully"
        });

    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove item from cart',
            message: error.message
        });
    }
};

/**
 * Clear entire cart
 */
const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ where: { userId } });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Delete all cart items
        await CartItem.destroy({
            where: { cartId: cart.id }
        });

        // Reset cart totals
        await cart.update({
            subtotal: 0,
            totalItems: 0
        });

        res.status(200).json({
            success: true,
            data: cart,
            message: "Cart cleared successfully"
        });

    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear cart',
            message: error.message
        });
    }
};

/**
 * Apply promo code to cart
 */
const applyPromoCode = async (req, res) => {
    try {
        const { userId } = req.params;
        const { promoCode } = req.body;

        const cart = await Cart.findOne({ where: { userId } });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Mock promo code validation (in real app, check against PromoCode model)
        const validPromoCodes = {
            'SNEAKHEAD10': { discount: 10, type: 'percentage' },
            'SAVE20': { discount: 20, type: 'fixed' },
            'NEWUSER15': { discount: 15, type: 'percentage' }
        };

        const promo = validPromoCodes[promoCode.toUpperCase()];
        
        if (!promo) {
            return res.status(400).json({
                success: false,
                message: "Invalid promo code"
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (promo.type === 'percentage') {
            discountAmount = (cart.subtotal * promo.discount) / 100;
        } else {
            discountAmount = Math.min(promo.discount, cart.subtotal);
        }

        await cart.update({
            promoCode: promoCode.toUpperCase(),
            discountAmount,
            discountType: promo.type
        });

        res.status(200).json({
            success: true,
            data: {
                promoCode: promoCode.toUpperCase(),
                discountAmount,
                discountType: promo.type
            },
            message: "Promo code applied successfully"
        });

    } catch (error) {
        console.error('Error applying promo code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to apply promo code',
            message: error.message
        });
    }
};

/**
 * Remove promo code from cart
 */
const removePromoCode = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ where: { userId } });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.update({
            promoCode: null,
            discountAmount: 0,
            discountType: null
        });

        res.status(200).json({
            success: true,
            data: cart,
            message: "Promo code removed successfully"
        });

    } catch (error) {
        console.error('Error removing promo code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove promo code',
            message: error.message
        });
    }
};

export {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode
};
