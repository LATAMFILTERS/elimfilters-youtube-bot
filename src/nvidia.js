import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";

export function createNvidiaClient({ apiKey, model }) {
  return {
    async generateReply(userMessage) {
      if (!apiKey) {
        return `Hola, gracias por comentar en el canal de ELIMFILTERS. Para consultar números de parte y equivalencias, usa nuestro buscador oficial: https://part-search.elimfilters.com. Para más información visita https://elimfilters.com.`;
      }

      const prompt = `${SYSTEM_PROMPT}\n\n[CONOCIMIENTO BASE OFICIAL]:\n${ELIMFILTERS_KNOWLEDGE}\n\n[COMENTARIO EN YOUTUBE]: "${userMessage}"\n\nResponde concisamente:`;

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
        return reply || `Gracias por escribir a ELIMFILTERS. Puedes consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      } catch (err) {
        console.error("[nvidia-nim]", err.message);
        return `Gracias por escribir a ELIMFILTERS. Puedes consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      }
    }
  };
}
