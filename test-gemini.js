require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking Gemini Key:", key ? "Present" : "Missing");

    if (!key) return;

    const genAI = new GoogleGenerativeAI(key);

    const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"];

    console.log("Starting Model Tests...");

    for (const modelName of modelsToTest) {
        try {
            console.log(`\n👉 Attempting: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} WORKED!`);
            console.log("Response:", result.response.text());
            return; // Stop after first success
        } catch (e) {
            console.log(`❌ ${modelName} Failed:`, e.message);
        }
    }

    console.log("\n❌ ALL MODELS FAILED.");
}

testGemini();
