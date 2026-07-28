import { isGreeting } from './greeting.js';
import { detectIntent, getIntentDescription, getSuggestedAgent, inferCustomerTypeFromIntent, CUSTOMER_TYPES } from './intent.js';
import { extractAssetsFromMessage, extractRisksFromMessage, extractContextFromMessage, RISK_TYPES, ASSET_TYPES, OPERATING_CONTEXT, detectTechnicalQuestion, detectProductCatalogQuestion } from './consultant.js';
import { getRecommendedProducts, buildProductRecommendationText } from './products.js';
import { TECHNICAL_KNOWLEDGE, getKnowledgeForRisk, buildDetailedTechnicalResponse } from './knowledge.js';
import { getRecommendedProductsFromDatabase, validateSKUExists } from './database.js';
import { handleSpecificationQuestion, detectSpecificationRequest } from './specifications.js';

// Map asset types to Spanish phrases for proper grammar
const ASSET_SPANISH_NAMES = {
  [ASSET_TYPES.WATER_SYSTEMS]: 'sistemas de agua',
  [ASSET_TYPES.AIR_SYSTEMS]: 'sistemas de aire comprimido',
  [ASSET_TYPES.INDUSTRIAL_PLANTS]: 'planta industrial',
  [ASSET_TYPES.PRODUCTION_EQUIPMENT]: 'equipos de producción',
  [ASSET_TYPES.HVAC_SYSTEMS]: 'sistemas de climatización',
  [ASSET_TYPES.COMPRESSED_AIR]: 'aire comprimido',
  [ASSET_TYPES.OFFICE_SPACES]: 'oficinas',
  [ASSET_TYPES.DATA_CENTERS]: 'centro de datos',
  [ASSET_TYPES.FOOD_INDUSTRY]: 'equipos de alimentos y bebidas',
  [ASSET_TYPES.PHARMACEUTICAL]: 'equipos farmacéuticos',
  [ASSET_TYPES.OTHER]: 'infraestructura'
};

function buildAssetPhrase(assets) {
  if (!assets || assets.length === 0) return 'tu infraestructura';

  const validAssets = assets.filter(a => a !== ASSET_TYPES.OTHER);
  if (validAssets.length === 0) return 'tu infraestructura';

  if (validAssets.length === 1) {
    return 'tu ' + ASSET_SPANISH_NAMES[validAssets[0]];
  }

  // Multiple assets - use generic
  return 'tus activos e infraestructura';
}

const CONVERSATION_STATES = {
  GREETING: 'greeting',
  UNDERSTANDING_PROBLEM: 'understanding_problem',
  IDENTIFYING_ASSETS: 'identifying_assets',
  ASSESSING_RISKS: 'assessing_risks',
  EXPLORING_CURRENT_EQUIPMENT: 'exploring_current_equipment',
  PROPOSING_SOLUTION: 'proposing_solution',
  CONFIRMING_SOLUTION: 'confirming_solution',
  HANDOFF_TO_TEAM: 'handoff_to_team'
};

// Extract recommended SKU from conversation message history
function extractRecommendedSKU(messages = []) {
  // Search from most recent to oldest to find SKU pattern
  const skuPattern = /\*\*([A-Z]{1,4}-\d{3})\*\*/;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.type === 'outgoing') {
      const match = msg.body.match(skuPattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  }

  return null;
}

export function createConversationFlow({ storage, master, logger = console }) {
  async function getResponseForState(state, contactName, messageText, contact = {}) {
    // Detect assets and risks mentioned in the current message
    const detectedAssets = messageText ? extractAssetsFromMessage(messageText) : [];
    const detectedRisks = messageText ? extractRisksFromMessage(messageText) : [];

    switch (state) {
      case CONVERSATION_STATES.GREETING:
        return contactName
          ? `¡Hola ${contactName}! ¿Qué te trae a ELIMFILTERS? Estoy aquí para ayudarte con lo que necesites.`
          : `¡Hola! ¿Qué te trae a ELIMFILTERS? Estoy aquí para ayudarte con lo que necesites.`;

      case CONVERSATION_STATES.UNDERSTANDING_PROBLEM:
        // If assets were mentioned, ask about risks for those assets
        if (detectedAssets.length > 0 && !detectedAssets.includes('OTHER')) {
          const assetPhrase = buildAssetPhrase(detectedAssets);
          return `Entiendo que necesitás proteger ${assetPhrase}. ¿Qué riesgos específicos enfrentás?`;
        }
        return `¿Qué activos específicos necesitás proteger?`;

      case CONVERSATION_STATES.IDENTIFYING_ASSETS:
        // If contamination or water-related risks detected, ask about causes
        if (detectedRisks.some(r => [RISK_TYPES.CONTAMINATION, RISK_TYPES.PARTICLES, RISK_TYPES.SEDIMENT].includes(r))) {
          return `Entiendo tu problema. ¿De dónde viene la contaminación? Puede ser por condensación en tanques, sedimentación, falta de purga de sistemas, o acumulación de partículas. ¿Qué notás?`;
        }
        // If microorganism risks detected, ask about causes
        if (detectedRisks.includes(RISK_TYPES.MICROORGANISMS)) {
          return `Entiendo tu problema. ¿Cuál es la fuente? Puede ser por estancamiento del agua, falta de circulación, o contaminación biológica. ¿Qué observás?`;
        }
        // If corrosion detected, ask about causes
        if (detectedRisks.includes(RISK_TYPES.CORROSION)) {
          return `Entiendo tu problema. ¿Cuál es la causa de la corrosión? Puede ser por agua con alto contenido mineral, pH desbalanceado, o falta de inhibidores. ¿Qué evidencia tenés?`;
        }
        // Generic case if risks detected but not specific
        if (detectedRisks.length > 0 && !detectedRisks.includes(RISK_TYPES.UNKNOWN)) {
          return `Entiendo. ¿Cuál creés que es la causa principal de ese problema?`;
        }
        return `¿Qué riesgos específicos enfrentás?`;

      case CONVERSATION_STATES.ASSESSING_RISKS:
        return `Perfecto. Para dar la mejor recomendación, ¿en qué contexto operas? ¿Industrial, comercial, o algo más específico? ¿Y qué escala de operación estamos hablando?`;

      case CONVERSATION_STATES.EXPLORING_CURRENT_EQUIPMENT:
        return `Excelente. Ahora me gustaría conocer tu situación actual. ¿Qué equipo de filtración ya tenés instalado? ¿Cómo te ha funcionado hasta ahora? ¿Qué problemas ha tenido?`;

      case CONVERSATION_STATES.PROPOSING_SOLUTION:
        // Extract detected risks from conversation history
        if (contact && contact.messages && contact.messages.length > 0) {
          const allRisks = [];

          for (const msg of contact.messages) {
            if (msg.type === 'incoming') {
              allRisks.push(...extractRisksFromMessage(msg.body));
            }
          }

          const uniqueRisks = [...new Set(allRisks)].filter(r => r !== RISK_TYPES.UNKNOWN);

          if (uniqueRisks.length > 0) {
            const primaryRisk = uniqueRisks[0];

            // Get technical knowledge for identified risk
            const knowledge = getKnowledgeForRisk(primaryRisk);
            if (knowledge) {
              let response = `Perfecto. Basándome en que identificamos **${knowledge.problem}**, te recomiendo:\n\n`;

              response += `**Solución:** ${knowledge.solution}\n\n`;

              if (knowledge.installation) {
                response += `**Instalación:** ${knowledge.installation}\n`;
              }

              if (knowledge.maintenance) {
                response += `**Mantenimiento:** ${knowledge.maintenance}\n\n`;
              }

              if (knowledge.benefits && knowledge.benefits.length > 0) {
                response += `**Beneficios de implementar esto:**\n`;
                knowledge.benefits.slice(0, 3).forEach(benefit => {
                  response += `✅ ${benefit}\n`;
                });
                response += '\n';
              }

              response += `Para darte un presupuesto exacto y cronograma de instalación, necesito conectarte con nuestro equipo técnico.\n\n` +
                         `¿Cuál es tu teléfono para que te contacten en 24 horas?`;

              return response;
            }
          }
        }

        return `Basándome en tu situación, te presento la solución ideal. ¿Te interesa proceder?`;

      case CONVERSATION_STATES.CONFIRMING_SOLUTION:
        return `Perfecto. Para que nuestro distribuidor en tu país te contacte con presupuesto e instalación, necesito confirmar tus datos. ¿Cuál es tu nombre completo, email y número de teléfono?`;

      case CONVERSATION_STATES.HANDOFF_TO_TEAM:
        return `Excelente. Pasamos tu información al distribuidor de ELIMFILTERS en tu país. Se pondrán en contacto contigo en las próximas 24-48 horas con presupuesto, cronograma e instalación. ¿Hay algo más que necesites saber técnicamente sobre la solución?`;

      default:
        return 'Contame más.';
    }
  }

  function getNextState(currentState, messageText, contact = {}) {
    // Only progress if there's meaningful input
    if (!messageText || messageText.trim().length < 2) {
      return currentState;
    }

    // Detect assets and risks mentioned in the current message
    const detectedAssets = extractAssetsFromMessage(messageText);
    const detectedRisks = extractRisksFromMessage(messageText);
    const detectedContext = extractContextFromMessage(messageText);
    const hasValidAssets = detectedAssets.length > 0 && !detectedAssets.includes('OTHER');
    const hasValidRisks = detectedRisks.length > 0 && !detectedRisks.includes('UNKNOWN');
    const hasContext = detectedContext !== OPERATING_CONTEXT.OTHER;

    // Common patterns used across multiple states
    const messageLength = messageText?.trim().length || 0;
    const hasCauseKeywords = /condensacion|purga|sedimento|estancamiento|acumulacion|oxido|mineral|ph|inhibidor/i.test(messageText);
    const hasEquipmentKeywords = /filtro|equipo|sistema|tengo|instalado|actualizado|viejo|nuevo/i.test(messageText);
    const hasConfirmKeywords = /si|perfecto|excelente|bueno|me interesa|vamos|sí|claro|de acuerdo/i.test(messageText);
    const hasEmailPhone = /@|(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(messageText);
    const hasContactInfo = messageText.length > 20 || hasEmailPhone;

    // If client asks for recommendation/solution, jump to proposal
    const asksForRecommendation = /qu[eé].*filtro|qu[eé].*soluci[oó]n|qu[eé].*producto|qu[eé].*recomiendan|recomendame|cu[aá]l.*filtro|cu[aá]l.*soluci[oó]n/i.test(messageText);
    const hasHistoryWithRisks = contact && contact.messages && contact.messages.some(msg => {
      const risks = extractRisksFromMessage(msg.body);
      return msg.type === 'incoming' && risks.length > 0 && !risks.includes(RISK_TYPES.UNKNOWN);
    });

    if (asksForRecommendation && hasHistoryWithRisks) {
      return CONVERSATION_STATES.PROPOSING_SOLUTION;
    }

    switch (currentState) {
      case CONVERSATION_STATES.GREETING:
        return CONVERSATION_STATES.UNDERSTANDING_PROBLEM;

      case CONVERSATION_STATES.UNDERSTANDING_PROBLEM:
        // Only progress if we have meaningful input about assets
        if (messageLength > 10) {
          return CONVERSATION_STATES.IDENTIFYING_ASSETS;
        }
        return CONVERSATION_STATES.UNDERSTANDING_PROBLEM;

      case CONVERSATION_STATES.IDENTIFYING_ASSETS:
        // Stay until we understand the risks deeply
        if (hasValidRisks && (messageLength > 30 || hasCauseKeywords)) {
          return CONVERSATION_STATES.ASSESSING_RISKS;
        }
        return CONVERSATION_STATES.IDENTIFYING_ASSETS;

      case CONVERSATION_STATES.ASSESSING_RISKS:
        // Progress when context is mentioned
        if (hasContext) {
          return CONVERSATION_STATES.EXPLORING_CURRENT_EQUIPMENT;
        }
        return CONVERSATION_STATES.ASSESSING_RISKS;

      case CONVERSATION_STATES.EXPLORING_CURRENT_EQUIPMENT:
        // Progress when they describe current equipment
        if (hasEquipmentKeywords && messageLength > 15) {
          return CONVERSATION_STATES.PROPOSING_SOLUTION;
        }
        return CONVERSATION_STATES.EXPLORING_CURRENT_EQUIPMENT;

      case CONVERSATION_STATES.PROPOSING_SOLUTION:
        // If they confirm or express interest, move to confirming
        if (hasConfirmKeywords) {
          return CONVERSATION_STATES.CONFIRMING_SOLUTION;
        }
        // If they have questions, stay to clarify
        if (/como|cuanto|cuál|precio|costo|tiempo|cuánto|que diferencia/i.test(messageText)) {
          return CONVERSATION_STATES.PROPOSING_SOLUTION;
        }
        return CONVERSATION_STATES.PROPOSING_SOLUTION;

      case CONVERSATION_STATES.CONFIRMING_SOLUTION:
        // Move to handoff when they provide contact information
        if (hasContactInfo) {
          return CONVERSATION_STATES.HANDOFF_TO_TEAM;
        }
        return CONVERSATION_STATES.CONFIRMING_SOLUTION;

      case CONVERSATION_STATES.HANDOFF_TO_TEAM:
        return CONVERSATION_STATES.HANDOFF_TO_TEAM;

      default:
        return currentState;
    }
  }

  return {
    async processMessage(phoneNumber, messageText, contactName = null) {
      logger.debug('processMessage START', {
        phoneNumber,
        messageText: messageText?.substring(0, 100),
        contactName
      });

      try {
        // Detect intent from message
        const intent = detectIntent(messageText);
        logger.debug('Intent detected', { intent });

        // Detect customer type (B2B/B2C)
        const customerType = inferCustomerTypeFromIntent(intent, messageText);
        logger.debug('Customer type detected', { customerType });

        // Get or create contact
        let contact = await storage.getContact(phoneNumber);
        logger.debug('Contact retrieved', { contactExists: !!contact });

        if (!contact) {
          logger.debug('Creating new contact');
          contact = await storage.saveContact(phoneNumber, {
            phoneNumber,
            name: contactName,
            state: CONVERSATION_STATES.GREETING,
            intent,
            customerType,
            suggestedAgent: getSuggestedAgent(intent),
            messages: []
          });
          logger.debug('Contact created', { state: contact.state });
        } else {
          // Update intent, customer type and suggested agent if it's a new message
          logger.debug('Updating existing contact');
          await storage.saveContact(phoneNumber, {
            intent,
            customerType,
            suggestedAgent: getSuggestedAgent(intent)
          });
        }

        // Add message to history with intent
        logger.debug('Adding incoming message to history');
        await storage.addMessage(phoneNumber, {
          type: 'incoming',
          body: messageText,
          intent
        });
        logger.debug('Message added to history');

        // Refresh contact to get updated message history
        contact = await storage.getContact(phoneNumber);
        logger.debug('Contact refreshed', {
          messageCount: contact?.messages?.length || 0
        });

        // Determine current and next state
        const currentState = contact.state || CONVERSATION_STATES.GREETING;
        logger.debug('Current state', { state: currentState });

        let nextState = getNextState(currentState, messageText, contact);
        logger.debug('Next state calculated', { nextState });

        // Use next state if transitioning (e.g., for recommendations after historical questions)
        const stateForResponse = (nextState !== currentState) ? nextState : currentState;
        logger.debug('State for response', {
          isTransitioning: nextState !== currentState,
          stateForResponse
        });

        // Determine response based on state
        logger.debug('Getting response for state', { state: stateForResponse });
        let responseText = await getResponseForState(stateForResponse, contact.name, messageText, contact);
        logger.debug('Response generated', {
          responseLength: responseText?.length || 0
        });

        // Check for product catalog questions first
        logger.debug('Checking for product catalog question');
        if (detectProductCatalogQuestion(messageText)) {
          logger.info('Product catalog question detected', { messagePreview: messageText.substring(0, 50) });

          responseText = `ELIMFILTERS fabrica sistemas de filtración para:

• Aire (aire comprimido, aire de cabina)
• Aceite lubricante
• Combustible (diésel, gasolina)
• Fluido hidráulico
• Aire acondicionado
• Agua industrial

Nuestros sistemas están diseñados para operaciones industriales, transporte y maquinaria. No vendemos al por menor; comercializamos a través de distribuidores e importadores autorizados.

¿Necesitás proteger algún sistema específico?`;

          // Don't progress state - stay here for more questions
          nextState = currentState;
        }
        // Check for technical "what if" questions at ANY point in conversation
        else {
          logger.debug('Checking for technical question');
          const technicalRisk = detectTechnicalQuestion(messageText);
          if (technicalRisk) {
          logger.debug('Technical question detected', { technicalRisk });
          // Get detailed technical knowledge for this risk
          const knowledge = getKnowledgeForRisk(technicalRisk);

          if (knowledge) {
            logger.debug('Knowledge found for technical risk', { problem: knowledge.problem });
            // Build expert technical response
            let technicalResponse = `**${knowledge.problem}**\n\n`;

            if (knowledge.causes && knowledge.causes.length > 0) {
              technicalResponse += `**Causas principales:**\n`;
              knowledge.causes.slice(0, 3).forEach(cause => {
                technicalResponse += `• ${cause}\n`;
              });
              technicalResponse += `\n`;
            }

            if (knowledge.consequences && knowledge.consequences.length > 0) {
              technicalResponse += `**Consecuencias:**\n`;
              knowledge.consequences.slice(0, 3).forEach(consequence => {
                technicalResponse += `• ${consequence}\n`;
              });
              technicalResponse += `\n`;
            }

            if (knowledge.symptoms && knowledge.symptoms.length > 0) {
              technicalResponse += `**Síntomas que notarías:**\n`;
              knowledge.symptoms.slice(0, 2).forEach(symptom => {
                technicalResponse += `• ${symptom}\n`;
              });
              technicalResponse += `\n`;
            }

            if (knowledge.howItWorks) {
              technicalResponse += `**Cómo se resuelve:**\n${knowledge.howItWorks}\n\n`;
            }

            if (knowledge.costImpact) {
              technicalResponse += `**Impacto económico sin solución:**\n`;
              for (const [key, value] of Object.entries(knowledge.costImpact)) {
                if (typeof value === 'string') {
                  const cleanKey = key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
                  technicalResponse += `• ${cleanKey}: ${value}\n`;
                }
              }
              technicalResponse += `\n`;
            }

            technicalResponse += `¿Te interesa conocer la solución que ofrecemos?`;

            responseText = technicalResponse;
            // Don't progress state - stay here so they can ask more technical questions
            nextState = currentState;

            logger.info('Technical question answered with expert knowledge', {
              phoneNumber,
              technicalRisk,
              knowledge: knowledge.problem
            });
          }
          }
        }

        // If user shows interest after a technical question, offer specific solution
        if (currentState === CONVERSATION_STATES.GREETING || currentState === CONVERSATION_STATES.UNDERSTANDING_PROBLEM) {
          const hasInterestKeywords = /si|claro|me interesa|vamos|sí|de acuerdo|ok|si interesa|me interesaria/i.test(messageText);
          const hasRecentTechnicalQuestion = contact && contact.messages && contact.messages.some(msg =>
            msg.type === 'outgoing' && msg.body.includes('¿Te interesa conocer la solución que ofrecemos?')
          );

          if (hasInterestKeywords && hasRecentTechnicalQuestion) {
            logger.debug('User interested in solution after technical question');

            // Extract the most recent technical risk from conversation
            const allRisks = [];
            for (const msg of contact.messages || []) {
              if (msg.type === 'incoming') {
                allRisks.push(...extractRisksFromMessage(msg.body));
              }
            }

            const uniqueRisks = [...new Set(allRisks)].filter(r => r !== RISK_TYPES.UNKNOWN);
            if (uniqueRisks.length > 0) {
              const primaryRisk = uniqueRisks[0];
              const knowledge = getKnowledgeForRisk(primaryRisk);

              if (knowledge) {
                let solutionResponse = `Perfecto. Aquí está la solución que tenemos para tu problema:\n\n`;

                solutionResponse += `**${knowledge.solution}**\n\n`;

                if (knowledge.howItWorks) {
                  solutionResponse += `**Cómo funciona:**\n${knowledge.howItWorks}\n\n`;
                }

                if (knowledge.installation) {
                  solutionResponse += `**Instalación:** ${knowledge.installation}\n`;
                }

                if (knowledge.maintenance) {
                  solutionResponse += `**Mantenimiento:** ${knowledge.maintenance}\n\n`;
                }

                if (knowledge.benefits && knowledge.benefits.length > 0) {
                  solutionResponse += `**Beneficios:**\n`;
                  knowledge.benefits.slice(0, 4).forEach(benefit => {
                    solutionResponse += `✅ ${benefit}\n`;
                  });
                  solutionResponse += '\n';
                }

                solutionResponse += `Entiendo que necesitás proteger tu infraestructura. ¿Qué otros riesgos específicos enfrentás que quieras que abordemos?`;

                responseText = solutionResponse;
                nextState = CONVERSATION_STATES.ASSESSING_RISKS;

                logger.info('Solution offered after user interest', {
                  phoneNumber,
                  primaryRisk,
                  knowledge: knowledge.problem
                });
              }
            }
          }
        }

        // Handle technical specification questions during HANDOFF_TO_TEAM
        if (currentState === CONVERSATION_STATES.HANDOFF_TO_TEAM && !responseText.includes('fabrica')) {
          logger.debug('Checking for specification request in HANDOFF_TO_TEAM state');
          const specFields = detectSpecificationRequest(messageText);
          if (specFields.length > 0) {
            // Extract recommended SKU from recent conversation history
            const recommendedSKU = extractRecommendedSKU(contact.messages);
            if (recommendedSKU) {
              logger.debug('SKU found, handling specification question', { sku: recommendedSKU });
              // Customer asking about technical specs of recommended product
              const specResponse = await handleSpecificationQuestion(recommendedSKU, messageText, logger);
              if (specResponse) {
                responseText = specResponse + '\n\n' + responseText;
                logger.info('Technical specification question answered', {
                  phoneNumber,
                  sku: recommendedSKU,
                  requested_specs: specFields
                });
              }
            }
          }
        }

        logger.debug('Preparing to save response and update state', {
          responseLength: responseText?.length || 0,
          nextState
        });

        // Add response to history
        logger.debug('Adding outgoing message to history');
        await storage.addMessage(phoneNumber, {
          type: 'outgoing',
          body: responseText,
          intent
        });
        logger.debug('Outgoing message added');

        // Update state for next message
        logger.debug('Updating contact state', { nextState });
        await storage.updateContactState(phoneNumber, nextState);
        logger.debug('Contact state updated');

        // Get lead info if needed (to eventually pass to agent)
        logger.debug('Fetching lead info from master');
        const leadInfo = await master.getLeadInfo(phoneNumber);
        logger.debug('Lead info fetched', { hasLeadInfo: !!leadInfo });

        logger.debug('processMessage SUCCESS', {
          phoneNumber,
          state: nextState,
          responseLength: responseText?.length || 0
        });

        return {
          response: responseText,
          state: nextState,
          intent,
          customerType,
          suggestedAgent: getSuggestedAgent(intent),
          contact,
          leadInfo
        };
      } catch (error) {
        logger.error('processMessage FAILED', {
          phoneNumber,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },

    async getConversationSummary(phoneNumber) {
      const contact = await storage.getContact(phoneNumber);
      if (!contact) return null;

      return {
        phoneNumber,
        name: contact.name,
        state: contact.state,
        messageCount: contact.messages?.length || 0,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        lastMessages: (contact.messages || []).slice(-3)
      };
    }
  };
}
