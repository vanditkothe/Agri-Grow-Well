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
  origin: [
    "https://agri-grow-well.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
import calendarRouter from "./Routes/calendarRouter.js";

app.use("/api/user", userRouter);
app.use("/api/calendar", calendarRouter);

/* --------------------------- HEALTH ANALYSIS ENDPOINT --------------------------- */

function extractSeverity(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("severity level: high") || lowerText.includes("severity: high") || lowerText.includes("🔴")) {
    return "high";
  } else if (lowerText.includes("severity level: moderate") || lowerText.includes("severity: moderate") || lowerText.includes("🟡")) {
    return "moderate";
  }
  return "low";
}

app.post("/api/health/analyze", async (req, res) => {
  try {
    const { symptoms, age, gender, reportImage, hasReport } = req.body;

    if (!symptoms || !age || !gender) {
      return res.status(400).json({
        error: "Missing required fields: symptoms, age, and gender are required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file",
      });
    }

    console.log("Queueing health analysis request...");

    let prompt = `You are an expert medical AI assistant for farmers. Analyze the patient information and provide clear, systematic health guidance.

Patient Information:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}
${hasReport ? "- Medical Report: Attached (analyze the test results in the image)" : ""}

Provide your analysis in this EXACT structured format using emojis for visual clarity:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 HEALTH ANALYSIS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 GREETING
Write one friendly, reassuring sentence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SYMPTOM ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on your symptoms, here's what I found:

${hasReport ? `📋 TEST REPORT FINDINGS
Analyze the medical report values and highlight:
• Key abnormal values (if any)
• Normal ranges vs actual values
• Important observations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ""}🤔 POSSIBLE CONDITIONS

List 2-3 possible conditions:

1️⃣ [Condition Name]
   • What it is (simple explanation)
   • Why these symptoms match
   • Common in farmers because...

2️⃣ [Condition Name]
   • What it is (simple explanation)
   • Why these symptoms match
   • Common in farmers because...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ SEVERITY ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on symptoms ${hasReport ? "and test results" : ""}, this appears to be:

${hasReport ? "🟢 LOW SEVERITY / 🟡 MODERATE SEVERITY / 🔴 HIGH SEVERITY" : "🟢 LOW SEVERITY / 🟡 MODERATE SEVERITY / 🔴 HIGH SEVERITY"}

Explanation: [Brief reason for severity level]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏡 HOME CARE (what you can do now):

1. 💧[First recommendation]
   - Specific action to take
   - Why it helps

2. 🍎[Second recommendation]
   - Specific action to take
   - Why it helps

3. 😴[Third recommendation]
   - Specific action to take
   - Why it helps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 WHEN TO SEE A DOCTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ SEE A DOCTOR IMMEDIATELY IF:

🚨 [Urgent symptom 1]
🚨 [Urgent symptom 2]
🚨 [Urgent symptom 3]

📅 SCHEDULE AN APPOINTMENT IF:

• [Non-urgent but important sign 1]
• [Non-urgent but important sign 2]
• Symptoms persist beyond [timeframe]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌿 LIFESTYLE TIPS FOR FARMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ [Farming-specific tip 1]
✓ [Farming-specific tip 2]
✓ [Farming-specific tip 3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep language simple, avoid medical jargon, and be farmer-friendly. ${hasReport ? "Reference specific values from the test report when relevant." : ""}`;

    const analysis = await analyzeHealthWithGemini(prompt, reportImage);

    console.log("✅ Health analysis complete");

    const structuredResponse = {
      analysis,
      severity: extractSeverity(analysis),
      timestamp: new Date().toISOString(),
      disclaimer:
        "⚠️ IMPORTANT: This AI analysis is for informational purposes only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns.",
    };

    res.json(structuredResponse);
  } catch (error) {
    console.error("Error analyzing health:", error);

    let errorMessage = "Failed to analyze symptoms.";
    let statusCode = 500;
    
    if (error.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
      statusCode = 429;
    } else if (error.status === 404) {
      errorMessage = "Model not found. The Gemini model may not be available with your API key.";
      statusCode = 404;
    } else if (error.message.includes("API_KEY_INVALID")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in the .env file.";
      statusCode = 401;
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
    });
  }
});

app.get("/api/health/status", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Health Analysis API is running",
    model: "gemini-2.5-flash",
    timestamp: new Date().toISOString()
  });
});

/* --------------------------- AI DIET PLAN ENDPOINT --------------------------- */

app.post("/api/diet/plan", async (req, res) => {
  try {
    const { age, weight, height, condition, dietType, allergies } = req.body;

    if (!age || !weight || !height || !condition) {
      return res.status(400).json({
        error: "Missing required fields: age, weight, height, and condition are required.",
      });
    }

    console.log("Queueing diet plan request...");

    const prompt = `You are a professional nutritionist and dietitian specializing in health management for farmers and rural communities.

Patient Information:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Medical Conditions: ${condition}
- Diet Preference: ${dietType || "No preference"}
- Food Allergies: ${allergies || "None"}

Create a personalized 7-day meal plan in this EXACT JSON format:

{
  "bmi": "Calculate BMI",
  "bmiCategory": "Underweight/Normal/Overweight/Obese",
  "calorieTarget": "Daily calorie target in kcal",
  "nutritionGoals": {
    "protein": "grams/day",
    "carbs": "grams/day",
    "fats": "grams/day",
    "fiber": "grams/day"
  },
  "weeklyPlan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": {
          "items": ["Item 1", "Item 2"],
          "calories": "kcal",
          "description": "Brief description"
        },
        "lunch": {
          "items": ["Item 1", "Item 2"],
          "calories": "kcal",
          "description": "Brief description"
        },
        "dinner": {
          "items": ["Item 1", "Item 2"],
          "calories": "kcal",
          "description": "Brief description"
        },
        "snacks": {
          "items": ["Item 1"],
          "calories": "kcal"
        }
      }
    }
  ],
  "hydration": "Daily water intake recommendation",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Important:
- Use affordable, locally available Indian ingredients
- Consider farming lifestyle and physical activity
- Provide practical, easy-to-prepare meals
- Return ONLY valid JSON, no markdown`;

    const dietPlan = await analyzeHealthWithGemini(prompt);

    let structuredPlan;
    try {
      structuredPlan = JSON.parse(
        dietPlan.replace(/```json|```/g, "").trim()
      );
    } catch (e) {
      return res.status(500).json({
        error: "Failed to generate structured diet plan",
        rawPlan: dietPlan
      });
    }

    res.json({
      plan: structuredPlan,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating diet plan:", error);
    
    let statusCode = 500;
    if (error.status === 429) statusCode = 429;
    if (error.status === 404) statusCode = 404;
    
    res.status(statusCode).json({
      error: "Failed to generate diet plan",
      details: error.message,
    });
  }
});

/* --------------------------- SOIL ANALYSIS ENDPOINT --------------------------- */

app.post("/api/soil/analyze", async (req, res) => {
  try {
    const { reportText } = req.body;

    if (!reportText || reportText.trim().length === 0) {
      return res.status(400).json({
        error: "Soil report text is required"
      });
    }

    console.log("Received soil report text");

    const prompt = `
You are an expert agricultural scientist specializing in soil health and crop management for Indian farmers.

Analyze the following soil test report and return ONLY valid JSON in this format:

{
  "soilHealthSummary": {
    "overallHealth": "Excellent/Good/Fair/Poor",
    "soilType": "Sandy/Loamy/Clay/Silt",
    "summary": "Brief 2-3 sentence overview",
    "keyIssues": ["Issue 1", "Issue 2"]
  },
  "parameters": [
    {
      "name": "pH",
      "value": "6.8",
      "unit": "",
      "optimalRange": "6.5-7.5",
      "status": "Optimal/Low/High",
      "interpretation": "Explanation",
      "recommendation": "What to do"
    }
  ],
  "cropRecommendations": [],
  "fertilizerRecommendations": [],
  "soilTreatments": [],
  "seasonalCalendar": []
}

Soil Report Text:
${reportText}

Return ONLY JSON. No markdown.`;

    const analysis = await analyzeHealthWithGemini(prompt);

    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(
        analysis.replace(/```json|```/g, "").trim()
      );
    } catch (e) {
      structuredAnalysis = { rawText: analysis };
    }

    res.json({
      analysis: structuredAnalysis,
      timestamp: new Date().toISOString(),
      disclaimer: "AI-generated soil analysis. Consult an agronomist for final decisions."
    });

  } catch (error) {
    console.error("Error analyzing soil:", error);
    res.status(500).json({
      error: "Failed to analyze soil report",
      details: error.message
    });
  }
});


/* --------------------------- CHAT ENDPOINT --------------------------- */

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }

    console.log("Queueing chat request...");

    const prompt = `You are an intelligent Agri-Health AI Assistant for farmers.
You help with: understandable,  correct and optimized answer related to question is asked 

Question: ${message}

Provide a clear, helpful answer in simple farmer-friendly language.`;

    const responseText = await analyzeHealthWithGemini(prompt);

    console.log("✅ Chat response generated");

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Chat API Error:", error);
    
    let statusCode = 500;
    if (error.status === 429) statusCode = 429;
    if (error.status === 404) statusCode = 404;
    
    res.status(statusCode).json({
      error: "Failed to generate AI response.",
      details: error.message,
    });
  }
});

/* --------------------------- CROP ANALYSIS ENDPOINT --------------------------- */
app.post("/api/crop/analyze", async (req, res) => {
  try {
    const { image, cropType } = req.body;

    if (!image || !cropType) {
      return res.status(400).json({
        error: "Missing required fields: image and cropType are required.",
      });
    }

    console.log("Queueing crop analysis request...");

    const prompt = `You are an expert agricultural scientist specializing in crop disease detection for Indian farmers.

Crop Information:
- Crop Name: ${cropType}

Analyze the crop image and return the result in this EXACT JSON format:

{
  "healthStatus": {
    "status": "Healthy / Diseased / Stressed",
    "confidence": "High / Medium / Low",
    "summary": "Short explanation of crop condition"
  },
  "identifiedIssues": [
    {
      "name": "Disease or Pest Name",
      "type": "Disease / Pest / Nutrient Deficiency",
      "severity": "Low / Medium / High",
      "description": "Simple explanation in farmer-friendly language",
      "symptoms": ["Symptom 1", "Symptom 2"]
    }
  ],
  "treatmentRecommendations": {
    "immediate": [
      "Immediate action to prevent damage"
    ],
    "organic": [
      "Organic treatment method"
    ],
    "chemical": [
      "Recommended chemical treatment (if needed)"
    ],
    "preventive": [
      "Steps to prevent future occurrence"
    ]
  },
  "additionalTips": [
    "General care tip",
    "Watering / soil / spacing advice"
  ]
}

Guidelines:
- Focus on Indian farming practices
- Use simple, non-technical language
- Be farmer-friendly
- Return ONLY valid JSON
- Do NOT include markdown or extra text`;

    // Gemini vision analysis (image + text)
    const analysis = await analyzeHealthWithGemini(prompt, image);

    let structuredAnalysis;
    try {
      const cleanedText = analysis
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      structuredAnalysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse crop analysis:", parseError);
      return res.status(500).json({
        error: "Failed to generate structured crop analysis",
        rawAnalysis: analysis,
      });
    }

    console.log("✅ Crop analysis generated");

    res.json({
      analysis: structuredAnalysis,
      timestamp: new Date().toISOString(),
      disclaimer:
        "This crop analysis is AI-generated. Consult a local agriculture officer for severe crop issues.",
    });

  } catch (error) {
    console.error("Error analyzing crop:", error);

    let statusCode = 500;
    if (error.status === 429) statusCode = 429;
    if (error.status === 404) statusCode = 404;

    res.status(statusCode).json({
      error: "Failed to analyze crop image",
      details: error.message,
    });
  }
});

/* ------------------------------------------------------------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
  console.log(`Using Gemini model: gemini-1.5-flash-latest`);
  console.log(`Calendar API available at /api/calendar`);
});

Connection();