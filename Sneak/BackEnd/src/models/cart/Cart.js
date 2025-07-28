import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/index.js';

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    totalItems: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    promoCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    discountType: {
        type: DataTypes.ENUM,
        values: ['percentage', 'fixed'],
        allowNull: true
    }
}, {
    tableName: 'carts',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        }
    ]
});

// Instance methods
Cart.prototype.isEmpty = function() {
    return this.totalItems === 0;
};

Cart.prototype.getTotal = function() {
    return parseFloat(this.subtotal) - parseFloat(this.discountAmount);
};

export { Cart };
