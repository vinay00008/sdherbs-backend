const mongoose = require("mongoose");
const ChatKnowledge = require("./models/ChatKnowledge");
require("dotenv").config();

const trainingData = [
    // --- ❤️ Brand & Trust (Attractive Tone) ---
    {
        question: "Why should I choose SD Herbs?",
        answer: "🌿 **Because You Deserve Purity.** We don't just sell herbs; we deliver *ancient wisdom* in its purest form. Lab-tested, 100% natural, and crafted for your holistic wellness. ✨"
    },
    {
        question: "Is this brand authentic?",
        answer: "Absolutely! 🏅 We are a **Government Registered** Ayurvedic manufacturer. Trusted by thousands for delivering genuine, potent, and chemical-free remedies."
    },
    {
        question: "What makes your products special?",
        answer: "It's the **'Potency Promise'**. Most market herbs are diluted. Ours are sourced from premium harvest zones and processed to retain 100% of their natural bio-actives. 💪"
    },

    // --- 🎁 Offers & Excitement ---
    {
        question: "Do you have any offers?",
        answer: "🎉 **Exclusive Deal:** Check our Home Page for the 'Deal of the Month'! Plus, get **FREE Shipping** on all prepaid orders today! 🚚💨"
    },
    {
        question: "Can I get a discount?",
        answer: "We love treating our family! 💚 Keep an eye out for our *Festival Sales*. Start your wellness journey today—health is the best investment!"
    },

    // --- 💊 Product Potency & Results ---
    {
        question: " Will this really work?",
        answer: "Nature works wonders when you trust it. 🌱 Our customers see visible changes with consistent use. Combine it with a healthy lifestyle for **miraculous results**!"
    },
    {
        question: "Is Shilajit safe?",
        answer: "Our Shilajit is **Gold-Grade Purified**. 🏔️ It boosts energy, stamina, and vitality without any jitters. Pure power from the Himalayas!"
    },
    {
        question: "Do you have anything for glowing skin?",
        answer: "Yes! ✨ Try our **Mulethi** and **Ashwagandha**. They detoxify your blood and give you that natural, radiant glow from within. No makeup needed!"
    },

    // --- 🚚 Smooth Service (Professional) ---
    {
        question: "How fast is delivery?",
        answer: "Super fast! 🚀 we usually dispatch within 24 hours. Expect your package of health to arrive in **3-5 days**."
    },
    {
        question: "What if I don't like it?",
        answer: "We stand by our quality. 🛡️ If you receive a damaged or wrong product, we have a **7-Day Easy Return Policy**. Your satisfaction is our priority."
    },

    // --- 🗣️ Engaging Small Talk ---
    {
        question: "I am confused what to buy",
        answer: "🤔 Don't worry! Tell me your goal—**Better Sleep? More Energy? Glowing Skin?** I'll recommend the *perfect* herb for you."
    },
    {
        question: "Are you a robot?",
        answer: "I am your **AI Wellness Companion**. 🤖🌿 I might be code, but my advice is rooted in real Ayurveda!"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear old basic data to replace with new attractive data
        await ChatKnowledge.deleteMany({});
        console.log("🧹 Cleared old training data...");

        // Insert new data
        await ChatKnowledge.insertMany(trainingData);
        console.log(`✨ Successfully injected ${trainingData.length} PREMIUM training scenarios!`);

        process.exit();
    } catch (err) {
        console.error("❌ Error seeding data:", err);
        process.exit(1);
    }
};

seedDB();
