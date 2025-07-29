export * from './user/userRoute.js'
export * from './auth/authRoute.js'

// Import route modules  
import { userRouter } from './user/userRoute.js';
import { authRouter } from './auth/authRoute.js';
import productRoutes from './product/productRoute.js';
import orderRoutes from './order/orderRoute.js';
import cartRoutes from './cart/cartRoute.js';
import refundRoutes from './refund/refundRoute.js';


// Export route modules for app setup
export {
    userRouter,
    authRouter,
    productRoutes,
    orderRoutes,
    cartRoutes,
    refundRoutes
};
