import Player from "../models/user.model.js";
// GET leaderboard (sorted by totalYield or avgPotency)

// Helper for time window
const getDateAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// GET /api/leaderboard/weekly
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const oneWeekAgo = getDateAgo(7);

    const leaderboard = await Player.aggregate([
      { $unwind: "$growLogs" },
      { $match: { "growLogs.date": { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          weeklyYield: { $sum: "$growLogs.amount" },
          weeklyPotencies: { $push: "$growLogs.potency" },
          weeklyGrowCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          weeklyPotency: { $avg: "$weeklyPotencies" },
        },
      },
      { $sort: { weeklyYield: -1 } },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get weekly leaderboard" });
  }
};

// GET /api/leaderboard/monthly
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const oneMonthAgo = getDateAgo(30);

    const leaderboard = await Player.aggregate([
      { $unwind: "$growLogs" },
      { $match: { "growLogs.date": { $gte: oneMonthAgo } } },
      {
        $group: {
          _id: "$_id",
          username: { $first: "$username" },
          monthlyYield: { $sum: "$growLogs.amount" },
          monthlyPotencies: { $push: "$growLogs.potency" },
          monthlyGrowCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          monthlyPotency: { $avg: "$monthlyPotencies" },
        },
      },
      { $sort: { monthlyYield: -1 } },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get monthly leaderboard" });
  }
};

// GET /api/leaderboard/alltime
export const getAllTimeLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Player.aggregate([
      {
        $addFields: {
          avgPotency: {
            $cond: [
              { $gt: [{ $size: "$potencyHistory" }, 0] },
              { $avg: "$potencyHistory" },
              0,
            ],
          },
        },
      },
      {
        $project: {
          username: 1,
          totalYield: 1,
          avgPotency: 1,
          growCount: 1,
        },
      },
      { $sort: { totalYield: -1 } },
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all-time leaderboard" });
  }
};

export const getPlayerStatsAndRank = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Calculate avg potency
    const avgPotency =
      player.potencyHistory.length > 0
        ? player.potencyHistory.reduce((a, b) => a + b, 0) /
          player.potencyHistory.length
        : 0;

    // Determine rank by comparing totalYield with all players
    const allPlayers = await Player.find().select("totalYield");
    const sorted = allPlayers.sort((a, b) => b.totalYield - a.totalYield);
    const rank =
      sorted.findIndex((p) => String(p._id) === String(player._id)) + 1;

    res.json({
      username: player.username,
      totalYield: player.totalYield,
      growCount: player.growCount,
      avgPotency: Math.round(avgPotency * 10) / 10, // round to 1 decimal
      rank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch player stats" });
  }
};

// POST clear leaderboard
export const clearLeaderboard = async (req, res) => {
  await Player.updateMany({}, { $set: { totalYield: 0, potencyHistory: [] } });
  res.json({ message: "Leaderboard cleared" });
};

export const completeGrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { harvestedAmount, potencyScore } = req.body;

    const player = await Player.findById(id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    // Update core stats
    player.growCount += 1;
    player.totalYield += harvestedAmount;
    player.potencyHistory.push(potencyScore);

    // Log the grow
    player.growLogs.push({
      amount: harvestedAmount,
      potency: potencyScore,
      date: new Date(),
    });

    // Optional: track personal bests
    if (!player.highestPotency || potencyScore > player.highestPotency) {
      player.highestPotency = potencyScore;
    }

    if (!player.biggestYield || harvestedAmount > player.biggestYield) {
      player.biggestYield = harvestedAmount;
    }

    await player.save();

    res.json({
      message: "Grow recorded successfully",
      growCount: player.growCount,
      totalYield: player.totalYield,
      avgPotency:
        player.potencyHistory.reduce((a, b) => a + b, 0) /
        player.potencyHistory.length,
      highestPotency: player.highestPotency,
      biggestYield: player.biggestYield,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete grow" });
  }
};
export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await Player.findById(id).select("-password -refreshToken");
    if (!player) return res.status(404).json({ message: "Player not found" });

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch player" });
  }
};
