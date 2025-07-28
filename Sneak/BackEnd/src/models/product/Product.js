import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/index.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [['men', 'women', 'kids', 'sale', 'featured']]
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    availableSizes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    availableColors: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    specifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        }
    },
    reviewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
}, {
    tableName: 'products',
    timestamps: true,
    indexes: [
        {
            fields: ['brand']
        },
        {
            fields: ['category']
        },
        {
            fields: ['price']
        },
        {
            fields: ['isActive']
        },
        {
            fields: ['isFeatured']
        }
    ]
});

// Instance methods
Product.prototype.isInStock = function() {
    return this.stockQuantity > 0 && this.isActive;
};

Product.prototype.getDiscountPercentage = function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
};

// Class methods
Product.findByCategory = function(category) {
    return this.findAll({
        where: {
            category,
            isActive: true
        },
        order: [['createdAt', 'DESC']]
    });
};

Product.findByBrand = function(brand) {
    return this.findAll({
        where: {
            brand,
            isActive: true
        },
        order: [['createdAt', 'DESC']]
    });
};

Product.findFeatured = function(limit = 8) {
    return this.findAll({
        where: {
            isFeatured: true,
            isActive: true
        },
        limit,
        order: [['createdAt', 'DESC']]
    });
};

export { Product };
