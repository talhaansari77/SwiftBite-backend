import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import connectDB from "./config/database"
import authRoutes from "./routes/authRoutes"
import restaurantRoutes from "./routes/restaurantRoutes"
import orderRoutes from "./routes/orderRoutes"

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(helmet())
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})
app.get("/", (req, res) => {
  res.json({
    message: "SwiftBite API is running! 🍔",
    status: "OK",
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/orders", orderRoutes)

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app