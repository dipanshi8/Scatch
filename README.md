# Scatch - E-Commerce Bag Shopping Website

A full-featured e-commerce application for shopping bags, built with Node.js, Express, MongoDB, and EJS.

## Features

### User Features
- ✅ User authentication (Register, Login, Logout)
- ✅ Product browsing and search
- ✅ Product detail pages
- ✅ Session-based shopping cart with quantity management
- ✅ Checkout flow with shipping address
- ✅ Order placement and order history
- ✅ Order tracking

### Admin Features
- ✅ Separate admin authentication system
- ✅ Admin dashboard with statistics
- ✅ Product management (Create, Read, Update, Delete)
- ✅ Order management and status updates
- ✅ Inventory management (stock tracking)

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **View Engine**: EJS
- **Styling**: Tailwind CSS (via CDN)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Session Management**: express-session

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (cloud database - no local installation needed)
- npm or yarn
- Internet connection (for MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Scatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Atlas Connection String (REQUIRED)
   MONGO_URI=mongodb+srv://yaduvanshidips25_db_user:baN8ufhQqU0qGmGs@trackify.of744pl.mongodb.net/?retryWrites=true&w=majority&appName=Trackify
   
   # Session Secret (REQUIRED for express-session)
   SESSION_SECRET=your-super-secret-session-key-change-in-production-12345
   
   # JWT Secret Key (for authentication tokens)
   JWT_KEY=your-super-secret-jwt-key-change-in-production-67890
   
   # Server Port
   PORT=3000
   
   # Environment
   NODE_ENV=development
   ```

   **Note:** This project uses MongoDB Atlas (cloud database). No local MongoDB installation required!

4. **Run the application**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```
   (Note: Requires nodemon - install with `npm install -g nodemon`)

5. **Access the application**
   - User interface: http://localhost:3000
   - Admin login: http://localhost:3000/owners/login

## Project Structure

```
Scatch/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── config/                # Configuration files
│   ├── keys.js
│   ├── mongoose-connection.js
│   └── multer-config.js
├── controllers/           # Business logic controllers
│   ├── authController.js
│   ├── adminController.js
│   └── cartController.js
├── middlewares/           # Custom middleware
│   ├── isLoggedIn.js     # User authentication middleware
│   └── isAdmin.js        # Admin authentication middleware
├── models/               # Database models
│   ├── user-model.js
│   ├── product-model.js
│   ├── owners-model.js
│   └── order-model.js
├── routes/               # Route handlers
│   ├── index.js         # Main routes (shop, cart, checkout, orders)
│   ├── usersRouter.js    # User authentication routes
│   ├── productsRouter.js # Product routes (public)
│   └── ownersRouter.js  # Admin routes
├── public/              # Static assets
│   ├── images/         # Product images
│   ├── javascripts/
│   └── stylesheets/
├── utils/              # Utility functions
│   └── generateToken.js
└── views/             # EJS templates
    ├── index.ejs      # Home/Login page
    ├── shop.ejs       # Product listing
    ├── product-detail.ejs
    ├── cart.ejs
    ├── checkout.ejs
    ├── orders.ejs
    ├── order-detail.ejs
    ├── admin-login.ejs
    ├── admin-dashboard.ejs
    ├── admin-products.ejs
    ├── admin-orders.ejs
    ├── createproducts.ejs
    ├── edit-product.ejs
    ├── error.ejs
    └── partials/
        ├── header.ejs
        └── footer.ejs
```

## Usage

### As a User

1. **Register/Login**: Visit the home page to create an account or login
2. **Browse Products**: Go to the Shop page to see all available bags
3. **View Product Details**: Click on any product to see details
4. **Add to Cart**: Click the "+" button to add products to your cart
5. **Manage Cart**: Visit the Cart page to update quantities or remove items
6. **Checkout**: Fill in shipping details and place your order
7. **View Orders**: Check your order history in the "My Orders" section

### As an Admin

1. **Admin Login**: Visit `/owners/login` and login with admin credentials
2. **Dashboard**: View statistics and quick actions
3. **Manage Products**: 
   - View all products at `/owners/admin/products`
   - Create new products
   - Edit existing products
   - Delete products
4. **Manage Orders**: 
   - View all orders at `/owners/admin/orders`
   - Update order status (pending, processing, shipped, delivered, cancelled)

### Creating Admin Account (Development Only)

In development mode, you can create an admin account:
1. Visit `/owners/register`
2. Fill in the registration form
3. Login with the created credentials

**Note**: Admin registration is only available when `NODE_ENV=development`

## Database Models

### User
- Full name, email, password (hashed)
- Cart (session-based, not stored in DB)
- Orders (references to Order documents)

### Product
- Name, description, price, discount
- Image (stored as base64 data URI)
- Stock quantity
- Display colors (background, panel, text)

### Order
- User reference
- Items (product, quantity, price, discount)
- Shipping address
- Status (pending, processing, shipped, delivered, cancelled)
- Total amount and platform fee

### Owner (Admin)
- Full name, email, password (hashed)
- Products array
- GSTIN (optional)

## Important Notes

1. **Environment Variables**: Make sure to set up your `.env` file with proper secrets before running in production
2. **MongoDB Atlas**: The app uses MongoDB Atlas (cloud database). The app will run even if the connection fails, but database features won't work until connected.
3. **Image Storage**: Currently, images are stored as base64 strings in the database. For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
4. **Session Secret**: Change the session secret in production for security
5. **JWT Secret**: Change the JWT secret in production for security
6. **Environment Variables**: Ensure `MONGO_URI` and `SESSION_SECRET` are set in `.env` file

## Troubleshooting

### MongoDB Atlas Connection Error
- Verify `MONGO_URI` is set correctly in `.env` file
- Check your internet connection (MongoDB Atlas requires internet)
- Verify the connection string format is correct
- Check MongoDB Atlas dashboard to ensure your IP is whitelisted (if IP whitelisting is enabled)
- The app will still run without database connection, but database features won't work

### Session Not Working
- Check if `EXPRESS_SESSION_SECRET` is set in `.env`
- Clear browser cookies and try again

### Images Not Displaying
- Ensure product images are uploaded correctly
- Check if multer is configured properly
- Verify image paths in the database

## Development

The project uses:
- Express.js for the web framework
- Mongoose for MongoDB ODM
- EJS for templating
- Tailwind CSS for styling
- JWT for authentication
- express-session for session management

## License

ISC

## Author

Built as a full-stack e-commerce project.

