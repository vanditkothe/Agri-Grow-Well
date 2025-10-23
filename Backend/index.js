import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Connection from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Initialize Gemini AI (latest SDK)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Helper function to handle AI calls
async function analyzeHealthWithGemini(prompt) {
  try {
    // Correct model call for latest API (v1)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    // Properly extract AI text response
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

import userRouter from "./Routes/userRouter.js";
app.use("/api/user", userRouter);

/* --------------------------- HEALTH ANALYSIS ENDPOINT --------------------------- */

// Helper function to extract severity from AI response
function extractSeverity(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("severity level: high") || lowerText.includes("severity: high")) {
    return "high";
  } else if (lowerText.includes("severity level: moderate") || lowerText.includes("severity: moderate")) {
    return "moderate";
  }
  return "low";
}

app.post("/api/health/analyze", async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;

    // Validation
    if (!symptoms || !age || !gender) {
      return res.status(400).json({
        error: "Missing required fields: symptoms, age, and gender are required",
      });
    }

    // Verify API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file",
      });
    }

    console.log("Attempting to call Gemini API...");

    // Create AI prompt
  const prompt = `You are a helpful medical AI assistant for farmers.
Analyze the following details and provide simple, farmer-friendly health advice.

Patient Information:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}

Write your answer in a clear and visually appealing format using emojis and headings (NO bullet symbols like * or -).  
Follow this structure exactly:

-> 🩺 Your Health Analysis  

-> 👋 Introduction:
Start with a friendly and reassuring sentence addressing the user and introducing the topic.

-> 💡 What might be happening:
Explain briefly what could be causing the symptoms in simple, farmer-friendly language.

-> 🏡 Easy Home Remedies:
List 3–5 easy things the person can try at home.  
Use emojis (💧, 😴, 🍎, ❄️, 💊, etc.) at the start of each point, and make it short and practical.

-> 🧑‍⚕️ When to See a Doctor:
Explain clearly when they should visit a doctor.  
Use emojis (🚨, ⏱️, 🤒, 🤕, 🌙, etc.) for each point to make it visually engaging.

Keep the entire answer short, friendly, and easy to read.  
Avoid medical jargon and DO NOT use severity levels (like low, moderate, or high).`;

    // ✅ Call the Gemini AI function
    const analysis = await analyzeHealthWithGemini(prompt);

    console.log("Successfully received response from Gemini");

    // Format and send back structured response
    const structuredResponse = {
      analysis,
      severity: extractSeverity(analysis),
      timestamp: new Date().toISOString(),
      disclaimer:
        "This analysis is for informational purposes only. Always consult a healthcare professional for medical advice.",
    };

    res.json(structuredResponse);
  } catch (error) {
    console.error("Error analyzing health:", error);

    let errorMessage = "Failed to analyze symptoms.";
    if (error.message.includes("API_KEY_INVALID")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in the .env file.";
    } else if (error.message.includes("404")) {
      errorMessage =
        "Gemini API access issue. Please verify your API key has access to Gemini models at https://aistudio.google.com/app/apikey";
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health/status", (req, res) => {
  res.json({ status: "ok", message: "Health Analysis API is running" });
});

/* ----------------------------------------------------------------------------------------------------------------------------- */
/* --------------------------- AI DIET PLAN ENDPOINT --------------------------- */

app.post("/api/diet/plan", async (req, res) => {
  try {
    const { age, weight, height, condition, allergies } = req.body;

    if (!age || !weight || !height || !condition) {
      return res.status(400).json({
        error: "Missing required fields: age, weight, height, and condition are required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured.",
      });
    }

    console.log("Generating AI Diet Plan...");

    // ✅ AI Prompt
    const prompt = `You are a nutrition and diet AI assistant for farmers.
Use the following information to create a personalized diet plan with local, affordable foods.

Farmer Profile:
- Age: ${age}
- Weight: ${weight} kg
- Height: ${height} cm
- Health Condition: ${condition}
- Allergies: ${allergies && allergies.length ? allergies.join(", ") : "None"}

Provide your response in a clear, emoji-rich format (NO bullet symbols * or -).  
Follow this structure:

## 🥗 Personalized Diet Plan

### 👋 Introduction:
Write 1 short, friendly sentence welcoming the user and explaining that this is a personalized diet plan.

### 🍱 Daily Meal Plan:
Give simple meal ideas for:
🌅 Breakfast  
🌞 Lunch  
🌙 Dinner  
Include local foods and explain why they are good.

### 🧃 Snacks & Drinks:
Suggest 2–3 healthy snacks or drinks to include daily.

### ⚠️ Foods to Avoid:
Mention foods they should limit or avoid, based on their condition or allergies.

### 💡 Extra Tips:
Give 2–3 helpful lifestyle or nutrition tips for farmers (like hydration, portion control, etc.)

Keep it short, farmer-friendly, and practical. Use emojis for each point.
Avoid medical jargon or clinical tone.`;

    // ✅ Call Gemini API
    const plan = await analyzeHealthWithGemini(prompt);

    res.json({
      plan,
      timestamp: new Date().toISOString(),
      disclaimer:
        "This diet plan is AI-generated for educational purposes. Please consult a certified nutritionist for professional advice.",
    });
  } catch (error) {
    console.error("Error generating diet plan:", error);
    res.status(500).json({
      error: "Failed to generate diet plan.",
      details: error.message,
    });
  }
});
/* --------------------------- AI CROP DISEASE DETECTION --------------------------- */

app.post("/api/crop/analyze", async (req, res) => {
  try {
    const { image, cropType, location } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image of the crop is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file",
      });
    }

    console.log("Calling Gemini AI for crop disease detection...");

    // ✅ AI Prompt
    const prompt = `
You are an AI agricultural assistant. Analyze this crop image and provide farmer-friendly advice.

Crop Information:
- Crop Type: ${cropType || "Unknown"}
- Location: ${location || "Unknown"}
- Image (base64): ${image}

Please provide a short, easy-to-read , in organized way analysis that includes:
1. Possible diseases
2. Pest infestations
3. Nutrient deficiencies
4. Practical treatment or prevention advice

Use emojis (🪱, 🍃, 💧, 🌿) to make the guidance clear and farmer-friendly. Avoid technical jargon.
`;

    // ✅ Call Gemini AI
    const analysis = await analyzeHealthWithGemini(prompt);

    res.json({
      analysis,
      timestamp: new Date().toISOString(),
      disclaimer:
        "This analysis is AI-generated for informational purposes. Always consult an agricultural expert for serious issues.",
    });
  } catch (error) {
    console.error("Error analyzing crop:", error);
    res.status(500).json({
      error: "Failed to analyze crop image",
      details: error.message,
    });
  }
});
/* --------------------------- AI SOIL REPORT ANALYSIS --------------------------- */
app.post("/api/soil/analyze", async (req, res) => {
  try {
    const { reportText } = req.body; // accept text extracted from PDF/Image or raw text

    if (!reportText) {
      return res.status(400).json({ error: "Soil report content is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file",
      });
    }

    console.log("Calling Gemini AI for soil analysis...");

    // ✅ AI Prompt
    const prompt = `
You are an AI agricultural assistant. Analyze the following soil report and provide farmer-friendly advice.

Soil Report:
${reportText}

Provide your response in a structured format with these sections:
1. Soil Parameters (pH, Nitrogen, Phosphorus, Potassium, Organic Matter, etc.)
2. Crop Recommendations based on the soil
3. Fertilizer Recommendations
4. Treatment / Soil Improvement Plans
5. Seasonal Planting Tips

Use emojis (🌱, 💧, 🧪) for clarity. Keep it simple and actionable for farmers.
Return the response as JSON object with keys: parameters, crops, fertilizers, treatments, calendar.
`;

    const analysis = await analyzeHealthWithGemini(prompt);

    // Try to parse AI response as JSON, fallback to raw text if parsing fails
    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysis);
    } catch (e) {
      structuredAnalysis = { rawText: analysis };
    }

    res.json({
      analysis: structuredAnalysis,
      timestamp: new Date().toISOString(),
      disclaimer:
        "This analysis is AI-generated for informational purposes. Consult an agronomist before taking major actions.",
    });
  } catch (error) {
    console.error("Error analyzing soil report:", error);
    res.status(500).json({
      error: "Failed to analyze soil report",
      details: error.message,
    });
  }
});

/* ----------------------------------------------------------------------------------------------------------------------------- */

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

Connection();
