import { Request, Response } from "express"
import cloudinary from "../config/cloudinary"

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image provided" })
      return
    }

    // Convert buffer to base64
    const fileStr = req.file.buffer.toString("base64")
    const fileType = req.file.mimetype

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${fileType};base64,${fileStr}`,
      {
        folder: "swiftbite",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto" },
        ],
      }
    )

    res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Upload failed", error: error.message })
  }
}