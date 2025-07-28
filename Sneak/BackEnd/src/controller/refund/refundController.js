import Refund from '../../models/refund/Refund.js';
import { Order } from '../../models/order/Order.js';
import { User } from '../../models/user/User.js';
import { Product } from '../../models/product/Product.js';

// Create a new refund request
const createRefundRequest = async (req, res) => {
  try {
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

    // Validate required fields
    if (!orderId || !userId || !customerName || !customerEmail || !refundType || !orderTotal || !refundAmount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if order exists and belongs to user
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Order does not belong to this user'
      });
    }

    // Check if refund already exists for this order/product combination
    const existingRefund = await Refund.findOne({
      where: {
        orderId,
        productId: productId || null,
        status: ['pending', 'approved']
      }
    });

    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: 'Refund request already exists for this order/product'
      });
    }

    // Create refund request
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

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });

  } catch (error) {
    console.error('Error creating refund request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all refund requests (admin only)
const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'status', 'createdAt']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: refunds
    });

  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get refund requests for a specific user
const getUserRefunds = async (req, res) => {
  try {
    const { userId } = req.params;

    const refunds = await Refund.findAll({
      where: { userId },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'status', 'createdAt']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: refunds
    });

  } catch (error) {
    console.error('Error fetching user refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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