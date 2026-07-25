import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";

export function createNvidiaClient({ apiKey, model, pool }) {
  return {
    async generateReply(userMessage) {
      let catalogContext = "";

      // 1. Live Catalog Lookup if user message contains potential part number or VIN
      if (pool && typeof userMessage === "string") {
        const cleanedMsg = userMessage.trim().toUpperCase();
        const codeMatches = cleanedMsg.match(/\b[A-Z0-9\-]{3,15}\b/g) || [];
        
        if (codeMatches.length > 0) {
          try {
            const searchTerms = codeMatches.slice(0, 3);
            const foundRows = [];

            for (const term of searchTerms) {
              const res = await pool.query(
                `SELECT sku, duty, oem_codes, competitor_codes, height_mm, outer_diameter_mm
                 FROM elimfilters_catalog
                 WHERE UPPER(sku) = $1
                    OR UPPER(sku) LIKE $2
                    OR oem_codes::text ILIKE $2
                    OR competitor_codes::text ILIKE $2
                 LIMIT 2`,
                [term, `%${term}%`]
              );
              if (res.rows.length > 0) {
                foundRows.push(...res.rows);
              }
            }

            if (foundRows.length > 0) {
              const itemsText = foundRows.map(r => 
                `- SKU ELIMFILTERS: ${r.sku} (${r.duty || 'Standard'}) | Dimensiones: Altura ${r.height_mm || 'N/A'}mm, DE ${r.outer_diameter_mm || 'N/A'}mm | Equivalencias OEM: ${JSON.stringify(r.oem_codes || {})}`
              ).join("\n");
              catalogContext = `\n\n[BÚSQUEDA EN TIEMPO REAL EN BASE DE DATOS CATÁLOGO ELIMFILTERS]:\nResultados exactos encontrados:\n${itemsText}\n\nInstrucción: Menciona explícitamente el SKU ELIMFILTERS encontrado y sus detalles al usuario.`;
            }
          } catch (err) {
            console.error("[catalog-lookup-error]", err.message);
          }
        }
      }

      if (!apiKey) {
        if (catalogContext) {
          return `Hola, gracias por comentar en ELIMFILTERS. ${catalogContext.replace(/\n+/g, ' ')} Para más información visita https://elimfilters.com/instagram.`;
        }
        return `Hola, gracias por comentar en el canal de ELIMFILTERS. Para consultar números de parte y equivalencias, usa nuestro buscador oficial: https://elimfilters.com/instagram. Para más información visita https://elimfilters.com.`;
      }

      const prompt = `${SYSTEM_PROMPT}\n\n[CONOCIMIENTO BASE OFICIAL]:\n${ELIMFILTERS_KNOWLEDGE}${catalogContext}\n\n[COMENTARIO EN YOUTUBE]: "${userMessage}"\n\nResponde concisamente:`;

      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || "nvidia/nemotron-3-super-120b-a12b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 200
          })
        });

        if (!res.ok) {
          throw new Error(`NVIDIA NIM API error status ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        return reply || `Gracias por escribir a ELIMFILTERS. Puedes consultar nuestro catálogo en https://elimfilters.com/instagram.`;
      } catch (err) {
        console.error("[nvidia-nim]", err.message);
        return `Gracias por escribir a ELIMFILTERS. Puedes consultar nuestro catálogo en https://elimfilters.com/instagram.`;
      }
    }
  };
}
