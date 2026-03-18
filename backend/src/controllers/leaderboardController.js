import User from "../models/User.js";

export async function leaderboard(req, res, next) {
  try {
    const sortBy = req.query.sortBy === "solved" ? "solvedCount" : "points";
    const users = await User.find({})
      .sort({ [sortBy]: -1 })
      .limit(20)
      .lean();

    const leaderboard = users.map((user) => ({
      id: user._id,
      name: user.name,
      points: user.points || 0,
      solved: user.solvedCount || 0,
      badges: user.badges || [],
    }));

    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
}
