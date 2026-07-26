import test from "node:test";
import assert from "node:assert/strict";
import { createConversationState, parseModelResult, SUPPORT_EMAIL } from "../src/conversation-policy.js";

test("resolved answers require ELIMFILTERS evidence and reset unresolved attempts", () => {
  const session = createConversationState().get("customer");
  session.unresolved = 3;
  const result = parseModelResult(JSON.stringify({
    reply: "ELIMFILTERS does not sell retail.",
    outcome: "resolved",
    buyerType: "B2C",
    evidence: ["ELIMFILTERS retail policy"]
  }), session);
  assert.equal(result.outcome, "resolved");
  assert.equal(session.unresolved, 0);
  assert.equal(session.buyerType, "B2C");
});

test("unsupported answers are blocked and escalated", () => {
  const session = createConversationState().get("customer");
  const result = parseModelResult(JSON.stringify({
    reply: "Unverified answer",
    outcome: "resolved",
    buyerType: "unknown",
    evidence: []
  }), session);
  assert.equal(result.outcome, "no_evidence");
  assert.match(result.reply, new RegExp(SUPPORT_EMAIL.replace(".", "\\.")));
});

test("fifth unresolved turn includes support escalation", () => {
  const session = createConversationState().get("customer");
  session.unresolved = 4;
  const result = parseModelResult(JSON.stringify({
    reply: "Which equipment model do you use?",
    outcome: "follow_up",
    buyerType: "B2B",
    evidence: []
  }), session);
  assert.equal(session.unresolved, 5);
  assert.match(result.reply, new RegExp(SUPPORT_EMAIL.replace(".", "\\.")));
});
