import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false }, // ✅ NEW
  password: { type: String, required: true, minlength: 6 },
  refreshToken: { type: String },
  seedLives: { type: Number, default: 3 }, // ✅ current available seeds
  lastSpinDate: { type: Date }, // ✅ when they last spun the daily wheel
  lockoutTimestamp: { type: Date },
  totalYield: { type: Number, default: 0 },
  growCount: { type: Number, default: 0 },
  potencyHistory: [Number],
  highestPotency: { type: Number, default: 0 },
  biggestYield: { type: Number, default: 0 },
  growLogs: [
    {
      yield: Number,
      date: { type: Date, default: Date.now },
      potency: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Player", PlayerSchema);
