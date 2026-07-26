const LEAK_PATTERNS=[
 /\b(okay|ok),?\s+(let['’]?s|let us)\s+(see|think)/i,
 /\b(the user|user is asking|i need to|we need to|first,? i|the rules say|according to the rules)\b/i,
 /\b(analysis|reasoning|chain[- ]of[- ]thought|system prompt|developer message|hidden instructions?)\b/i,
 /\b(el usuario|necesito (?:recordar|analizar|responder)|las reglas dicen|según las reglas|razonamiento interno)\b/i,
 /CONOCIMIENTO BASE OFICIAL|BÚSQUEDA EN TIEMPO REAL|VALIDATED CONTEXT/i,
 /<\/?think>/i
];
export function safeReply(raw){
 const text=String(raw||"").replace(/<think>[\s\S]*?<\/think>/gi,"").trim();
 if(!text||LEAK_PATTERNS.some(p=>p.test(text))) throw new Error("unsafe model output blocked");
 return text;
}
export function detectLanguage(text){
 const v=String(text||"").toLowerCase();
 if(/[¿¡ñáéíóúü]/.test(v)||/\b(hola|necesito|equipo|problema|empresa|flota|filtro)\b/.test(v)) return "Spanish";
 if(/[ãõç]/.test(v)||/\b(olá|preciso|equipamento|empresa|frota)\b/.test(v)) return "Portuguese";
 if(/[àâçéèêëîïôùûüÿœ]/.test(v)||/\b(bonjour|besoin|équipement|entreprise)\b/.test(v)) return "French";
 return "English";
}
