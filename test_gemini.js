const path = require('path');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No GEMINI_API_KEY found in .env");
    process.exit(1);
}

async function listModels() {
    console.log("Testing API Key...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            require('fs').writeFileSync('models.json', JSON.stringify(data.error, null, 2));
        } else {
            require('fs').writeFileSync('models.json', JSON.stringify(data.models, null, 2));
            console.log("Wrote models to models.json");
        }
    } catch (e) {
        console.error("Network Error:", e);
    }
}

listModels();
