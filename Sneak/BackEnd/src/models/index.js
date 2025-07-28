// Import models for relationship setup
import { User } from "./user/User.js";
import { Product } from "./product/Product.js";
import { Order } from "./order/Order.js";
import { OrderItem } from "./order/OrderItem.js";
import { Cart } from "./cart/Cart.js";
import { CartItem } from "./cart/CartItem.js";


// Define relationships

// User relationships
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Order relationships
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });

// OrderItem relationships
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Product relationships
Product.hasMany(OrderItem, { foreignKey: 'productId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

// Cart relationships
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });

// CartItem relationships
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });



// Export configured models
export {
    User,
    Product,
    Order,
    OrderItem,
    Cart,
    CartItem
};
