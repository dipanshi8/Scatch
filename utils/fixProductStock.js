const mongoose = require('mongoose');
const productModel = require('../models/product-model');
require('dotenv').config();

async function fixProductStock() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI not found in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Update all products with stockQuantity = 0 to have stockQuantity = 10
    const result = await productModel.updateMany(
      { stockQuantity: 0 },
      { $set: { stockQuantity: 10 } }
    );
    console.log(`✅ Updated ${result.modifiedCount} products with stockQuantity = 0`);
    
    // Also update legacy stock field
    await productModel.updateMany(
      { stock: 0 },
      { $set: { stock: 10 } }
    );
    
    // Count products with stock > 0
    const count = await productModel.countDocuments({ stockQuantity: { $gt: 0 } });
    console.log(`✅ Products with stock > 0: ${count}`);
    
    // Show sample products
    const products = await productModel.find().limit(3);
    products.forEach(p => {
      console.log(`   - ${p.name}: Stock = ${p.stockQuantity}, Category = ${p.category}`);
    });
    
    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProductStock();

