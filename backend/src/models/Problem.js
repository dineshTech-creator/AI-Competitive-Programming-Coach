import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    difficulty: { type: String, required: true },
    topics: { type: [String], default: [] },
    timeTakenMinutes: { type: Number, default: 0 },
    attempts: { type: Number, default: 1 },
    correct: { type: Boolean, default: true },
    solvedAt: { type: Date, default: Date.now },
    language: { type: String, default: "javascript" },
    description: { type: String },
    code: { type: String }, // submitted code
    stdout: { type: String },
    stderr: { type: String },
    score: { type: Number, min: 0, max: 100 }, // AI score
    feedback: { type: String }, // AI feedback
    executionErrors: { type: String }, // compilation/runtime errors
  },
  { timestamps: true }
);

const Problem = mongoose.models.Problem || mongoose.model("Problem", problemSchema);
export default Problem;
