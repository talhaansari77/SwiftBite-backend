// Load environment variables from .env file first
// This must be at the very top before any other imports
import dotenv from "dotenv"
dotenv.config()

import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import connectDB from "./config/database"
import authRoutes from "./routes/authRoutes"
import restaurantRoutes from "./routes/restaurantRoutes"
import orderRoutes from "./routes/orderRoutes"
import uploadRoutes from "./routes/uploadRoutes"

// Create Express app
const app = express()

// Wrap Express app in a raw HTTP server
// This is required because Socket.io needs direct access to the HTTP server
// Regular express.listen() doesn't expose the raw server Socket.io needs
const httpServer = createServer(app)

// Initialize Socket.io on top of the HTTP server
// cors: "*" allows connections from any origin (our React Native app)
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
})

// Use PORT from environment variables or fallback to 5000 for local development
const PORT = process.env.PORT || 5000

// Connect to MongoDB Atlas
connectDB()

// helmet adds security headers to every response
// protects against common attacks like clickjacking and XSS
app.use(helmet())

// cors allows our React Native app to make requests to this server
// without this the browser/app would block all requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// morgan logs every incoming request to the terminal
// example: POST /api/auth/login 200 45ms
app.use(morgan("dev"))

// Parse incoming JSON request bodies
// without this req.body would be undefined
app.use(express.json())

// Parse URL-encoded form data (like HTML form submissions)
app.use(express.urlencoded({ extended: true }))

// Socket.io connection handler
// Fires every time a new client connects to the server
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`)

  // When a customer opens their order detail screen
  // they join a "room" named after their order ID
  // this means we can send updates to ONLY that customer
  // instead of broadcasting to everyone
  socket.on("join_order", (orderId: string) => {
    socket.join(orderId)
    console.log(`📦 Client joined order room: ${orderId}`)
  })

  // Fires when a client disconnects (closes app, loses connection etc.)
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

// Health check route
// Used to verify the server is running
app.get("/", (req, res) => {
  res.json({
    message: "SwiftBite API is running! 🍔",
    status: "OK",
  })
})

// Mount all API routes
// each route handles a specific part of the app
app.use("/api/auth", authRoutes)           // login, register, profile
app.use("/api/restaurants", restaurantRoutes) // restaurant & menu management
app.use("/api/orders", orderRoutes)        // order placement & tracking
app.use("/api/upload", uploadRoutes)       // image uploads to Cloudinary

// Catch-all route for any undefined routes
// returns 404 if no route matches the request
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Start the HTTP server (not app.listen!)
// We use httpServer.listen instead of app.listen
// because Socket.io is attached to httpServer not app
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app