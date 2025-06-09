import express from "express";
import { createSeed, getSeeds, deleteSeed, updateSeed } from "../controllers/seeds.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const seedRouter = express.Router();

seedRouter.post("/", requireAuth, createSeed);
seedRouter.get("/", getSeeds);
seedRouter.delete("/:id", requireAuth, requireAdmin, deleteSeed);
seedRouter.patch("/:id", requireAuth, requireAdmin, updateSeed);

export default seedRouter;