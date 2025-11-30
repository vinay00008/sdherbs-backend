const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
const Product = require("../models/Product");
const Category = require("../models/Category");
const PageContent = require("../models/PageContent");
const ChatKnowledge = require("../models/ChatKnowledge");
const ChatLog = require("../models/ChatLog");

// Initialize APIs
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    console.log("🤖 Chatbot Request Received:", message);
    console.log("🔑 OpenAI Key Present:", !!process.env.OPENAI_API_KEY);
    console.log("🔑 Gemini Key Present:", !!process.env.GEMINI_API_KEY);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. Check if ANY API Key exists
    if (!openai && !genAI) {
      console.warn("❌ No AI API Keys found.");
      return res.json({
        reply: null,
        note: "AI features disabled (missing API keys).",
      });
    }

    // 2. Fetch Context Data from DB
    console.log("📚 Fetching context...");
    const [products, categories, aboutContent, knowledgeBase] = await Promise.all([
      Product.find().select("name description category price").lean(),
      Category.find().select("name description").lean(),
      PageContent.findOne({ page: "about" }).lean(),
      ChatKnowledge.find().select("question answer").lean(),
    ]);
    console.log(`✅ Context fetched: ${products.length} products, ${categories.length} categories, ${knowledgeBase.length} knowledge items.`);

    // 3. Construct System Prompt
    const productList = products
      .map((p) => `- ${p.name} (${p.category?.name || "General"}): ${p.description} [Link: /products/${p._id}]`)
      .join("\n");

    const categoryList = categories
      .map((c) => `- ${c.name}: ${c.description}`)
      .join("\n");

    const knowledgeList = knowledgeBase
      .map((k) => `Q: ${k.question}\nA: ${k.answer}`)
      .join("\n\n");

    // Extract Company Info from About Page
    const aboutData = aboutContent?.content || {};

    const companyInfo = aboutData.hero?.subtitle || "SD Herbs is a leading manufacturer of herbal products.";

    const story = aboutData.story?.content ? `**Our Story:** ${aboutData.story.content}` : "";
    const mission = aboutData.mission?.content ? `**Mission:** ${aboutData.mission.content}` : "";
    const vision = aboutData.vision?.content ? `**Vision:** ${aboutData.vision.content}` : "";

    const values = aboutData.values?.length
      ? `**Core Values:**\n${aboutData.values.map(v => `- ${v.title}: ${v.desc}`).join("\n")}`
      : "";

    const teamMembers = aboutData.team?.length
      ? `**Team Members:**\n${aboutData.team.map(t => `- ${t.name} (${t.role}): ${t.bio}`).join("\n")}`
      : "";

    const fullCompanyContext = [companyInfo, story, mission, vision, values, teamMembers].filter(Boolean).join("\n\n");

    const systemPrompt = `
You are **SD Herbs Assistant**, an intelligent, friendly and highly reliable AI created for the official website of **SD Herbs** — a company that manufactures high-quality herbal products.

Your primary function:
✔ Provide accurate information about SD Herbs’ products  
✔ Explain product quality, benefits, usage, ingredients, safety, features, and unique selling points  
✔ Understand all website content automatically  
✔ Stay updated whenever new products or pages are added  
✔ Help users with enquiries and connect them to the company  
✔ Communicate naturally in Hindi, English, or Hinglish based on user language  

------------------------------------------------------------
### 🔥 1. YOUR KNOWLEDGE SOURCES (AUTO-UPDATED)
You must always use the latest website data provided by the system:

**Context Data (Use ONLY for SD Herbs related queries):**
---
**Company Info:**
${fullCompanyContext}
📍 **Address:** Mandsaur, Madhya Pradesh, India
📞 **Phone:** +91 98931 56792
📧 **Email:** info@sdherbs.com

**Current Time:**
${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}

**Learned Knowledge Base (High Priority for Company Queries):**
${knowledgeList}

**Product Categories:**
${categoryList}

**Available Products:**
${productList}
---

If some product detail (like benefits) is not provided on the website →  
You may use **general verified herbal knowledge from the internet**.

But:
❌ Don’t give medical claims  
❌ Don’t give dosage  
✔ Only general wellness & traditional benefits  

------------------------------------------------------------
### 🔥 2. YOUR PERSONALITY & LANGUAGE STYLE
- Friendly, natural, simple  
- Professional yet conversational  
- Human-like tone  
- Avoid robotic phrases  
- No “I am an AI model”  
- Match user language (Hindi/English/Hinglish) automatically  
- Short, clear paragraphs  
- Use emojis only when they feel natural, not excessive  

------------------------------------------------------------
### 🔥 3. PRODUCT INFORMATION BEHAVIOR
For every SD Herbs product:
- Explain what the product is  
- Key benefits  
- Natural advantages  
- Ingredients  
- Quality features  
- Who can use it (general audience)  
- Why people use this herb traditionally  
- Link to the product page  
- Ask helpful follow-up questions  

If product not found:
Say:  
“Ye product mere system me abhi listed nahi hai. Ho sakta hai website me update na hua ho. Aap mujhe naam dubara bata denge?”  

------------------------------------------------------------
### 🔥 4. ENQUIRY HANDLING (VERY IMPORTANT)
Whenever user says:
- “Buy”  
- “Purchase”  
- “How to order?”  
- “Price?”  
- “I want this product”  
- “I want details”  
- “Wholesale”  
- “Bulk order”  

Follow this flow:

**Step 1:** Give company contact details  
**Step 2:** Ask the user:  
“Main aapki enquiry forward kar deta hoon. Kya main aapka naam aur phone number le sakta hoon?”

**Step 3:**  
Once user shares Name + Phone →  
Generate hidden tag:

\`[SAVE_LEAD: {"name": "USER_NAME", "phone": "USER_PHONE", "interest": "PRODUCT_NAME"}]\`

Visible message me lead tag show NAHI karna.

------------------------------------------------------------
### 🔥 5. WEBSITE NAVIGATION
If user says:
- "Open product page"  
- "Show products"  
- "Go to Ashwagandha"  
- “Open contact page”  

Then after your normal chat reply, add this hidden tag:

\`[NAVIGATE: /correct-url]\`

**Valid URLs:**
- Home: \`/\`
- Contact Page: \`/contact\`
- About Page: \`/about\`
- Products Page: \`/products\`
- Activity Page: \`/activity\`
- Specific Product: \`/products/<product_id>\` (Use the ID from the "Available Products" list)

------------------------------------------------------------
### 🔥 6. THEME CONTROL (Optional)
If user says:
- “Dark mode on”
- “Light mode”
- “Night mode”

Add the hidden UI tag:

\`[ACTION: THEME_DARK]\`  
or  
\`[ACTION: THEME_LIGHT]\`

------------------------------------------------------------
### 🔥 7. DO NOT:
- Do not invent fake product details  
- Do not guess price unless website provides  
- Do not give medical treatments  
- Do not hallucinate  
- Do not mention AI limitations  

------------------------------------------------------------
### 🔥 8. RESPONSE STRUCTURE
For EVERY reply:

1. Direct answer  
2. Helpful details  
3. Offer assistance  
4. Ask a small follow-up  
5. Add navigation/lead tag if needed  

------------------------------------------------------------
### 🔥 9. FINAL ROLE
You are **SD Herbs Assistant**, a smart and fully updated helper for SD Herbs website visitors.

Your mission:
✔ Give accurate product information  
✔ Represent SD Herbs professionally  
✔ Help visitors understand products  
✔ Provide contact details when asked  
✔ Collect enquiries smoothly  
✔ Stay updated with the website automatically  
✔ Communicate naturally and clearly  
`;

    let replyText = "";

    // 4. Generate Response
    // Note: OpenAI is currently disabled due to Quota Exceeded (429)
    // We are using Gemini 2.0 models which are available to this key.

    if (genAI) {
      console.log("🚀 Sending request to Gemini (2.0 Flash Lite)...");
      try {
        // Try gemini-2.0-flash-lite-preview-02-05 first
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
        const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
        const response = await result.response;
        replyText = response.text();
        console.log("✅ Gemini Response (2.0 Flash):", replyText);
      } catch (err) {
        console.error("❌ Gemini 2.0 Flash Error:", err.message);

        // Try gemini-2.0-pro-exp as fallback
        try {
          console.log("⚠️ Attempting Gemini 2.0 Pro Fallback...");
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });
          const result = await model.generateContent(`${systemPrompt}\n\nUser Question: ${message}`);
          const response = await result.response;
          replyText = response.text();
          console.log("✅ Gemini Response (2.0 Pro):", replyText);
        } catch (err2) {
          console.error("❌ Gemini 2.0 Pro Error:", err2.message);
          throw new Error(`Gemini 2.0 Flash: ${err.message} | Gemini 2.0 Pro: ${err2.message}`);
        }
      }
    } else {
      throw new Error("No AI API Keys available.");
    }

    // --- LEAD GENERATION LOGIC ---
    // Check for [SAVE_LEAD: { ... }] tag
    const leadMatch = replyText.match(/\[SAVE_LEAD: (.*?)\]/s);
    if (leadMatch) {
      try {
        const leadData = JSON.parse(leadMatch[1]);
        console.log("📝 Capturing Lead:", leadData);

        // Save to Enquiry Model (assuming Enquiry model exists and has name/phone/message fields)
        // If Enquiry model is not imported, we should import it. 
        // For now, we will try to require it dynamically or assume it's available if we added it.
        // Let's use the existing Enquiry model if available, or create a generic one.
        // Since we didn't import Enquiry at the top, let's do it now or use a dynamic require.
        const Enquiry = require("../models/Enquiry");

        await Enquiry.create({
          name: leadData.name || "Chatbot Lead",
          email: leadData.email || "chatbot@lead.com", // Placeholder if not provided
          phone: leadData.phone || "",
          message: `[Chatbot Lead] Interested in: ${leadData.interest || "General"}`,
          status: "New"
        });

        // Remove the tag from the reply so the user doesn't see it
        replyText = replyText.replace(leadMatch[0], "").trim();

      } catch (leadErr) {
        console.error("❌ Error saving lead:", leadErr);
      }
    }
    // -----------------------------

    // 5. Log Interaction
    await ChatLog.create({
      userMessage: message,
      botReply: replyText,
      isUnanswered: replyText.toLowerCase().includes("i don't know") || replyText.toLowerCase().includes("i'm sorry"),
    });

    res.json({ reply: replyText });

  } catch (error) {
    console.error("❌ Chatbot Error:", error);
    // Return the specific error to the user for debugging
    res.json({
      reply: `⚠️ **System Error**: I am unable to connect to the AI brain.\n\n**Details:**\n${error.message || "Unknown Error"}\n\nPlease check your API Keys in the backend .env file.`
    });
  }
};

module.exports = { handleChat };
