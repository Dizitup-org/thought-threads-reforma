import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: "No image provided"
      });
    }

    const upload = await cloudinary.uploader.upload(image, {
      folder: "reforma_products"
    });

    return res.status(200).json({
      url: upload.secure_url
    });

  } catch (error) {

    console.error("Upload error:", error);

    return res.status(500).json({
      error: error.message
    });

  }

}