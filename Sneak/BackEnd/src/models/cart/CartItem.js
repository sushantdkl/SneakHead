import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/index.js';

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 10
        }
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
        {
            fields: ['cartId']
        },
        {
            fields: ['productId']
        }
        // Temporarily removed unique constraint to debug cart issue
        // {
        //     unique: true,
        //     fields: ['cartId', 'productId', 'size', 'color']
        // }
    ]
});

// Instance methods
CartItem.prototype.getItemTotal = function() {
    return parseFloat(this.price) * this.quantity;
};

export { CartItem };
