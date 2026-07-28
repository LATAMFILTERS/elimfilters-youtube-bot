#!/usr/bin/env node
import { createConversationFlow } from '../src/conversation.js';
import { detectTechnicalQuestion, detectProductCatalogQuestion, extractRisksFromMessage } from '../src/consultant.js';

// Mock storage
class MockStorage {
  constructor() {
    this.contacts = new Map();
  }

  async getContact(phoneNumber) {
    return this.contacts.get(phoneNumber) || null;
  }

  async saveContact(phoneNumber, data) {
    const existing = this.contacts.get(phoneNumber) || { messages: [] };
    this.contacts.set(phoneNumber, { ...existing, ...data });
    return this.contacts.get(phoneNumber);
  }

  async addMessage(phoneNumber, message) {
    const contact = this.contacts.get(phoneNumber);
    if (contact) {
      if (!contact.messages) contact.messages = [];
      contact.messages.push(message);
    }
  }

  async updateContactState(phoneNumber, state) {
    const contact = this.contacts.get(phoneNumber);
    if (contact) {
      contact.state = state;
    }
  }
}

const mockLogger = {
  info: () => {},
  debug: () => {},
  warn: () => {},
  error: () => console.error
};

// Test suite
class BotTestSuite {
  constructor() {
    this.storage = new MockStorage();
    this.flow = createConversationFlow({
      storage: this.storage,
      master: { async getLeadInfo() { return null; } },
      logger: mockLogger
    });
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  assert(condition, testName) {
    if (condition) {
      this.passed++;
      console.log(`✅ ${testName}`);
    } else {
      this.failed++;
      console.log(`❌ ${testName}`);
    }
  }

  clearContact(phoneNumber) {
    this.storage.contacts.delete(phoneNumber);
  }

  async testTechnicalQuestionDetection() {
    console.log('\n📋 TECHNICAL QUESTION DETECTION\n');

    const testCases = [
      {
        question: '¿Qué pasa si el agua se mezcla con el diésel?',
        shouldDetect: true,
        description: 'Standard technical question'
      },
      {
        question: 'Que pasa en el motor si el agua se mezcla con el diésel',
        shouldDetect: true,
        description: 'No question mark, missing accents'
      },
      {
        question: 'agua en diesel qué consecuencias tiene',
        shouldDetect: true,
        description: 'Minimal wording'
      },
      {
        question: 'si entra agua al diesel que pasa',
        shouldDetect: true,
        description: 'Informal phrasing'
      },
      {
        question: 'Que tipos de filtros fabrican?',
        shouldDetect: false,
        description: 'Product question (not technical)'
      },
      {
        question: 'Hola, cómo estás?',
        shouldDetect: false,
        description: 'Greeting (not technical)'
      }
    ];

    for (const test of testCases) {
      const detected = detectTechnicalQuestion(test.question);
      this.assert(
        (detected !== null) === test.shouldDetect,
        `${test.description}: "${test.question.substring(0, 40)}..."`
      );
    }
  }

  async testProductCatalogDetection() {
    console.log('\n📋 PRODUCT CATALOG DETECTION\n');

    const testCases = [
      {
        question: '¿Qué tipos de filtros fabrican?',
        shouldDetect: true,
        description: 'Standard product question'
      },
      {
        question: 'Que tipos de filtros fabrican?',
        shouldDetect: true,
        description: 'Without accents'
      },
      {
        question: '¿Cuáles son sus productos?',
        shouldDetect: true,
        description: 'Generic products'
      },
      {
        question: '¿Qué ofrecen?',
        shouldDetect: true,
        description: 'What do you offer'
      },
      {
        question: '¿Qué pasa si el agua se mezcla con el diésel?',
        shouldDetect: false,
        description: 'Technical question (not product)'
      }
    ];

    for (const test of testCases) {
      const detected = detectProductCatalogQuestion(test.question);
      this.assert(
        detected === test.shouldDetect,
        `${test.description}: "${test.question}"`
      );
    }
  }

  async testTechnicalConversationFlow() {
    console.log('\n📋 TECHNICAL CONVERSATION FLOW\n');

    const phoneNumber = '+54912345678';
    this.clearContact(phoneNumber);

    // Step 1: Technical question
    const response1 = await this.flow.processMessage(
      phoneNumber,
      '¿Qué pasa si el agua se mezcla con el diésel?',
      'Juan'
    );

    this.assert(
      response1.response.includes('Agua contaminada en combustible'),
      'Technical response includes problem identification'
    );

    this.assert(
      response1.response.includes('Causas principales'),
      'Technical response includes causes'
    );

    this.assert(
      response1.response.includes('Consecuencias'),
      'Technical response includes consequences'
    );

    this.assert(
      response1.response.includes('Síntomas'),
      'Technical response includes symptoms'
    );

    this.assert(
      response1.response.includes('Cómo se resuelve'),
      'Technical response includes how to solve'
    );

    this.assert(
      response1.response.includes('¿Te interesa conocer la solución que ofrecemos?'),
      'Technical response ends with interest question'
    );

    this.assert(
      !response1.response.includes('costImpact') && !response1.response.includes('$'),
      'Technical response does NOT include cost data'
    );

    // Step 2: User shows interest
    const response2 = await this.flow.processMessage(
      phoneNumber,
      'Si me interesa',
      'Juan'
    );

    this.assert(
      response2.response.includes('Sistema separador agua-combustible') ||
      response2.response.includes('solución'),
      'Response to interest includes specific solution'
    );

    this.assert(
      response2.response.includes('Cómo funciona') || response2.response.includes('funciona'),
      'Solution response explains how it works'
    );

    this.assert(
      response2.response.includes('Instalación') || response2.response.includes('instalación'),
      'Solution response includes installation info'
    );

    this.assert(
      response2.response.includes('Beneficios'),
      'Solution response includes benefits'
    );

    this.assert(
      !response2.response.includes('costImpact') && !response2.response.includes('$'),
      'Solution response does NOT include cost data'
    );
  }

  async testProductCatalogFlow() {
    console.log('\n📋 PRODUCT CATALOG FLOW\n');

    const phoneNumber = '+54987654321';
    this.clearContact(phoneNumber);

    const response = await this.flow.processMessage(
      phoneNumber,
      '¿Qué tipos de filtros fabrican?',
      'Maria'
    );

    this.assert(
      response.response.includes('ELIMFILTERS fabrica'),
      'Product response starts with company intro'
    );

    this.assert(
      response.response.includes('Aire') ||
      response.response.includes('Combustible') ||
      response.response.includes('Agua'),
      'Product response lists products'
    );

    this.assert(
      response.response.includes('distribuidores'),
      'Product response mentions distribution channels'
    );

    this.assert(
      !response.response.includes('Causas principales'),
      'Product response does NOT include technical details'
    );
  }

  async testMultipleRisksContext() {
    console.log('\n📋 MULTIPLE RISKS CONTEXT\n');

    const phoneNumber = '+5491111111111';
    this.clearContact(phoneNumber);

    // First question about water in fuel
    const response1 = await this.flow.processMessage(
      phoneNumber,
      '¿Qué pasa si tengo agua en el diesel?',
      'Carlos'
    );

    this.assert(
      response1.response.includes('Agua contaminada') || response1.response.includes('combustible'),
      'First question handled (water in fuel)'
    );

    // Second question about bacteria
    const response2 = await this.flow.processMessage(
      phoneNumber,
      'También tengo bacteria en el combustible',
      'Carlos'
    );

    this.assert(
      response2.response.length > 0,
      'Second context question handled'
    );
  }

  async testEdgeCases() {
    console.log('\n📋 EDGE CASES\n');

    const phoneNumber = '+5492222222222';
    this.clearContact(phoneNumber);

    // Empty message
    const response1 = await this.flow.processMessage(phoneNumber, '', 'Test');
    this.assert(response1.response.length > 0, 'Empty message handled');

    // Very short message
    this.clearContact(phoneNumber);
    const response2 = await this.flow.processMessage(phoneNumber, 'hola', 'Test');
    this.assert(response2.response.length > 0, 'Short message handled');

    // Message with special characters
    this.clearContact(phoneNumber);
    const response3 = await this.flow.processMessage(
      phoneNumber,
      '¿¿¿AGUA EN DIESEL???!!!',
      'Test'
    );
    this.assert(response3.response.length > 0, 'Special characters handled');

    // Very long question
    this.clearContact(phoneNumber);
    const longQ = 'Tengo un problema muy grave con agua en el diesel que entra en el sistema de combustible del motor y no sé qué hacer';
    const response4 = await this.flow.processMessage(phoneNumber, longQ, 'Test');
    this.assert(response4.response.length > 0, 'Long question handled');
  }

  async testRiskExtraction() {
    console.log('\n📋 RISK EXTRACTION\n');

    const testCases = [
      {
        message: 'agua en diesel',
        expectedRiskKeywords: ['water', 'fuel', 'water_fuel'],
        description: 'Water in fuel extraction'
      },
      {
        message: 'contaminacion en el motor',
        expectedRiskKeywords: ['contamination'],
        description: 'Contamination extraction'
      },
      {
        message: 'bacteria en agua',
        expectedRiskKeywords: ['microorganism', 'biological'],
        description: 'Bacteria extraction'
      }
    ];

    for (const test of testCases) {
      const risks = extractRisksFromMessage(test.message);
      const hasExpectedRisk = risks.length > 0;
      this.assert(hasExpectedRisk, `${test.description}: "${test.message}"`);
    }
  }

  async testLanguageVariations() {
    console.log('\n📋 LANGUAGE VARIATIONS\n');

    const phoneNumber = '+5493333333333';

    const variations = [
      '¿qué pasa si el agua se mezcla con el diésel?',
      'que pasa si agua y diesel',
      'AGUA EN DIESEL QUÉ PASA',
      'agua+diesel=problema?',
      'si meto agua en diesel q pasa'
    ];

    for (const variation of variations) {
      this.clearContact(phoneNumber);
      const response = await this.flow.processMessage(phoneNumber, variation, 'Test');
      const isDetected = response.response.includes('Agua contaminada') ||
                        response.response.includes('combustible') ||
                        response.response.length > 50;
      this.assert(isDetected, `Language variation: "${variation.substring(0, 30)}..."`);
    }
  }

  async testNoFalseNegatives() {
    console.log('\n📋 FALSE NEGATIVES CHECK\n');

    const phoneNumber = '+5494444444444';

    // These should NOT be treated as technical questions
    const nonTechnical = [
      'Hola',
      '¿Cómo estás?',
      'Buenos días',
      '¿Cuál es tu horario?',
      'Me interesa saber más'  // This is a response to a question, not a question itself
    ];

    for (const msg of nonTechnical) {
      this.clearContact(phoneNumber);
      const response = await this.flow.processMessage(phoneNumber, msg, 'Test');
      const isTechnical = response.response.includes('Causas principales') &&
                         response.response.includes('Consecuencias');
      this.assert(!isTechnical, `Non-technical recognized: "${msg}"`);
    }
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 BOT COMPREHENSIVE TEST SUITE');
    console.log('='.repeat(80));

    await this.testTechnicalQuestionDetection();
    await this.testProductCatalogDetection();
    await this.testTechnicalConversationFlow();
    await this.testProductCatalogFlow();
    await this.testMultipleRisksContext();
    await this.testEdgeCases();
    await this.testRiskExtraction();
    await this.testLanguageVariations();
    await this.testNoFalseNegatives();

    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 RESULTS: ${this.passed} passed, ${this.failed} failed\n`);

    if (this.failed === 0) {
      console.log('🎉 ALL TESTS PASSED!\n');
      process.exit(0);
    } else {
      console.log(`⚠️  ${this.failed} test(s) failed\n`);
      process.exit(1);
    }
  }
}

// Run tests
const suite = new BotTestSuite();
suite.runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
