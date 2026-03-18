import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;

const isGoogleApiKey = Boolean(apiKey && apiKey.startsWith("AIza"));

function getHeaders() {
  if (!apiKey) {
    return {};
  }

  // Gemini prefers OAuth Bearer tokens, but Google API keys can also be used via query param.
  if (provider === "gemini" && !isGoogleApiKey) {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  // Deepseek and OpenAI use Bearer tokens.
  if (provider === "deepseek" || provider === "openai") {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
  };
}

async function callGemini(prompt) {
  console.log("callGemini invoked (provider=", provider, ")");
  if (!apiKey) {
    return "Error: LLM API key not configured.";
  }

  // Use a working Gemini model from the available list (e.g., gemini-2.5-flash).
  // The correct endpoint uses generateContent rather than generate.
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Try both generateContent and generate endpoints with common payload shapes.
  const endpoints = [
    { suffix: ":generateContent", payloads: [
      { prompt: { text: prompt }, temperature: 0.7, maxOutputTokens: 512 },
      { instances: [{ content: prompt }] },
      { input: prompt },
    ] },
    { suffix: ":generate", payloads: [
      { instances: [{ content: prompt }] },
      { input: prompt },
    ] },
  ];

  for (const endpoint of endpoints) {
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}${endpoint.suffix}?key=${apiKey}`;
    for (const payload of endpoint.payloads) {
      try {
        const response = await axios.post(url, payload, {
          headers: getHeaders(),
          timeout: 15000,
        });

        const data = response.data;
        const outputText =
          data?.candidates?.[0]?.content?.find((c) => c.type === "output_text")?.text ||
          data?.candidates?.[0]?.content?.[0]?.text ||
          data?.output?.[0]?.content?.find((c) => c.type === "output_text")?.text ||
          data?.output?.[0]?.content?.[0]?.text ||
          data?.output ||
          data?.text ||
          (typeof data === "string" ? data : undefined);

        if (outputText) {
          return outputText;
        }

        console.warn("Gemini response did not contain output (trying next payload):", JSON.stringify(data, null, 2));
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.warn(`Gemini request attempt failed (endpoint=${endpoint.suffix}, status=${status}):`, data || err.message);
        // Continue to next payload attempt
      }
    }
  }

  console.error("Gemini request failed: no payload form produced output.");
  return "Error: unable to get a response from the LLM.";
}


async function callDeepseek(prompt) {
  if (!apiKey) {
    return "Error: Deepseek API key not configured.";
  }

  const url = process.env.DEEPSEEK_API_URL || "https://api.deepseek.ai/v1/generate";

  const payload = {
    prompt,
    max_tokens: 512,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(url, payload, {
      headers: getHeaders(),
      timeout: 15000,
    });

    const data = response.data;
    const output = data?.output || data?.text || data?.result || data?.response || "";
    if (typeof output === "object") {
      // Some responses embed text in a nested field
      return output.text || output.content || JSON.stringify(output);
    }

    return output || "Error: unable to get a response from the LLM.";
  } catch (err) {
    console.error(`Deepseek request failed:`, err?.response?.status, err?.response?.data || err.message);
    return "Error: unable to get a response from the LLM.";
  }
}

async function callOpenAI(prompt) {
  if (!apiKey) {
    return `OpenAI API key not configured. Prompt: ${prompt}`;
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const response = await axios.post(
    url,
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    },
    { headers: getHeaders() }
  );

  return response.data?.choices?.[0]?.message?.content || "(no response)";
}

export async function runPrompt(prompt, overrideProvider) {
  try {
    const useProvider = (overrideProvider || provider).toLowerCase();

    if (useProvider === "openai") {
      return await callOpenAI(prompt);
    }

    if (useProvider === "deepseek") {
      return await callDeepseek(prompt);
    }

    return await callGemini(prompt);
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const message = err?.message || "Unknown error";
    console.error("LLM request failed:", status, data || message);
    const errText = data?.error?.message || data?.message || message;
    return `Error: unable to get a response from the LLM. ${errText}`;
  }
}

function generateFallbackAnalysis() {
  return `Based on your recent problem-solving activity, here's your performance snapshot:
  
STRENGTHS: You've shown solid fundamentals in Arrays and basic data structures. Your consistent practice shows dedication.

WEAKNESSES: Consider focusing more on Graph algorithms and Dynamic Programming, which are common in interviews.

NEXT STEPS: Dedicate 30 minutes daily to Graph problems to improve your algorithmic skills.`;
}

function generateFallbackRecommendation() {
  return `3-DAY PRACTICE PLAN

Day 1: Arrays & Strings
- Solve 2 medium-level array problems
- Review sliding window technique
- Time: 60 minutes

Day 2: Graphs & Trees
- Solve 1 graph traversal problem
- Practice BFS/DFS patterns
- Time: 90 minutes

Day 3: Dynamic Programming
- Solve 1 DP problem
- Review memoization vs tabulation
- Time: 75 minutes`;
}

function generateFallbackHint(stage) {
  const hints = {
    1: "Start by understanding what the problem is asking. Write down the constraints and think about the simplest approach first.",
    2: "Consider if there's a pattern or data structure that could help. What's the time/space tradeoff you're making?",
    3: "Try working through a concrete example with your approach. Does it handle edge cases like empty input, single element, or duplicates?",
  };
  return hints[stage] || hints[1];
}

function generateFallbackEvaluation() {
  return `Your approach demonstrates a solid understanding of the problem. You correctly identified the need to use a hash map for O(n) time complexity.

STRENGTHS:
- Clean variable naming
- Proper handling of edge case (duplicate elements)

SUGGESTIONS:
- Consider adding comments for complex logic
- Review error handling for invalid inputs`;
}

function generateFallbackPerformanceAnalysis() {
  return `STRENGTHS:
- Consistent practice with multiple problems attempted
- Building foundational knowledge in basic data structures
- Showing improvement in problem-solving approach

WEAKNESSES:
- Need more focus on advanced algorithms and data structures
- Limited practice with graph and dynamic programming problems
- Could improve time management during problem solving

DAILY PLAN:
- 30 minutes: Review fundamental data structures (Arrays, Linked Lists, Stacks, Queues)
- 30 minutes: Solve 2-3 LeetCode easy/medium problems focusing on weak topics
- 30 minutes: Study one algorithm pattern (e.g., Two Pointers, Sliding Window)
- 30 minutes: Practice explaining solutions out loud for better understanding`;
}

function generateFallbackMCQQuestions(count = 20) {
  const questions = [
    {
      question: "What is the time complexity of binary search?",
      options: ["A) O(n)", "B) O(log n)", "C) O(n log n)", "D) O(n²)"],
      correctAnswer: "B",
      explanation: "Binary search divides the search space in half each time, resulting in O(log n) time complexity.",
      topic: "Searching",
      difficulty: "easy"
    },
    {
      question: "Which data structure uses LIFO (Last In, First Out) principle?",
      options: ["A) Queue", "B) Stack", "C) Array", "D) Linked List"],
      correctAnswer: "B",
      explanation: "Stack follows LIFO principle where the last element added is the first one to be removed.",
      topic: "Data Structures",
      difficulty: "easy"
    },
    {
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["A) O(n)", "B) O(n log n)", "C) O(n²)", "D) O(log n)"],
      correctAnswer: "C",
      explanation: "In the worst case, QuickSort can degrade to O(n²) when the pivot selection is poor.",
      topic: "Sorting",
      difficulty: "medium"
    },
    {
      question: "Which algorithm is used to find the shortest path in a graph with non-negative weights?",
      options: ["A) Bellman-Ford", "B) Floyd-Warshall", "C) Dijkstra's", "D) Kruskal's"],
      correctAnswer: "C",
      explanation: "Dijkstra's algorithm finds the shortest path from a source node to all other nodes in a graph with non-negative edge weights.",
      topic: "Graphs",
      difficulty: "medium"
    },
    {
      question: "What does the term 'memoization' refer to in dynamic programming?",
      options: ["A) Storing results of expensive function calls", "B) Sorting data in memory", "C) Memory allocation", "D) Matrix operations"],
      correctAnswer: "A",
      explanation: "Memoization is an optimization technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again.",
      topic: "Dynamic Programming",
      difficulty: "medium"
    },
    {
      question: "Which of the following is NOT a primitive data type in most programming languages?",
      options: ["A) int", "B) char", "C) String", "D) boolean"],
      correctAnswer: "C",
      explanation: "String is typically a class/object, not a primitive data type, while int, char, and boolean are primitives.",
      topic: "Data Types",
      difficulty: "easy"
    },
    {
      question: "What is the space complexity of a recursive function that calls itself n times?",
      options: ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n²)"],
      correctAnswer: "C",
      explanation: "Each recursive call adds a layer to the call stack, resulting in O(n) space complexity for n recursive calls.",
      topic: "Recursion",
      difficulty: "medium"
    },
    {
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["A) Bubble Sort", "B) Insertion Sort", "C) Merge Sort", "D) Selection Sort"],
      correctAnswer: "C",
      explanation: "Merge Sort has O(n log n) time complexity in all cases, which is optimal for comparison-based sorting.",
      topic: "Sorting",
      difficulty: "easy"
    },
    {
      question: "What is a hash table primarily used for?",
      options: ["A) Sorting data", "B) Fast lookups", "C) Storing sorted data", "D) Matrix operations"],
      correctAnswer: "B",
      explanation: "Hash tables provide average O(1) time complexity for insertions, deletions, and lookups.",
      topic: "Hash Tables",
      difficulty: "easy"
    },
    {
      question: "Which data structure would be most efficient for implementing a priority queue?",
      options: ["A) Array", "B) Linked List", "C) Heap", "D) Stack"],
      correctAnswer: "C",
      explanation: "Heaps (specifically binary heaps) are ideal for priority queues as they allow O(log n) insertions and O(1) access to the minimum/maximum element.",
      topic: "Data Structures",
      difficulty: "medium"
    }
  ];
  
  // Return up to the requested count, cycling through available questions if needed
  const result = [];
  for (let i = 0; i < Math.min(count, questions.length * 2); i++) {
    const q = questions[i % questions.length];
    if (i >= questions.length) {
      // Create variation for repeated questions
      result.push({
        ...q,
        question: q.question + ` (Advanced)`,
        difficulty: q.difficulty === "easy" ? "medium" : "hard"
      });
    } else {
      result.push(q);
    }
  }
  return result.slice(0, count);
}

export async function generateCodeExecution(code, language) {
  const prompt = `Execute the following ${language} code and return only the output (stdout), any error messages (stderr), and the execution status (Success or Error). If there are errors, include them in stderr. Format your response as JSON: {"stdout": "...", "stderr": "...", "status": "Success" or "Error"}\n\nCode:\n${code}`;

  // First attempt with the default provider (usually Gemini)
  let response = await runPrompt(prompt);

  // If Gemini fails, try OpenAI (if configured) and then Deepseek
  if (typeof response === "string" && response.startsWith("Error: unable to get a response")) {
    if (process.env.OPENAI_API_KEY) {
      response = await runPrompt(prompt, "openai");
    }
    if (typeof response === "string" && response.startsWith("Error: unable to get a response") && process.env.DEEPSEEK_API_KEY) {
      response = await runPrompt(prompt, "deepseek");
    }
  }

  // If still failing, return a structured error result
  if (typeof response === "string" && response.startsWith("Error: unable to get a response")) {
    return {
      stdout: "",
      stderr: "LLM unavailable (check API key or provider).",
      status: "Error",
    };
  }

  // Try parse as JSON; if it fails, return the raw response as stdout.
  try {
    const result = JSON.parse(response);
    return result;
  } catch (err) {
    return { stdout: response, stderr: "", status: "Success" };
  }
}


export async function generateAnalysis(stats, providerOverride) {
  const prompt = `You are an AI assistant for a competitive programming coach app. The user has the following statistics:\n\n${JSON.stringify(
    stats,
    null,
    2
  )}\n\nProvide a short analysis of their strengths and areas to improve. Keep it under 120 words.`;
  const result = await runPrompt(prompt, providerOverride);
  return result === "Error: unable to get a response from the LLM." ? generateFallbackAnalysis() : result;
}

export async function generateRecommendation(stats, providerOverride) {
  const prompt = `You are an AI coach helping a competitive programmer improve. The user has this data:\n\n${JSON.stringify(
    stats,
    null,
    2
  )}\n\nProvide a 3-day practice plan with clear daily goals (e.g. number of problems, topics to focus on). Keep it concise.`;
  const result = await runPrompt(prompt, providerOverride);
  return result === "Error: unable to get a response from the LLM." ? generateFallbackRecommendation() : result;
}

export async function generateHint({ problemName, topic, difficulty, stage }, providerOverride) {
  const prompt = `You are an AI hint generator. A user is stuck on a problem named "${problemName}" in the topic "${topic}" with difficulty "${difficulty}". Provide a helpful hint for stage ${stage} that nudges the user forward without giving the full solution. Keep the response concise.`;
  const result = await runPrompt(prompt, providerOverride);
  return result === "Error: unable to get a response from the LLM." ? generateFallbackHint(stage) : result;
}

function getRandomFeedbackPrefix() {
  const prefixes = [
    "Nice attempt!",
    "Good work so far.",
    "Solid effort.",
    "Here’s a quick review:",
    "Let’s improve this:",
    "Quick note:",
    "Checklist:",
    "A few thoughts:",
  ];
  return prefixes[Math.floor(Math.random() * prefixes.length)];
}

function localCodeAnalysis({ code, stdout = "", stderr = "", status = "", userAvgScore }) {
  const prefix = getRandomFeedbackPrefix();
  let score = 70;
  const details = [];

  if (stderr) {
    score = 40;
    details.push(`Your code produced errors:\n${stderr.trim()}`);
  }

  if (status && status !== "Success") {
    score = Math.min(score, 50);
    details.push(`Execution status: ${status}.`);
  }

  if (!stderr && status === "Success") {
    details.push(`Your code executed successfully.`);
  }

  if (stdout) {
    details.push(`Output was:\n${stdout.trim()}`);
  }

  if (!stdout && !stderr && status === "Success") {
    score = Math.min(score, 60);
    details.push("Your code ran without output; make sure this is expected.");
  }

  // Simple heuristic: if code contains nested loops, penalize for possible O(n^2)
  if (/for\s*\(.*\)\s*\{[\s\S]*for\s*\(/.test(code)) {
    score = Math.min(score, 60);
    details.push("The code has nested loops; consider whether this could be slow for large inputs.");
  }

  // Include user average context if available
  if (typeof userAvgScore === "number") {
    const diff = score - userAvgScore;
    if (diff >= 10) {
      details.push(`This is above your recent average score of ${userAvgScore.toFixed(0)}.`);
    } else if (diff <= -10) {
      details.push(`This is below your recent average score of ${userAvgScore.toFixed(0)}; focus on fixing errors first.`);
    }
  }

  const body = details.join(" \n\n");
  let finalFeedback = `${prefix} ${body}`.trim();

  if (score <= 60 && !/weakness/i.test(finalFeedback)) {
    finalFeedback = `${prefix} Weakness: The solution may not handle edge cases or could be inefficient.\n\n${body}`;
  }

  const wordCount = finalFeedback.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    finalFeedback += "\n\nTip: Consider adding test cases for edge conditions and validating input.";
  }

  return { feedback: finalFeedback, score: Math.min(100, Math.max(0, score)) };
}

export async function evaluateCodeWithAI(code, problemDescription = "", context = {}) {
  const prefix = getRandomFeedbackPrefix();
  const { stdout = "", stderr = "", status = "", userAvgScore } = context;

  const prompt = `You are an expert competitive programming coach. A user submitted code and ran it. Use the execution outcome to inform feedback and suggest improvements.

Execution result:
- Status: ${status || "(unknown)"}
- Stdout: ${stdout || "(none)"}
- Stderr: ${stderr || "(none)"}

Problem description:\n${problemDescription || "Generic programming problem"}

Code:\n${code}

Provide a short feedback paragraph that is relevant to the output/errors shown above, and suggest how to improve the solution (performance, correctness, edge cases, readability). Also provide a numeric score (0-100) based on correctness, efficiency, and style.

Return your response exactly in this format:\nFeedback: <your feedback here>\nScore: <number between 0 and 100>`;

  // Prefer Deepseek for analysis, but fall back if unavailable.
  let response = await runPrompt(prompt, "deepseek");

  if (typeof response === "string" && response.startsWith("Error: unable to get a response")) {
    if (process.env.OPENAI_API_KEY) {
      response = await runPrompt(prompt, "openai");
    }
  }

  // If the LLM failed, fall back to local analysis (must always return meaningful feedback)
  if (typeof response === "string" && response.startsWith("Error: unable to get a response")) {
    return localCodeAnalysis({ code, stdout, stderr, status, userAvgScore });
  }

  // Parse response to extract feedback and score
  const feedbackMatch = response.match(/Feedback:\s*([\s\S]*?)\nScore:/i);
  const scoreMatch = response.match(/Score:\s*(\d+)/i);
  const feedbackBody = feedbackMatch ? feedbackMatch[1].trim() : response;
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 60;

  // Ensure we always include a weakness statement when score is low
  let finalFeedback = `${prefix} ${feedbackBody}`.trim();
  if (score <= 60 && !/weakness/i.test(finalFeedback)) {
    finalFeedback = `${prefix} Weakness: The solution may not handle edge cases or could be inefficient.\n\n${feedbackBody}`;
  }

  // Ensure feedback is at least 20 words (for better readability in UI)
  const wordCount = finalFeedback.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    finalFeedback += "\n\nTip: Consider adding test cases for edge conditions and validating input.";
  }

  return { feedback: finalFeedback, score: Math.min(100, Math.max(0, score)) };
}

export async function generatePerformanceAnalysis(userStats, providerOverride) {
  const prompt = `You are an expert competitive programming coach. Analyze this user's performance data and provide detailed, actionable feedback.

User Performance Data:
${JSON.stringify(userStats, null, 2)}

Provide a comprehensive analysis with these EXACT sections:

STRENGTHS:
- List 2-3 specific areas where the user excels
- Include concrete examples based on their data

WEAKNESSES:
- Identify 2-3 areas needing improvement
- Be specific about which topics or skills need work
- Explain why these are weaknesses based on their performance

DAILY PLAN:
- Create a structured 1-2 hour daily practice plan
- Include specific activities (e.g., "Solve 3 LeetCode medium problems in Arrays")
- Suggest learning resources or techniques
- Include time allocations for each activity
- Make it realistic and progressive

Ensure all suggestions are actionable and specific to their current performance level.`;
  const result = await runPrompt(prompt, providerOverride);
  return result === "Error: unable to get a response from the LLM." ? generateFallbackPerformanceAnalysis() : result;
}

export async function generateMCQQuestions(count = 20, providerOverride = "deepseek") {
  const prompt = `Generate ${count} UNIQUE multiple-choice questions (MCQs) for a competitive programming interview assessment. Each question should test knowledge of algorithms, data structures, problem-solving techniques, and coding concepts commonly asked in technical interviews.

CRITICAL REQUIREMENTS:
- ALL questions must be COMPLETELY UNIQUE - no similar questions or variations
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should cover DIVERSE topics: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting, Searching, Hash Tables, Stacks, Queues, etc.
- Difficulty distribution: approximately 40% easy, 40% medium, 20% hard
- Include a brief explanation for the correct answer (but don't include it in the question itself)
- Ensure questions test different concepts within the same topic area
- Format as valid JSON array of objects with this EXACT structure:
[
  {
    "question": "Question text here?",
    "options": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation why this is correct",
    "topic": "Topic name",
    "difficulty": "easy|medium|hard"
  }
]

Generate exactly ${count} COMPLETELY UNIQUE questions covering different algorithms and concepts.`;
  const result = await runPrompt(prompt, providerOverride);
  try {
    const parsed = JSON.parse(result);
    return Array.isArray(parsed) ? parsed : generateFallbackMCQQuestions(count);
  } catch (err) {
    console.warn("Failed to parse MCQ questions JSON:", err.message);
    return generateFallbackMCQQuestions(count);
  }
}


