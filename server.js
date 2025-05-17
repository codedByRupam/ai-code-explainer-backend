import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Gemini Model Init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Root Route - For Health Check
app.get("/", (req, res) => {
  res.send("✅ AI Code Explainer Backend is running!");
});

// ✅ Explain Code
app.post("/explain", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "No code provided!" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`Explain this code in detail:\n${code}`);
    const explanation = result.response.text();

    res.json({ explanation, codeSnippet: code });
  } catch (error) {
    console.error("Explain Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Debug Code
app.post("/debug", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "No code provided for debugging!" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`Find bugs in the following code and suggest fixes:\n${code}`);
    const debugging_suggestions = result.response.text();

    res.json({ debugging_suggestions, original_code: code });
  } catch (error) {
    console.error("Debug Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Simplify Code
app.post("/simplify", async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) return res.status(400).json({ error: "Code and language are required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
You are an expert ${language} developer. Simplify or optimize the following code and explain the improvements.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond in this format:

Simplified Code:
\`\`\`${language}
<your improved code here>
\`\`\`

Explanation:
<explanation of what was changed and why>
    `;

    const result = await model.generateContent(prompt);
    const simplification = result.response.text();

    res.json({ simplification });
  } catch (error) {
    console.error("Simplify Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
