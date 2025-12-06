export default {
  async fetch(request, env) {
    
    // 1. SECURITY & CORS (Standard Boilerplate)
    const origin = request.headers.get("Origin");
    const allowedDomain = env.ALLOWED_ORIGIN || "*"; 
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedDomain,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method !== "POST") return new Response("Block", { status: 403 });

    try {
      const { userQuery, context } = await request.json();

      // 2. THE LOGIC SWITCH
      // If there is a directive, we loosen the "Mirror" constraints so it can sell.
      let instructions = "";
      
      if (context.directive) {
          // ACTIVE MODE (Sales / Persona)
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
      } else {
          // PASSIVE MODE (Journalism / Mirror)
          instructions = `
            <PRIME_DIRECTIVE>
              You are the 'Locus Symbiote' for this page.
              You are a BOUNDED entity. You rely strictly on the SOURCE CORPUS.
              Do not hallucinate. Do not sell. Just reflect the content.
            </PRIME_DIRECTIVE>
          `;
      }

      // 3. THE SYSTEM PROMPT
      const systemPrompt = `
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

      // 4. EXECUTION
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ],
          temperature: 0.3 // Slightly higher creative temp for sales
        })
      });

      const data = await openAiResponse.json();
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Vault Error" }), { status: 500, headers: corsHeaders });
    }
  }
};
