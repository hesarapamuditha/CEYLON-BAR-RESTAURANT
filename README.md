# 🍛 Ceylon Bar & Restaurant

A premium, modern full-stack web application for **Ceylon Bar & Restaurant**, designed to provide customers with a seamless online ordering and table reservation experience, paired with a robust administrative dashboard for restaurant management.

Built using the **MERN Stack** (MongoDB, Express, React, Node.js) with a highly responsive, glassmorphic UI, smooth micro-interactions, and role-based access control.

---

## 🌟 Key Features

### 🧑‍🍳 Customer Experience
- **Dynamic Digital Menu**: Browse categorized food and beverage items with high-quality images and real-time category filtering.
- **Interactive Cart System**: Add, update, and remove items via a slide-out cart drawer with a persistent floating action button (FAB).
- **Online Table Reservation**: Fast and responsive reservation system to book tables in advance.
- **Order Flow**: Build a custom cart and place order tickets seamlessly.
- **User Authentication**: Secure signup and login with persistent session states.
- **Reviews & Feedback**: Submit customer reviews and send direct queries to the restaurant.

### 🛡️ Admin Management Dashboard
- **Menu Catalog Control**: Add, modify, or delete menu items and categories with support for image uploads.
- **Reservation Tracker**: View, monitor, and manage customer table bookings.
- **Order Queue**: Track real-time customer orders and update their fulfillment status.
- **Inquiry Inbox**: View customer queries submitted through the contact form.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript/JavaScript, React Router DOM, Axios, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT Authentication, Multer (image upload handling) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Styling** | Modern Vanilla CSS, Glassmorphism, HSL custom color palettes |
| **Tooling** | Concurrently, Nodemon |

---

## 📂 Project Structure

```bash
Ceylon Bar Restaurant/
├── client/                 # Frontend React Application (Vite)
│   ├── public/             # Static public assets
│   └── src/
│       ├── components/     # Reusable UI components (Navbar, Cart, etc.)
│       ├── context/        # Global states (AuthContext, CartContext)
│       ├── pages/          # Page views (Home, Menu, Admin, Login, etc.)
│       ├── services/       # Axios API integrations
│       └── index.css       # Main stylesheet and design system tokens
│
├── server/                 # Backend RESTful API (Express)
│   └── src/
│       ├── config/         # DB Connection configuration
│       ├── controllers/    # Request handlers & logic
│       ├── middleware/     # Auth, Admin validation & Error handlers
│       ├── models/         # Mongoose DB Schemas (User, Order, Reservation, etc.)
│       ├── routes/         # Express API endpoints
│       ├── seed.js         # Database initial seeder script
│       └── server.js       # Express server entry point
│
└── package.json            # Root configuration for concurrent run scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v16.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hesarapamuditha/CEYLON-BAR-RESTAURANT.git
   cd CEYLON-BAR-RESTAURANT
   ```

2. **Install all dependencies** (installs both frontend & backend dependencies in one command):
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**

   - **Backend Configuration:**
     Create a `.env` file in the `/server` directory matching `/server/.env.example`:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_uri
     JWT_SECRET=your_super_secret_jwt_key
     ```

   - **Frontend Configuration:**
     Create a `.env` file in the `/client` directory:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```

4. **Seed Database (Optional):**
   Populate the database with initial categories, menu items, and admin users:
   ```bash
   npm run seed
   ```

5. **Start Application in Development Mode:**
   Runs both the server and Vite client concurrently:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:5173`
   - Backend API runs on: `http://localhost:5000`

---

## 🔒 Security
- Passwords are encrypted using **bcryptjs** before storage.
- Admin routes and operations require verified **JSON Web Tokens (JWT)**.
- Sensitive environment variables are kept strictly out of Git versioning.
