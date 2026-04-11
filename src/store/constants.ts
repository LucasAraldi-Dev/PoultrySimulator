import { FeedItem, Equipment } from './types';

export const FEEDS: Record<string, FeedItem> = {
  // Broilers
  'feed_broiler_pre': {
    id: 'feed_broiler_pre',
    name: 'Ração Pré-Inicial (Corte)',
    costPerKg: 3.5,
    requiredLevel: 1,
    bonus: { mortalityModifier: 1.0, growthModifier: 1.0, eggModifier: 1.0 },
  },
  'feed_basic': {
    id: 'feed_basic',
    name: 'Ração Crescimento (Corte)',
    costPerKg: 1.5,
    requiredLevel: 1,
    bonus: { mortalityModifier: 1.0, growthModifier: 1.0, eggModifier: 1.0 },
  },
  'feed_terminacao': {
    id: 'feed_terminacao',
    name: 'Ração Terminação (Engorda)',
    costPerKg: 2.2,
    requiredLevel: 1,
    bonus: { mortalityModifier: 1.0, growthModifier: 1.0, eggModifier: 1.0 },
  },
  // Layers
  'feed_layers_start': {
    id: 'feed_layers_start',
    name: 'Ração Cria e Recria (Postura)',
    costPerKg: 1.8,
    requiredLevel: 1,
    bonus: { mortalityModifier: 1.0, growthModifier: 1.0, eggModifier: 1.0 },
  },
  'feed_layers': {
    id: 'feed_layers',
    name: 'Ração Postura Fase 1',
    costPerKg: 2.0,
    requiredLevel: 1,
    bonus: { mortalityModifier: 1.0, growthModifier: 1.0, eggModifier: 1.0 },
  },
};

export interface RawMaterial {
  id: string;
  name: string;
  costPerUnit: number;
  unit: 'kg' | 'm3' | 'L' | 'un';
  description: string;
}

export const RAW_MATERIALS: Record<string, RawMaterial> = {
  'corn': { id: 'corn', name: 'Milho em Grão', costPerUnit: 1.0, unit: 'kg', description: 'Base energética da ração' },
  'soy': { id: 'soy', name: 'Farelo de Soja', costPerUnit: 2.5, unit: 'kg', description: 'Base proteica da ração' },
  'premix': { id: 'premix', name: 'Núcleo/Premix', costPerUnit: 15.0, unit: 'kg', description: 'Vitaminas e minerais essenciais' },
  'rice_straw': { id: 'rice_straw', name: 'Palha de Arroz (Cama)', costPerUnit: 50.0, unit: 'm3', description: 'Forragem essencial para iniciar lotes e manter higiene' },
  'diesel': { id: 'diesel', name: 'Óleo Diesel', costPerUnit: 6.0, unit: 'L', description: 'Combustível para geradores e caminhões' },
  'medication': { id: 'medication', name: 'Medicamentos Vet.', costPerUnit: 100.0, unit: 'un', description: 'Usado para tratar doenças rapidamente' },
  'parts': { id: 'parts', name: 'Peças de Reposição', costPerUnit: 250.0, unit: 'un', description: 'Usado na manutenção preventiva e corretiva de equipamentos' },
  'gas': { id: 'gas', name: 'Gás de Aquecimento (GLP)', costPerUnit: 120.0, unit: 'un', description: 'Necessário para aquecer pintinhos nos primeiros dias' },
};

export const REGIONS: Record<string, import('./types').Region> = {
  'pe_sao_bento': {
    id: 'pe_sao_bento',
    name: 'São Bento do Una',
    state: 'PE',
    description: 'Polo forte em ovos no Nordeste. O clima é mais quente, mas a ração chega um pouco mais cara pelo frete longo.',
    feedCostModifier: 1.15, // +15% no custo base da ração (frete embutido)
    productSaleModifier: 1.05, // +5% no preço de venda (forte demanda regional)
    landCostModifier: 0.8, // Terra mais barata (-20% pra construir)
    freightCostPerKg: 0.15, // Frete caro
  },
  'sp_rio_preto': {
    id: 'sp_rio_preto',
    name: 'São José do Rio Preto',
    state: 'SP',
    description: 'Região rica com logística excelente. Consumo forte no Sudeste puxa os preços pra cima, mas a terra é cara.',
    feedCostModifier: 1.05, 
    productSaleModifier: 1.15, // +15% no preço de venda (mercado paulista)
    landCostModifier: 1.3, // +30% no custo da terra
    freightCostPerKg: 0.05, // Frete barato
  },
  'mt_lucas': {
    id: 'mt_lucas',
    name: 'Lucas do Rio Verde',
    state: 'MT',
    description: 'O coração do agro. Milho e soja abundantes fazem a ração ser barata, porém o frete pra escoar o frango é caro.',
    feedCostModifier: 0.7, // -30% no custo da ração
    productSaleModifier: 0.85, // -15% no preço de venda (muita oferta, longe do consumo)
    landCostModifier: 1.0, 
    freightCostPerKg: 0.02, // Frete da ração muito barato
  },
  'ms_campo_grande': {
    id: 'ms_campo_grande',
    name: 'Campo Grande',
    state: 'MS',
    description: 'Meio-termo perfeito do Centro-Oeste. Boa produção de grãos e proximidade razoável com o Sul/Sudeste.',
    feedCostModifier: 0.85, 
    productSaleModifier: 0.95, 
    landCostModifier: 0.9, 
    freightCostPerKg: 0.04,
  },
  'sc_chapeco': {
    id: 'sc_chapeco',
    name: 'Chapecó',
    state: 'SC',
    description: 'Capital nacional da agroindústria. Muitas cooperativas e frigoríficos. Alta tecnologia, mas muita concorrência.',
    feedCostModifier: 1.0, 
    productSaleModifier: 1.0, 
    landCostModifier: 1.1, 
    freightCostPerKg: 0.08,
  },
  'pr_cascavel': {
    id: 'pr_cascavel',
    name: 'Cascavel',
    state: 'PR',
    description: 'Oeste do Paraná, forte em grãos e integração. Ótima base para expandir com logística equilibrada.',
    feedCostModifier: 0.92,
    productSaleModifier: 1.02,
    landCostModifier: 1.05,
    freightCostPerKg: 0.06,
  },
  'rs_lajeado': {
    id: 'rs_lajeado',
    name: 'Lajeado',
    state: 'RS',
    description: 'Vale do Taquari, região de proteína e cooperativas. Mercado exigente, mas paga melhor qualidade.',
    feedCostModifier: 0.98,
    productSaleModifier: 1.08,
    landCostModifier: 1.08,
    freightCostPerKg: 0.07,
  },
  'go_rio_verde': {
    id: 'go_rio_verde',
    name: 'Rio Verde',
    state: 'GO',
    description: 'Polo do agro em Goiás. Boa oferta de milho/soja e fácil escoamento para o Sudeste.',
    feedCostModifier: 0.78,
    productSaleModifier: 0.95,
    landCostModifier: 0.95,
    freightCostPerKg: 0.03,
  },
  'mg_uberlandia': {
    id: 'mg_uberlandia',
    name: 'Uberlândia',
    state: 'MG',
    description: 'Hub logístico entre Centro-Oeste e Sudeste. Frete eficiente, terra intermediária, bom preço de venda.',
    feedCostModifier: 0.95,
    productSaleModifier: 1.08,
    landCostModifier: 1.12,
    freightCostPerKg: 0.05,
  },
  'ba_barreiras': {
    id: 'ba_barreiras',
    name: 'Barreiras',
    state: 'BA',
    description: 'MATOPIBA em expansão. Grãos crescentes, mas riscos climáticos e logística mais longa.',
    feedCostModifier: 0.9,
    productSaleModifier: 0.92,
    landCostModifier: 0.85,
    freightCostPerKg: 0.12,
  },
  'pa_paragominas': {
    id: 'pa_paragominas',
    name: 'Paragominas',
    state: 'PA',
    description: 'Fronteira agrícola distante. Terra barata, mas frete caro e instabilidade de abastecimento.',
    feedCostModifier: 1.22,
    productSaleModifier: 1.05,
    landCostModifier: 0.75,
    freightCostPerKg: 0.18,
  }
};

export const BARN_MODELS: Record<string, import('./types').BarnModel> = {
  'pequeno_postura': {
    id: 'pequeno_postura',
    name: 'Galpão Pequeno',
    size: 'PEQUENO',
    baseCapacity: 1000,
    baseCost: 15000,
    baseDailyCost: 10,
    requiredLevel: 1,
    description: 'Estrutura básica de madeira. Baixo custo, mas capacidade limitada.',
  },
  'medio_postura': {
    id: 'medio_postura',
    name: 'Galpão Médio',
    size: 'MEDIO',
    baseCapacity: 3000,
    baseCost: 40000,
    baseDailyCost: 25,
    requiredLevel: 4,
    description: 'Galpão de alvenaria com melhor isolamento térmico.',
  },
  'grande_postura': {
    id: 'grande_postura',
    name: 'Galpão Industrial',
    size: 'GRANDE',
    baseCapacity: 10000,
    baseCost: 120000,
    baseDailyCost: 70,
    requiredLevel: 8,
    description: 'Galpão de grande escala. Alto custo inicial, mas excelente para produção em massa.',
  },
  'pequeno_corte': {
    id: 'pequeno_corte',
    name: 'Galpão Pequeno',
    size: 'PEQUENO',
    baseCapacity: 2000,
    baseCost: 20000,
    baseDailyCost: 15,
    requiredLevel: 1,
    description: 'Galpão de piso simples, ideal para iniciantes.',
  },
  'medio_corte': {
    id: 'medio_corte',
    name: 'Galpão Médio',
    size: 'MEDIO',
    baseCapacity: 6000,
    baseCost: 55000,
    baseDailyCost: 35,
    requiredLevel: 4,
    description: 'Estrutura reforçada, comporta uma quantidade média de aves.',
  },
  'grande_corte': {
    id: 'grande_corte',
    name: 'Galpão Industrial',
    size: 'GRANDE',
    baseCapacity: 20000,
    baseCost: 160000,
    baseDailyCost: 100,
    requiredLevel: 8,
    description: 'Megagalpão focado em escala industrial e grandes abates.',
  }
};

export const EQUIPMENTS: Record<string, import('./types').Equipment> = {
  'eq_ventilador': {
    id: 'eq_ventilador',
    name: 'Ventilador Industrial',
    cost: 500,
    requiredLevel: 2,
    description: 'Melhora a circulação de ar, essencial para dias quentes. Aumenta levemente a conta de luz.',
    effect: { mortalityReduction: 0.1, dailyCostIncrease: 2 },
  },
  'eq_aquecedor_gas': {
    id: 'eq_aquecedor_gas',
    name: 'Aquecedor a Gás (Campânula)',
    cost: 1500,
    requiredLevel: 3,
    description: 'Mantém os pintinhos aquecidos nos primeiros dias. Custo diário com gás.',
    effect: { mortalityReduction: 0.15, dailyCostIncrease: 5 },
  },
  'eq_comedouro_auto': {
    id: 'eq_comedouro_auto',
    name: 'Comedouro Automático',
    cost: 1200,
    requiredLevel: 4,
    description: 'Distribui ração automaticamente, removendo a necessidade da tarefa diária manual.',
    effect: { capacityIncrease: 0, dailyCostIncrease: 3 }, 
  },
  'eq_bebedouro_nipple': {
    id: 'eq_bebedouro_nipple',
    name: 'Bebedouro Tipo Nipple',
    cost: 800,
    requiredLevel: 5,
    description: 'Fornece água limpa sem molhar a cama. Reduz doenças e mortalidade.',
    effect: { mortalityReduction: 0.05 },
  },
  'eq_nebulizador': {
    id: 'eq_nebulizador',
    name: 'Linha de Nebulização',
    cost: 2500,
    requiredLevel: 6,
    description: 'Borrifa microgotas de água para resfriar o galpão. Muito eficaz no calor, mas gasta água e energia.',
    effect: { mortalityReduction: 0.20, dailyCostIncrease: 8 },
  },
  'eq_placa_evap': {
    id: 'eq_placa_evap',
    name: 'Placa Evaporativa (Climatização)',
    cost: 4500,
    requiredLevel: 7,
    description: 'Resfria o ar que entra no galpão de forma muito eficiente. Custo diário moderado.',
    effect: { mortalityReduction: 0.25, dailyCostIncrease: 10 },
  },
  'eq_silo_grande': {
    id: 'eq_silo_grande',
    name: 'Silo de Armazenagem 10T',
    cost: 4000,
    requiredLevel: 9,
    description: 'Silo externo conectado ao galpão. Libera espaço interno, aumentando drasticamente a capacidade.',
    effect: { capacityIncrease: 2000 },
  },
  'eq_dark_house': {
    id: 'eq_dark_house',
    name: 'Sistema Dark House',
    cost: 15000,
    requiredLevel: 12,
    description: 'Isolamento total de luz e ventilação exaustora. Crescimento espetacular e baixíssima mortalidade, porém altíssimo custo de energia.',
    effect: { mortalityReduction: 0.40, capacityIncrease: 1000, growthBonus: 0.15, dailyCostIncrease: 30 },
  }
};

export const DISEASES: Record<string, Omit<import('./types').Disease, 'daysActive'>> = {
  'gripe_aviaria_leve': {
    id: 'gripe_aviaria_leve',
    name: 'Gripe Aviária (Leve)',
    mortalityModifier: 5.0, // Multiplica a mortalidade por 5
    growthModifier: 0.8, // Cresce 20% menos
    eggModifier: 0.5, // Bota 50% menos ovos
    durationDays: 7,
  },
  'bronquite_infecciosa': {
    id: 'bronquite_infecciosa',
    name: 'Bronquite Infecciosa',
    mortalityModifier: 2.0,
    growthModifier: 0.9,
    eggModifier: 0.3, // Queda brusca na postura
    durationDays: 14,
  },
  'doenca_newcastle': {
    id: 'doenca_newcastle',
    name: 'Doença de Newcastle',
    mortalityModifier: 10.0, // Alta mortalidade
    growthModifier: 0.5,
    eggModifier: 0.1,
    durationDays: 5,
  }
};

export const MACHINERY_CATALOG: Record<string, import('./types').Machinery> = {
  'gen_generator': {
    id: 'gen_generator',
    name: 'Gerador a Diesel',
    brand: 'Branco (Usado)',
    type: 'GENERATOR',
    tier: 'GENERIC',
    cost: 15000,
    requiredLevel: 3,
    description: 'Evita a quebra de equipamentos durante quedas de energia (50% de chance de acionar a tempo).'
  },
  'prem_generator': {
    id: 'prem_generator',
    name: 'Gerador Cabinado Automático',
    brand: 'Stemac',
    type: 'GENERATOR',
    tier: 'PREMIUM',
    cost: 45000,
    requiredLevel: 10,
    description: 'Proteção total garantida contra quedas de energia. Acionamento em 3 segundos.'
  },
  'gen_tractor': {
    id: 'gen_tractor',
    name: 'Trator Leve',
    brand: 'Agrale 4100',
    type: 'TRACTOR',
    tier: 'GENERIC',
    cost: 35000,
    requiredLevel: 2,
    description: 'Agiliza a limpeza e o manejo. Reduz o custo diário de todos os galpões em 5%.'
  },
  'prem_tractor': {
    id: 'prem_tractor',
    name: 'Trator Cabinado com Ar',
    brand: 'John Deere Série 5',
    type: 'TRACTOR',
    tier: 'PREMIUM',
    cost: 120000,
    requiredLevel: 9,
    description: 'Manejo impecável de alto rendimento. Reduz o custo diário dos galpões em 15%.'
  },
  'gen_truck_small': {
    id: 'gen_truck_small',
    name: 'Caminhonete 3/4',
    brand: 'F-4000 / MB 710',
    type: 'TRUCK_FEED',
    tier: 'GENERIC',
    cost: 50000,
    requiredLevel: 4,
    description: 'Veículo básico para buscar carga leve. Reduz o frete em 10% (Economia de combustível em curtas distâncias).'
  },
  'gen_truck_toco': {
    id: 'gen_truck_toco',
    name: 'Caminhão Toco',
    brand: 'MB 1620 / Ford Cargo 1317',
    type: 'TRUCK_FEED',
    tier: 'GENERIC',
    cost: 110000,
    requiredLevel: 6,
    description: 'O clássico guerreiro das rodovias. Reduz o frete em 25% (melhor custo-benefício em médias distâncias).'
  },
  'gen_truck_feed': {
    id: 'gen_truck_feed',
    name: 'Caminhão Truck Graneleiro',
    brand: 'VW Worker 24.220',
    type: 'TRUCK_FEED',
    tier: 'GENERIC',
    cost: 185000,
    requiredLevel: 8,
    description: 'Transporte pesado de ração. Reduz o custo do frete no mercado em 50%.'
  },
  'prem_truck_feed': {
    id: 'prem_truck_feed',
    name: 'Carreta Bi-Trem (LS)',
    brand: 'Volvo FH 460 / Scania R440',
    type: 'TRUCK_FEED',
    tier: 'PREMIUM',
    cost: 380000,
    requiredLevel: 12,
    description: 'Compra direto das gigantes da soja. Corta todo o custo de frete na compra da ração e ganha -5% no valor do insumo.'
  },
  'gen_truck_live': {
    id: 'gen_truck_live',
    name: 'Caminhão Baú de Transporte',
    brand: 'MB Atego 2426',
    type: 'TRUCK_LIVE',
    tier: 'GENERIC',
    cost: 210000,
    requiredLevel: 7,
    description: 'Transporte de aves vivas com baixo estresse: Aumenta o preço de venda de frangos vivos em 5%.'
  },
  'prem_truck_cold': {
    id: 'prem_truck_cold',
    name: 'Carreta Frigorífica',
    brand: 'Scania R450',
    type: 'TRUCK_COLD',
    tier: 'PREMIUM',
    cost: 450000,
    requiredLevel: 15,
    description: 'Exige Abatedouro. Logística refrigerada premium que garante +15% de receita na carne abatida.'
  }
};

// Tabela Base Cobb500 (Dias 1 a 42)
// Referência aproximada de ganho de peso (g) e consumo diário (g)
export const COBB500_TABLE: Record<number, { weightG: number, dailyFeedG: number, dailyMortalityPct: number }> = {
  1: { weightG: 42, dailyFeedG: 14, dailyMortalityPct: 0.15 },
  2: { weightG: 58, dailyFeedG: 16, dailyMortalityPct: 0.10 },
  3: { weightG: 77, dailyFeedG: 19, dailyMortalityPct: 0.10 },
  4: { weightG: 101, dailyFeedG: 23, dailyMortalityPct: 0.08 },
  5: { weightG: 130, dailyFeedG: 28, dailyMortalityPct: 0.08 },
  6: { weightG: 164, dailyFeedG: 34, dailyMortalityPct: 0.08 },
  7: { weightG: 203, dailyFeedG: 41, dailyMortalityPct: 0.08 },
  8: { weightG: 247, dailyFeedG: 48, dailyMortalityPct: 0.05 },
  9: { weightG: 297, dailyFeedG: 56, dailyMortalityPct: 0.05 },
  10: { weightG: 353, dailyFeedG: 64, dailyMortalityPct: 0.05 },
  14: { weightG: 645, dailyFeedG: 99, dailyMortalityPct: 0.03 },
  21: { weightG: 1318, dailyFeedG: 154, dailyMortalityPct: 0.03 },
  28: { weightG: 2154, dailyFeedG: 197, dailyMortalityPct: 0.04 },
  35: { weightG: 3040, dailyFeedG: 224, dailyMortalityPct: 0.05 },
  42: { weightG: 3904, dailyFeedG: 238, dailyMortalityPct: 0.08 },
};

// Função auxiliar para interpolar dias não listados
export const getCobb500Data = (day: number) => {
  if (day <= 0) return COBB500_TABLE[1];
  if (day > 42) return COBB500_TABLE[42]; // Limita a 42 dias para crescimento máximo base
  
  if (COBB500_TABLE[day]) return COBB500_TABLE[day];
  
  // Interpolação simples
  let lowerDay = 1;
  let upperDay = 42;
  const days = Object.keys(COBB500_TABLE).map(Number).sort((a,b) => a - b);
  for (let i = 0; i < days.length; i++) {
    if (days[i] < day) lowerDay = days[i];
    if (days[i] > day) {
      upperDay = days[i];
      break;
    }
  }
  
  const range = upperDay - lowerDay;
  const progress = (day - lowerDay) / range;
  
  const lowerData = COBB500_TABLE[lowerDay];
  const upperData = COBB500_TABLE[upperDay];
  
  return {
    weightG: lowerData.weightG + (upperData.weightG - lowerData.weightG) * progress,
    dailyFeedG: lowerData.dailyFeedG + (upperData.dailyFeedG - lowerData.dailyFeedG) * progress,
    dailyMortalityPct: lowerData.dailyMortalityPct + (upperData.dailyMortalityPct - lowerData.dailyMortalityPct) * progress,
  };
};

export const GLOBAL_EVENTS: import('./types').RandomEvent[] = [
  { id: 'diesel_crisis', name: 'Crise Global do Petróleo', description: 'Conflitos no Oriente Médio (Irã/Israel) dispararam o preço do barril. O custo de frete subiu absurdamente!', effectType: 'FREIGHT_SPIKE', severity: 1.5 },
  { id: 'corn_shortage', name: 'Quebra de Safra Histórica', description: 'Seca severa no Centro-Oeste destruiu as lavouras de milho. O preço da ração disparou no mercado!', effectType: 'FEED_SPIKE', severity: 1.4 },
  { id: 'heat_wave', name: 'Onda de Calor Extrema', description: 'El Niño brutal! Temperaturas recordes. Mortalidade aumentada em galpões sem climatização.', effectType: 'MORTALITY_SPIKE', severity: 2.5 },
  { id: 'rat_infestation', name: 'Infestação de Roedores', description: 'Ratos invadiram seus estoques de ração e contaminaram 10% do seu estoque!', effectType: 'FEED_LOSS', severity: 0.1 },
  { id: 'power_outage', name: 'Apagão Nacional', description: 'Falha no sistema interligado nacional. Equipamentos pararam hoje.', effectType: 'EQUIPMENT_BREAK', severity: 1.0 },
  { id: 'bird_flu', name: 'Alerta de Gripe Aviária', description: 'Focos de gripe aviária (H5N1) detectados em aves silvestres próximas! Risco de doenças disparou.', effectType: 'DISEASE_SPIKE', severity: 3.0 },
];

export const DEFAULT_DAILY_TASKS: import('./types').DailyTask[] = [
  {
    id: 'clean_drinkers',
    name: 'Limpar Bebedouros',
    description: 'Evita a proliferação de bactérias na água.',
    durationMinutes: 1,
    startedAt: null,
    completed: false,
    effectType: 'DISEASE',
    severity: 'MEDIA',
  },
  {
    id: 'check_temperature',
    name: 'Checar Climatização',
    description: 'Ajusta a temperatura para o conforto térmico ideal.',
    durationMinutes: 2,
    startedAt: null,
    completed: false,
    effectType: 'GROWTH',
    severity: 'MEDIA',
  },
  {
    id: 'remove_dead',
    name: 'Retirar Aves Mortas',
    description: 'Evita contaminação do lote e doenças.',
    durationMinutes: 3,
    startedAt: null,
    completed: false,
    effectType: 'MORTALITY',
    severity: 'ALTA',
  }
];

export const INITIAL_MONEY = 15000; // Rebalanceado: De 5000 para 15000 para conseguir concluir 1º lote com folga
export const CHICK_COST = 2.0; // Price per chick
export const EGG_PRICE = 0.5; // Venda de ovo unitário
export const MEAT_PRICE_PER_KG = 6.0; // Venda de frango vivo por KG
export const MEAT_PROCESSED_PRICE_PER_KG = 10.0; // Venda frango abatido
export const LAYER_COST = 18.0; // Price per young layer (franga)

export const MAX_LAYER_AGE_DAYS = 600; // Idade em que as galinhas de postura param de botar bem
export const DISCARD_BIRD_PRICE = 3.5; // Valor de venda da galinha de descarte
export const SANITARY_VOID_DAYS = 15; // Dias que o galpão deve ficar vazio para desinfecção após a saída de um lote

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // nome do ícone lucide
  rewardMoney: number;
  rewardXp: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'primeiro_lote': {
    id: 'primeiro_lote',
    title: 'O Início de Tudo',
    description: 'Aloje seu primeiro lote de aves.',
    icon: 'Egg',
    rewardMoney: 1000,
    rewardXp: 50,
  },
  'empresario': {
    id: 'empresario',
    title: 'Visão de Negócio',
    description: 'Acumule R$ 500.000 em caixa.',
    icon: 'DollarSign',
    rewardMoney: 5000,
    rewardXp: 200,
  },
  'magnata': {
    id: 'magnata',
    title: 'Magnata do Agro',
    description: 'Acumule R$ 1.000.000 em caixa.',
    icon: 'Crown',
    rewardMoney: 20000,
    rewardXp: 1000,
  },
  'imperio': {
    id: 'imperio',
    title: 'Império das Aves',
    description: 'Alcance uma capacidade total de 50.000 aves alojadas.',
    icon: 'Home',
    rewardMoney: 15000,
    rewardXp: 500,
  },
  'industrial': {
    id: 'industrial',
    title: 'Revolução Industrial',
    description: 'Construa sua própria Fábrica de Ração.',
    icon: 'Factory',
    rewardMoney: 10000,
    rewardXp: 300,
  },
  'frigorifico': {
    id: 'frigorifico',
    title: 'Processamento Próprio',
    description: 'Construa seu Abatedouro Frigorífico.',
    icon: 'Briefcase',
    rewardMoney: 25000,
    rewardXp: 600,
  },
  'pesquisador': {
    id: 'pesquisador',
    title: 'Tecnologia de Ponta',
    description: 'Atinja o nível 5 em qualquer pesquisa.',
    icon: 'Microscope',
    rewardMoney: 5000,
    rewardXp: 400,
  },
  'veterano': {
    id: 'veterano',
    title: 'Veterano',
    description: 'Alcance o nível 10 de jogador.',
    icon: 'Star',
    rewardMoney: 10000,
    rewardXp: 0,
  }
};

