import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";
import { CHANNEL_POLICY, createConversationState, parseModelResult, SUPPORT_EMAIL } from "./conversation-policy.js";

async function lookupCatalog(pool, message) {
  if (!pool || typeof message !== "string") return "";
  const terms = (message.toUpperCase().match(/\b[A-Z0-9-]{3,20}\b/g) || []).slice(0, 3);
  const rows = [];
  for (const term of terms) {
    const result = await pool.query(
      `SELECT sku, duty, oem_codes, competitor_codes, height_mm, outer_diameter_mm
       FROM elimfilters_catalog
       WHERE UPPER(sku) = $1 OR UPPER(sku) LIKE $2
          OR oem_codes::text ILIKE $2 OR competitor_codes::text ILIKE $2
       LIMIT 2`,
      [term, `%${term}%`]
    );
    rows.push(...result.rows);
  }
  return rows.map((row) => JSON.stringify({
    sku: row.sku,
    duty: row.duty,
    height_mm: row.height_mm,
    outer_diameter_mm: row.outer_diameter_mm,
    oem_codes: row.oem_codes,
  })).join("\n");
}

export function createNvidiaClient({ apiKey, model, pool }) {
  const conversations = createConversationState();
  return {
    async generateReply(userMessage, context = {}) {
      const session = conversations.get(context.conversationId || context.authorId || "anonymous");
      let catalogEvidence = "";
      try {
        catalogEvidence = await lookupCatalog(pool, userMessage);
      } catch (error) {
        console.error("[catalog-lookup-error]", error.message);
      }
      if (!apiKey) {
        return `I can't verify this against the official ELIMFILTERS source right now. Please contact ${SUPPORT_EMAIL}.`;
      }

      const userPrompt = `${SYSTEM_PROMPT}
${CHANNEL_POLICY}

[SESSION]
greetingRequired=${!session.greeted}
buyerType=${session.buyerType}
unresolvedAttempts=${session.unresolved}
authorName=${context.authorName || ""}

[OFFICIAL ELIMFILTERS KNOWLEDGE]
${ELIMFILTERS_KNOWLEDGE}

[VERIFIED CATALOG ROWS]
${catalogEvidence || "NONE"}

[YOUTUBE COMMENT]
${userMessage}`;
      session.history = [...session.history, { role: "user", content: userMessage }].slice(-8);

      try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: model || "nvidia/nemotron-3-super-120b-a12b",
            messages: [
              { role: "system", content: CHANNEL_POLICY },
              ...session.history.slice(0, -1),
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2,
            max_tokens: 240,
            chat_template_kwargs: { enable_thinking: false }
          })
        });
        if (!response.ok) throw new Error(`NVIDIA NIM API error status ${response.status}`);
        const data = await response.json();
        return parseModelResult(data.choices?.[0]?.message?.content, session).reply;
      } catch (error) {
        console.error("[nvidia-nim]", error.message);
        return `I can't verify this against the official ELIMFILTERS source right now. Please contact ${SUPPORT_EMAIL}.`;
      }
    }
  };
}
