require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking Gemini Key:", key ? "Present" : "Missing");

    if (!key) {
        console.error("❌ No API Key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log(`📡 Sending GET request to: ${url.replace(key, 'HIDDEN_KEY')}`);
        const response = await axios.get(url);

        console.log("\n✅ API Connection Successful!");

        if (response.data && response.data.models) {
            console.log(`\n📋 Found ${response.data.models.length} Models. Listing first 15:`);
            response.data.models.slice(0, 15).forEach(model => {
                console.log(`- ${model.name}`);
            });
        } else {
            console.log("⚠️ No models found in response.");
            console.log(JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error("\n❌ API Request Failed!");
        if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

listModels();
