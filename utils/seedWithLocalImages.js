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
    image: "beautiful-elegance-luxury-fashion-pink-women-handbag.jpg",
    featured: true
  },
  {
    name: "Luxury Green Fashion Handbag",
    description: "Stunning green handbag with a sophisticated design. Features premium leather construction and spacious interior. A statement piece for the modern woman.",
    price: 12499,
    discountPrice: 9999,
    category: "Handbags",
    stockQuantity: 12,
    image: "beautiful-elegance-luxury-fashion-green-handbag.jpg",
    featured: true
  },
  {
    name: "Premium Leather Handbag",
    description: "Classic leather handbag with timeless elegance. Crafted from genuine leather with attention to detail. Perfect for professional and casual settings.",
    price: 15999,
    discountPrice: 0,
    category: "Handbags",
    stockQuantity: 8,
    image: "luxury-handbag-leather-female-hand.jpg",
    featured: false
  },
  {
    name: "Modern Minimalist Tote Bag",
    description: "Contemporary tote bag with clean lines and minimalist design. Spacious and practical, ideal for work and travel. Sustainable fashion choice.",
    price: 5499,
    discountPrice: 4499,
    category: "Handbags",
    stockQuantity: 20,
    image: "still-life-say-no-fast-fashion.jpg",
    featured: false
  },
  {
    name: "Stylish Hanging Shoulder Bag",
    description: "Unique hanging design shoulder bag that stands out. Versatile and fashionable, perfect for adding a touch of sophistication to any outfit.",
    price: 7499,
    discountPrice: 5999,
    category: "Handbags",
    stockQuantity: 18,
    image: "bag-hanging-from-furniture-item-indoors.jpg",
    featured: false
  },
  {
    name: "Designer Pink Handbag Collection",
    description: "Exquisite pink handbag collection featuring multiple styles. Premium quality materials and contemporary design. A must-have for fashion enthusiasts.",
    price: 10999,
    discountPrice: 8999,
    category: "Handbags",
    stockQuantity: 10,
    image: "pink-handbags.jpg",
    featured: true
  },
  {
    name: "Floating Display Luxury Bag",
    description: "Innovative design luxury bag with a modern aesthetic. Premium materials and exceptional craftsmanship. A unique piece that combines art and functionality.",
    price: 17999,
    discountPrice: 14999,
    category: "Handbags",
    stockQuantity: 6,
    image: "levitating-women-s-bag-display.jpg",
    featured: true
  },
  {
    name: "Elegant Black Leather Bag",
    description: "Sophisticated black leather bag perfect for formal occasions. Timeless design with premium craftsmanship and durable materials.",
    price: 12999,
    discountPrice: 10999,
    category: "Handbags",
    stockQuantity: 14,
    image: "1bag.jpg",
    featured: false
  },
  {
    name: "Casual Canvas Tote",
    description: "Versatile canvas tote bag ideal for everyday use. Spacious and lightweight, perfect for shopping or work.",
    price: 3999,
    discountPrice: 3499,
    category: "Handbags",
    stockQuantity: 22,
    image: "2bag.jpg",
    featured: false
  },
  {
    name: "Designer Patterned Handbag",
    description: "Stylish patterned handbag with unique design elements. Combines fashion and functionality for the modern woman.",
    price: 8999,
    discountPrice: 7999,
    category: "Handbags",
    stockQuantity: 10,
    image: "3bag 1.jpg",
    featured: false
  },
  {
    name: "Compact Crossbody Bag",
    description: "Compact and convenient crossbody bag for on-the-go style. Secure and fashionable, perfect for travel or daily outings.",
    price: 6499,
    discountPrice: 5499,
    category: "Handbags",
    stockQuantity: 16,
    image: "4bag.jpg",
    featured: false
  },
  {
    name: "Vintage Inspired Satchel",
    description: "Vintage-inspired satchel with classic charm. Spacious interior and adjustable straps for comfort and style.",
    price: 9999,
    discountPrice: 0,
    category: "Backpacks",
    stockQuantity: 12,
    image: "5bag.jpg",
    featured: false
  },
  {
    name: "Boho Fringe Bag",
    description: "Bohemian style fringe bag with artistic flair. Free-spirited design perfect for casual and artistic occasions.",
    price: 7499,
    discountPrice: 6499,
    category: "Handbags",
    stockQuantity: 18,
    image: "6bag.jpg",
    featured: false
  },
  {
    name: "Executive Briefcase Bag",
    description: "Professional briefcase bag for the working woman. Organized compartments and sleek design for business meetings.",
    price: 15999,
    discountPrice: 13999,
    category: "Handbags",
    stockQuantity: 8,
    image: "7bag.jpg",
    featured: false
  },
  {
    name: "Artistic Print Clutch",
    description: "Eye-catching artistic print clutch bag. Perfect for evening events and special occasions with a touch of creativity.",
    price: 5999,
    discountPrice: 4999,
    category: "Clutches",
    stockQuantity: 20,
    image: "image 80.jpg",
    featured: false
  }
];

/**
 * Seed database with products using local images
 * Always deletes existing products and reseeds with correct data
 */
async function seedWithLocalImages() {
  try {
    console.log('📦 Deleting existing products and reseeding with local images...');
    
    // Delete all existing products to ensure clean reseed
    await productModel.deleteMany({});
    console.log('✅ Deleted existing products');
    
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
  } catch (error) {
    console.error('❌ Error seeding products with local images:', error.message);
    return false;
  }
}

module.exports = { seedWithLocalImages };

