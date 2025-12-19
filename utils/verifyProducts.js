const mongoose = require('mongoose');
const productModel = require('../models/product-model');
require('dotenv').config();

async function verifyProducts() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI not found in environment variables!');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    const products = await productModel.find({ stockQuantity: { $gt: 0 } });
    console.log(`\n📦 Products with stock > 0: ${products.length}\n`);
    
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Stock: ${p.stockQuantity} | Category: ${p.category}`);
      console.log(`   Image: ${p.image ? p.image.substring(0, 60) + '...' : 'No image'}`);
      console.log('');
    });
    
    await mongoose.connection.close();
    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyProducts();

