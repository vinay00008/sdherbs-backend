const Product = require("../models/Product");
const Category = require("../models/Category");
const PageContent = require("../models/PageContent");
const ChatKnowledge = require("../models/ChatKnowledge");
const ChatLog = require("../models/ChatLog");
const stringSimilarity = require("string-similarity");

// --- LOCAL AI ENGINE ---

// Helper: Normalize text for better matching
const normalize = (text) => text?.toLowerCase().trim().replace(/[?!.,]/g, "") || "";

// Helper: Find best match from a list of strings
const findBestMatch = (query, targets) => {
  if (!targets.length) return null;
  const matches = stringSimilarity.findBestMatch(query, targets);
  return matches.bestMatch; // { target: 'string', rating: 0.1 ~ 1.0 }
};

const handleChat = async (req, res) => {
  try {
    let { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Capture "Admin" attempts politely
    if (message.toLowerCase().includes("admin") || message.toLowerCase().includes("dashboard")) {
      return res.json({ reply: "🔒 That area is for staff only. But I can show you our public collections! [NAVIGATE: /products]" });
    }

    const { bestMatch, response } = await processLocalAI(message);

    // Log interaction
    await ChatLog.create({
      userMessage: message,
      botReply: response,
      isUnanswered: !bestMatch,
    });

    console.log(`🧠 AI Reply (${bestMatch ? 'Matched' : 'Fallback'}):`, response);
    res.json({ reply: response });

  } catch (error) {
    console.error("❌ Local AI Error:", error);
    res.status(500).json({ reply: "😇 Oops! I bumped into a small technical issue. Could you say that again?" });
  }
};

// --- SOPHISTICATED LOCAL AI ENGINE ---

// 1. Define Knowledge Maps (The "Brain")
const NAV_ROUTES = {
  "home page": "/",
  "main page": "/",
  "products page": "/products",
  "shop": "/products",
  "store": "/products",
  "collection": "/products",
  "about us": "/about",
  "our story": "/about",
  "company info": "/about",
  "contact us": "/contact",
  "support": "/contact",
  "call us": "/contact",
  "activity": "/activity",
  "events": "/activity",
  "activities": "/activity",
  "news": "/activity"
};

const SMALL_TALK = {
  "hello": "👋 Namaste! Welcome to SD Herbs. How can I assist you in your wellness journey today?",
  "hi": "👋 Hello there! Ready to explore the power of nature?",
  "how are you": "I'm great and fully updated! 🌿 Ready to help you find the best herbal products.",
  "who are you": "I am the SD Herbs Assistant, your personal guide to our natural products and services.",
  "thank you": "You're most welcome! 💚 Let me know if you need anything else.",
  "bye": "Goodbye! Stay healthy and natural. 🌿",
  "what can you do": "I can show you products, check prices, navigate the site for you, or switch to Dark Mode! Just ask.",
  "good morning": "Good morning! ☀️ a fresh start with fresh herbs?",
  "good night": "Good night! 🌙 Rest well.",
  "help": "I'd love to help! You can ask me to 'Show Products', 'Open Contact Page', or ask about any specific herb."
};

const INTENTS = {
  "dark mode": { action: "THEME_DARK", reply: "🌙 As you wish! Switching to Dark Mode." },
  "night mode": { action: "THEME_DARK", reply: "🌙 Easy on the eyes. Dark Mode activated." },
  "light mode": { action: "THEME_LIGHT", reply: "☀️ Let there be light! Switching to Light Mode." },
  "new products": { special: "NEW_ARRIVALS" },
  "latest items": { special: "NEW_ARRIVALS" },
  "categories": { special: "SHOW_CATEGORIES" },
  "all categories": { special: "SHOW_CATEGORIES" }
};

// 2. Core Processing Function
async function processLocalAI(rawMessage) {
  const userQuery = normalize(rawMessage);

  // A. FETCH LIVE DATA (The "Brain" Snapshot)
  const [products, categories, knowledgeBase] = await Promise.all([
    Product.find().select("name description category price").lean(),
    Category.find().select("name description").lean(),
    ChatKnowledge.find().select("question answer").lean(),
  ]);

  // --- LAYER 1: CATALOG STATISTICS (Count & Overview) ---
  if (userQuery.match(/(how many|total|number of) (product|item|herb)/)) {
    return { bestMatch: true, response: `🌿 We currently have **${products.length} premium herbal products** in our catalog, across **${categories.length} categories**.\n\nWould you like to see the **Latest Arrivals**?` };
  }

  if (userQuery.match(/(list|show|what) (all|everything|products|items)/)) {
    const names = products.slice(0, 5).map(p => `• ${p.name}`).join("\n");
    const remaining = Math.max(0, products.length - 5);
    return { bestMatch: true, response: `📋 **Here are some of our popular products:**\n\n${names}\n${remaining > 0 ? `...and ${remaining} more!` : ""}\n\n[NAVIGATE: /products]` };
  }

  // --- LAYER 2: EXACT & FUZZY NAVIGATION ---
  const navKeys = Object.keys(NAV_ROUTES);
  const navMatch = findBestMatch(userQuery, navKeys);
  if (navMatch && navMatch.rating > 0.45) {
    const route = NAV_ROUTES[navMatch.target];
    return { bestMatch: true, response: `🚀 Taking you there! [NAVIGATE: ${route}]` };
  }

  // --- LAYER 3: SMALL TALK & GREETINGS ---
  const talkKeys = Object.keys(SMALL_TALK);
  const talkMatch = findBestMatch(userQuery, talkKeys);
  if (talkMatch && talkMatch.rating > 0.6) {
    return { bestMatch: true, response: SMALL_TALK[talkMatch.target] };
  }

  // --- LAYER 4: SPECIAL INTENTS (Theme, New, Cats) ---
  const intentKeys = Object.keys(INTENTS);
  const intentMatch = findBestMatch(userQuery, intentKeys);
  if (intentMatch && intentMatch.rating > 0.55) {
    const intent = INTENTS[intentMatch.target];
    if (intent.action) return { bestMatch: true, response: `${intent.reply} [ACTION: ${intent.action}]` };

    if (intent.special === "NEW_ARRIVALS") {
      const newItems = products.slice(-3).reverse().map(p => `• [${p.name}](/products/${p._id})`).join("\n");
      return { bestMatch: true, response: `🆕 **Just Arrived:**\n\n${newItems}\n\n[NAVIGATE: /products]` };
    }

    if (intent.special === "SHOW_CATEGORIES") {
      const catList = categories.map(c => `• ${c.name}`).join("\n");
      return { bestMatch: true, response: `📂 **Explore our Categories:**\n\n${catList}` };
    }
  }

  // --- LAYER 5: DEEP KNOWLEDGE SEARCH (Benefit/Description Matching) ---
  // This is the "Advanced" part - searching INSIDE descriptions for keywords like "immunity", "skin", "energy"

  // 5a. Direct Product Name Match (High Priority)
  const productNames = products.map(p => p.name);
  const nameMatch = findBestMatch(userQuery, productNames);

  if (nameMatch && nameMatch.rating > 0.4) {
    const p = products.find(prod => prod.name === nameMatch.target);
    // Price specific check
    if (userQuery.includes("price") || userQuery.includes("cost") || userQuery.includes("rate") || userQuery.includes("kitne")) {
      return { bestMatch: true, response: `💰 The price for **${p.name}** is **₹${p.price}**.\n\nWant to buy it? [NAVIGATE: /products/${p._id}]` };
    }
    return { bestMatch: true, response: `🌿 **${p.name}**\n\n${p.description}\n\n💰 Price: ₹${p.price}\n\n[NAVIGATE: /products/${p._id}]` };
  }

  // 5b. Deep Search (Scanning Descriptions for benefits)
  // Split query into significant words (ignore 'the', 'is', 'for')
  const searchTerms = userQuery.split(" ").filter(w => w.length > 3 && !["what", "show", "give", "want", "have", "some"].includes(w));

  if (searchTerms.length > 0) {
    const deepMatches = products.filter(p => {
      const content = (p.name + " " + p.description + " " + (p.category?.name || "")).toLowerCase();
      // Check if ANY significant search term is in the content
      return searchTerms.some(term => content.includes(term));
    });

    if (deepMatches.length > 0) {
      // If too many, show top 3
      const topMatches = deepMatches.slice(0, 3);
      const linkList = topMatches.map(p => `• [${p.name}](/products/${p._id})`).join("\n");

      if (deepMatches.length === 1) {
        const p = deepMatches[0];
        return { bestMatch: true, response: `💡 I found a perfect match for that:\n\n🌿 **${p.name}**\n${p.description}\n\n[NAVIGATE: /products/${p._id}]` };
      }

      return { bestMatch: true, response: `💡 I found **${deepMatches.length} products** related to your search:\n\n${linkList}\n\nWould you like to see all? [NAVIGATE: /products]` };
    }
  }

  // --- LAYER 6: KNOWLEDGE BASE (FAQ) ---
  const kbQuestions = knowledgeBase.map(k => k.question);
  const kbMatch = findBestMatch(userQuery, kbQuestions);
  if (kbMatch && kbMatch.rating > 0.5) {
    const answer = knowledgeBase.find(k => k.question === kbMatch.target)?.answer;
    return { bestMatch: true, response: answer };
  }

  // --- LAYER 7: LEAD CAPTURE ---
  const phoneMatch = rawMessage.match(/[6-9]\d{9}/);
  if (phoneMatch) {
    const Enquiry = require("../models/Enquiry");
    await Enquiry.create({ name: "Chat User", phone: phoneMatch[0], message: `[Auto-Lead] ${rawMessage}`, status: "New" });
    return { bestMatch: true, response: "✅ Details received! Our expert will call you shortly." };
  }

  // --- LAYER 8: SMART FALLBACK ---
  return {
    bestMatch: false,
    response: "🤔 I understand you're looking for something specific. I'm an expert on our **Herbal Products**.\n\nTry asking:\n- *\"Something for immunity\"*\n- *\"How many products you have?\"*\n- *\"Price of Shilajit\"*\n\nOr reply with your **Phone Number** for a callback!"
  };
}

module.exports = { handleChat };
