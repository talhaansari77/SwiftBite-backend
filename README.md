# SwiftBite Backend 🍔

A full-stack food delivery app backend built with Node.js, Express, MongoDB and TypeScript.

## 🚀 Live API

https://swiftbite-backend-1ioe.onrender.com

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Web server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time updates |
| Cloudinary | Image storage |
| Resend | Email service |
| Render.com | Hosting |

## 📁 Project Structure

SwiftBite-backend/
└── src/
├── config/          # Database, Cloudinary, Email
├── controllers/     # Business logic
├── middleware/      # Auth, Upload middleware
├── models/          # MongoDB models
└── routes/          # API routes

## 🔌 API Routes

### Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/update-profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

### Restaurants
GET    /api/restaurants
POST   /api/restaurants
GET    /api/restaurants/:id
PUT    /api/restaurants/:id
GET    /api/restaurants/:id/menu
POST   /api/restaurants/:id/menu
POST   /api/restaurants/:id/menu/bulk
PUT    /api/restaurants/:id/menu/:itemId
DELETE /api/restaurants/:id/menu/:itemId

### Orders
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
GET    /api/orders/restaurant/:restaurantId
GET    /api/orders/restaurant/:restaurantId/analytics

### Reviews
POST   /api/reviews
GET    /api/reviews/restaurant/:restaurantId

### Promo Codes
POST   /api/promo/validate
POST   /api/promo/apply
POST   /api/promo/create
GET    /api/promo

### Upload
POST   /api/upload


## 🔧 Setup & Installation

1. Clone the repo:
```bash
git clone https://github.com/talhaansari77/SwiftBite-backend.git
cd SwiftBite-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

4. Start the server:
```bash
npm run dev
```

## 👨‍💻 Author

**Talha Ansari**
- GitHub: [@talhaansari77](https://github.com/talhaansari77)

## 📄 License

MIT License