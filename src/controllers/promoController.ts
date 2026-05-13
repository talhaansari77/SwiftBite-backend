import { Request, Response } from "express"
import PromoCode from "../models/PromoCode"

// @desc    Validate a promo code
// @route   POST /api/promo/validate
export const validatePromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = req.body

    if (!code) {
      res.status(400).json({ message: "Promo code is required" })
      return
    }

    // Find promo code
    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    })

    if (!promo) {
      res.status(404).json({ message: "Invalid promo code" })
      return
    }

    // Check expiry
    if (new Date() > promo.expiryDate) {
      res.status(400).json({ message: "Promo code has expired" })
      return
    }

    // Check max uses
    if (promo.currentUses >= promo.maxUses) {
      res.status(400).json({ message: "Promo code has reached its limit" })
      return
    }

    // Check minimum order
    if (orderTotal < promo.minimumOrder) {
      res.status(400).json({
        message: `Minimum order of $${promo.minimumOrder} required for this code`,
      })
      return
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.discountType === "percentage") {
      discountAmount = (orderTotal * promo.discountValue) / 100
    } else {
      discountAmount = promo.discountValue
    }

    // Make sure discount doesn't exceed order total
    discountAmount = Math.min(discountAmount, orderTotal)

    res.status(200).json({
      message: "Promo code applied successfully!",
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Apply promo code (increment uses)
// @route   POST /api/promo/apply
export const applyPromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body

    await PromoCode.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { currentUses: 1 } }
    )

    res.status(200).json({ message: "Promo code applied" })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Create a promo code (admin)
// @route   POST /api/promo/create
export const createPromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrder,
      maxUses,
      expiryDate,
    } = req.body

    const promo = await PromoCode.create({
      code,
      discountType,
      discountValue,
      minimumOrder,
      maxUses,
      expiryDate,
    })

    res.status(201).json({
      message: "Promo code created successfully",
      promo,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get all promo codes (admin)
// @route   GET /api/promo
export const getPromoCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 })
    res.status(200).json({ promos })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}