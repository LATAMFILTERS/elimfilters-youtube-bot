import test from "node:test";
import assert from "node:assert/strict";
import {safeReply,detectLanguage} from "../src/safety.js";
test("blocks internal reasoning in English and Spanish",()=>{
 assert.throws(()=>safeReply("Okay, let's see. The user needs a filter."),/blocked/);
 assert.throws(()=>safeReply("El usuario pregunta. Necesito analizar la respuesta."),/blocked/);
});
test("detects customer language and allows final response",()=>{
 assert.equal(detectLanguage("Necesito proteger una flota de camiones"),"Spanish");
 assert.equal(safeReply("¿Qué síntoma observás y en cuántas unidades ocurre?"),"¿Qué síntoma observás y en cuántas unidades ocurre?");
});
