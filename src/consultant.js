// Professional consultant responses for asset protection
export const ASSET_TYPES = {
  WATER_SYSTEMS: 'water_systems',
  AIR_SYSTEMS: 'air_systems',
  INDUSTRIAL_PLANTS: 'industrial_plants',
  PRODUCTION_EQUIPMENT: 'production_equipment',
  HVAC_SYSTEMS: 'hvac_systems',
  COMPRESSED_AIR: 'compressed_air',
  OFFICE_SPACES: 'office_spaces',
  DATA_CENTERS: 'data_centers',
  FOOD_INDUSTRY: 'food_industry',
  PHARMACEUTICAL: 'pharmaceutical',
  FUEL_SYSTEMS: 'fuel_systems',
  DIESEL_ENGINES: 'diesel_engines',
  GASOLINE_ENGINES: 'gasoline_engines',
  INJECTORS: 'injectors',
  FUEL_PUMPS: 'fuel_pumps',
  VEHICLES: 'vehicles',
  GENERATORS: 'generators',
  OTHER: 'other'
};

export const RISK_TYPES = {
  CONTAMINATION: 'contamination',
  PARTICLES: 'particles',
  MICROORGANISMS: 'microorganisms',
  CORROSION: 'corrosion',
  SEDIMENT: 'sediment',
  CHEMICAL: 'chemical',
  BIOLOGICAL: 'biological',
  PARTICULATE: 'particulate',
  ODOR: 'odor',
  SCALE: 'scale',
  WATER_IN_FUEL: 'water_fuel',
  FUEL_CONTAMINATION: 'fuel_contamination',
  INJECTOR_DAMAGE: 'injector_damage',
  ENGINE_POWER_LOSS: 'engine_power',
  DIESEL_WATER: 'diesel_water',
  FUEL_SYSTEM_FAILURE: 'fuel_system',
  UNKNOWN: 'unknown'
};

export const OPERATING_CONTEXT = {
  INDUSTRIAL: 'industrial',
  COMMERCIAL: 'commercial',
  RESIDENTIAL: 'residential',
  FOOD_BEVERAGE: 'food_beverage',
  HEALTHCARE: 'healthcare',
  MANUFACTURING: 'manufacturing',
  PHARMACEUTICAL: 'pharmaceutical',
  OTHER: 'other'
};

export function extractAssetsFromMessage(messageText) {
  if (!messageText) return [];

  const normalized = messageText.toLowerCase();
  const detectedAssets = [];

  const assetKeywords = {
    [ASSET_TYPES.WATER_SYSTEMS]: ['agua', 'sistema de agua', 'tuberias', 'tuberías', 'tanque', 'piscina', 'fuente'],
    [ASSET_TYPES.AIR_SYSTEMS]: ['aire', 'aire comprimido', 'compresor', 'neumatico', 'neumático', 'aire acondicionado'],
    [ASSET_TYPES.INDUSTRIAL_PLANTS]: ['planta', 'fabrica', 'fábrica', 'produccion', 'producción', 'industrial', 'manufactura'],
    [ASSET_TYPES.PRODUCTION_EQUIPMENT]: ['maquinas', 'máquinas', 'equipos', 'produccion', 'producción', 'linea de produccion'],
    [ASSET_TYPES.HVAC_SYSTEMS]: ['hvac', 'aire acondicionado', 'ventilacion', 'ventilación', 'climatizacion', 'climatización'],
    [ASSET_TYPES.COMPRESSED_AIR]: ['aire comprimido', 'compresor', 'neumatico', 'neumático'],
    [ASSET_TYPES.OFFICE_SPACES]: ['oficina', 'oficinas', 'despacho', 'edificio de oficinas'],
    [ASSET_TYPES.DATA_CENTERS]: ['data center', 'servidor', 'equipos informaticos', 'equipos informáticos', 'centro de datos'],
    [ASSET_TYPES.FOOD_INDUSTRY]: ['alimentos', 'bebidas', 'industria alimentaria', 'cocina industrial'],
    [ASSET_TYPES.PHARMACEUTICAL]: ['farmaceutica', 'farmacéutica', 'farmacia', 'medicamentos', 'laboratorio'],
    [ASSET_TYPES.FUEL_SYSTEMS]: ['diesel', 'diésel', 'combustible', 'fuel', 'gasolina', 'nafta', 'tanque de combustible', 'sistema de combustible'],
    [ASSET_TYPES.DIESEL_ENGINES]: ['motor diésel', 'motor diesel', 'motor de diesel', 'diesel engine'],
    [ASSET_TYPES.GASOLINE_ENGINES]: ['motor de gasolina', 'motor gasolina', 'motor nafta', 'gasoline engine'],
    [ASSET_TYPES.INJECTORS]: ['inyector', 'inyectores', 'inyección', 'inyector de combustible'],
    [ASSET_TYPES.FUEL_PUMPS]: ['bomba de combustible', 'bomba de diesel', 'fuel pump', 'bomba de gasolina'],
    [ASSET_TYPES.VEHICLES]: ['camión', 'camion', 'auto', 'coche', 'vehículo', 'vehiculo', 'tractora', 'flota'],
    [ASSET_TYPES.GENERATORS]: ['generador', 'genset', 'grupo electrógeno', 'grupo electrogeno']
  };

  for (const [assetType, keywords] of Object.entries(assetKeywords)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      detectedAssets.push(assetType);
    }
  }

  return detectedAssets.length > 0 ? detectedAssets : [ASSET_TYPES.OTHER];
}

export function extractRisksFromMessage(messageText) {
  if (!messageText) return [];

  const normalized = messageText.toLowerCase();
  const detectedRisks = [];

  const riskKeywords = {
    [RISK_TYPES.CONTAMINATION]: ['contamina', 'contaminacion', 'sucio', 'impuro', 'contaminante'],
    [RISK_TYPES.PARTICLES]: ['particula', 'particulado', 'polvo', 'sedimento', 'arena', 'particulado'],
    [RISK_TYPES.MICROORGANISMS]: ['bacteria', 'virus', 'microorganismo', 'hongo', 'moho', 'biologico'],
    [RISK_TYPES.CORROSION]: ['corrosion', 'corrosión', 'oxido', 'oxidacion', 'oxidación', 'herrumbre', 'oxidado'],
    [RISK_TYPES.SEDIMENT]: ['sedimento', 'deposito', 'depósito', 'acumulacion', 'acumulación', 'sedimentacion', 'sedimentación'],
    [RISK_TYPES.CHEMICAL]: ['quimico', 'químico', 'quimica', 'química', 'producto quimico', 'producto químico'],
    [RISK_TYPES.BIOLOGICAL]: ['biologico', 'biológico', 'organico', 'orgánico', 'biologica', 'biológica'],
    [RISK_TYPES.PARTICULATE]: ['particula', 'particulado', 'particulado', 'polvo fino'],
    [RISK_TYPES.ODOR]: ['olor', 'olor fuerte', 'hedor', 'apestoso'],
    [RISK_TYPES.SCALE]: ['sarro', 'incrustacion', 'incrustación', 'escala', 'calcificacion', 'calcificación', 'deposito mineral'],
    [RISK_TYPES.WATER_IN_FUEL]: ['agua en diesel', 'agua en diésel', 'agua en gasolina', 'agua en combustible', 'agua diesel', 'agua diésel', 'condensacion en combustible', 'agua en fuel', 'humedad en diesel', 'humedad en diésel', 'agua mezcla diesel', 'agua mezcla diésel'],
    [RISK_TYPES.FUEL_CONTAMINATION]: ['combustible contaminado', 'diesel contaminado', 'gasolina contaminada', 'fuel system contamination'],
    [RISK_TYPES.INJECTOR_DAMAGE]: ['daño de inyector', 'inyectores dañados', 'falla de inyector', 'inyectores tapados', 'corrosión de inyector'],
    [RISK_TYPES.ENGINE_POWER_LOSS]: ['pérdida de potencia', 'perdida de potencia', 'motor pierde potencia', 'falta de potencia', 'motor débil'],
    [RISK_TYPES.DIESEL_WATER]: ['agua en diesel', 'agua en diésel', 'mezcla de agua y diesel', 'diesel con agua'],
    [RISK_TYPES.FUEL_SYSTEM_FAILURE]: ['fallo de combustible', 'fallo del motor', 'parada del motor', 'motor se para', 'motor muere']
  };

  // Standard keyword matching
  for (const [riskType, keywords] of Object.entries(riskKeywords)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      detectedRisks.push(riskType);
    }
  }

  // Special compound detection for water-in-fuel: if message contains both "agua" and ("diésel"|"diesel"|"combustible")
  // This handles questions like "¿qué pasa si el agua se mezcla con el diésel?"
  if (!detectedRisks.includes(RISK_TYPES.WATER_IN_FUEL) && !detectedRisks.includes(RISK_TYPES.DIESEL_WATER)) {
    const hasWater = /agua|humedad/i.test(messageText);
    const hasFuel = /diésel|diesel|combustible|fuel|gasolina|nafta/i.test(messageText);
    if (hasWater && hasFuel) {
      detectedRisks.push(RISK_TYPES.WATER_IN_FUEL);
    }
  }

  return detectedRisks.length > 0 ? detectedRisks : [RISK_TYPES.UNKNOWN];
}

export function extractContextFromMessage(messageText) {
  if (!messageText) return OPERATING_CONTEXT.OTHER;

  const normalized = messageText.toLowerCase();

  const contextKeywords = {
    [OPERATING_CONTEXT.INDUSTRIAL]: ['industrial', 'fabrica', 'fábrica', 'planta', 'manufactura'],
    [OPERATING_CONTEXT.COMMERCIAL]: ['comercial', 'empresa', 'negocio'],
    [OPERATING_CONTEXT.RESIDENTIAL]: ['casa', 'hogar', 'departamento', 'residencial'],
    [OPERATING_CONTEXT.FOOD_BEVERAGE]: ['alimentos', 'bebidas', 'cocina'],
    [OPERATING_CONTEXT.HEALTHCARE]: ['hospital', 'clinica', 'clínica', 'salud', 'medico', 'médico'],
    [OPERATING_CONTEXT.MANUFACTURING]: ['fabricacion', 'fabricación', 'produccion', 'producción', 'manufactura'],
    [OPERATING_CONTEXT.PHARMACEUTICAL]: ['farmaceutica', 'farmacéutica', 'medicamentos', 'farmacos', 'fármacos']
  };

  for (const [context, keywords] of Object.entries(contextKeywords)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return context;
    }
  }

  return OPERATING_CONTEXT.OTHER;
}

export function getRiskCauses(riskType) {
  const causes = {
    [RISK_TYPES.CONTAMINATION]: [
      'condensación en tanques',
      'falta de purga del sistema',
      'sedimentación',
      'acumulación de partículas',
      'entrada de suciedad externa',
      'tuberías corroídas'
    ],
    [RISK_TYPES.PARTICLES]: [
      'desgaste de componentes',
      'sedimentación',
      'erosión de tuberías',
      'falta de filtración',
      'entrada de polvo/arena'
    ],
    [RISK_TYPES.MICROORGANISMS]: [
      'estancamiento del agua',
      'falta de circulación',
      'temperatura inadecuada',
      'biofilm en tuberías',
      'contaminación biológica del agua'
    ],
    [RISK_TYPES.CORROSION]: [
      'agua con alto contenido mineral',
      'pH desbalanceado',
      'falta de inhibidores de corrosión',
      'reacciones electroquímicas',
      'oxígeno disuelto alto'
    ],
    [RISK_TYPES.SEDIMENT]: [
      'acumulación de partículas',
      'falta de purga',
      'sedimentación natural',
      'erosión de tuberías',
      'depósitos minerales'
    ],
    [RISK_TYPES.SCALE]: [
      'agua dura',
      'mineral disuelto alto',
      'temperatura alta',
      'falta de descalcificación',
      'depósitos de calcio/magnesio'
    ]
  };

  return causes[riskType] || [];
}

export function detectProductCatalogQuestion(messageText) {
  if (!messageText) return false;

  const normalized = messageText.toLowerCase();

  // Detect questions about what products/filters we manufacture
  const catalogPatterns = [
    /qu[eé].*tipo.*filtro/i,
    /qu[eé].*tipos.*filtro/i,
    /qu[eé].*fabrica/i,
    /qu[eé].*producto/i,
    /qu[eé].*productos/i,
    /qu[eé].*sistemas.*filtración/i,
    /qu[eé].*se.*fabrica/i,
    /catálogo|catalogo/i,
    /línea de productos|linea de productos/i,
    /qu[eé].*ofrec/i,
    /cuál.*sus.*producto/i,
    /cuáles.*son.*sus/i
  ];

  return catalogPatterns.some(pattern => pattern.test(messageText));
}

export function detectTechnicalQuestion(messageText) {
  if (!messageText) return null;

  const normalized = messageText.toLowerCase();

  // First, extract risks from the message (this detects keywords like agua, diesel, etc.)
  const risks = extractRisksFromMessage(messageText);

  // If no significant risks detected, it's not a technical question
  if (risks.length === 0 || risks.includes(RISK_TYPES.UNKNOWN)) {
    return null;
  }

  // Now check if it's asking ABOUT something (what happens, what are consequences, etc.)
  // This is the "intent" - does it ask about the impact/consequences/what happens?
  const asksAboutConsequences = /qué|cuál|cuáles|pasa|sucede|ocurre|consecuencia|riesgo|problema|efecto|daño|afecta|causa|motivo|por qué|what|happens|why|\?|¿/i.test(messageText);

  // If message contains risk keywords AND asks about them (or ends with ?), it's a technical question
  if (asksAboutConsequences) {
    return risks[0];
  }

  return null;
}

export function buildConsultantSummary(contact) {
  if (!contact || !contact.messages) return null;

  const summary = {
    assets: [],
    risks: [],
    context: OPERATING_CONTEXT.OTHER,
    budget: null,
    timeline: null
  };

  // Extract from all client messages
  for (const msg of contact.messages || []) {
    if (msg.type === 'incoming') {
      summary.assets.push(...extractAssetsFromMessage(msg.body));
      summary.risks.push(...extractRisksFromMessage(msg.body));

      const context = extractContextFromMessage(msg.body);
      if (context !== OPERATING_CONTEXT.OTHER) {
        summary.context = context;
      }

      // Try to detect budget/timeline
      if (/presupuesto|costo|precio/i.test(msg.body)) {
        summary.budget = true;
      }
      if (/urgente|rápido|pronto|inmediato/i.test(msg.body)) {
        summary.timeline = 'urgent';
      }
    }
  }

  // Deduplicate
  summary.assets = [...new Set(summary.assets)];
  summary.risks = [...new Set(summary.risks)];

  return summary;
}
