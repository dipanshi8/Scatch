const { faker } = require('@faker-js/faker');
const productModel = require('../models/product-model');

// Categories for bags
const categories = ['Backpacks', 'Handbags', 'Clutches'];

// Generate premium bag product data
function generateProduct() {
  const category = faker.helpers.arrayElement(categories);
  const basePrice = faker.number.int({ min: 1500, max: 15000 });
  const hasDiscount = faker.datatype.boolean({ probability: 0.4 });
  const discountPrice = hasDiscount 
    ? Math.round(basePrice * faker.number.float({ min: 0.7, max: 0.95 }))
    : 0;

  // Generate product name based on category
  let name;
  switch (category) {
    case 'Backpacks':
      name = `${faker.helpers.arrayElement(['Premium', 'Designer', 'Luxury', 'Classic', 'Modern'])} ${faker.helpers.arrayElement(['Leather', 'Canvas', 'Nylon', 'Vegan Leather'])} Backpack`;
      break;
    case 'Handbags':
      name = `${faker.helpers.arrayElement(['Elegant', 'Stylish', 'Designer', 'Premium', 'Luxury'])} ${faker.helpers.arrayElement(['Tote', 'Shoulder', 'Crossbody', 'Satchel'])} Handbag`;
      break;
    case 'Clutches':
      name = `${faker.helpers.arrayElement(['Designer', 'Elegant', 'Evening', 'Premium', 'Luxury'])} ${faker.helpers.arrayElement(['Clutch', 'Wristlet', 'Evening Bag', 'Mini Bag'])}`;
      break;
    default:
      name = faker.commerce.productName();
  }

  // Generate images using placeholder service (can be replaced with Cloudinary later)
  const imageCount = faker.number.int({ min: 1, max: 3 });
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    images.push({
      url: `https://images.unsplash.com/photo-${faker.string.numeric(10)}?w=800&h=800&fit=crop`,
      publicId: `scatch/products/${faker.string.uuid()}`,
      isPrimary: i === 0
    });
  }

  return {
    name: name,
    description: faker.commerce.productDescription() + ' ' + faker.lorem.sentences(2),
    price: basePrice,
    discountPrice: discountPrice,
    category: category,
    stockQuantity: faker.number.int({ min: 5, max: 50 }),
    images: images,
    featured: faker.datatype.boolean({ probability: 0.3 }),
    // Legacy fields for backward compatibility
    image: images[0]?.url || '',
    bgcolor: faker.internet.color(),
    panelcolor: '#f3f4f6',
    textcolor: '#000000',
    discount: discountPrice > 0 ? basePrice - discountPrice : 0,
    stock: faker.number.int({ min: 5, max: 50 })
  };
}

/**
 * Seed database with 20 premium bag products
 * Only seeds if database is empty
 */
async function seedPremiumProducts() {
  try {
    const productCount = await productModel.countDocuments();
    
    if (productCount === 0) {
      console.log('📦 No products found. Seeding 20 premium bag products...');
      
      const products = [];
      for (let i = 0; i < 20; i++) {
        products.push(generateProduct());
      }
      
      await productModel.insertMany(products);
      console.log(`✅ Successfully seeded ${products.length} premium products!`);
      
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
    console.error('❌ Error seeding premium products:', error.message);
    return false;
  }
}

module.exports = { seedPremiumProducts, generateProduct };

