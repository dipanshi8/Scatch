const mongoose = require('mongoose');
const productModel = require('../models/product-model');
const { seedWithLocalImages } = require('./seedWithLocalImages');
require('dotenv').config();

async function reseedProducts() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI not found in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Delete all existing products
    const deleteResult = await productModel.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);
    
    // Seed new products
    await seedWithLocalImages();
    
    // Verify products were created
    const count = await productModel.countDocuments();
    console.log(`✅ Total products in database: ${count}`);
    
    const products = await productModel.find().limit(3);
    products.forEach(p => {
      console.log(`   - ${p.name}: Stock = ${p.stockQuantity}, Category = ${p.category}`);
    });
    
    await mongoose.connection.close();
    console.log('✅ Reseeding complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reseedProducts();

