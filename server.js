import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Route for explaining code
app.post("/explain", async (req, res) => {
    try {
        console.log("📥 Received request:", req.body);

        const { code } = req.body;
        if (!code) {
            console.error("❌ No code provided!");
            return res.status(400).json({ error: "No code provided!" });
        }

        console.log("🔍 Generating explanation for:", code);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(`Explain this code in detail: ${code}`);
        const responseText = result.response.text();

        console.log("✅ Explanation generated!");

        res.json({
            explanation: responseText,
            codeSnippet: code
        });

    } catch (error) {
        console.error("❌ Error occurred:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// ✅ NEW FEATURE: AI-Powered Debugging Assistance 🛠️
app.post("/debug", async (req, res) => {
    try {
        console.log("🐛 Received debugging request:", req.body);

        const { code } = req.body;
        if (!code) {
            console.error("❌ No code provided for debugging!");
            return res.status(400).json({ error: "No code provided for debugging!" });
        }

        console.log("🔍 Analyzing code for errors...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(`Find bugs in the following code and suggest fixes:\n${code}`);
        
        const debugResponse = result.response.text();
        console.log("✅ Debugging response received!");

        res.json({
            debugging_suggestions: debugResponse,
            original_code: code
        });

    } catch (error) {
        console.error("❌ Error in debugging:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// ✅ NEW FEATURE: AI-Powered Code Simplification 🔄
app.post("/simplify", async (req, res) => {
    try {
        console.log("🔄 Received code simplification request:", req.body);

        const { code, language } = req.body;
        if (!code || !language) {
            console.error("❌ Missing code or language!");
            return res.status(400).json({ error: "Code and language are required" });
        }

        console.log("📦 Sending code to Gemini for simplification...");
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
        const responseText = result.response.text();

        console.log("✅ Simplification generated!");
        res.json({ simplification: responseText });

    } catch (error) {
        console.error("❌ Error in code simplification:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
