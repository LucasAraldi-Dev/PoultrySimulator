export type BarnType = 'POSTURA' | 'CORTE' | 'MATRIZ';
export type BarnSize = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface BarnModel {
  id: string;
  name: string;
  size: BarnSize;
  baseCapacity: number;
  baseCost: number;
  baseDailyCost: number;
  requiredLevel: number;
  description: string;
}

export interface FeedItem {
  id: string;
  name: string;
  costPerKg: number;
  requiredLevel: number;
  bonus: {
    mortalityModifier: number; // e.g. -0.05 for 5% less mortality
    growthModifier: number; // e.g. 1.05 for 5% faster growth
    eggModifier: number; // e.g. 1.1 for 10% more eggs
  };
}

export interface Equipment {
  id: string;
  name: string;
  cost: number;
  requiredLevel: number;
  description: string; // Descrição para o tooltip
  effect: {
    capacityIncrease?: number;
    mortalityReduction?: number;
    dailyCostIncrease?: number; // Contra: aumenta custo diário
    growthBonus?: number; // Pró: aumenta crescimento
    eggBonus?: number; // Pró: aumenta ovos
  };
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'DELIVER_EGGS' | 'DELIVER_MEAT' | 'HAVE_MONEY' | 'HAVE_CHICKENS';
  targetAmount: number;
  currentAmount: number;
  rewardMoney: number;
  rewardXp: number;
  deadlineDays: number;
  daysPassed: number;
  completed: boolean;
}

export interface Batch {
  id: string;
  animalCount: number;
  ageDays: number; // Idade do lote em dias
  currentWeight: number; // Peso médio em kg (para corte)
  totalFeedConsumed: number;
  mortalityCount: number;
  activeDisease: Disease | null; // Doença ativa no lote
  vaccineProtectionDays: number; // Dias restantes de proteção da vacina
  hygieneLevel: number; // Nível de higiene do lote (0-100)
}

export interface Disease {
  id: string;
  name: string;
  mortalityModifier: number; // Ex: 1.5 aumenta em 50% a mortalidade
  growthModifier: number; // Ex: 0.8 reduz o crescimento em 20%
  eggModifier: number; // Ex: 0.7 reduz a postura em 30%
  durationDays: number; // Quantos dias a doença dura
  daysActive: number; // Dias que já se passaram com a doença
}

export interface Barn {
  id: string;
  name: string;
  type: BarnType;
  size: BarnSize;
  level: number; // Nível do galpão
  capacity: number;
  equipment: string[]; // IDs of installed equipment
  batch: Batch | null; // Lote atual no galpão
  dailyCost: number; // Custo operacional diário
  isRented: boolean; // Indica se é alugado
  sanitaryVoidDays: number; // Dias restantes de vazio sanitário (0 = liberado)
  selectedFeedId: string; // Ração selecionada para o galpão
  siloBalance: number; // kg de ração no silo do galpão
  siloCapacity: number; // kg máximos que o silo aguenta
}

export interface InventoryItem {
  itemId: string; // ID da Ração, Milho, Soja, Diesel, etc.
  quantity: number; // Quantidade (kg, m3, L, etc.)
}

export interface FeedDelivery {
  id: string;
  itemId: string;
  quantity: number;
  orderedAtDay: number;
  dispatchAtDay: number;
  arrivesAtDay: number;
  freightCost: number;
  mode: 'ENTREGA' | 'CAMINHAO';
}

export interface BatchHistory {
  id: string;
  barnId: string;
  barnName: string;
  type: BarnType;
  startedAtDay: number;
  endedAtDay: number;
  mortalityCount: number;
  totalFeedConsumed: number;
  finalWeight: number; // Para corte
  totalEggsProduced: number; // Para postura
  revenue: number;
}

export interface MarketPrices {
  egg: number;
  meat: number;
  processedMeat: number;
  feedModifier: number; // Multiplicador de preço da ração (ex: 1.1 = +10% mais caro)
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  effectType: 'MORTALITY_SPIKE' | 'FEED_LOSS' | 'EQUIPMENT_BREAK' | 'FREIGHT_SPIKE' | 'FEED_SPIKE' | 'DISEASE_SPIKE';
  severity: number;
}

export interface Company {
  name: string;
  color: string;
}

export interface Machinery {
  id: string;
  name: string;
  brand: string;
  type: 'GENERATOR' | 'TRACTOR' | 'TRUCK_FEED' | 'TRUCK_LIVE' | 'TRUCK_COLD';
  tier: 'GENERIC' | 'PREMIUM';
  cost: number;
  requiredLevel: number;
  description: string;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  description: string;
  feedCostModifier: number; // Ração mais barata no Centro-Oeste
  productSaleModifier: number; // Produtos mais caros no Sudeste
  landCostModifier: number; // Custo de construir galpões
  freightCostPerKg: number; // Custo base de frete por kg de ração
}

export interface DailyExpenses {
  barns: number;
  maintenance: number;
  labor: number;
  freight: number;
}

export interface DailyTask {
  id: string;
  name: string;
  durationMinutes: number;
  startedAt: number | null; // timestamp in ms
  completed: boolean;
  effectType: 'MORTALITY' | 'GROWTH' | 'DISEASE';
  severity: 'BAIXA' | 'MEDIA' | 'ALTA';
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'TRATADOR' | 'MOTORISTA' | 'OPERADOR_FABRICA';
  experienceLevel: number; // 1 a 5 (cada nível melhora eficiência)
  dailySalary: number; // Salário diário
}

export type WeatherType = 'SUNNY' | 'RAIN' | 'HEATWAVE' | 'COLD';

export interface GameState {
  // Auth state
  isAuthenticated: boolean;
  setAuth: (access: string, refresh: string) => void;
  logout: () => void;
  fetchGameState: () => Promise<void>;
  syncAdvanceDay: () => Promise<void>;

  // Player Data
  company: Company | null;
  region: Region | null;
  money: number;
  currentDay: number;
  level: number;
  xp: number;

  // Environment
  currentWeather: WeatherType;
  weatherDaysLeft: number;

  // Emergency Loan
  emergencyLoanAvailable: boolean;
  emergencyLoanActive: boolean;
  takeEmergencyLoan: (amount: number) => void;
  payEmergencyLoan: () => void;

  // Research
  unlockedResearches: string[];
  unlockResearch: (researchId: string) => void;
  
  // Bank Loan
  bankLoan: number;
  
  // Tasks
  dailyTasks: DailyTask[];
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  
  // Market State
  marketPrices: MarketPrices;
  feedPriceHistory: { day: number; priceModifier: number }[];
  
  // Assets
  barns: Barn[];
  inventory: InventoryItem[]; // Estoque de insumos (rações e ingredientes)
  pendingDeliveries: FeedDelivery[]; // Pedidos em transporte
  ownedMachinery: string[]; // IDs of purchased machinery
  employees: Employee[]; // Funcionários contratados
  products: {
    eggs: number; // Quantidade de ovos no estoque
    meat: number; // Frangos vivos/abatidos para venda (kg ou unidades)
  };
  
  // Facilities Flags
  hasFeedMill: boolean;
  hasIncubator: boolean;
  hasSlaughterhouse: boolean;
  
  // Mercado de Futuros (Fábrica)
  futureContracts: { id: string; type: string; kg: number; lockedPricePerKg: number; expiresAtDay: number }[];
  buyFutureContract: (kg: number, pricePerKg: number, daysToDeliver: number, cost: number) => void;
  
  // Metrics & History
  totalProfit: number;
  totalExpenses: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  detailedExpenses: DailyExpenses; // Gastos acumulados por categoria
  history: BatchHistory[]; // Histórico de lotes vendidos
  activeEvent: RandomEvent | null;
  activeMissions: Mission[];

  // Actions
  buyBarn: (barn: Barn, cost: number) => void;
  upgradeBarn: (barnId: string, cost: number) => void;
  buyEquipment: (barnId: string, equipmentId: string, cost: number) => void;
  buyMachinery: (machineryId: string, cost: number) => void;
  buyFeed: (feedId: string, kg: number, totalCost: number, scheduledInDays?: number, useOwnTruck?: boolean) => void;
  buyChicks: (barnId: string, quantity: number, cost: number) => void;
  sellEggs: (quantity: number, pricePerEgg: number) => void;
  sellBatch: (barnId: string) => void; // Para descarte de Postura
  feedFlock: (barnId: string, feedId: string, amountKg: number) => void;
  advanceDay: (days?: number) => void; // Parâmetro days opcional para avançar vários dias
  resetGame: (initialChoice: 'POSTURA' | 'CORTE', companyName: string, companyColor: string, regionId: string) => void;
  addXp: (amount: number) => void;
  deliverMission: (missionId: string) => void;
  
  // Bank Loan
  loanInstallment: number; // Valor da parcela mensal
  loanInstallmentsRemaining: number; // Quantas parcelas faltam
  nextLoanPaymentDay: number; // Dia de vencimento da próxima parcela
  missedPayments: number; // Quantidade de parcelas em atraso
  
  takeLoan: (amount: number, installments: number) => void;
  payLoan: (amount: number) => void;
  payInstallment: () => void;
  
  // Employees
  hireEmployee: (role: Employee['role']) => void;
  fireEmployee: (employeeId: string) => void;
  trainEmployee: (employeeId: string, cost: number) => void;

  // Consultants
  hireVeterinarian: () => void;
  hireFinancialAdvisor: () => void;
  financialBuffDays: number;
  
  // Batch Management
  vaccinateBatch: (barnId: string, cost: number) => void;
  cleanBarn: (barnId: string, cost: number) => void;
  medicateBatch: (barnId: string) => void;
  
  // Feed Management
  selectFeed: (barnId: string, feedId: string) => void;
  fillSilo: (barnId: string, amountKg: number) => void;
  
  // Novas Ações - Fábrica
  buildFeedMill: (cost: number) => void;
  buildSlaughterhouse: (cost: number) => void;
  produceFeed: (feedId: string, amountKg: number, costToProduce: number) => void;
}
