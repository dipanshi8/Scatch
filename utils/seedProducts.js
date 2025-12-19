const productModel = require("../models/product-model");

// Sample bag products to seed the database
const sampleProducts = [
  {
    name: "Classic Leather Tote Bag",
    description: "Elegant and spacious leather tote bag perfect for everyday use. Made from premium genuine leather with reinforced handles.",
    price: 2499,
    discount: 300,
    stock: 15,
    bgcolor: "#f5f5dc",
    panelcolor: "#8b4513",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4YjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MZWF0aGVyIFRvdGU8L3RleHQ+PC9zdmc+"
  },
  {
    name: "Modern Canvas Backpack",
    description: "Stylish and durable canvas backpack with multiple compartments. Ideal for work, travel, or daily commute.",
    price: 1799,
    discount: 200,
    stock: 20,
    bgcolor: "#e8f4f8",
    panelcolor: "#2c3e50",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U4ZjRmOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMyYzNlNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYW52YXMgQmFja3BhY2s8L3RleHQ+PC9zdmc+"
  },
  {
    name: "Designer Handbag",
    description: "Luxury designer handbag with premium finish. Perfect for special occasions and professional settings.",
    price: 4499,
    discount: 500,
    stock: 8,
    bgcolor: "#fff8dc",
    panelcolor: "#8b008b",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZjhkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4YjAwOGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZXNpZ25lciBCYWc8L3RleHQ+PC9zdmc+"
  },
  {
    name: "Sporty Gym Bag",
    description: "Spacious gym bag with separate shoe compartment. Water-resistant material perfect for active lifestyle.",
    price: 1299,
    discount: 150,
    stock: 25,
    bgcolor: "#f0f0f0",
    panelcolor: "#ff4500",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZjQ1MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HeW0gQmFnPC90ZXh0Pjwvc3ZnPg=="
  },
  {
    name: "Elegant Clutch Purse",
    description: "Compact and elegant clutch purse for evening events. Features a secure magnetic closure.",
    price: 899,
    discount: 100,
    stock: 18,
    bgcolor: "#ffe4e1",
    panelcolor: "#4b0082",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZTRlMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM0YjAwODIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbHV0Y2g8L3RleHQ+PC9zdmc+"
  },
  {
    name: "Travel Duffel Bag",
    description: "Large capacity duffel bag for weekend trips. Durable construction with comfortable shoulder strap.",
    price: 2199,
    discount: 250,
    stock: 12,
    bgcolor: "#e0e0e0",
    panelcolor: "#006400",
    textcolor: "#ffffff",
    category: "bag",
    image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDY0MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EdWZmZWwgQmFnPC90ZXh0Pjwvc3ZnPg=="
  }
];

/**
 * Seed products if database is empty
 * This ensures the shop always has products to display
 */
async function seedProducts() {
  try {
    const productCount = await productModel.countDocuments();
    
    if (productCount === 0) {
      console.log('📦 No products found. Seeding sample products...');
      await productModel.insertMany(sampleProducts);
      console.log(`✅ Successfully seeded ${sampleProducts.length} products!`);
      return true;
    } else {
      console.log(`✅ Products already exist (${productCount} products found). Skipping seed.`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    return false;
  }
}

module.exports = { seedProducts };

