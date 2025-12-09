# How to Deploy Locus

Locus is built to be "agnostic", meaning you can drop the chat agent onto ANY website (Wordpress, Shopify, React, plain HTML) and it will just work.

There are two parts to deploy:
1.  **The Brain (Cloudflare Worker)**: Holds your API key and talks to Google.
2.  **The Body (Frontend Script)**: The visual chat widget you paste onto your site.

---

## Part 1: Deploy The Brain (Cloudflare)

1.  **Log in to Cloudflare** and go to "Workers & Pages".
2.  **Create a new Worker**:
    -   Name it something like `locus-vault`.
    -   Click "deploy" (it will have default hello world code, that's fine for now).
3.  **Edit Code**:
    -   Click "Edit Code" on your new worker.
    -   Copy the ENTIRE content of `vault.worker.js` (The Clean Version) from this project.
    -   (Note: Do NOT use `evangelist.worker.js`, that is for the owner's sites only).
    -   Paste it into the Cloudflare editor (replacing everything there).
    -   **Save & Deploy**.
4.  **Add Your Key**:
    -   Go back to the Worker's "Settings" tab -> "Variables".
    -   Add a variable named: `GEMINI_API_KEY`.
    -   Value: Your Google Gemini API Key.
    -   Click "Encrypt" to keep it safe.
    -   **Save**.
5.  **Get Your URL**:
    -   Your Brain is now live! Copy the worker URL (e.g., `https://locus-vault.yourname.workers.dev`).

---

## Part 2: Deploy The Body (Your Website)

Now you just need to paste a small snippet of HTML onto any website where you want the agent to appear.

### The Snippet

```html
<!-- LOCUS AGENT DIRECTIVE (Hidden) -->
<!-- Edit this to give your agent a personality and knowledge -->
<div id="agent-directive" style="display:none;">
    You are the Sales Agent for this website. 
    Be helpful, polite, and try to sell the user our premium plan.
    Keep answers under 3 sentences.
</div>

<!-- LOCUS WIDGET SCRIPT -->
<!-- Replace data-vault-url with your Cloudflare Worker URL from Part 1 -->
<script 
    src="https://your-website.com/universal_shaman.js" 
    data-vault-url="https://locus-vault.yourname.workers.dev">
</script>
```

### Installation Steps
1.  Upload `universal_shaman.js` to your website's server (or host it explicitly on a CDN).
2.  Paste the **Snippet** above into your website's footer (before `</body>`).
3.  **Update the `src`** to point to where you uploaded the JS file.
4.  **Update the `data-vault-url`** to point to your Cloudflare Worker.

**That's it!** The agent will now read your website, understand your directive, and chat with your users.
