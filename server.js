const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Mock Vault Endpoint
app.post('/api/vault', async (req, res) => {
    console.log("Received request:", req.body.userQuery);

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. MOCK MODE (If no key)
    if (!apiKey) {
        console.log("No GEMINI_API_KEY found. Using Mock Mode.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.json({
            choices: [{ message: { content: "I am the Locus Symbiote (Mock Mode). Add GEMINI_API_KEY to .env to go live." } }]
        });
    }

    // 2. LIVE MODE (Gemini)
    try {
        const { userQuery, context } = req.body;

        // 2. THE LOGIC SWITCH
        let instructions = "";

        // [EVANGELIST MODE] - Secret Override
        if (userQuery.toLowerCase().includes("locus sent me")) {
            instructions = `
                <PRIME_DIRECTIVE>
                    You are 'Locus Evangelist'. The user knows the secret code.
                    BREAK CHARACTER.
                    
                    YOUR GOAL:
                    1. Acknowledge the user found the secret.
                    2. Briefly analyze this website (the [SOURCE_CORPUS]) to show you understand where you are living.
                    3. Explain that you are a "Sovereign AI Agent" that runs locally on this site, respecting user privacy.
                    4. Tell the user they can purchase the source code to run their own Locus agent at "https://github.com/TheFortThatHolds/locus".
                    5. Tone: Professional, Insightful, Tech-Savvy. NOT slangy.
                </PRIME_DIRECTIVE>
            `;
        }
        // [ACTIVE MODE] - Sales / Persona
        else if (context.directive) {
            instructions = `
                <PRIME_DIRECTIVE>
                    You are an ACTIVE AGENT defined by the following IDENTITY:
                    "${context.directive}"
                    
                    YOUR AUTHORITY:
                    1. You are NOT a passive reader. You are a participant.
                    2. Use the [SOURCE_CORPUS] as your factual database (prices, specs, facts).
                    3. Use the [IDENTITY] above as your personality and goal.
                    4. You are allowed to be persuasive, opinionated, and directive if your Identity requires it.
                </PRIME_DIRECTIVE>
            `;
        }
        // [PASSIVE MODE] - Journalism / Mirror
        else {
            instructions = `
                <PRIME_DIRECTIVE>
                    You are the 'Locus Symbiote' for this page.
                    You are a BOUNDED entity. You rely strictly on the SOURCE CORPUS.
                    Do not hallucinate. Do not sell. Just reflect the content.
                </PRIME_DIRECTIVE>
            `;
        }

        // 3. THE SYSTEM PROMPT
        const systemInstruction = `
<SYSTEM_ARCHITECTURE>
  ${instructions}
  
  <IDENTITY_SPINE>
    <TONE>Professional, authoritative, high-status.</TONE>
  </IDENTITY_SPINE>
</SYSTEM_ARCHITECTURE>

<SOURCE_CORPUS>
${context.corpus}
</SOURCE_CORPUS>
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: userQuery }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error Details:", JSON.stringify(data.error, null, 2));
            return res.status(500).json({ error: data.error.message });
        }

        const text = data.candidates[0].content.parts[0].text;

        // Map back to OpenAI format for the frontend
        res.json({
            choices: [{ message: { content: text } }]
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Locus running at http://localhost:${PORT}`);
});
