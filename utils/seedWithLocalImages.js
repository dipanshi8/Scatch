const productModel = require('../models/product-model');
const path = require('path');

// Map of 7 local images to product data
const productData = [
  {
    name: "Elegant Pink Designer Handbag",
    description: "A beautiful pink handbag that combines elegance with modern style. Perfect for special occasions and daily use. Made with premium materials and exquisite craftsmanship.",
    price: 8999,
    discountPrice: 6999,
    category: "Handbags",
    stockQuantity: 15,
    image: "/images/beautiful-elegance-luxury-fashion-pink-women-handbag.jpg",
    featured: true
  },
  {
    name: "Luxury Green Fashion Handbag",
    description: "Stunning green handbag with a sophisticated design. Features premium leather construction and spacious interior. A statement piece for the modern woman.",
    price: 12499,
    discountPrice: 9999,
    category: "Handbags",
    stockQuantity: 12,
    image: "/images/beautiful-elegance-luxury-fashion-green-handbag.jpg",
    featured: true
  },
  {
    name: "Premium Leather Handbag",
    description: "Classic leather handbag with timeless elegance. Crafted from genuine leather with attention to detail. Perfect for professional and casual settings.",
    price: 15999,
    discountPrice: 0,
    category: "Handbags",
    stockQuantity: 8,
    image: "/images/luxury-handbag-leather-female-hand.jpg",
    featured: false
  },
  {
    name: "Modern Minimalist Tote Bag",
    description: "Contemporary tote bag with clean lines and minimalist design. Spacious and practical, ideal for work and travel. Sustainable fashion choice.",
    price: 5499,
    discountPrice: 4499,
    category: "Handbags",
    stockQuantity: 20,
    image: "/images/still-life-say-no-fast-fashion.jpg",
    featured: false
  },
  {
    name: "Stylish Hanging Shoulder Bag",
    description: "Unique hanging design shoulder bag that stands out. Versatile and fashionable, perfect for adding a touch of sophistication to any outfit.",
    price: 7499,
    discountPrice: 5999,
    category: "Handbags",
    stockQuantity: 18,
    image: "/images/bag-hanging-from-furniture-item-indoors.jpg",
    featured: false
  },
  {
    name: "Designer Pink Handbag Collection",
    description: "Exquisite pink handbag collection featuring multiple styles. Premium quality materials and contemporary design. A must-have for fashion enthusiasts.",
    price: 10999,
    discountPrice: 8999,
    category: "Handbags",
    stockQuantity: 10,
    image: "/images/pink-handbags.jpg",
    featured: true
  },
  {
    name: "Floating Display Luxury Bag",
    description: "Innovative design luxury bag with a modern aesthetic. Premium materials and exceptional craftsmanship. A unique piece that combines art and functionality.",
    price: 17999,
    discountPrice: 14999,
    category: "Handbags",
    stockQuantity: 6,
    image: "/images/levitating-women-s-bag-display.jpg",
    featured: true
  }
];

/**
 * Seed database with 7 products using local images
 * Only seeds if database is empty
 */
async function seedWithLocalImages() {
  try {
    const productCount = await productModel.countDocuments();
    
    if (productCount === 0) {
      console.log('📦 No products found. Seeding 7 products with local images...');
      
      const products = productData.map(data => ({
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        category: data.category,
        stockQuantity: data.stockQuantity,
        images: [{
          url: data.image,
          publicId: `local/${path.basename(data.image)}`,
          isPrimary: true
        }],
        featured: data.featured,
        // Legacy fields for backward compatibility
        image: data.image,
        bgcolor: '#ffffff',
        panelcolor: '#f3f4f6',
        textcolor: '#000000',
        discount: data.discountPrice > 0 ? data.price - data.discountPrice : 0,
        stock: data.stockQuantity
      }));
      
      await productModel.insertMany(products);
      console.log(`✅ Successfully seeded ${products.length} products with local images!`);
      
      // Log category distribution
      const categoryStats = await productModel.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      console.log('📊 Category distribution:');
      categoryStats.forEach(stat => {
        console.log(`   ${stat._id}: ${stat.count} products`);
      });
      
      return true;
    } else {
      console.log(`✅ Products already exist (${productCount} products found). Skipping seed.`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error seeding products with local images:', error.message);
    return false;
  }
}

module.exports = { seedWithLocalImages };

