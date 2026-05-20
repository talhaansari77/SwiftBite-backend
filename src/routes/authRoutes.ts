import { Router } from "express"
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  deleteAddress,
  toggleFavourite,
  addToWallet,
  setDefaultAddress,
} from "../controllers/authController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getMe)
router.put("/update-profile", protect, updateProfile)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

// Addresses
router.get("/addresses", protect, getAddresses)
router.post("/addresses", protect, addAddress)
router.delete("/addresses/:addressId", protect, deleteAddress)

// Favourites
router.post("/favourites/:restaurantId", protect, toggleFavourite)

// Wallet
router.post("/wallet/add", protect, addToWallet)

router.put("/addresses/:addressId/default", protect, setDefaultAddress)

export default router