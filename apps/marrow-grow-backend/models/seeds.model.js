// models/Seed.js
import mongoose from "mongoose";

const SeedSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  waterDrainRate: { type: Number, required: true },
  nutrientDrainRate: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String }, // Optional: Cloudinary image link
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Player" }, // for user-added strains
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Seed", SeedSchema);
