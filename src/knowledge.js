// ELIMFILTERS technical knowledge base - bot is the expert, not just a gateway
export const TECHNICAL_KNOWLEDGE = {
  // How filtration works and solutions for specific problems
  contamination_water: {
    problem: 'Contaminación del agua',
    causes: [
      'Condensación en tanques de almacenamiento',
      'Falta de purga regular del sistema',
      'Sedimentación natural del agua',
      'Acumulación de partículas en tuberías',
      'Entrada de suciedad desde fuentes externas'
    ],
    solution: 'Filtración multicapa con microfibra de 5 micrones',
    howItWorks: 'La malla multicapa atrapa partículas de diferentes tamaños en capas sucesivas, logrando 99.5% de remoción de sedimento',
    installation: '1-2 horas, compatible con sistemas existentes',
    maintenance: 'Reemplazo cada 6-12 meses dependiendo del volumen y contaminación inicial',
    benefits: [
      'Reduce 99.2% de contaminación',
      'Extiende vida útil de equipos downstream',
      'Mantiene calidad de agua constante',
      'ROI en 2-3 meses por reducción de paros'
    ]
  },

  microorganisms_water: {
    problem: 'Bacterias, hongos o microorganismos en agua',
    causes: [
      'Agua estancada sin circulación',
      'Temperatura inadecuada (15-30°C favorece crecimiento)',
      'Falta de desinfección o tratamiento',
      'Biofilm acumulado en tuberías antiguas',
      'Contaminación biológica del agua de entrada'
    ],
    solution: 'Filtro antibiológico con carbón activado y membrana antimicrobiana',
    howItWorks: 'El carbón activado adsorbe impurezas orgánicas mientras la membrana de 0.5 micrones elimina bacterias y virus',
    installation: '2-3 horas, requiere limpieza previa del sistema',
    maintenance: 'Reemplazo cada 3-6 meses, monitoreo semanal de pH y cloro residual',
    benefits: [
      'Elimina 99.99% de bacterias',
      'Protege salud de operarios',
      'Cumple normas ISO 13485 para industria alimentaria',
      'Reduce olores y sabores desagradables'
    ]
  },

  sediment_accumulation: {
    problem: 'Acumulación de sedimento en tanques y tuberías',
    causes: [
      'Falta de purga del sistema (no se drena periódicamente)',
      'Sedimentación natural del agua dura',
      'Erosión de tuberías metálicas corroídas',
      'Detritos acumulados en puntos bajos',
      'Baja velocidad de flujo en líneas de retorno'
    ],
    solution: 'Sistema de prefiltración 5μm + purga automática programada',
    howItWorks: 'Filtra partículas antes de que sedimenten. La purga automática drena sedimento acumulado cada 24-48 horas',
    installation: '3-4 horas con válvula de purga y timer programable',
    maintenance: 'Limpiar línea de purga mensualmente, inspeccionar cada 3 meses',
    benefits: [
      'Previene 99.5% de sedimentación',
      'Reduce mantenimiento manual',
      'Evita paros de producción por atascos',
      'Extiende vida de equipos presión 5-7 años más'
    ]
  },

  scale_hardness: {
    problem: 'Sarro/incrustaciones por agua dura',
    causes: [
      'Agua con alto contenido de minerales (calcio/magnesio)',
      'pH elevado (>8) favorece precipitación',
      'Temperatura alta acelera formación de depósitos',
      'Falta de inhibidores de escala',
      'Evaporación concentra minerales'
    ],
    solution: 'Sistema de ósmosis inversa o suavizador de agua',
    howItWorks: 'Ósmosis inversa: membrana de 0.0001 micrones rechaza minerales (99.5% remoción). Suavizador: intercambio iónico reemplaza calcio/magnesio por sodio',
    installation: 'OI: 4-6 horas. Suavizador: 2-3 horas. Requiere drenaje',
    maintenance: 'OI: cambiar membrana cada 12-24 meses. Suavizador: regenerar con sal cada 2-4 semanas',
    benefits: [
      'Elimina 99.5% de minerales',
      'Reduce consumo de energía en calderas',
      'Extiende vida de equipos 2-3x',
      'Mejora eficiencia térmica 30%'
    ]
  },

  corrosion_prevention: {
    problem: 'Corrosión de tuberías y equipos',
    causes: [
      'Agua con bajo pH (<6.5) es corrosiva',
      'Alto contenido de oxígeno disuelto',
      'Falta de inhibidores de corrosión',
      'Reacciones electroquímicas entre metales diferentes',
      'Agua con dióxido de carbono disuelto'
    ],
    solution: 'Filtro estabilizador de pH + inhibidores de corrosión',
    howItWorks: 'Neutraliza agua ácida elevando pH a 7.0-7.5. Inhibe capa protectora de óxido en metal',
    installation: '2-3 horas, se integra en línea de entrada',
    maintenance: 'Monitoreo de pH mensual, reemplazo cada 12 meses',
    benefits: [
      'Detiene corrosión activa',
      'Protege inversión de 10-15 años',
      'Reduce fallas por pinchazos',
      'Cumple ASME B16.1 para equipos presurizado'
    ]
  },

  compressed_air_oil: {
    problem: 'Aire comprimido contaminado con aceite y humedad',
    causes: [
      'Compresor viejo con desgaste en sellos',
      'Falta de drenaje de condensación en tanque',
      'Tuberías con óxido interno',
      'Vapor de aceite del compresor no filtrado',
      'Aire húmedo sin secador'
    ],
    solution: 'Compresor con filtración integrada en 3 etapas',
    howItWorks: 'Etapa 1: partículas 1μm. Etapa 2: vapor de aceite 0.01μm. Etapa 3: humedad (secador desecante)',
    installation: '4-6 horas, requiere purga de sistema anterior',
    maintenance: 'Drenar condensación diaria, cambiar cartuchos cada 6-12 meses',
    benefits: [
      'Aire limpio 99.99% libre de aceite',
      'Protege herramientas neumáticas',
      'Extiende vida de cilindros y válvulas',
      'Mejora precisión en procesos de pintura/chorreado'
    ]
  },

  water_in_fuel: {
    problem: 'Agua contaminada en combustible (diésel, gasolina)',
    causes: [
      'Condensación en tanques de almacenamiento (cambios de temperatura)',
      'Filtración de agua desde tuberías o conexiones',
      'Lluvia o derrames en tapas de carga',
      'Agua que entra durante reabastecimiento',
      'Falta de drenaje periódico del fondo del tanque',
      'Tanques viejos con corrosión y fugas'
    ],
    solution: 'Sistema separador agua-combustible con filtro coalescente',
    howItWorks: 'El filtro coalescente captura micro gotas de agua (>3 micrones) y las aglomera. El separador gravimétrico las envía al fondo para drenaje automático. Cartuchos especiales para diésel evitan absorción de agua.',
    installation: '3-4 horas en línea antes de bomba de inyección',
    maintenance: 'Drenar agua del separador diaria o según volumen. Cambiar cartucho cada 2000-5000 litros o semestral.',
    consequences: [
      'INMEDIATO: Corrosión de inyectores de combustible (agua + ácidos naturales)',
      'PROGRESIVO: Formación de emulsión agua-combustible (pasta que atasca filtros)',
      'CRÍTICO: Detención del motor sin previo aviso',
      'LARGO PLAZO: Daño severo a bomba de inyección y cilindros (motor irrecuperable)'
    ],
    symptoms: [
      'Pérdida de potencia progresiva',
      'Humo negro/blanco en escape',
      'Dificultad para encender en frío',
      'Ruidos anormales en motor (golpeteo)',
      'Consumo anormal de combustible',
      'Fallo total del motor sin causa aparente'
    ],
    benefits: [
      'Protege la inversión en equipos del motor',
      'Evita paros de producción no planificados',
      'Reduce consumo de combustible 5-8%',
      'Extiende vida de inyectores 10+ años',
      'Previene corrosión de tuberías de combustible',
      'Cumple estándares ISO 4406 (cleanliness code para combustibles)'
    ],
    technicalNotes: [
      'Agua en diésel causa reacción química: Fe³⁺ + H₂O → Fe(OH)₃ (óxido de hierro = corrosión)',
      'El agua es inmiscible en diésel pero se emulsiona si hay movimiento/turbulencia',
      'Puntos de inyección operan a >1,500 bar = presión extrema amplifica daño',
      'Solucionadores de agua en combustible NO funcionan = son mitos',
      'ÚNICA solución: Remover el agua antes de motor'
    ]
  },

  fuel_system_contamination: {
    problem: 'Contaminación general en sistema de combustible (partículas, agua, bacterias)',
    causes: [
      'Tanques de combustible con sedimento acumulado (años de almacenamiento)',
      'Bacterias Cladosporium, Aspergillus (crecen en interfaz agua-combustible)',
      'Partículas de óxido desde tuberías corroídas',
      'Hollín del motor circulando en retorno de inyectores',
      'Falta de filtración en proceso de carga/descarga'
    ],
    solution: 'Sistema triple: prefiltro grueso + filtro fino coalescente + separador de agua',
    howItWorks: 'Etapa 1 (40μm): atrapa sedimento y partículas gruesas. Etapa 2 (3μm): atrapa agua y bacterias. Etapa 3 (separador): extrae agua del fondo para drenaje. Antibacteriano opcional en cartucho.',
    installation: '5-6 horas con instalación de línea de retorno',
    maintenance: 'Inspección visual diaria de separador, drenaje cada 48 horas o 500L, cambio de cartuchos cada 3 meses',
    benefits: [
      'Combustible ISO 4406 18/16/13 (limpieza garantizada)',
      'Extiende vida de toda la línea de inyección',
      'Evita problemas de bacteria (combustible punzante/verde)',
      'Mejora estabilidad de combustible almacenado',
      'Permite usar combustible de calidad variable'
    ]
  },

  injector_performance: {
    problem: 'Pérdida de presión y caudal en inyectores (falta de potencia del motor)',
    causes: [
      'Depósitos de agua precipitada en punta del inyector',
      'Acumulación de lacas y resinas del combustible degradado',
      'Partículas de óxido bloqueando orificios (<0.15mm)',
      'Corrosión electroquímica en punta (aguja del inyector)',
      'Bacterias formando biofilm en cavidades internas'
    ],
    solution: 'Limpieza profesional + instalación de filtro separador agua + cambio de combustible',
    howItWorks: 'Limpieza ultrasónica disuelve depósitos. Instalación de separador evita futuro depósito. Cambio a combustible certificado ISO 4406 evita degradación.',
    installation: 'Desmontaje y limpieza: 2-3 horas. Nueva instalación con filtro: 4-5 horas',
    maintenance: 'Preventivo: mantener filtro separador en buen estado. Correctivo: limpieza cada 24 meses',
    benefits: [
      'Recupera potencia original del motor',
      'Reduce consumo a valores normales',
      'Mejora arranque en frío',
      'Cumple normas de emisiones Euro 5/6',
      'Extiende vida del motor 50,000+ km adicionales'
    ]
  },

  diesel_vs_gasoline_filtration: {
    problem: 'Diferencias de filtración entre diésel y gasolina',
    technicalDifferences: [
      'DIÉSEL: Mayor viscosidad (más propenso a cristalización con agua)',
      'DIÉSEL: Punto de inflamación más bajo (más riesgo de combustión espontánea con agua)',
      'DIÉSEL: Bacteria crece más rápido (ambiente húmedo + temperatura)',
      'GASOLINA: Volatilidad mayor (pierde combustible si hay contaminación)',
      'GASOLINA: Menos afectada por agua inicial PERO más riesgo de corrosión de tanque',
      'GASOLINA: Inyectores más sensibles a depósitos (presión = 2,000+ bar vs diésel 1,500 bar)'
    ],
    filteringStrategy: {
      diesel: 'Separador agua + prefiltro 40μm + filtro fino 3μm + deshollinador si retorno largo',
      gasoline: 'Prefiltro 20μm + filtro fino 10μm + trampa de agua química (no coalescente)',
      lpg: 'Solo secador desecante (LPG no tiene agua en origen, pero absorbe en almacenamiento)',
      nh3: 'Filtración especial según legislación (menos usado)'
    },
    benefits: [
      'Diésel: Evita corrosión específica de motor diésel',
      'Gasolina: Evita depósitos específicos de inyectores high-pressure',
      'Ambos: Prolongan vida de motor 50k-200k km según mantenimiento'
    ]
  },

  maintenance_best_practices: {
    weekly: [
      'Inspeccionar visual de tuberías por fugas',
      'Escuchar ruidos anormales (atascos, cavitación)',
      'Anotar presión diferencial del filtro'
    ],
    monthly: [
      'Medir presión de entrada/salida',
      'Verificar nivel de condensación en tanque',
      'Drenar válvula de purga si existe',
      'Revisar pH del agua (si aplica)'
    ],
    quarterly: [
      'Inspeccionar interior de tuberías (endoscopio si es posible)',
      'Limpiar filtros secundarios',
      'Prueba de caudal',
      'Documentar todos los datos'
    ],
    annually: [
      'Cambio de cartuchos principales',
      'Calibración de instrumentos de medición',
      'Inspección profesional con reporte',
      'Planificación de siguiente año'
    ]
  }
};

export function getKnowledgeForRisk(riskType) {
  const riskToKnowledge = {
    'contamination': 'contamination_water',
    'microorganisms': 'microorganisms_water',
    'sediment': 'sediment_accumulation',
    'scale': 'scale_hardness',
    'corrosion': 'corrosion_prevention',
    'particles': 'contamination_water',
    'chemical': 'contamination_water',
    'biological': 'microorganisms_water',
    'particulate': 'contamination_water',
    'odor': 'contamination_water',
    'water_fuel': 'water_in_fuel',
    'fuel_contamination': 'fuel_system_contamination',
    'injector_damage': 'injector_performance',
    'diesel_water': 'water_in_fuel',
    'fuel_system': 'fuel_system_contamination',
    'diesel_contamination': 'water_in_fuel',
    'fuel_water': 'water_in_fuel',
    'engine_power': 'injector_performance'
  };

  const knowledgeKey = riskToKnowledge[riskType];
  return knowledgeKey ? TECHNICAL_KNOWLEDGE[knowledgeKey] : null;
}

export function buildDetailedTechnicalResponse(product, knowledgeKey) {
  const knowledge = TECHNICAL_KNOWLEDGE[knowledgeKey];
  if (!knowledge) return null;

  // Build OEM and equipment documentation
  let oemAndEquipmentInfo = '';
  if (product.oem_part_number || product.equipment_target) {
    oemAndEquipmentInfo = '\n**Especificaciones de Parte:**\n';
    if (product.oem_part_number) {
      oemAndEquipmentInfo += `• Número de Parte OEM: ${product.oem_part_number}\n`;
    }
    if (product.equipment_target) {
      oemAndEquipmentInfo += `• Equipo Destino: ${product.equipment_target}\n`;
    }
    oemAndEquipmentInfo += '\n';
  }

  const response = `Te explico técnicamente cómo se resuelve tu problema:

**El problema:** ${knowledge.problem}
- ${knowledge.causes.join('\n- ')}

**La solución:** ${product.name} (${product.sku})${oemAndEquipmentInfo}
**Cómo funciona:**
${knowledge.howItWorks}

**Instalación y mantenimiento:**
- Instalación: ${knowledge.installation}
- Mantenimiento: ${knowledge.maintenance}

**Beneficios específicos para tu caso:**
${knowledge.benefits.map(b => `• ${b}`).join('\n')}

¿Esto aclara cómo resolvemos tu problema de ${knowledge.problem.toLowerCase()}?`;

  return response;
}

export function getMaintenanceSchedule() {
  return TECHNICAL_KNOWLEDGE.maintenance_best_practices;
}
