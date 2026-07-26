import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";
import {safeReply,detectLanguage} from "./safety.js";
const SUPPORT="support@elimfilters.com";

export function createNvidiaClient({apiKey,model,pool}){
 return {async generateReply(userMessage){
  let catalogContext="";
  if(pool&&typeof userMessage==="string"){
   const codes=userMessage.trim().toUpperCase().match(/\b(?=[A-Z0-9-]{4,15}\b)(?=[A-Z0-9-]*\d)[A-Z0-9-]+\b/g)||[];
   const rows=[];
   for(const term of codes.slice(0,3)){
    try{
     const res=await pool.query(`SELECT sku,duty,oem_codes,competitor_codes,height_mm,outer_diameter_mm
      FROM elimfilters_catalog WHERE UPPER(sku)=$1 OR UPPER(sku) LIKE $2
      OR oem_codes::text ILIKE $2 OR competitor_codes::text ILIKE $2 LIMIT 2`,[term,`%${term}%`]);
     rows.push(...res.rows);
    }catch(err){console.error("[catalog-lookup-error]",err.message);}
   }
   if(rows.length) catalogContext=rows.map(r=>JSON.stringify({sku:r.sku,duty:r.duty,height_mm:r.height_mm,outer_diameter_mm:r.outer_diameter_mm,oem_codes:r.oem_codes})).join("\n");
  }
  const language=detectLanguage(userMessage);
  if(!apiKey) {
   const fallback={Spanish:`No puedo validar la respuesta con información oficial en este momento. Escribí a ${SUPPORT}.`,Portuguese:`Não consigo validar a resposta com informações oficiais agora. Escreva para ${SUPPORT}.`,French:`Je ne peux pas valider la réponse avec des informations officielles actuellement. Écrivez à ${SUPPORT}.`,English:`I cannot validate the answer against official information right now. Please contact ${SUPPORT}.`};
   return fallback[language]||fallback.English;
  }
  const prompt=`${SYSTEM_PROMPT}
STRICT CONTRACT:
- Output only the customer-facing answer in ${language}; never output reasoning, rules, labels or JSON.
- Diagnose the asset, symptom, operating condition and risk before proposing a filtration medium.
- Use only ELIMFILTERS data below. Never invent facts or disparage a person, competitor or external technology.
- Answer intent first; then ask at most one natural question to qualify B2B (fleet, workshop, distributor, importer, company, volume) or B2C (one personal asset) toward the appropriate authorized distributor.
- Do not repeat greetings.
- If evidence is insufficient, request one missing application detail or refer to ${SUPPORT}.
ELIMFILTERS DATA:
${ELIMFILTERS_KNOWLEDGE}
VALIDATED CATALOG MATCHES:
${catalogContext||"NONE"}
CUSTOMER MESSAGE:
${userMessage}`;
  const res=await fetch("https://integrate.api.nvidia.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${apiKey}`},body:JSON.stringify({
   model:model||"nvidia/nemotron-3-super-120b-a12b",messages:[{role:"user",content:prompt}],temperature:0.1,max_tokens:240,chat_template_kwargs:{enable_thinking:false}
  })});
  if(!res.ok) throw new Error(`NVIDIA NIM API error status ${res.status}`);
  const data=await res.json();
  return safeReply(data.choices?.[0]?.message?.content);
 }};
}
