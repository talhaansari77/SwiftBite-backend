import { Request, Response } from "express"
import Restaurant from "../models/Restaurant"
import MenuItem from "../models/MenuItem"

// @desc    Get all restaurants
// @route   GET /api/restaurants
export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cuisine, search } = req.query

    let query: any = {}

    if (cuisine) {
      query.cuisine = cuisine
    }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const restaurants = await Restaurant.find(query).sort({ createdAt: -1 })
    res.status(200).json({ restaurants })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
export const getRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" })
      return
    }
    res.status(200).json({ restaurant })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Create restaurant
// @route   POST /api/restaurants
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      image,
      cuisine,
      deliveryTime,
      deliveryFee,
      minimumOrder,
      address,
      phone,
    } = req.body

    const restaurant = await Restaurant.create({
      name,
      description,
      image,
      cuisine,
      deliveryTime,
      deliveryFee,
      minimumOrder,
      address,
      phone,
      ownerId: (req as any).userId,
    })

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get menu items for a restaurant
// @route   GET /api/restaurants/:id/menu
export const getMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const menuItems = await MenuItem.find({
      restaurantId: String(req.params.id),
      isAvailable: true,
    })
    res.status(200).json({ menuItems })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Add menu item
// @route   POST /api/restaurants/:id/menu
export const addMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, image, category } = req.body

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      image,
      category,
      restaurantId: String(req.params.id),
    })

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

export const addMenuItemsBulk = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body

    const restaurantId = String(req.params.id)

    const menuItems = items.map((item: any) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || "",
      restaurantId,
      isAvailable: true,
    }))

    const created = await MenuItem.insertMany(menuItems)

    res.status(201).json({
      message: `${created.length} menu items added successfully`,
      menuItems: created,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
export const updateRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    )

    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" })
      return
    }

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}