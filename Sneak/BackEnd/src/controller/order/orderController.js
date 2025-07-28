import { Order, OrderItem, Product, User } from '../../models/index.js'
import { Op } from 'sequelize';

/**
 * Create new order
 */
const createOrder = async (req, res) => {
    try {
        const {
            userId,
            items, // [{ productId, quantity, size, color, price }]
            shippingAddress,
            billingAddress,
            paymentMethod,
            deliveryMethod,
            promoCode,
            notes
        } = req.body;

        // Validation
        if (!userId || !items || !items.length || !shippingAddress || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`
                });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price,
                total: itemTotal
            });
        }

        // Calculate shipping and taxes
        const shippingCost = deliveryMethod?.price || 0;
        const taxRate = 0.08; // 8% tax
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + shippingCost + taxAmount;

        // Create order
        const order = await Order.create({
            userId,
            orderNumber: `ORD-${Date.now()}`,
            status: 'processing', // Start with processing status for admin approval
            subtotal,
            shippingCost,
            taxAmount,
            totalAmount,
            shippingAddress,
            billingAddress,
            paymentMethod,
            deliveryMethod,
            promoCode,
            notes,
            paymentStatus: 'paid', // Set payment status to paid
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day for digital delivery
        });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                ...item
            });

            // Update product stock
            await Product.decrement('stockQuantity', {
                by: item.quantity,
                where: { id: item.productId }
            });
        }

        // Fetch complete order with items
        const completeOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        res.status(201).json({
            success: true,
            data: completeOrder,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order',
            message: error.message
        });
    }
};

/**
 * Get all orders with filtering
 */
const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || (!req.user.role || req.user.role !== 'admin') && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const {
            page = 1,
            limit = 10,
            status,
            userId,
            paymentStatus,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (userId) where.userId = userId;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        const orders = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'brand', 'images']
                    }]
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]]
        });

        // Transform the data to match frontend expectations
        const transformedOrders = orders.rows.map(order => {
            const orderData = order.toJSON();
            
            // Transform OrderItems to products array
            orderData.products = orderData.OrderItems?.map(item => ({
                id: item.Product?.id,
                name: item.Product?.name,
                brand: item.Product?.brand,
                image: item.Product?.images?.[0] || null,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })) || [];

            // Map User data to customer for frontend compatibility
            if (orderData.User) {
                orderData.customer = {
                    name: orderData.User.name,
                    email: orderData.User.email,
                    phone: orderData.User.phone
                };
                // Also keep user data for backward compatibility
                orderData.user = orderData.User;
            }

            // Calculate total if not present
            if (!orderData.totalAmount && orderData.products && orderData.products.length > 0) {
                orderData.totalAmount = orderData.products.reduce((sum, item) => {
                    return sum + (parseFloat(item.total) || 0);
                }, 0);
            }

            // Add date field for frontend compatibility
            orderData.date = orderData.createdAt;
            
            // Remove the original OrderItems and User to avoid confusion
            delete orderData.OrderItems;
            delete orderData.User;
            
            return orderData;
        });

        res.status(200).json({
            success: true,
            data: transformedOrders,
            pagination: {
                total: orders.count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(orders.count / limit)
            },
            message: "Orders fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders',
            message: error.message
        });
    }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: OrderItem,
                    include: [{
                        model: Product,
                        attributes: ['id', 'name', 'brand', 'images', 'category']
                    }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Transform the data to match frontend expectations
        const orderData = order.toJSON();
        
        // Transform OrderItems to products array
        orderData.products = orderData.OrderItems?.map(item => ({
            id: item.Product?.id,
            name: item.Product?.name,
            brand: item.Product?.brand,
            image: item.Product?.images?.[0] || null,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            total: item.total
        })) || [];

        // Add date field for frontend compatibility
        orderData.date = orderData.createdAt;
        
        // Remove the original OrderItems to avoid confusion
        delete orderData.OrderItems;

        res.status(200).json({
            success: true,
            data: orderData,
            message: "Order fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order',
            message: error.message
        });
    }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || (!req.user.role || req.user.role !== 'admin') && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { id } = req.params;
        const { status, trackingNumber, notes } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const order = await Order.findByPk(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const updateData = { status };
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (notes) updateData.notes = notes;

        await order.update(updateData);

        res.status(200).json({
            success: true,
            data: order,
            message: "Order status updated successfully"
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update order status',
            message: error.message
        });
    }
};

/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const order = await Order.findByPk(id, {
            include: [OrderItem]
        });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel shipped or delivered orders"
            });
        }

        // Restore product stock
        for (const item of order.OrderItems) {
            await Product.increment('stockQuantity', {
                by: item.quantity,
                where: { id: item.productId }
            });
        }

        await order.update({
            status: 'cancelled',
            notes: reason || 'Order cancelled by user'
        });

        res.status(200).json({
            success: true,
            data: order,
            message: "Order cancelled successfully"
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel order',
            message: error.message
        });
    }
};

/**
 * Get user orders
 */
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        // Check if user is accessing their own orders or is admin
        if (!req.user || (req.user.id != userId && (!req.user.role || req.user.role !== 'admin') && !req.user.isAdmin)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own orders."
            });
        }

        const offset = (page - 1) * limit;
        const where = { userId };

        if (status) where.status = status;

        const orders = await Order.findAndCountAll({
            where,
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    attributes: ['id', 'name', 'brand', 'images']
                }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        // Transform the data to match frontend expectations
        const transformedOrders = orders.rows.map(order => {
            const orderData = order.toJSON();
            
            // Transform OrderItems to products array
            orderData.products = orderData.OrderItems?.map(item => ({
                id: item.Product?.id,
                name: item.Product?.name,
                brand: item.Product?.brand,
                image: item.Product?.images?.[0] || null,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })) || [];

            // Add date field for frontend compatibility
            orderData.date = orderData.createdAt;
            
            // Remove the original OrderItems to avoid confusion
            delete orderData.OrderItems;
            
            return orderData;
        });

        res.status(200).json({
            success: true,
            data: transformedOrders,
            pagination: {
                total: orders.count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(orders.count / limit)
            },
            message: "User orders fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user orders',
            message: error.message
        });
    }
};

/**
 * Get order analytics
 */
const getOrderAnalytics = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user || (!req.user.role || req.user.role !== 'admin') && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const { startDate, endDate } = req.query;
        
        const where = {};
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Total orders and revenue
        const totalOrders = await Order.count({ where });
        const totalRevenue = await Order.sum('totalAmount', { where });

        // Orders by status
        const ordersByStatus = await Order.findAll({
            attributes: [
                'status',
                [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count'],
                [Order.sequelize.fn('SUM', Order.sequelize.col('totalAmount')), 'revenue']
            ],
            where,
            group: ['status']
        });

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue || 0,
                ordersByStatus
            },
            message: "Order analytics fetched successfully"
        });

    } catch (error) {
        console.error('Error fetching order analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order analytics',
            message: error.message
        });
    }
};

export {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getUserOrders,
    getOrderAnalytics
};
