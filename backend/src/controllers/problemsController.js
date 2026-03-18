import Problem from "../models/Problem.js";
import User from "../models/User.js";
import { evaluateCodeWithAI } from "../config/llm.js";

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";

async function runCode(code, language = "python") {
  const lang = language.toLowerCase();

  if (lang === "python") {
    return runLocalPython(code);
  }

  if (lang === "java") {
    return runLocalJava(code);
  }

  return {
    stdout: "",
    stderr: `Unsupported language: ${language}. Supported: python, java`,
    status: "Error",
  };
}

function runLocalPython(code) {
  return new Promise((resolve) => {
    const child = spawn("python", ["-c", code]);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => (stdout += data.toString()));
    child.stderr.on("data", (data) => (stderr += data.toString()));

    child.on("close", (code) => {
      resolve({ stdout, stderr, status: code === 0 ? "Success" : "Error" });
    });

    child.on("error", (err) => {
      resolve({ stdout: "", stderr: err.message, status: "Error" });
    });
  });
}

function runLocalJava(code) {
  return new Promise((resolve) => {
    const tempDir = tmpdir();

    // If the user declares a public class, Java requires the file name to match it.
    const match = code.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    const className = match ? match[1] : "Main";
    const javaFile = path.join(tempDir, `${className}.java`);

    fs.writeFileSync(javaFile, code);

    const compile = spawn("javac", [javaFile]);
    let compileStderr = "";

    compile.stderr.on("data", (data) => (compileStderr += data.toString()));

    compile.on("close", (code) => {
      if (code !== 0) {
        try {
          fs.unlinkSync(javaFile);
        } catch {}
        resolve({ stdout: "", stderr: compileStderr, status: "Compilation Error" });
        return;
      }

      const run = spawn("java", ["-cp", tempDir, className]);
      let stdout = "";
      let stderr = "";

      run.stdout.on("data", (data) => (stdout += data.toString()));
      run.stderr.on("data", (data) => (stderr += data.toString()));

      run.on("close", (runCode) => {
        try {
          fs.unlinkSync(javaFile);
        } catch {}
        try {
          fs.unlinkSync(path.join(tempDir, `${className}.class`));
        } catch {}
        resolve({ stdout, stderr, status: runCode === 0 ? "Success" : "Runtime Error" });
      });

      run.on("error", (err) => {
        try {
          fs.unlinkSync(javaFile);
        } catch {}
        resolve({ stdout: "", stderr: err.message, status: "Error" });
      });
    });

    compile.on("error", (err) => {
      try {
        fs.unlinkSync(javaFile);
      } catch {}
      resolve({ stdout: "", stderr: err.message, status: "Error" });
    });
  });
}

export async function listProblems(req, res, next) {
  try {
    const problems = await Problem.find({ user: req.user._id }).sort({ solvedAt: -1 }).lean();
    res.json({ problems });
  } catch (err) {
    next(err);
  }
}

export async function addProblem(req, res, next) {
  try {
    const {
      name,
      description,
      difficulty,
      topics,
      timeTakenMinutes,
      attempts,
      language = "Python",
      code,
    } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ message: "Code is required for submission." });
    }

    let errors = null;
    let feedback = null;
    let score = null;
    let stdout = "";
    let stderr = "";

    // Execute the code
    try {
      const result = await runCode(code, language);
      stdout = result.stdout;
      stderr = result.stderr;
      if (result.status !== 'Success') {
        throw new Error(stderr || 'Execution failed');
      }

      // Compute user performance history so feedback can reference their average score.
      const pastProblems = await Problem.find({ user: req.user._id });
      const userAvgScore =
        pastProblems.length > 0
          ? pastProblems.reduce((sum, p) => sum + (p.score || 0), 0) / pastProblems.length
          : null;

      const aiResult = await evaluateCodeWithAI(
        code,
        description || name || "",
        { stdout, stderr, status: result.status, userAvgScore }
      );
      feedback = aiResult.feedback;
      score = aiResult.score;
    } catch (err) {
      errors = err.message;
      score = 0;
      feedback = `Execution error: ${err.message}`;
      stderr = stderr || err.message;
    }

    const isFail = typeof score === "number" ? score <= 60 : true;
    const normalizedFeedback = feedback || "";
    const finalFeedback = isFail
      ? normalizedFeedback.includes("Weakness")
        ? normalizedFeedback
        : `Weakness: Your solution may have bugs or not handle edge cases.\n\n${normalizedFeedback}`
      : normalizedFeedback;

    const problem = await Problem.create({
      user: req.user._id,
      name,
      description,
      difficulty,
      topics,
      timeTakenMinutes,
      attempts,
      language,
      code,
      stdout,
      stderr,
      score,
      feedback: finalFeedback,
      executionErrors: errors,
      correct: !isFail,
      solvedAt: new Date(),
    });

    // Update user stats based on AI score
    const pointsDelta = typeof score === "number" ? score : 0;
    const solvedDelta = typeof score === "number" && score > 60 ? 1 : 0;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: pointsDelta, solvedCount: solvedDelta },
    });

    res.status(201).json({ problem });
  } catch (err) {
    next(err);
  }
}
