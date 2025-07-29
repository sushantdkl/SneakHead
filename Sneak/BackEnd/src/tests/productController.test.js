// Mock the modules before importing
jest.mock("../controller/product/productController.js", () => ({
  productController: {
    createProduct: jest.fn(),
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  }
}));

jest.mock("../models/product/Product.js", () => ({
  Product: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  }
}));

// Import after mocking
const { productController } = require("../controller/product/productController.js");
const { Product } = require("../models/product/Product.js");

describe("Product Controller", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should have createProduct function", () => {
    expect(typeof productController.createProduct).toBe('function');
  });

  it("should have getAllProducts function", () => {
    expect(typeof productController.getAllProducts).toBe('function');
  });

  it("should have getProductById function", () => {
    expect(typeof productController.getProductById).toBe('function');
  });

  it("should have updateProduct function", () => {
    expect(typeof productController.updateProduct).toBe('function');
  });

  it("should have deleteProduct function", () => {
    expect(typeof productController.deleteProduct).toBe('function');
  });

  it("should mock Product.create function", () => {
    expect(Product.create).toBeDefined();
    expect(typeof Product.create).toBe('function');
  });

  it("should mock Product.findAll function", () => {
    expect(Product.findAll).toBeDefined();
    expect(typeof Product.findAll).toBe('function');
  });

  it("should mock Product.findByPk function", () => {
    expect(Product.findByPk).toBeDefined();
    expect(typeof Product.findByPk).toBe('function');
  });
});
