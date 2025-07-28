import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/index.js';

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  requestDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  refundType: {
    type: DataTypes.ENUM('product', 'order'),
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  orderTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'refunds',
  timestamps: true
});

export default Refund; 