import Seed from "../models/seeds.model.js";
import cloudinary from '../config/cloudinary.js';

const createSeed = async (req, res) => {
  try {
    const { name, description, waterDrainRate, nutrientDrainRate, image } = req.body;

    // Validate required fields
    if (!name || !description || !waterDrainRate || !nutrientDrainRate) {
      return res.status(400).json({ 
        message: "All fields (name, description, waterDrainRate, nutrientDrainRate) are required." 
      });
    }

    // Check if image was provided
    if (!image) {
      return res.status(400).json({ message: "Image is required." });
    }

    // Check if seed already exists
    const existing = await Seed.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Seed name already exists." });
    }

    // Upload single image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(image, {
      folder: "marrow-grow/seeds",
      transformation: [
        { width: 500, height: 500, crop: 'limit' }
      ]
    });

    let imageUrl = '';
    if (cloudinaryResponse?.secure_url) {
      imageUrl = cloudinaryResponse.secure_url;
    } else {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary." });
    }

    const seed = new Seed({
      name,
      description,
      waterDrainRate: parseFloat(waterDrainRate),
      nutrientDrainRate: parseFloat(nutrientDrainRate),
      imageUrl,
      createdBy: req.user._id,
    });

    await seed.save();
    res.status(201).json({
      message: "Seed created successfully",
      seed
    });
  } catch (err) {
    console.error('Error creating seed:', err);
    res.status(500).json({ message: "Error creating seed.", error: err.message });
  }
};

// GET /api/seeds
const getSeeds = async (req, res) => {
  try {
    const seeds = await Seed.find();
    res.json({ seeds });
  } catch (err) {
    console.error('Error fetching seeds:', err);
    res.status(500).json({ message: "Error fetching seeds." });
  }
};

// DELETE /api/seeds/:id
const deleteSeed = async (req, res) => {
  try {
    const { id } = req.params;

    const seed = await Seed.findById(id);
    if (!seed) {
      return res.status(404).json({ message: "Seed not found" });
    }

    // Delete image from Cloudinary if it exists
    if (seed.imageUrl) {
      try {
        // Extract public_id from the Cloudinary URL
        const public_id = seed.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`marrow-grow/seeds/${public_id}`);
        console.log(`Deleted image with public_id: marrow-grow/seeds/${public_id}`);
      } catch (error) {
        console.log("Error deleting image from Cloudinary:", error.message);
      }
    }

    await Seed.findByIdAndDelete(id);
    res.json({ message: "Seed deleted successfully" });
  } catch (err) {
    console.error('Error deleting seed:', err);
    res.status(500).json({ message: "Error deleting seed." });
  }
};

// UPDATE /api/seeds/:id
const updateSeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, waterDrainRate, nutrientDrainRate, image } = req.body;

    const updates = {};

    // Add fields to updates object if they exist
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (waterDrainRate) updates.waterDrainRate = parseFloat(waterDrainRate);
    if (nutrientDrainRate) updates.nutrientDrainRate = parseFloat(nutrientDrainRate);

    // If there's a new image, upload it to Cloudinary
    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "marrow-grow/seeds",
        transformation: [
          { width: 500, height: 500, crop: 'limit' }
        ]
      });

      if (cloudinaryResponse?.secure_url) {
        updates.imageUrl = cloudinaryResponse.secure_url;
      }
    }

    const seed = await Seed.findByIdAndUpdate(id, updates, { 
      new: true,  // Return the updated document
      runValidators: true  // Run model validators
    });
    
    if (!seed) {
      return res.status(404).json({ message: "Seed not found" });
    }

    res.json({
      message: "Seed updated successfully",
      seed
    });
  } catch (err) {
    console.error('Error updating seed:', err);
    res.status(500).json({ message: "Error updating seed." });
  }
};

export { createSeed, getSeeds, deleteSeed, updateSeed };