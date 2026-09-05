import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// Get the exact server folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env explicitly
dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Check API key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in server/.env");
} else {
  console.log("✅ GEMINI_API_KEY loaded successfully");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Tourist Planner Backend is running 🚀",
  });
});
   app.post("/api/plan-trip", async (req, res) => {
  console.log("🚨 API /api/plan-trip was called");

  try {
    console.log("📥 Trip request received:");
    console.log(req.body);

    const {
      destination,
      days,
      budget,
      travelType,
      interests,
    } = req.body;

    if (
      !destination ||
      !days ||
      !budget ||
      !travelType ||
      !interests ||
      interests.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all trip details.",
      });
    }

    const prompt = `
You are an expert AI travel planner.

Create a neat, practical and well-organized travel itinerary.

TRIP DETAILS:
Destination: ${destination}
Duration: ${days} days
Budget: ₹${budget}
Travel Type: ${travelType}
Interests: ${interests.join(", ")}

IMPORTANT FORMAT RULES:

1. Use clear section headings.
2. Put a blank line between major sections.
3. Put a blank line between each day.
4. Put a blank line between Morning, Afternoon and Evening.
5. Use suitable emojis based on the content.
6. Do NOT use Markdown ** symbols.
7. Keep the content easy to read.
8. Do not make one huge paragraph.
9. Keep the budget close to the user's given budget.

Create the complete itinerary for all ${days} days.

Include:

🌍 TRIP OVERVIEW

📍 Destination
📅 Duration
👥 Travel Type
💰 Budget
❤️ Interests

━━━━━━━━━━━━━━━━━━━━

🗓️ DAY-BY-DAY ITINERARY

For every day include:

🌅 DAY [number]: [Title]

🌞 Morning:
[Activity]

☀️ Afternoon:
[Activity]

🌆 Evening:
[Activity]

🌙 Night:
[Activity if appropriate]

━━━━━━━━━━━━━━━━━━━━

📍 TOP PLACES TO VISIT

Give at least 5 places with short descriptions.

━━━━━━━━━━━━━━━━━━━━

🍴 LOCAL FOOD TO TRY

Give at least 5 local foods with short descriptions.

━━━━━━━━━━━━━━━━━━━━

💡 TRAVEL TIPS

🚗 Transport:
[Tip]

💧 Hydration:
[Tip]

👕 Clothing:
[Tip]

⏰ Timing:
[Tip]

━━━━━━━━━━━━━━━━━━━━

🌤️ BEST TIME TO VISIT

[Best time and explanation]

━━━━━━━━━━━━━━━━━━━━

💰 BUDGET SUMMARY

🏨 Accommodation: ₹amount
🍴 Food: ₹amount
🚗 Transport: ₹amount
🎟️ Activities/Entry: ₹amount

💵 TOTAL ESTIMATED: ₹amount

Make the itinerary practical, attractive and easy to read.
`;

    console.log("🤖 Sending request to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const plan = response.text;

    if (!plan) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("✅ Trip generated successfully.");

    res.json({
      success: true,
      plan: plan,
    });

  } catch (error) {
    console.error("❌ BACKEND ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate trip.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});