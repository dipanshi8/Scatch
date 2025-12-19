# Installation & Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Express.js
- Mongoose
- EJS
- Tailwind CSS (via CDN)
- DaisyUI (via CDN)
- Cloudinary
- Faker.js
- And all other dependencies

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://yaduvanshidips25_db_user:baN8ufhQqU0qGmGs@trackify.of744pl.mongodb.net/?retryWrites=true&w=majority&appName=Trackify

# Security
SESSION_SECRET=your-super-secret-session-key-change-in-production-12345
JWT_KEY=your-super-secret-jwt-key-change-in-production-67890

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. Start the Application

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 4. Access the Application

- **User Interface**: http://localhost:3000
- **Admin Login**: http://localhost:3000/owners/login

## First Time Setup

### Create Admin Account (Development Only)

1. Visit: http://localhost:3000/owners/register
2. Fill in the registration form
3. Login with credentials at: http://localhost:3000/owners/login

### Product Seeding

Products are automatically seeded on first startup if the database is empty. The seeder creates 20 premium bag products across 3 categories:
- Backpacks
- Handbags  
- Clutches

## Features Available

### User Features
- ✅ Register/Login/Logout
- ✅ Browse products with category filters
- ✅ View new arrivals
- ✅ Add to cart (database-persisted)
- ✅ Update cart quantities
- ✅ Multi-step checkout
- ✅ View order history
- ✅ Order tracking

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Product management (Create, Edit, Delete)
- ✅ Order management
- ✅ Total sales tracking
- ✅ Recent orders view

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct in `.env`
- Check internet connection (MongoDB Atlas requires internet)
- App will run without DB but features won't work

### Products Not Showing
- Products auto-seed on startup
- If empty, visit `/shop` to trigger seeding
- Check MongoDB connection

### Cart Not Working
- Ensure you're logged in
- Cart is stored in database, not just session
- Check user model has cart field

### Cloudinary Issues
- Cloudinary is optional for now
- Images use placeholder URLs from Faker.js
- Set up Cloudinary credentials in `.env` for real uploads

## Next Steps

1. Set up Cloudinary account for image uploads
2. Customize product categories if needed
3. Add payment gateway integration
4. Configure email notifications
5. Set up production environment variables

