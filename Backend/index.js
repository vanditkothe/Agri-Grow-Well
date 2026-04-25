import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Connection from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin:  "*",

  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Initialize Gemini AI (latest SDK)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Helper function to handle AI calls
// async function analyzeHealthWithGemini(prompt) {
//   try {
//     // Correct model call for latest API (v1)
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
//     const result = await model.generateContent(prompt);

//     // Properly extract AI text response
//     const text = result.response.text();
//     return text;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw error;
//   }
// }
// async function analyzeHealthWithGemini(prompt) {
//   const model = genAI.getGenerativeModel({
//     model: "gemini-3-flash-preview",
//   });

//   let retries = 3;

//   while (retries > 0) {
//     try {
//       const result = await model.generateContent(prompt);
//       return result.response.text();
//     } catch (error) {
//       console.error("Gemini API Error:", error.message);

//       if (error.status === 503) {
//         retries--;
//         console.log(`Retrying... attempts left: ${retries}`);
//         await new Promise((res) => setTimeout(res, 2000));
//       } else {
//         throw error;
//       }
//     }
//   }

//   throw new Error("Gemini overloaded. Try again later.");
// }
// async function analyzeHealthWithGemini(prompt, base64Image = null) {
//   const model = genAI.getGenerativeModel({
//     model: "gemini-2.5-flash", // Use 2.5-flash for higher stability on Free Tier
//   });

//   let parts = [prompt];
//   if (base64Image) {
//     const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
//     const cleanData = base64Image.replace(/^data:image\/\w+;base64,/, "");
//     parts.push({ inlineData: { data: cleanData, mimeType: mimeType } });
//   }

//   let retries = 3;
//   while (retries > 0) {
//     try {
//       const result = await model.generateContent(parts);
//       return result.response.text();
//     } catch (error) {
//       if (error.status === 503 || error.status === 429) {
//         retries--;
//         console.log(`Gemini busy (503/429). Retrying in 5s... Attempts left: ${retries}`);
//         await new Promise((res) => setTimeout(res, 5000));
//       } else {
//         throw error;
//       }
//     }
//   }
//   throw new Error("Gemini is currently overloaded. Please try again in a minute.");
// }
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// async function analyzeAI(prompt, base64Image = null) {
//   // ----------- TRY GEMINI FIRST -----------
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-pro", // STABLE MODEL
//     });

//     let parts = [prompt];

//     if (base64Image) {
//       const mimeType =
//         base64Image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
//       const cleanData = base64Image.replace(
//         /^data:image\/\w+;base64,/,
//         ""
//       );

//       parts.push({
//         inlineData: { data: cleanData, mimeType },
//       });
//     }

//     const result = await model.generateContent(parts);
//     return result.response.text();
//   } catch (error) {
//     console.log("⚠️ Gemini failed, switching to Groq...", error.message);
//   }

//   // ----------- FALLBACK TO GROQ -----------
//   try {
//     const chat = await groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: "llama3-8b-8192",
//     });

//     return chat.choices[0].message.content;
//   } catch (error) {
//     console.error("❌ Groq also failed:", error.message);
//     throw new Error("All AI services failed");
//   }
// }
async function analyzeAI(prompt, base64Image = null) {
  // ---------- GEMINI ----------
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", 
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.log("Gemini failed:", err.message);
  }

  // ---------- GROQ ----------
  try {
    if (!process.env.GROQ_API_KEY) throw new Error("No Groq key");

    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    return chat.choices[0].message.content;
  } catch (err) {
    console.log("Groq failed:", err.message);
  }

  // ---------- FINAL SAFE ----------
  return "⚠️ AI temporarily unavailable. Try again.";
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

    const analysis = await analyzeAI(prompt, reportImage);

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



/* --------------------------- DIET PLAN ENDPOINT --------------------------- */
app.post("/api/diet/plan", async (req, res) => {
  try {
    const { age, weight, height, condition, dietType, allergies } = req.body;

    // 1. Validation
    if (!age || !weight || !height || !condition) {
      return res.status(400).json({ error: "Missing required profile fields." });
    }

    console.log(`Processing diet plan for: Age ${age}, Conditions: ${condition}`);

    const prompt = `You are an expert Indian nutritionist. Create a 7-day meal plan for a farmer.
    Details: Age ${age}, Weight ${weight}kg, Height ${height}cm, Conditions: ${condition}, Diet: ${dietType}, Allergies: ${allergies}.
    
    Use local Indian ingredients. Return ONLY a JSON object in this format:
    {
      "bmi": "value",
      "bmiCategory": "string",
      "calorieTarget": "string",
      "nutritionGoals": {"protein": "g", "carbs": "g", "fats": "g", "fiber": "g"},
      "weeklyPlan": [{"day": "Monday", "meals": {"breakfast": {"items": []}, "lunch": {"items": []}, "dinner": {"items": []}, "snacks": {"items": []}}}],
      "hydration": "string",
      "tips": []
    }
    IMPORTANT: No markdown, no conversational text.`;

    const rawAIResponse = await analyzeAI(prompt);

    // 2. Robust JSON Extraction
    let structuredPlan;
    try {
      const start = rawAIResponse.indexOf('{');
      const end = rawAIResponse.lastIndexOf('}') + 1;
      if (start === -1 || end === 0) throw new Error("No JSON found");
      
      const jsonString = rawAIResponse.substring(start, end);
      structuredPlan = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response. Raw text:", rawAIResponse);
      return res.status(500).json({ error: "The AI sent an invalid data format. Please try again." });
    }

    res.json({ plan: structuredPlan, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Diet Plan Route Error:", error.message);
    res.status(500).json({ error: "Server Error: " + error.message });
  }
});

/* --------------------------- TRANSLATION ENDPOINT --------------------------- */
// This handles the "हिंदी में देखें" button in your React frontend
app.post("/api/diet/translate", async (req, res) => {
  try {
    const { dietPlan } = req.body;

    if (!dietPlan) {
      return res.status(400).json({ error: "No plan provided" });
    }

    const prompt = `
Translate ONLY food items and tips into Hindi (Devanagari).

⚠️ Rules:
- Keep keys like "breakfast", "lunch", "dinner" in English
- Translate ONLY values
- Return ONLY VALID JSON
- No explanation
- No extra text

JSON:
${JSON.stringify(dietPlan)}
`;

    const raw = await analyzeAI(prompt);

    // 🔥 CLEAN RESPONSE
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // 🔥 SAFE JSON EXTRACTION
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}") + 1;

    if (start === -1 || end === 0) {
      throw new Error("Invalid JSON from AI");
    }

    const jsonString = cleaned.substring(start, end);

    const translatedPlan = JSON.parse(jsonString);

    res.json({ translatedPlan });

  } catch (error) {
    console.error("Translation Error:", error.message);

    res.status(500).json({
      error: "Translation failed",
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

    const analysis = await analyzeAI(prompt);

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

    const responseText = await analyzeAI(prompt);

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

    const prompt = `
You are a STRICT agricultural plant disease expert.

STEP 1:
Describe EXACTLY what you see in the image (colors, damage, fungus, insects, rot).

STEP 2:
Based on that, determine if the plant is Healthy or Diseased.

STRICT RULES:
- If ANY damage, rot, fungus, insects → mark as Diseased
- NEVER say Healthy unless PERFECT
- If unsure → choose Diseased

STEP 3:
Return ONLY JSON:

{
  "healthStatus": {
    "status": "Healthy / Diseased / Stressed",
    "confidence": "High / Medium / Low",
    "summary": "Clear explanation"
  },
  "identifiedIssues": [
    {
      "name": "Exact issue (rot, fungus, pest)",
      "type": "Disease / Pest / Environmental",
      "severity": "Low / Medium / High",
      "description": "What is happening",
      "symptoms": ["visible symptoms"]
    }
  ],
  "treatmentRecommendations": {
    "immediate": ["what to do now"],
    "organic": ["organic solutions"],
    "chemical": ["if needed"],
    "preventive": ["future prevention"]
  }
}
`;
    // Gemini vision analysis (image + text)
    const analysis = await analyzeAI(prompt, image);

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
import nodemailer from "nodemailer";

app.post("/api/contact", async (req, res) => {
  try {
    console.log("🔥 CONTACT HIT");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS" : "MISSING");

    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "vanditkothe@gmail.com",
      subject: "Test Mail",
      text: `Name: ${name} Email: ${email} Message: ${message}`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
/* ------------------------------------------------------------- */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
  console.log(`Using AI: Gemini + Groq fallback`);
  // console.log(`Calendar API available at /api/calendar`);
});

Connection();