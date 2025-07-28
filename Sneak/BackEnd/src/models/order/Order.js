import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/index.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        allowNull: false,
        defaultValue: 'pending'
    },
    paymentStatus: {
        type: DataTypes.ENUM,
        values: ['pending', 'paid', 'failed', 'refunded'],
        allowNull: false,
        defaultValue: 'pending'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    shippingCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false
    },
    billingAddress: {
        type: DataTypes.JSON,
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.JSON,
        allowNull: false
    },
    deliveryMethod: {
        type: DataTypes.JSON,
        allowNull: true
    },
    trackingNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    promoCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedDelivery: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['paymentStatus']
        },
        {
            fields: ['orderNumber']
        },
        {
            fields: ['createdAt']
        }
    ]
});

// Instance methods
Order.prototype.canBeCancelled = function() {
    return ['pending', 'confirmed', 'processing'].includes(this.status);
};

Order.prototype.isDelivered = function() {
    return this.status === 'delivered';
};

export { Order };
