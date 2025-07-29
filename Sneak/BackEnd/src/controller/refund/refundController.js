import Refund from '../../models/refund/Refund.js';
import { Order } from '../../models/order/Order.js';
import { User } from '../../models/user/User.js';
import { Product } from '../../models/product/Product.js';

// Create a new refund request
const createRefundRequest = async (req, res) => {
  try {
    console.log('Refund request received:', req.body);
    
    const {
      orderId,
      userId,
      customerName,
      customerEmail,
      refundType,
      productId,
      productName,
      orderTotal,
      refundAmount,
      reason
    } = req.body;

    console.log('Extracted data:', {
      orderId,
      userId,
      customerName,
      customerEmail,
      refundType,
      productId,
      productName,
      orderTotal,
      refundAmount,
      reason
    });

    // Validate required fields
    if (!orderId || !userId || !customerName || !customerEmail || !refundType || !orderTotal || !refundAmount || !reason) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if order exists and belongs to user
    console.log('Checking order:', orderId);
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order found:', order.id, 'User ID:', order.userId, 'Requested user ID:', userId);
    if (order.userId !== parseInt(userId)) {
      console.log('Order does not belong to user');
      return res.status(403).json({
        success: false,
        message: 'Order does not belong to this user'
      });
    }

    // Check if refund already exists for this order/product combination
    console.log('Checking for existing refund');
    const existingRefund = await Refund.findOne({
      where: {
        orderId,
        productId: productId || null,
        status: ['pending', 'approved']
      }
    });

    if (existingRefund) {
      console.log('Existing refund found');
      return res.status(400).json({
        success: false,
        message: 'Refund request already exists for this order/product'
      });
    }

    // Create refund request
    console.log('Creating refund request');
    const refund = await Refund.create({
      orderId,
      userId,
      customerName,
      customerEmail,
      status: 'pending',
      requestDate: new Date(),
      refundType,
      productId,
      productName,
      orderTotal,
      refundAmount,
      reason
    });

    console.log('Refund created successfully:', refund.id);

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });

  } catch (error) {
    console.error('Error creating refund request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all refund requests (admin only)
const getAllRefunds = async (req, res) => {
  try {
    console.log('Fetching all refunds');
    const refunds = await Refund.findAll({
      include: [
        {
          model: Order,
          attributes: ['id', 'status', 'createdAt']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Refunds fetched successfully:', refunds.length);

    res.json({
      success: true,
      data: refunds
    });

  } catch (error) {
    console.error('Error fetching refunds:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get refund requests for a specific user
const getUserRefunds = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching refunds for user:', userId);

    const refunds = await Refund.findAll({
      where: { userId },
      include: [
        {
          model: Order,
          attributes: ['id', 'status', 'createdAt']
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('User refunds fetched successfully:', refunds.length);

    res.json({
      success: true,
      data: refunds
    });

  } catch (error) {
    console.error('Error fetching user refunds:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update refund status (admin only)
const updateRefundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const refund = await Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    // Update refund status
    refund.status = status;
    refund.adminNotes = adminNotes;
    refund.processedDate = new Date();
    await refund.save();

    res.json({
      success: true,
      message: 'Refund status updated successfully',
      data: refund
    });

  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete refund request
const deleteRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findByPk(id);
    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }

    await refund.destroy();

    res.json({
      success: true,
      message: 'Refund request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting refund:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  createRefundRequest,
  getAllRefunds,
  getUserRefunds,
  updateRefundStatus,
  deleteRefund
}; 