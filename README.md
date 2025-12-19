# 👜 Scatch — Full-Stack E-Commerce Web App

A production-ready full-stack e-commerce application for shopping bags, built with secure authentication, dynamic product rendering, and database-persisted cart management.

## 📌 Overview

Scatch is a full-stack e-commerce web application that replicates real-world online shopping workflows. It focuses on backend robustness, JWT-based authentication, and server-side rendering using EJS.

Users can register, log in, browse products, view product details, add items to a cart, and maintain cart state across sessions.

## 🚀 Features

- **🔐 Authentication** – Secure register/login with JWT tokens
- **🛍️ Product Listing** – Dynamic shop & product detail pages with category filtering
- **🛒 Cart System** – Database-persisted cart with add/remove functionality
- **🧭 Protected Routes** – Auth-aware navigation & redirects
- **🌐 SSR UI** – Server-side rendering with EJS and Tailwind CSS
- **📦 Order Management** – Order history and tracking
- **👤 Admin Dashboard** – Product and order management

## 🛠️ Tech Stack

- **Frontend**: EJS, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **Auth**: JWT with bcrypt
- **Session**: Express Sessions (for flash messages)

## ▶️ Run Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

```bash
git clone https://github.com/yourusername/Scatch.git
cd Scatch
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_super_secret_session_key
JWT_KEY=your_jwt_secret_key
```

### Start the Application

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
Scatch/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Custom middleware (auth, loadUser)
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── utils/           # Utility functions (seeding, tokens)
├── views/           # EJS templates
├── public/          # Static assets
├── images/          # Product images (gitignored)
└── app.js           # Main application entry point
```

## 🧠 Highlights

- **MVC Architecture** – Clean route–controller separation
- **JWT Authentication** – Secure token-based auth
- **Database-Persisted Cart** – Cart survives sessions and logouts
- **Graceful Error Handling** – Empty states & error pages
- **Production Ready** – Environment-based configuration
- **Resume-Ready** – Full-stack project demonstrating best practices

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Environment variable configuration
- Protected routes with middleware
- Session security (httpOnly cookies)

## 📝 API Routes

### Public Routes
- `GET /` - Home (redirects to shop or login)
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /shop` - Product listing
- `GET /new-arrivals` - Latest products
- `GET /product/:id` - Product details

### Protected Routes (Require Authentication)
- `GET /cart` - Shopping cart
- `POST /cart/add/:id` - Add to cart
- `POST /cart/remove/:id` - Remove from cart
- `GET /orders` - Order history
- `GET /logout` - Logout

## 👩‍💻 Author

**Dipanshi Yadav**
- GitHub: [@dipanshi8](https://github.com/dipanshi8)
- LinkedIn: [Dipanshi Yadav](https://www.linkedin.com/in/dipanshi-yadav-00081b)

## 📄 License

ISC
