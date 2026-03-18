import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    badges: {
      type: [
        {
          key: { type: String },
          name: { type: String },
        },
      ],
      default: [],
    },
    ai: {
      lastAnalysis: { type: String, default: "" },
      lastRecommendation: { type: String, default: "" },
      lastPerformanceAnalysis: { type: String, default: "" },
      lastHint: {
        text: { type: String, default: "" },
        problemName: { type: String, default: "" },
        topic: { type: String, default: "" },
        difficulty: { type: String, default: "" },
        stage: { type: Number, default: 1 },
      },
    },
    mcqInterviews: {
      lastInterviewDate: { type: Date, default: null },
      totalInterviews: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
