import express from "express";
import {
  clearLeaderboard,
  getWeeklyLeaderboard,
  getAllTimeLeaderboard,
  getMonthlyLeaderboard,
  getPlayerStatsAndRank,
  completeGrow,
} from "../controllers/players.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const PlayerRouter = express.Router();

PlayerRouter.get("/weekly", getWeeklyLeaderboard);
PlayerRouter.get("/alltime", getAllTimeLeaderboard);
PlayerRouter.get("/monthly", getMonthlyLeaderboard);
PlayerRouter.post("/clear", requireAdmin, clearLeaderboard);
PlayerRouter.get("/:id/stats", requireAuth, getPlayerStatsAndRank);
PlayerRouter.patch("/players/:id/complete-grow", requireAdmin, completeGrow);

export default PlayerRouter;
