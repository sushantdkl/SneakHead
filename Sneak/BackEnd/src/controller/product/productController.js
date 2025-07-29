import { Product } from '../../models/index.js';
import { Op } from 'sequelize';

// Main product controller for handling CRUD operations
// Product controller handles all product CRUD operations
/**
 * Product Controller
 * Handles all product-related operations including CRUD, search, and filtering
 * Supports pagination, sorting, and advanced search functionality
 */


/**
 * Get all products with advanced filtering, pagination, and search
 * @param {Object} req - Express request object with query parameters
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with products data and pagination info
 */
const getAllProducts = async (req, res) => {
    try {
        // Extract query parameters with default values
        const { 
            page = 1, 
            limit = 10,  // Default page size
            category, 
            brand, 
            minPrice, 
            maxPrice, 
            size, 
            color,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
            search,
            q // Also support 'q' parameter for search compatibility
        } = req.query;

        // Calculate pagination offset
        const offset = (page - 1) * limit;
        const where = {}; // Initialize filter object

        // Apply category and brand filters with case-insensitive matching
        if (category) where.category = { [Op.like]: `%${category}%` };
        if (brand) where.brand = { [Op.like]: `%${brand}%` };
        
        // Apply price range filters
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }
        
        // Advanced search functionality across multiple fields
        const searchQuery = search || q;
        if (searchQuery) {
            where[Op.or] = [
                { name: { [Op.like]: `%${searchQuery}%` } },
                { description: { [Op.like]: `%${searchQuery}%` } },
                { brand: { [Op.like]: `%${searchQuery}%` } },
                { category: { [Op.like]: `%${searchQuery}%` } }
            ];
        }

        // Execute database query with filters, pagination, and sorting
        const products = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]]
        });

        // Send successful response with products and pagination metadata
        res.status(200).json({
            success: true,
            data: products.rows,
            pagination: {
                total: products.count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(products.count / limit)
            },
            message: "Products fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch products',
            message: error.message 
        });
    }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find product by primary key
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: "Product fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch product',
            message: error.message 
        });
    }
};

/**
 * Create new product
 */
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            brand,
            category,
            price,
            originalPrice,
            images,
            availableSizes,
            availableColors,
            features,
            specifications,
            stockQuantity,
            isActive = true,
            isFeatured = false
        } = req.body;

        // Validation for required fields
        if (!name || !brand || !category || !price || !stockQuantity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, brand, category, price, stockQuantity"
            });
        }

        const product = await Product.create({
            name,
            description,
            brand,
            category,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            images: images || [],
            availableSizes: availableSizes || [],
            availableColors: availableColors || [],
            features: features || [],
            specifications: specifications || {},
            stockQuantity: parseInt(stockQuantity),
            isActive,
            isFeatured
        });

        res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully"
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create product',
            message: error.message 
        });
    }
};

/**
 * Update product
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find existing product
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Update price fields as floats
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
        if (updateData.stockQuantity) updateData.stockQuantity = parseInt(updateData.stockQuantity);

        await product.update(updateData);

        res.status(200).json({
            success: true,
            data: product,
            message: "Product updated successfully"
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update product',
            message: error.message 
        });
    }
};

/**
 * Delete product
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find product to delete
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await product.destroy();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete product',
            message: error.message 
        });
    }
};

/**
 * Get featured products
 */
const getFeaturedProducts = async (req, res) => {
    try {
        // Query only active and featured products
        const products = await Product.findAll({
            where: { 
                isActive: true,
                isFeatured: true 
            },
            limit: 8,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: products,
            message: "Featured products fetched successfully"
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch featured products',
            message: error.message 
        });
    }
};

/**
 * Update product stock
 */
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stockQuantity } = req.body;

        if (stockQuantity === undefined || stockQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock quantity"
            });
        }

        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await product.update({ 
            stockQuantity: parseInt(stockQuantity),
            isActive: stockQuantity > 0 
        });

        res.status(200).json({
            success: true,
            data: { stockQuantity: product.stockQuantity },
            message: "Stock updated successfully"
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update stock',
            message: error.message 
        });
    }
};

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    updateStock
};
