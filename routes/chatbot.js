const express = require("express");
const router = express.Router();
require("dotenv").config();
const Product = require("../models/Product");
const Category = require("../models/Category");
const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🧠 Initialize OpenAI client (only if API key exists)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// 🌟 Initialize Gemini client (latest endpoint fix)
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiEndpoint: "https://generativelanguage.googleapis.com/v1beta2",
    })
  : null;

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message)
    return res.status(400).json({ msg: "Message is required" });

  try {
    // 🌿 Get product data from DB
    const products = await Product.find().populate("category", "name");
    const categories = await Category.find();

    const productInfo = products
      .map(
        (p) =>
          `${p.name} (${p.category?.name || "Uncategorized"}): ${p.description}`
      )
      .join("\n");

    // 🧾 Create AI context
    const context = `
You are SD Herbs AI Assistant.
Company: SD Herbs — India's leading herbal powder & extract manufacturer.
Focus: Purity, Quality, B2B Bulk Supply, GMP Certified Products.
Product List:
${productInfo}

User Question: "${message}"
`;

    let reply = "";

    // ---------------------------
    // 1️⃣ Try OpenAI (GPT-3.5)
    // ---------------------------
    if (openai) {
      try {
        console.log("🧠 Trying OpenAI...");
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: context }],
          max_tokens: 250,
        });
        reply = completion.choices[0].message.content;
        console.log("✅ Reply from OpenAI");
        return res.json({ source: "OpenAI", reply });
      } catch (err) {
        console.warn("⚠️ OpenAI failed:", err.code || err.message);
      }
    }

    // ---------------------------
    // 2️⃣ Try Gemini (Google AI)
    // ---------------------------
    if (gemini) {
      try {
        console.log("🌟 Trying Gemini...");
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(context);
        const response = await result.response;
        reply = response.text();
        console.log("✅ Reply from Gemini");
        return res.json({ source: "Gemini", reply });
      } catch (err) {
        console.warn("⚠️ Gemini failed:", err.message);
      }
    }

    // ---------------------------
    // 3️⃣ Offline Fallback (Smart Mode)
    // ---------------------------
    console.log("🌿 Using Offline Fallback...");
    const userMsg = message.toLowerCase();

    // Try to match products or categories locally
    const matchedProduct = products.find((p) =>
      userMsg.includes(p.name.toLowerCase())
    );
    const matchedCategory = categories.find((c) =>
      userMsg.includes(c.name.toLowerCase())
    );

    if (matchedProduct) {
      reply = `Here's what I found about **${matchedProduct.name}** 🌿:\n\n${matchedProduct.description}\n\nYou can explore more similar herbal products in the **${matchedProduct.category?.name || "Herbal"}** section on our website.`;
    } else if (matchedCategory) {
      const related = products
        .filter((p) => p.category?.name === matchedCategory.name)
        .slice(0, 3)
        .map((p) => `• ${p.name}`)
        .join("\n");
      reply = `You're asking about **${matchedCategory.name}** products. Here are a few examples:\n${related}\n\nVisit our Products page to see all available items.`;
    } else {
      reply = `I'm sorry 😔, I couldn’t find specific information related to your query right now.\n\nBut you can reach out to us directly:\n📍 Mandsaur, Madhya Pradesh, India\n📞 +91 98931 56792\n📧 info@sdherbs.com\n\nOr send your question via our Contact page — our team will get back to you soon.`;
    }

    return res.json({ source: "Offline", reply });
  } catch (err) {
    console.error("❌ Chatbot Error:", err);
    res
      .status(500)
      .json({ msg: "Chatbot failed", error: err.message });
  }
});

module.exports = router;
