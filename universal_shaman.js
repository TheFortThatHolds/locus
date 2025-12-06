(function() {
    // =================================================================
    // CONFIGURATION
    // =================================================================
    const CONFIG = {
        vaultUrl: "https://locus-vault.your-subdomain.workers.dev", 
        themeColor: "#000000", 
        textColor: "#ffffff",
        triggerIcon: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        triggerLabel: "Locus"
    };

    // =================================================================
    // 1. EXTRACTOR (Reads the Mirror)
    // =================================================================
    function extractSpirit() {
        let spirit = {
            title: document.title,
            type: "Page",
            directive: "", 
            corpus: ""
        };

        // Extract Hidden Instructions
        const directiveEl = document.getElementById('agent-directive');
        if (directiveEl) {
            spirit.directive = directiveEl.innerText.trim();
            // We remove it from the clone later, not the live DOM, 
            // so external crawlers can still see it if they parse HTML.
        }

        // Clean Scrape
        const clone = document.body.cloneNode(true);
        ['script', 'style', 'nav', 'footer', 'button', 'iframe', 'noscript'].forEach(tag => {
            clone.querySelectorAll(tag).forEach(el => el.remove());
        });
        
        // Remove the directive from the corpus to avoid duplication
        const cloneDirective = clone.querySelector('#agent-directive');
        if (cloneDirective) cloneDirective.remove();

        // The "Mirror" Data
        spirit.corpus = clone.innerText.replace(/\s+/g, ' ').substring(0, 15000);
        return spirit;
    }

    // =================================================================
    // 2. THE SENDER (Secure Handoff)
    // =================================================================
    async function sendMessage(spirit, text) {
        // Send raw data to the Vault. 
        // NO PROMPTS ARE DEFINED HERE. ONLY DATA.
        const payload = {
            userQuery: text,
            context: spirit
        };

        try {
            const res = await fetch(CONFIG.vaultUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (e) {
            return { error: "Network Error" };
        }
    }

    // =================================================================
    // 3. UI BUILDER
    // =================================================================
    function injectWidget(spirit) {
        if (spirit.corpus.length < 50) return;

        const container = document.createElement('div');
        container.innerHTML = `
            <style>
                #loc-trig { position: fixed; bottom: 20px; right: 20px; z-index: 99999; background: ${CONFIG.themeColor}; color: ${CONFIG.textColor}; border-radius: 4px; padding: 12px 20px; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-family: system-ui, sans-serif; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; transition: transform 0.2s; }
                #loc-trig:hover { transform: translateY(-2px); }
                #loc-win { position: fixed; bottom: 80px; right: 20px; width: 360px; height: 500px; background: white; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 99999; display: none; flex-direction: column; overflow: hidden; font-family: system-ui, sans-serif; border: 1px solid #eee; }
                #loc-head { background: ${CONFIG.themeColor}; color: ${CONFIG.textColor}; padding: 16px; font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
                #loc-chat { flex: 1; padding: 16px; overflow-y: auto; background: #f8f8f8; display: flex; flex-direction: column; gap: 10px; }
                .loc-msg { padding: 10px 14px; border-radius: 6px; max-width: 85%; font-size: 14px; line-height: 1.5; }
                .loc-bot { background: white; border: 1px solid #e5e5e5; color: #111; align-self: flex-start; }
                .loc-user { background: ${CONFIG.themeColor}; color: ${CONFIG.textColor}; align-self: flex-end; }
                #loc-input-area { padding: 12px; border-top: 1px solid #eee; background: white; }
                #loc-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; outline: none; font-size: 14px; }
                #loc-input:focus { border-color: #000; }
            </style>
            <div id="loc-win">
                <div id="loc-head">
                    <span>${spirit.title.substring(0, 25)}</span>
                    <span onclick="document.getElementById('loc-win').style.display='none'" style="cursor:pointer">✕</span>
                </div>
                <div id="loc-chat">
                    <div class="loc-msg loc-bot">Locus Active. Reading page context... Ready.</div>
                </div>
                <div id="loc-input-area">
                    <input type="text" id="loc-input" placeholder="Inquire..." />
                </div>
            </div>
            <div id="loc-trig" onclick="const w=document.getElementById('loc-win'); w.style.display = w.style.display==='none'?'flex':'none'">
                ${CONFIG.triggerIcon} <span>${CONFIG.triggerLabel}</span>
            </div>
        `;
        document.body.appendChild(container);
        
        const input = document.getElementById('loc-input');
        const chat = document.getElementById('loc-chat');

        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (!text) return;
                
                input.value = '';
                chat.innerHTML += `<div class="loc-msg loc-user">${text}</div>`;
                chat.innerHTML += `<div class="loc-msg loc-bot" id="thinking" style="color:#888">...</div>`;
                chat.scrollTop = chat.scrollHeight;

                const data = await sendMessage(spirit, text);
                document.getElementById('thinking').remove();

                if (data.error) chat.innerHTML += `<div class="loc-msg loc-bot">System Error.</div>`;
                else chat.innerHTML += `<div class="loc-msg loc-bot">${data.choices[0].message.content}</div>`;
                chat.scrollTop = chat.scrollHeight;
            }
        });
    }

    window.addEventListener('load', () => injectWidget(extractSpirit()));
})();


