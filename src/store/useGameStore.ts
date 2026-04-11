import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Barn, Batch, Disease, DailyTask } from './types';
import { INITIAL_MONEY, FEEDS, EQUIPMENTS, DISEASES, EGG_PRICE, MEAT_PRICE_PER_KG, MEAT_PROCESSED_PRICE_PER_KG, MACHINERY_CATALOG, REGIONS, SANITARY_VOID_DAYS, getCobb500Data, GLOBAL_EVENTS,
  ACHIEVEMENTS,
  DISCARD_BIRD_PRICE
} from './constants';
import { getGameMonth } from '../lib/utils';
import { api } from '../lib/api';

// Funções utilitárias mantidas para não quebrar a tipagem existente
const generateDailyTasks = (barns: Barn[]): DailyTask[] => {
  const tasks: Omit<DailyTask, 'startedAt' | 'completed' | 'resultReport'>[] = [
    {
      id: 'clean_drinkers',
      name: 'Limpar Bebedouros',
      description: 'Reduz contaminação da água e risco sanitário.',
      durationMinutes: 2,
      effectType: 'DISEASE',
      severity: 'MEDIA',
    },
    {
      id: 'check_temperature',
      name: 'Checar Climatização',
      description: 'Ajusta temperatura, ventilação e cortinas para conforto térmico.',
      durationMinutes: 3,
      effectType: 'GROWTH',
      severity: 'ALTA',
    },
    {
      id: 'biosecurity',
      name: 'Biosseguridade',
      description: 'Controle de entrada, troca de botas e higienização.',
      durationMinutes: 5,
      effectType: 'DISEASE',
      severity: 'ALTA',
    },
    {
      id: 'check_litter',
      name: 'Manejo de Cama',
      description: 'Revolve cama, remove umidade e reduz amônia.',
      durationMinutes: 4,
      effectType: 'DISEASE',
      severity: 'BAIXA',
    },
    {
      id: 'check_feed_silo',
      name: 'Checar Estoque de Ração',
      description: 'Confere consumo previsto e planeja reposição para evitar falta.',
      durationMinutes: 1,
      effectType: 'MORTALITY',
      severity: 'ALTA',
    },
    {
      id: 'record_weights',
      name: 'Aferir Peso (Amostragem)',
      description: 'Amostragem do lote para comparar com o manual de linhagem.',
      durationMinutes: 8,
      effectType: 'GROWTH',
      severity: 'BAIXA',
    }
  ];

  // Tarefa de Alimentação Manual se algum galpão NÃO TIVER Comedouro Automático
  const needsManualFeed = barns.some(b => b.batch && !b.equipment.includes('eq_comedouro_auto'));
  if (needsManualFeed) {
    tasks.push({
      id: 'manual_feed',
      name: 'Alimentar Lote (Manual)',
      description: 'Distribuir ração nos pratos manualmente. (Compre Comedouro Automático para evitar)',
      durationMinutes: 15,
      effectType: 'GROWTH', // Afeta o ganho se não der comida
      severity: 'ALTA',
    });
  }

  const hasMortalityHistory = barns.some(b => b.batch && b.batch.mortalityCount > 0);
  if (hasMortalityHistory) {
    tasks.push({
      id: 'remove_dead',
      name: 'Retirar Aves Mortas',
      description: 'Remove carcaças e evita disseminação de patógenos.',
      durationMinutes: 3,
      effectType: 'MORTALITY',
      severity: 'ALTA',
    });
  }

  return tasks.map(t => ({ ...t, startedAt: null, completed: false }));
};

const createInitialBarn = (choice: 'POSTURA' | 'CORTE', regionId: string): Barn => {
  const landMod = REGIONS[regionId]?.landCostModifier || 1;
  if (choice === 'POSTURA') {
    return {
      id: 'barn_1',
      name: 'Galpão Principal (Postura)',
      type: 'POSTURA',
      size: 'PEQUENO',
      level: 1,
      capacity: 1000,
      equipment: [],
      dailyCost: 10 * landMod,
      isRented: false,
      sanitaryVoidDays: 0,
      siloBalance: 0,
      siloCapacity: 2000,
      batch: {
        id: 'batch_1',
        animalCount: 500,
        ageDays: 120,
        currentWeight: 1.8,
        totalFeedConsumed: 0,
        mortalityCount: 0,
        activeDisease: null,
        vaccineProtectionDays: 0,
        hygieneLevel: 100,
      },
      selectedFeedId: 'feed_layers_start',
    };
  }
  return {
    id: 'barn_1',
    name: 'Galpão Principal (Corte)',
    type: 'CORTE',
    size: 'PEQUENO',
    level: 1,
    capacity: 2000,
    equipment: [],
    dailyCost: 15 * landMod,
    isRented: false,
    sanitaryVoidDays: 0,
    siloBalance: 0,
    siloCapacity: 2000,
    batch: {
      id: 'batch_1',
      animalCount: 1000,
      ageDays: 1,
      currentWeight: 0.05,
      totalFeedConsumed: 0,
      mortalityCount: 0,
      activeDisease: null,
      vaccineProtectionDays: 0,
      hygieneLevel: 100,
    },
    selectedFeedId: 'feed_broiler_pre',
  };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      isAuthenticated: !!localStorage.getItem('access_token'),
  setAuth: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    set({ isAuthenticated: true });
    get().fetchGameState();
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ isAuthenticated: false, company: null });
  },
  fetchGameState: async () => {
    try {
      const response = await api.get('/game/state/');
      const player = response.data;
      
      const localState = get();
      
      // Resolução de conflito básica: Quem estiver com o dia mais avançado vence.
      if (localState.currentDay > player.current_day) {
        console.log('Estado local é mais recente. Enviando para o servidor...');
        get().syncToServer();
        return;
      }
      
      // Mapear dados do backend para o formato do Frontend (GameState)
      set({
        company: { name: player.company_name, color: player.company_color },
        money: player.money,
        xp: player.xp || 0,
        level: player.level || 1,
        activeResearchId: player.active_research_id || null,
        activeResearchDaysLeft: player.active_research_days_left || 0,
        currentDay: player.current_day,
        totalProfit: player.total_profit,
        totalExpenses: player.total_expenses,
        currentMonthRevenue: player.current_month_revenue,
        hasFeedMill: player.has_feed_mill,
        hasIncubator: player.has_incubator,
        hasSlaughterhouse: player.has_slaughterhouse,
        
        products: {
          eggs: player.products?.eggs || 0,
          meat: player.products?.meat || 0,
        },
        
        // Conversão dos arrays de barns e inventory
        // (O backend precisará enviar isso no serializer em detalhes no futuro. Por ora, mapeia o básico)
        barns: player.barns.map((b: any) => ({
          id: b.id.toString(),
          name: b.name,
          type: b.barn_type,
          capacity: b.capacity,
          level: b.level,
          siloCapacity: b.silo_capacity,
          siloBalance: b.silo_balance,
          selectedFeedId: b.selected_feed_id || 'feed_basic',
          isRented: b.is_rented,
          sanitaryVoidDays: b.sanitary_void_days,
          equipment: [], // Não no backend ainda
          dailyCost: 0,
          size: 'PEQUENO',
          batch: b.batch ? {
            id: b.batch.id.toString(),
            animalCount: b.batch.animal_count,
            ageDays: b.batch.age_days,
            currentWeight: b.batch.weight,
            mortalityCount: b.batch.mortality_count,
            activeDisease: null,
            totalFeedConsumed: 0,
            vaccineProtectionDays: 0,
            hygieneLevel: 100,
          } : null
        })),
        
        inventory: player.inventory.map((i: any) => ({
          itemId: i.item_id,
          quantity: i.quantity
        }))
      });
    } catch (err) {
      console.error("Erro ao buscar estado do jogo", err);
      get().logout();
    }
  },
  
  syncAdvanceDay: async () => {
    try {
      const res = await api.post('/game/advance-day/');
      // Ao avançar o dia, buscamos o estado atualizado do backend e injetamos no store
      await get().fetchGameState();
    } catch (err) {
      console.error("Erro ao avançar dia no backend", err);
    }
  },

  syncToServer: async () => {
    try {
      const state = get();
      if (!state.isAuthenticated) return;
      
      // Envia o estado local atual para sobrescrever o servidor
      await api.post('/game/sync/', {
        money: state.money,
        xp: state.xp,
        level: state.level,
        totalProfit: state.totalProfit,
        totalExpenses: state.totalExpenses,
        currentMonthRevenue: state.currentMonthRevenue,
        currentDay: state.currentDay,
        hasFeedMill: state.hasFeedMill,
        hasIncubator: state.hasIncubator,
        hasSlaughterhouse: state.hasSlaughterhouse,
        products: state.products,
        inventory: state.inventory,
        barns: state.barns
      });
      console.log('Sincronização com servidor concluída com sucesso!');
      
      // Busca atualizações (como pesquisas que podem ter finalizado)
      await get().fetchGameState();
      await get().fetchResearchesApi();
    } catch (err) {
      console.error('Erro ao sincronizar estado com servidor', err);
    }
  },

  // Async Economy Actions (Para Nuvem - Híbrido)
  fetchResearchesApi: async () => {
    try {
      if (get().isAuthenticated && navigator.onLine) {
        const response = await api.get('/game/research/');
        set({ researches: response.data });
      }
    } catch (err) {
      console.error("Erro ao buscar pesquisas da nuvem", err);
    }
  },

  startResearchApi: async (researchId: string) => {
    try {
      if (get().isAuthenticated && navigator.onLine) {
        const response = await api.post('/game/research/start/', { research_id: researchId });
        set({
          money: response.data.player.money,
          xp: response.data.player.xp,
          activeResearchId: response.data.player.active_research_id,
          activeResearchDaysLeft: response.data.player.active_research_days_left,
          researches: response.data.researches
        });
        alert(response.data.message);
      } else {
        alert("Conecte-se online para realizar pesquisas!");
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Erro ao iniciar pesquisa.");
    }
  },

  buyItemApi: async (itemId, quantity, totalCost, scheduledInDays = 0, useOwnTruck = false) => {
    const scheduledDays = Math.max(0, Math.floor(scheduledInDays || 0));
    if (scheduledDays > 0 || useOwnTruck) {
      get().buyFeed(itemId, quantity, totalCost, scheduledDays, useOwnTruck);
      return;
    }

    const isAuth = get().isAuthenticated;
    const isOnline = navigator.onLine;
    if (isAuth && isOnline) {
      try {
        await api.post('/economy/buy-item/', { item_id: itemId, quantity, total_cost: totalCost });
        await get().fetchGameState();
        return;
      } catch (err) {
        console.error("Erro na compra de item na nuvem. Aplicando localmente...", err);
      }
    }
    
    // Offline fallback ou falha na nuvem
    const state = get();
    if (state.money >= totalCost) {
      const newInv = [...state.inventory];
      const existing = newInv.findIndex(i => i.itemId === itemId);
      if (existing >= 0) newInv[existing].quantity += quantity;
      else newInv.push({ itemId, quantity });
      
      set({ money: state.money - totalCost, totalExpenses: state.totalExpenses + totalCost, inventory: newInv });
    }
  },

  sellProductsApi: async (productType, quantity, pricePerUnit) => {
    const isAuth = get().isAuthenticated;
    const isOnline = navigator.onLine;
    if (isAuth && isOnline) {
      try {
        await api.post('/economy/sell-products/', { product_type: productType, quantity, price_per_unit: pricePerUnit });
        await get().fetchGameState();
        return;
      } catch (err) {
        console.error("Erro na venda na nuvem. Aplicando localmente...", err);
      }
    }
    
    // Offline fallback
    const state = get();
    if (productType === 'eggs' && state.products.eggs >= quantity) {
      const revenue = quantity * pricePerUnit;
      set({ 
        money: state.money + revenue, 
        totalProfit: state.totalProfit + revenue,
        products: { ...state.products, eggs: state.products.eggs - quantity }
      });
    } else if (productType === 'meat' && state.products.meat >= quantity) {
      const revenue = quantity * pricePerUnit;
      set({ 
        money: state.money + revenue, 
        totalProfit: state.totalProfit + revenue,
        products: { ...state.products, meat: state.products.meat - quantity }
      });
    }
  },

  buyBarnApi: async (name, type, capacity, cost) => {
    const isAuth = get().isAuthenticated;
    const isOnline = navigator.onLine;
    if (isAuth && isOnline) {
      try {
        await api.post('/economy/buy-barn/', { name, type, capacity, cost });
        await get().fetchGameState();
        return;
      } catch (err) {
        console.error("Erro ao construir galpão na nuvem. Aplicando localmente...", err);
      }
    }
    
    // Offline fallback
    const state = get();
    if (state.money >= cost) {
      const newBarn: Barn = {
        id: `barn_${Date.now()}`,
        name,
        type,
        size: capacity > 10000 ? 'GRANDE' : capacity > 5000 ? 'MEDIO' : 'PEQUENO',
        level: 1,
        capacity,
        equipment: [],
        dailyCost: type === 'POSTURA' ? 10 : 15,
        isRented: false,
        sanitaryVoidDays: 0,
        siloBalance: 0,
        siloCapacity: 2000,
        batch: null,
        selectedFeedId: type === 'POSTURA' ? 'feed_layers_start' : 'feed_broiler_pre',
      };
      set({ money: state.money - cost, totalExpenses: state.totalExpenses + cost, barns: [...state.barns, newBarn] });
    }
  },

  buyBatchApi: async (barnId, animalCount, cost) => {
    const isAuth = get().isAuthenticated;
    const isOnline = navigator.onLine;
    if (isAuth && isOnline) {
      try {
        await api.post('/economy/buy-batch/', { barn_id: barnId, animal_count: animalCount, cost });
        await get().fetchGameState();
        return;
      } catch (err) {
        console.error("Erro ao alojar lote na nuvem. Aplicando localmente...", err);
      }
    }
    
    // Offline fallback
    const state = get();
    if (state.money >= cost) {
      const newBarns = state.barns.map(b => {
        if (b.id === barnId && !b.batch) {
          return {
            ...b,
            batch: {
              id: `batch_${Date.now()}`,
              animalCount,
              ageDays: 1,
              currentWeight: b.type === 'POSTURA' ? 0.05 : 0.05,
              totalFeedConsumed: 0,
              mortalityCount: 0,
              activeDisease: null,
              vaccineProtectionDays: 0,
              hygieneLevel: 100,
            }
          };
        }
        return b;
      });
      set({ money: state.money - cost, totalExpenses: state.totalExpenses + cost, barns: newBarns });
    }
  },

  company: null,
  region: null,
  money: 0,
  gold: 1000,
  currentDay: 0, // starts at 0 to prevent running before init
  currentHour: 6, // Começa as 6:00
  level: 1,
  xp: 0,
  currentWeather: 'SUNNY',
  weatherDaysLeft: 3,
  researches: {},
  activeResearchId: null,
  activeResearchDaysLeft: 0,
  bankLoan: 0,
  loanInstallment: 0,
  loanInstallmentsRemaining: 0,
  nextLoanPaymentDay: 0,
  missedPayments: 0,
  dailyTasks: [],
  
  emergencyLoanAvailable: false,
  emergencyLoanActive: false,

  ownedMachinery: [],
  marketPrices: {
    egg: EGG_PRICE,
    meat: MEAT_PRICE_PER_KG,
    processedMeat: MEAT_PROCESSED_PRICE_PER_KG,
    feedModifier: 1.0,
  },
  feedPriceHistory: [],
  barns: [],
  inventory: [],
  pendingDeliveries: [],
  employees: [],
  products: {
    eggs: 0,
    meat: 0,
  },
  hasFeedMill: false,
  hasIncubator: false,
  hasSlaughterhouse: false,
  futureContracts: [],
  unlockedAchievements: [],

  financialBuffDays: 0,
  totalProfit: 0,
  totalExpenses: 0,
  currentMonthRevenue: 0,
  lastMonthRevenue: 0,
  detailedExpenses: { barns: 0, maintenance: 0, labor: 0, freight: 0 },
  history: [],
  activeEvent: null,
  activeMissions: [],

  addXp: (amount: number) => set((state) => {
    let newXp = state.xp + amount;
    let newLevel = state.level;
    
    // Nível precisa de: 1000 * L^2 (Bem mais difícil)
    // L1->L2 = 1000 XP
    // L2->L3 = 4000 XP
    // L3->L4 = 9000 XP
    let nextLevelXp = 1000 * Math.pow(newLevel, 2);
    
    while (newXp >= nextLevelXp) {
      newLevel++;
      nextLevelXp = 1000 * Math.pow(newLevel, 2);
    }
    
    return { xp: newXp, level: newLevel };
  }),

  resetGame: (initialChoice: 'POSTURA' | 'CORTE', companyName: string, companyColor: string, regionId: string) => set((state) => {
    const region = REGIONS[regionId];
    const initialBarn = createInitialBarn(initialChoice, regionId);
    return {
      company: {
        name: companyName,
        color: companyColor,
      },
      region,
      money: INITIAL_MONEY,
      currentDay: 1,
      currentHour: 6, // Começa as 6:00
      level: 1,
      xp: 0,
      bankLoan: 0,
      loanInstallment: 0,
      loanInstallmentsRemaining: 0,
      nextLoanPaymentDay: 0,
      missedPayments: 0,
      dailyTasks: generateDailyTasks([initialBarn]),
      marketPrices: {
        egg: EGG_PRICE * region.productSaleModifier,
        meat: MEAT_PRICE_PER_KG * region.productSaleModifier,
        processedMeat: MEAT_PROCESSED_PRICE_PER_KG * region.productSaleModifier,
        feedModifier: region.feedCostModifier,
      },
      feedPriceHistory: [{ day: 1, priceModifier: region.feedCostModifier }],
      barns: [initialBarn],
      inventory: [
        { itemId: 'feed_basic', quantity: 500 },
        { itemId: 'rice_straw', quantity: 10 },
        { itemId: 'gas', quantity: 15 },
        { itemId: 'parts', quantity: 5 }
      ],
      pendingDeliveries: [],
      ownedMachinery: [],
      employees: [],
      products: { eggs: 0, meat: 0 },
      hasFeedMill: false,
      hasIncubator: false,
      hasSlaughterhouse: false,
      futureContracts: [],
      financialBuffDays: 0,
      unlockedAchievements: [],
      totalProfit: 0,
      totalExpenses: 0,
      detailedExpenses: { barns: 0, maintenance: 0, labor: 0, freight: 0 },
      history: [],
      activeEvent: null,
      activeMissions: [],
    };
  }),

  takeEmergencyLoan: (amount) => set((state) => {
    // Empréstimo de emergência tem 60 dias de carência e juros de 20%
    const totalDebt = amount * 1.20;
    return {
      money: state.money + amount,
      bankLoan: state.bankLoan + totalDebt,
      loanInstallment: totalDebt, // Parcela única no final
      loanInstallmentsRemaining: 1,
      nextLoanPaymentDay: state.currentDay + 60,
      emergencyLoanAvailable: false,
      emergencyLoanActive: true,
      missedPayments: 0, // Reseta pagamentos perdidos pra ajudar
    };
  }),

  payEmergencyLoan: () => set((state) => {
    return {
      emergencyLoanActive: false,
      // Se quitou, limpa o status, o pagamento do empréstimo em si já é coberto pela action payLoan / payInstallment
    };
  }),

  buyBarn: (barn, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: [...state.barns, barn],
      };
    }
    return state;
  }),

  upgradeSilo: (barnId, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: state.barns.map(barn => {
          if (barn.id === barnId) {
            return {
              ...barn,
              // Cada nível aumenta a capacidade do silo em 2000kg
              siloCapacity: barn.siloCapacity + 2000,
            };
          }
          return barn;
        })
      };
    }
    return state;
  }),

  buyEquipment: (barnId, equipmentId, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: state.barns.map(barn => {
          if (barn.id === barnId) {
            // Se tiver capacityIncrease no equip, aumenta a capacidade do galpão
            const eqData = EQUIPMENTS[equipmentId];
            const newCapacity = barn.capacity + (eqData.effect.capacityIncrease || 0);
            return {
              ...barn,
              capacity: newCapacity,
              equipment: [...barn.equipment, equipmentId]
            };
          }
          return barn;
        })
      };
    }
    return state;
  }),

  buyMachinery: (machineryId, cost) => set((state) => {
    if (state.money >= cost && !state.ownedMachinery.includes(machineryId)) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        ownedMachinery: [...state.ownedMachinery, machineryId]
      };
    }
    return state;
  }),

  buyFeed: (feedId, kg, totalCost, scheduledInDays = 0, useOwnTruck = false) => set((state) => {
    let freightCost = kg * (state.region?.freightCostPerKg || 0.05);
    
    // Buff de Motorista e Pesquisa inf_2
    const driverBuff = state.employees.filter(e => e.role === 'MOTORISTA').reduce((acc, emp) => acc + (emp.experienceLevel * 0.05), 0);
    const inf2Bonus = state.researches['inf_2']?.current_bonus || 0;
    
    freightCost *= Math.max(0.2, 1 - driverBuff - inf2Bonus);

    // Impacto de evento no frete
    if (state.activeEvent?.effectType === 'FREIGHT_SPIKE') {
      freightCost *= state.activeEvent.severity;
    }

    const hasFeedTruck = state.ownedMachinery.includes('prem_truck_feed') || state.ownedMachinery.includes('gen_truck_feed');
    const mode: 'ENTREGA' | 'CAMINHAO' = useOwnTruck && hasFeedTruck ? 'CAMINHAO' : 'ENTREGA';

    if (mode === 'CAMINHAO') {
      const truckMod = state.ownedMachinery.includes('prem_truck_feed') ? 0.2 : 0.35;
      freightCost *= truckMod;
    }

    const baseTransitDays = Math.min(6, Math.max(1, Math.ceil((state.region?.freightCostPerKg || 0.05) * 20)));
    const transitDays = mode === 'CAMINHAO' ? 1 : baseTransitDays;
    const dispatchAtDay = state.currentDay + Math.max(0, Math.floor(scheduledInDays));
    const arrivesAtDay = dispatchAtDay + transitDays;

    // Se a ração não for uma compra (ex: foi comprada por 0 porque é integração e precisa abastecer silo), podemos permitir que a quantidade do pedido seja registrada. Mas vamos ajustar o fillSilo depois para pegar de graça da integardora
    if (state.money >= totalCost + freightCost) {
      return {
        money: state.money - (totalCost + freightCost),
        totalExpenses: state.totalExpenses + (totalCost + freightCost),
        detailedExpenses: {
          ...state.detailedExpenses,
          freight: state.detailedExpenses.freight + freightCost,
        },
        pendingDeliveries: [
          ...state.pendingDeliveries,
          {
            id: `delivery_${Date.now()}_${Math.random()}`,
            itemId: feedId,
            quantity: kg,
            orderedAtDay: state.currentDay,
            dispatchAtDay,
            arrivesAtDay,
            freightCost,
            mode,
          }
        ],
      };
    }
    return state;
  }),

  buyChicks: (barnId, quantity, cost) => set((state) => {
    // Verifica se tem palha de arroz suficiente (ex: 1 m3 para cada 1000 aves)
    const strawNeeded = Math.max(1, Math.ceil(quantity / 1000));
    const strawIdx = state.inventory.findIndex(i => i.itemId === 'rice_straw');
    
    if (strawIdx < 0 || state.inventory[strawIdx].quantity < strawNeeded) {
      alert(`Você precisa de ${strawNeeded} m³ de Palha de Arroz (Cama) para alojar esse lote! Compre no mercado.`);
      return state;
    }

    if (state.money >= cost) {
      const newInventory = [...state.inventory];
      newInventory[strawIdx].quantity -= strawNeeded;

      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        inventory: newInventory,
        barns: state.barns.map(barn => {
          if (barn.id === barnId && !barn.batch) {
            return {
              ...barn,
              batch: {
                id: `batch_${Date.now()}`,
                animalCount: quantity,
                ageDays: 1,
                currentWeight: barn.type === 'POSTURA' ? 0.05 : 0.05,
                totalFeedConsumed: 0,
                mortalityCount: 0,
                activeDisease: null,
                vaccineProtectionDays: 0,
                hygieneLevel: 100,
              }
            };
          }
          return barn;
        })
      };
    }
    return state;
  }),

  sellEggs: (quantity, pricePerEgg) => set((state) => {
    if (state.products.eggs >= quantity) {
      let finalPrice = pricePerEgg;
      if (state.financialBuffDays > 0) {
        finalPrice *= 1.10;
      }
      const revenue = quantity * finalPrice;
      state.addXp(Math.floor(quantity / 50)); // 1 XP por cada 50 ovos vendidos (Mais difícil)
      return {
        money: state.money + revenue,
        totalProfit: state.totalProfit + revenue,
        currentMonthRevenue: state.currentMonthRevenue + revenue,
        products: {
          ...state.products,
          eggs: state.products.eggs - quantity
        }
      };
    }
    return state;
  }),

  sellBatch: (barnId) => set((state) => {
    let revenue = 0;
    let historyEntry = null;

    const newBarns = state.barns.map(barn => {
      if (barn.id === barnId && barn.batch) {
        let totalKg = barn.batch.animalCount * barn.batch.currentWeight;
        
        if (barn.type === 'CORTE') {
          if (barn.isRented) {
            // CONTRATO DE INTEGRAÇÃO REALISTA
            // A empresa paga por performance (FCA e Mortalidade)
            const expectedWeight = getCobb500Data(barn.batch.ageDays).weightG / 1000;
            const weightRatio = barn.batch.currentWeight / expectedWeight;
            const mortalityRate = barn.batch.mortalityCount / (barn.batch.animalCount + barn.batch.mortalityCount);
            
            // Bônus/Penalidade de Conversão Alimentar (se ave cresceu bem)
            let contractPricePerHead = 0.50; // Pagamento base miserável por cabeça
            if (weightRatio > 1.05) contractPricePerHead += 0.30;
            else if (weightRatio < 0.90) contractPricePerHead -= 0.20;

            // Penalidade por alta mortalidade
            if (mortalityRate > 0.05) contractPricePerHead -= 0.15;
            
            revenue = barn.batch.animalCount * contractPricePerHead;
          } else {
            // GALPÃO PRÓPRIO
            if (state.hasSlaughterhouse) {
              // Se tem abatedouro, a carne vira "Processed Meat" no inventário e demora 1 dia para vender/processar
              const meatIdx = state.inventory.findIndex(i => i.itemId === 'processed_meat');
              if (meatIdx >= 0) {
                state.inventory[meatIdx].quantity += totalKg;
              } else {
                state.inventory.push({ itemId: 'processed_meat', quantity: totalKg });
              }
              // Receita imediata = 0, pois virou estoque de carne
              revenue = 0;
            } else {
              // Vende vivo para atravessador
              revenue = totalKg * state.marketPrices.meat;
            }
          }
        } else if (barn.type === 'POSTURA') {
          revenue = barn.batch.animalCount * DISCARD_BIRD_PRICE; // Descarte de poedeiras velhas
        }

        historyEntry = {
          id: barn.batch.id,
          barnId: barn.id,
          barnName: barn.name,
          type: barn.type,
          startedAtDay: state.currentDay - barn.batch.ageDays,
          endedAtDay: state.currentDay,
          mortalityCount: barn.batch.mortalityCount,
          totalFeedConsumed: barn.batch.totalFeedConsumed,
          finalWeight: barn.type === 'CORTE' ? barn.batch.currentWeight : 0,
          totalEggsProduced: 0,
          revenue,
        };

        return { ...barn, batch: null, sanitaryVoidDays: SANITARY_VOID_DAYS };
      }
      return barn;
    });

    if (revenue > 0 || state.hasSlaughterhouse) {
      if (revenue > 0) state.addXp(250); 
      return {
        money: state.money + revenue,
        totalProfit: state.totalProfit + revenue,
        currentMonthRevenue: state.currentMonthRevenue + revenue,
        barns: newBarns,
        history: historyEntry ? [...state.history, historyEntry] : state.history,
      };
    }
    return state;
  }),

  feedFlock: (barnId, feedId, amountKg) => set((state) => state), // Não mais necessário clique manual, automático

  buyFutureContract: (kg, pricePerKg, daysToDeliver, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        futureContracts: [
          ...state.futureContracts,
          {
            id: `contract_${Date.now()}`,
            type: 'corn',
            kg,
            lockedPricePerKg: pricePerKg,
            expiresAtDay: state.currentDay + daysToDeliver
          }
        ]
      };
    }
    return state;
  }),

  buildFeedMill: (cost) => set((state) => {
    if (state.money >= cost && !state.hasFeedMill) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        hasFeedMill: true,
      };
    }
    return state;
  }),

  buildSlaughterhouse: (cost) => set((state) => {
    if (state.money >= cost && !state.hasSlaughterhouse) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        hasSlaughterhouse: true,
      };
    }
    return state;
  }),

  produceFeed: (feedId, amountKg, costToProduce) => set((state) => {
    // 1 tonelada de ração precisa de: 600kg milho, 350kg soja, 50kg premix
    const factor = amountKg / 1000;
    const cornNeeded = 600 * factor;
    const soyNeeded = 350 * factor;
    const premixNeeded = 50 * factor;

    const cornIdx = state.inventory.findIndex(i => i.itemId === 'corn');
    const soyIdx = state.inventory.findIndex(i => i.itemId === 'soy');
    const premixIdx = state.inventory.findIndex(i => i.itemId === 'premix');

    if (
      cornIdx < 0 || state.inventory[cornIdx].quantity < cornNeeded ||
      soyIdx < 0 || state.inventory[soyIdx].quantity < soyNeeded ||
      premixIdx < 0 || state.inventory[premixIdx].quantity < premixNeeded
    ) {
      alert(`Matéria-prima insuficiente! Para ${amountKg}kg de ração você precisa de ${cornNeeded}kg de Milho, ${soyNeeded}kg de Soja e ${premixNeeded}kg de Premix.`);
      return state;
    }

    let finalCost = costToProduce;
    const nut3Bonus = state.researches['nut_3']?.current_bonus || 0;
    finalCost *= Math.max(0.1, 1 - nut3Bonus);

    if (state.money >= finalCost && state.hasFeedMill) {
      const newInventory = [...state.inventory];
      newInventory[cornIdx].quantity -= cornNeeded;
      newInventory[soyIdx].quantity -= soyNeeded;
      newInventory[premixIdx].quantity -= premixNeeded;

      const existingItem = newInventory.findIndex(i => i.itemId === feedId);
      if (existingItem >= 0) {
        newInventory[existingItem].quantity += amountKg;
      } else {
        newInventory.push({ itemId: feedId, quantity: amountKg });
      }
      
      return {
        money: state.money - finalCost,
        totalExpenses: state.totalExpenses + finalCost,
        inventory: newInventory,
      };
    }
    return state;
  }),

  assignEmployeeToBarn: (employeeId, barnId) => set((state) => ({
    employees: state.employees.map(emp => emp.id === employeeId ? { ...emp, assignedBarnId: barnId } : emp)
  })),

  advanceHour: () => set((state) => {
    let nextHour = state.currentHour + 1;
    if (nextHour >= 24) {
      // Se virou o dia usando horas
      get().advanceDay();
      return { currentHour: 0 };
    }

    // Funcionários (Tratadores) completam tarefas do galpão automaticamente
    const newBarns = state.barns.map(barn => {
      // Encontra tratadores designados para esse galpão
      const assignedKeepers = state.employees.filter(e => e.role === 'TRATADOR' && e.assignedBarnId === barn.id);
      if (assignedKeepers.length === 0) return barn;

      // Cada nível de tratador dá 'X' minutos de capacidade de trabalho por hora
      // Ex: Nível 1 = 60 min, Nível 2 = 70 min, etc
      let totalWorkMinutesAvailable = assignedKeepers.reduce((acc, k) => acc + (60 + (k.experienceLevel * 10)), 0);

      const newTasks = barn.dailyTasks.map(task => {
        if (task.completed) return task;
        
        if (totalWorkMinutesAvailable >= task.durationMinutes) {
          totalWorkMinutesAvailable -= task.durationMinutes;
          return { ...task, completed: true, startedAt: Date.now() }; // Completa a tarefa
        }
        return task;
      });

      return { ...barn, dailyTasks: newTasks };
    });

    return {
      currentHour: nextHour,
      barns: newBarns
    };
  }),

  advanceDay: (days = 1) => set((state) => {
    let currentDay = state.currentDay;
    let money = state.money;
    let totalExpenses = state.totalExpenses;
    let detailedExpenses = { ...state.detailedExpenses };
    let newEggs = state.products.eggs;
    let currentInventory = [...state.inventory];
    let newBarns = JSON.parse(JSON.stringify(state.barns)) as Barn[]; // Deep clone para modificar
    let currentMarketPrices = { ...state.marketPrices };
    let currentEvent = null;
    let newMissions = [...state.activeMissions];
    let currentLoan = state.bankLoan;
    let currentFeedPriceHistory = [...state.feedPriceHistory];
    let currentFinancialBuff = state.financialBuffDays;
    let currentMonthRev = state.currentMonthRevenue;
    let lastMonthRev = state.lastMonthRevenue;
    
    let currentLoanInstallment = state.loanInstallment;
    let currentLoanInstallmentsRemaining = state.loanInstallmentsRemaining;
    let currentNextLoanPaymentDay = state.nextLoanPaymentDay;
    let currentMissedPayments = state.missedPayments;
    let penaltyApplied = 0;
    let pendingDeliveries = [...state.pendingDeliveries];
    
    let weatherDaysLeft = state.weatherDaysLeft;
    let currentWeather = state.currentWeather;
    let emergencyLoanAvailable = state.emergencyLoanAvailable;
    let emergencyLoanActive = state.emergencyLoanActive;

    let newActiveResearchDaysLeft = state.activeResearchDaysLeft;
    let newActiveResearchId = state.activeResearchId;
    let finishedResearchLocally = false;

    const gen1Bonus = state.researches['gen_1']?.current_bonus || 0;
    const gen2Bonus = state.researches['gen_2']?.current_bonus || 0;
    const nut1Bonus = state.researches['nut_1']?.current_bonus || 0;
    const inf1Bonus = state.researches['inf_1']?.current_bonus || 0;
    const hea1Bonus = state.researches['hea_1']?.current_bonus || 0;
      const hea3Bonus = state.researches['hea_3']?.current_bonus || 0;
      const gen3Bonus = state.researches['gen_3']?.current_bonus || 0;

      for (let day = 0; day < days; day++) {
      currentDay += 1;
      let dailyExpenses = 0;
      
      // Lógica do Clima
      weatherDaysLeft -= 1;
      if (weatherDaysLeft <= 0) {
        // Sorteia novo clima
        const rand = Math.random();
        if (rand < 0.6) currentWeather = 'SUNNY';
        else if (rand < 0.8) currentWeather = 'RAIN';
        else if (rand < 0.9) currentWeather = 'HEATWAVE';
        else currentWeather = 'COLD';
        
        weatherDaysLeft = Math.floor(Math.random() * 4) + 2; // Dura de 2 a 5 dias
      }

      const arriving = pendingDeliveries.filter(d => d.arrivesAtDay <= currentDay);
      if (arriving.length > 0) {
        arriving.forEach(d => {
          const existingItem = currentInventory.find(i => i.itemId === d.itemId);
          if (existingItem) {
            existingItem.quantity += d.quantity;
          } else {
            currentInventory.push({ itemId: d.itemId, quantity: d.quantity });
          }
        });
        pendingDeliveries = pendingDeliveries.filter(d => d.arrivesAtDay > currentDay);
      }
      
      // Fechamento do mês (a cada 30 dias)
      if (currentDay % 30 === 0) {
        lastMonthRev = currentMonthRev;
        currentMonthRev = 0;
      }
      
      // Verificação de Atraso do Empréstimo
      if (currentLoan > 0 && currentNextLoanPaymentDay > 0 && currentDay > currentNextLoanPaymentDay) {
        // Atrasou a parcela
        currentMissedPayments += 1;
        currentNextLoanPaymentDay += 30; // Joga pra frente
        // Multa de 2% sobre o saldo devedor + Juros moratórios pesados
        const penalty = currentLoan * 0.02;
        currentLoan += penalty;
        penaltyApplied += penalty;
      }

      if (currentFinancialBuff > 0) currentFinancialBuff -= 1;

      // Despesas com funcionários e Buffs
      let laborCost = state.employees.reduce((acc, emp) => acc + emp.salary, 0);
      dailyExpenses += laborCost;
      detailedExpenses.labor += laborCost;

      // Despesas de Energia e Água
      let energyCost = state.barns.reduce((acc, barn) => acc + (barn.equipment.length * 5), 0); // R$ 5 por equipamento/dia
      if (state.hasFeedMill) energyCost += 50;
      if (state.hasIncubator) energyCost += 30;
      if (state.hasSlaughterhouse) energyCost += 100;

      // Aplica bônus de Infraestrutura (inf_1)
      energyCost *= (1 - inf1Bonus);

      let waterCost = state.barns.reduce((acc, barn) => acc + (barn.batch ? barn.batch.animalCount * 0.005 : 0), 0); // R$ 0.005 por ave/dia
      
      let infraCost = energyCost + waterCost;
      
      // Quebras e Falhas (Consumo de Peças / Manutenção)
      // Se não tiver peças, a manutenção sobe absurdamente (multa/conserto emergencial)
      const partsIdx = currentInventory.findIndex(i => i.itemId === 'parts');
      let partsNeeded = Math.floor(state.barns.reduce((acc, barn) => acc + barn.equipment.length, 0) / 10);
      if (state.hasFeedMill) partsNeeded += 1;
      if (state.hasSlaughterhouse) partsNeeded += 2;
      
      if (partsNeeded > 0) {
        if (partsIdx >= 0 && currentInventory[partsIdx].quantity >= partsNeeded) {
          currentInventory[partsIdx].quantity -= partsNeeded;
        } else {
          // Manutenção emergencial cara se não tiver peça em estoque
          infraCost += partsNeeded * 500;
        }
      }

      dailyExpenses += infraCost;
      detailedExpenses.maintenance += infraCost;

      const caretakerBuff = state.employees.filter(e => e.role === 'TRATADOR').reduce((acc, emp) => acc + (emp.experienceLevel * 0.02), 0);

      // Juros do empréstimo (PRONAF: ~5.5% ao ano -> ~0.015% ao dia)
      if (currentLoan > 0) {
        const interest = currentLoan * 0.00015;
        currentLoan += interest;
      }

      // Analisa tarefas diárias não feitas e aplica penalidades
      let diseasePenalty = 1;
      let growthPenalty = 1;
      let mortalityPenalty = 1;
      
      state.dailyTasks.forEach(task => {
        if (!task.completed) {
          const severity = task.severity || 'MEDIA';
          if (severity === 'BAIXA') {
            if (task.effectType === 'DISEASE') diseasePenalty *= 1.1;
            if (task.effectType === 'GROWTH') growthPenalty *= 0.97;
            if (task.effectType === 'MORTALITY') mortalityPenalty *= 1.15;
          }
          if (severity === 'MEDIA') {
            if (task.effectType === 'DISEASE') diseasePenalty *= 1.3;
            if (task.effectType === 'GROWTH') growthPenalty *= 0.92;
            if (task.effectType === 'MORTALITY') mortalityPenalty *= 1.5;
          }
          if (severity === 'ALTA') {
            if (task.effectType === 'DISEASE') diseasePenalty *= 1.6;
            if (task.effectType === 'GROWTH') growthPenalty *= 0.85;
            if (task.effectType === 'MORTALITY') mortalityPenalty *= 2.2;
          }
        }
      });
      
      state.addXp(10);
      
      if (Math.random() < 0.02) { // 2% chance per day
        currentEvent = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];

        // Mitigação de geradores
        if (currentEvent.effectType === 'EQUIPMENT_BREAK') {
          if (state.ownedMachinery.includes('prem_generator')) {
            currentEvent = null; // Proteção total
          } else if (state.ownedMachinery.includes('gen_generator')) {
            if (Math.random() < 0.5) currentEvent = null; // 50% de chance de salvar
          }
        }
      }

      if (currentEvent?.effectType === 'FEED_LOSS') {
        currentInventory = currentInventory.map(item => ({
          ...item,
          quantity: item.quantity * (1 - currentEvent.severity)
        }));
      }

      // Sazonalidade e Eventos de Mercado
      const currentMonth = getGameMonth(currentDay);
      
      if (newActiveResearchId && newActiveResearchDaysLeft > 0) {
        newActiveResearchDaysLeft -= 1;
        if (newActiveResearchDaysLeft <= 0) {
          finishedResearchLocally = true;
          newActiveResearchId = null;
        }
      }
      let seasonalFeedMod = 1.0;
      let seasonalMeatMod = 1.0;
      let seasonalEggMod = 1.0;

      // Safra de milho no Brasil (Meio do ano tem mais oferta = mais barato)
      if (currentMonth >= 5 && currentMonth <= 7) seasonalFeedMod = 0.85; 
      // Entressafra (Começo de ano = mais caro)
      if (currentMonth >= 0 && currentMonth <= 3) seasonalFeedMod = 1.15; 

      // Festas de fim de ano aumentam demanda por carne
      if (currentMonth === 11) seasonalMeatMod = 1.20; 
      // Quaresma aumenta demanda por ovos
      if (currentMonth === 2 || currentMonth === 3) seasonalEggMod = 1.15; 

      if (currentEvent?.effectType === 'FEED_SPIKE') seasonalFeedMod *= currentEvent.severity;

      const nut2Bonus = state.researches['nut_2']?.current_bonus || 0;
      seasonalFeedMod *= (1 - nut2Bonus); // Desconto de pesquisa

      // Flutuação de mercado a cada dia
      currentMarketPrices.egg = EGG_PRICE * (0.95 + Math.random() * 0.1) * (state.region?.productSaleModifier || 1) * seasonalEggMod;
      currentMarketPrices.meat = MEAT_PRICE_PER_KG * (0.9 + Math.random() * 0.2) * (state.region?.productSaleModifier || 1) * seasonalMeatMod;
      currentMarketPrices.processedMeat = MEAT_PROCESSED_PRICE_PER_KG * (0.9 + Math.random() * 0.2) * (state.region?.productSaleModifier || 1) * seasonalMeatMod;
      
      let feedBaseMod = (0.8 + Math.random() * 0.5) * (state.region?.feedCostModifier || 1) * seasonalFeedMod;
      
      // Bônus Caminhão Ração
      if (state.ownedMachinery.includes('prem_truck_feed')) {
        feedBaseMod *= 0.85; // -15%
      } else if (state.ownedMachinery.includes('gen_truck_feed')) {
        feedBaseMod *= 0.95; // -5%
      }
      currentMarketPrices.feedModifier = feedBaseMod;

      currentFeedPriceHistory.push({ day: currentDay, priceModifier: feedBaseMod });
      if (currentFeedPriceHistory.length > 30) currentFeedPriceHistory.shift();

      newBarns = newBarns.map(barn => {
        // Custo diário agora inclui depreciação de equipamentos e mão de obra
        let barnDailyCost = barn.dailyCost; // Custos básicos (água, infraestrutura)
        let laborCost = 5; // Custo base de funcionário por dia
        
        if (state.ownedMachinery.includes('prem_tractor')) {
          barnDailyCost *= 0.85; // -15% custo diário
          laborCost *= 0.7; // Trator bom reduz a necessidade de peão
        } else if (state.ownedMachinery.includes('gen_tractor')) {
          barnDailyCost *= 0.95; // -5% custo diário
          laborCost *= 0.85; 
        }

        const equipmentCost = barn.equipment.length * 2; // Manutenção de bebedouros, etc
        let extraDailyCost = 0;
        barn.equipment.forEach(eqId => {
          if (EQUIPMENTS[eqId]?.effect?.dailyCostIncrease) {
            extraDailyCost += EQUIPMENTS[eqId].effect.dailyCostIncrease!;
          }
        });
        
        dailyExpenses += barnDailyCost + equipmentCost + laborCost + extraDailyCost;
        
        detailedExpenses.barns += barnDailyCost + extraDailyCost;
        detailedExpenses.maintenance += equipmentCost;
        detailedExpenses.labor += laborCost;
        
        if (!barn.batch || barn.batch.animalCount <= 0) {
          // Desconta os dias de vazio sanitário se o galpão estiver vazio
          if (barn.sanitaryVoidDays > 0) {
            return { ...barn, sanitaryVoidDays: barn.sanitaryVoidDays - 1 };
          }
          return barn;
        }

        let newBatch = { ...barn.batch };
        
        // Lógica de consumo de ração diária
        let dailyFeedNeeded = 0;
        let baseMortality = 0.001; // 0.1% normal para postura
        let expectedWeightG = 0; // Para atualizar peso
        
        // Efeitos do Clima na Mortalidade e Consumo de Água
        let weatherMortality = 1;
        if (currentWeather === 'HEATWAVE' && !barn.equipment.includes('eq_ventilador')) {
          weatherMortality = 3; // Calor extremo mata se não tiver ventilador
        } else if (currentWeather === 'COLD' && !barn.equipment.includes('eq_aquecedor') && newBatch.ageDays <= 21) {
          weatherMortality = 2; // Frio mata pintinhos sem aquecedor
        }

        if (barn.type === 'CORTE') {
          const cobbData = getCobb500Data(newBatch.ageDays);
          // O consumo é em gramas na tabela, converte para kg
          dailyFeedNeeded = newBatch.animalCount * (cobbData.dailyFeedG / 1000);
          baseMortality = cobbData.dailyMortalityPct / 100; // 0.1% -> 0.001
          expectedWeightG = cobbData.weightG;
        } else {
          if (newBatch.ageDays <= 42) {
            dailyFeedNeeded = newBatch.animalCount * 0.06;
          } else if (newBatch.ageDays <= 120) {
            dailyFeedNeeded = newBatch.animalCount * 0.09;
          } else {
            dailyFeedNeeded = newBatch.animalCount * 0.115;
          }
        }

        const appetiteModifier = Math.max(
          0.6,
          (newBatch.activeDisease ? 0.9 : 1) *
            (newBatch.hygieneLevel < 40 ? 0.85 : newBatch.hygieneLevel < 70 ? 0.95 : 1) *
            growthPenalty *
            (1 - nut1Bonus) // Reduz consumo com pesquisa
        );
        dailyFeedNeeded *= appetiteModifier;

        if (barn.type === 'CORTE') {
          const expectedWeightKg = expectedWeightG > 0 ? expectedWeightG / 1000 : newBatch.currentWeight;
          if (expectedWeightKg > 0) {
            const weightFactor = newBatch.currentWeight / expectedWeightKg;
            if (weightFactor > 1.05) {
              dailyFeedNeeded *= 1 + Math.min(0.25, (weightFactor - 1) * 0.2);
            }
          }
        }
        
        // Procura ração no SILO do galpão
        let feedFed = 0;
        let usedFeedId = barn.selectedFeedId || 'feed_basic';
        
        if (barn.siloBalance > 0) {
          if (barn.siloBalance >= dailyFeedNeeded) {
            barn.siloBalance -= dailyFeedNeeded;
            feedFed = dailyFeedNeeded;
          } else {
            feedFed = barn.siloBalance;
            barn.siloBalance = 0;
          }
        }

        newBatch.totalFeedConsumed += feedFed;
        
        const feedData = FEEDS[usedFeedId] || FEEDS['feed_basic'];
        const starved = feedFed < dailyFeedNeeded;

        // Penalidade por Ração Incorreta (Tipo ou Fase)
        let feedTypePenalty = 1.0;
        let feedPhasePenalty = 1.0;

        if (barn.type === 'CORTE' && usedFeedId.includes('layers')) {
          feedTypePenalty = 0.5; // Cresce 50% menos se comer ração de postura
        } else if (barn.type === 'POSTURA' && (usedFeedId.includes('broiler') || usedFeedId.includes('terminacao'))) {
          feedTypePenalty = 0.3; // Bota 70% menos ovo se comer ração de engorda (fica gorda e não bota)
        }

        // Penalidade por fase de idade
        if (barn.type === 'CORTE') {
          if (newBatch.ageDays <= 21 && usedFeedId === 'feed_terminacao') {
            feedPhasePenalty = 0.7; // Ração muito grossa para pintinho
          } else if (newBatch.ageDays > 21 && usedFeedId === 'feed_broiler_pre') {
            feedPhasePenalty = 0.8; // Ração pré-inicial não dá conta do frango grande
          }
        } else if (barn.type === 'POSTURA') {
          if (newBatch.ageDays < 120 && (usedFeedId === 'feed_layers' || usedFeedId === 'feed_layers_premium')) {
            feedPhasePenalty = 0.6; // Muito cálcio para franga jovem, danifica os rins
          } else if (newBatch.ageDays >= 120 && usedFeedId === 'feed_layers_start') {
            feedPhasePenalty = 0.4; // Falta cálcio para botar ovo
          }
        }

        // Consumo de Gás para Aquecimento (Pintinhos até 14 dias)
        let missingGas = false;
        if (newBatch.ageDays <= 14 || currentWeather === 'COLD') {
          const gasIdx = currentInventory.findIndex(i => i.itemId === 'gas');
          const gasNeeded = currentWeather === 'COLD' ? 2 : 1; // Dobra o consumo no frio
          if (gasIdx >= 0 && currentInventory[gasIdx].quantity >= gasNeeded) {
            currentInventory[gasIdx].quantity -= gasNeeded;
          } else {
            missingGas = true; // Sem aquecimento! Mortalidade alta
          }
        }

        // Mortalidade normal reduzida pelo bônus da ração e pelos equipamentos
        let equipmentMortalityBonus = 0;
        let equipmentGrowthBonus = 0;
        let equipmentEggBonus = 0;

        if (currentEvent?.effectType !== 'EQUIPMENT_BREAK') {
          barn.equipment.forEach(eqId => {
            const eqData = EQUIPMENTS[eqId];
            if (eqData?.effect?.mortalityReduction) {
              equipmentMortalityBonus += eqData.effect.mortalityReduction;
            }
            if (eqData?.effect?.growthBonus) {
              equipmentGrowthBonus += eqData.effect.growthBonus;
            }
            if (eqData?.effect?.eggBonus) {
              equipmentEggBonus += eqData.effect.eggBonus;
            }
          });
        }

        const diseaseSpikeMod = currentEvent?.effectType === 'DISEASE_SPIKE' ? currentEvent.severity : 1;
        // Doenças Aleatórias
        if (!newBatch.activeDisease) {
          // Chance de 1% por dia de pegar doença, mitigado por equipamentos e ração medicada e vacina e higiene
          let diseaseChance = 0.01 * (1 - equipmentMortalityBonus) * (feedData.id === 'feed_medicada' ? 0.2 : 1);
          diseaseChance *= diseasePenalty * diseaseSpikeMod * (1 - hea1Bonus); // Bônus da pesquisa hea_1
          
          if (newBatch.vaccineProtectionDays > 0) {
            diseaseChance *= 0.1; // 90% menos chance com vacina
            newBatch.vaccineProtectionDays -= 1;
          }
          if (newBatch.hygieneLevel < 50) {
            diseaseChance *= 2.0; // Dobro de chance se sujo
          }

          if (Math.random() < diseaseChance * (currentWeather === 'RAIN' ? 1.5 : 1)) {
            const diseaseKeys = Object.keys(DISEASES);
            const randomDisease = DISEASES[diseaseKeys[Math.floor(Math.random() * diseaseKeys.length)]];
            newBatch.activeDisease = { ...randomDisease, daysActive: 0 };
          }
        } else {
          newBatch.activeDisease.daysActive += 1;
          if (newBatch.activeDisease.daysActive >= newBatch.activeDisease.durationDays) {
            newBatch.activeDisease = null; // Curado
          }
        }

        // Suja o galpão todo dia
        newBatch.hygieneLevel = Math.max(0, newBatch.hygieneLevel - 2);

        let eventMortal = 1;
        if (currentEvent?.effectType === 'MORTALITY_SPIKE') {
           // Se não tem ventilador, sofre com a onda de calor
           if (!barn.equipment.includes('eq_ventilador')) {
             eventMortal = currentEvent.severity;
           }
        }
        
        if (missingGas) {
          eventMortal *= 10; // Sem gás o frio mata 10x mais!
        }
        
        eventMortal *= weatherMortality;
        
        // Bônus hea_3: Reduz danos de eventos drásticos
        if (eventMortal > 1) {
          eventMortal = 1 + ((eventMortal - 1) * Math.max(0, 1 - hea3Bonus));
        }

        const diseaseMortal = newBatch.activeDisease ? newBatch.activeDisease.mortalityModifier : 1;
        const diseaseGrowth = newBatch.activeDisease ? newBatch.activeDisease.growthModifier : 1;
        const diseaseEgg = newBatch.activeDisease ? newBatch.activeDisease.eggModifier : 1;

        if (starved) {
          const dead = Math.ceil(newBatch.animalCount * 0.05); // 5% morrem se faltar comida
          newBatch.animalCount -= dead;
          newBatch.mortalityCount += dead;
        } else {
          // Mortalidade normal reduzida pelo bônus da ração e multiplicada pela doença e eventos
            const mortalityChance = baseMortality * feedData.bonus.mortalityModifier * (1 - equipmentMortalityBonus) * Math.max(0.1, 1 - caretakerBuff) * diseaseMortal * eventMortal * mortalityPenalty * 10;
            if (Math.random() < mortalityChance) {
              const dead = Math.max(1, Math.floor(newBatch.animalCount * baseMortality * diseaseMortal * eventMortal * mortalityPenalty * Math.max(0.1, 1 - caretakerBuff)));
            newBatch.animalCount -= dead;
            newBatch.mortalityCount += dead;
          }
        }

        if (barn.type === 'POSTURA' && newBatch.ageDays >= 120) {
          if (!starved) {
            let postureRate = 0.8 * feedData.bonus.eggModifier * diseaseEgg * (1 + equipmentEggBonus) * feedTypePenalty * feedPhasePenalty * (1 + gen2Bonus);
            
            // Reduz drasticamente a postura se passar da idade máxima (expandida por gen_3)
            const maxAge = 600 + gen3Bonus;
            
            if (newBatch.ageDays > maxAge) {
              postureRate *= 0.1; // 90% de queda na postura
            } else if (newBatch.ageDays > maxAge - 100) {
              postureRate *= 0.5; // Começa a cair 100 dias antes do maxAge
            }
            
            const eggsToday = Math.floor(newBatch.animalCount * postureRate);
            newEggs += eggsToday;
          }
        } else if (barn.type === 'CORTE') {
          if (!starved) {
            // Peso esperado de hoje menos o peso esperado de ontem seria o ganho,
            // mas podemos apenas aplicar o peso da tabela modificado pelo crescimento
            const growthFactor = feedData.bonus.growthModifier * diseaseGrowth * growthPenalty * (1 + equipmentGrowthBonus) * feedTypePenalty * feedPhasePenalty * (1 + gen1Bonus); 
            // O ganho diário (expectedWeightG atual - peso anterior ou aprox) 
            // Para simplificar, o currentWeight avança em direção ao expectedWeightG modificado
            const yesterdayCobb = getCobb500Data(Math.max(1, newBatch.ageDays - 1));
            const baseGainKg = (expectedWeightG - yesterdayCobb.weightG) / 1000;
            const actualGainKg = Math.max(0, baseGainKg * growthFactor);
            newBatch.currentWeight += actualGainKg;
          }
        }

        newBatch.ageDays += 1;

        return { ...barn, batch: newBatch };
      });

      money -= dailyExpenses;
      totalExpenses += dailyExpenses;
      
      // Oferta de Empréstimo de Emergência se o dinheiro ficar negativo e não tiver empréstimo ativo
      if (money < 0 && !emergencyLoanActive) {
        emergencyLoanAvailable = true;
      }

      // Limpa os zerados a cada dia para não poluir
      currentInventory = currentInventory.filter(i => i.quantity > 0);
    }

    return {
      currentDay,
      money,
      bankLoan: currentLoan,
      loanInstallment: currentLoanInstallment,
      loanInstallmentsRemaining: currentLoanInstallmentsRemaining,
      nextLoanPaymentDay: currentNextLoanPaymentDay,
      missedPayments: currentMissedPayments,
      currentMonthRevenue: currentMonthRev,
      lastMonthRevenue: lastMonthRev,
      totalExpenses,
      detailedExpenses,
      marketPrices: currentMarketPrices,
      feedPriceHistory: currentFeedPriceHistory,
      activeEvent: currentEvent,
      activeMissions: newMissions,
      financialBuffDays: currentFinancialBuff,
      dailyTasks: generateDailyTasks(newBarns),
      products: {
        ...state.products,
        eggs: newEggs
      },
      currentHour: 6,
      barns: newBarns.map(b => ({ ...b, dailyTasks: generateDailyTasks([b]) })),
      inventory: currentInventory,
      pendingDeliveries,
      currentWeather,
      weatherDaysLeft,
      emergencyLoanAvailable,
      emergencyLoanActive,
      activeResearchId: newActiveResearchId,
      activeResearchDaysLeft: newActiveResearchDaysLeft,
    };
  }),

  deliverMission: (missionId: string) => set((state) => {
    const mission = state.activeMissions.find(m => m.id === missionId);
    if (!mission || mission.completed) return state;

    let newProducts = { ...state.products };
    let newMoney = state.money;

    if (mission.type === 'DELIVER_EGGS') {
      if (state.products.eggs >= mission.targetAmount) {
        newProducts.eggs -= mission.targetAmount;
        newMoney += mission.rewardMoney;
      } else {
        return state; // Nao tem ovos suficientes
      }
    } else if (mission.type === 'DELIVER_MEAT') {
      if (state.products.meat >= mission.targetAmount) {
        newProducts.meat -= mission.targetAmount;
        newMoney += mission.rewardMoney;
      } else {
        return state;
      }
    }

    state.addXp(mission.rewardXp);

    return {
      money: newMoney,
      totalProfit: state.totalProfit + mission.rewardMoney,
      currentMonthRevenue: state.currentMonthRevenue + mission.rewardMoney,
      products: newProducts,
      activeMissions: state.activeMissions.map(m => m.id === missionId ? { ...m, completed: true } : m),
    };
  }),

  takeLoan: (amount, installments) => set((state) => {
    // Validação de faturamento mensal: A parcela não pode exceder 30% do faturamento do último mês
    // Se for o primeiro mês (lastMonthRevenue = 0), permite um valor base de empréstimo.
    const interestRate = 0.055; // 5.5%
    const totalToPay = amount * (1 + interestRate);
    const installmentValue = totalToPay / installments;
    
    const allowedInstallment = state.lastMonthRevenue > 0 ? state.lastMonthRevenue * 0.3 : 5000;
    
    if (installmentValue > allowedInstallment) {
      alert(`Empréstimo negado! A parcela de R$ ${installmentValue.toFixed(2)} excede seu limite seguro baseado no faturamento do último mês (R$ ${state.lastMonthRevenue.toFixed(2)}).`);
      return state;
    }

    return {
      money: state.money + amount,
      bankLoan: state.bankLoan + totalToPay,
      loanInstallment: installmentValue,
      loanInstallmentsRemaining: installments,
      nextLoanPaymentDay: state.currentDay + 30
    };
  }),

  payInstallment: () => set((state) => {
    if (state.loanInstallmentsRemaining <= 0 || state.money < state.loanInstallment) return state;

    const remaining = state.loanInstallmentsRemaining - 1;
    let newLoan = state.bankLoan - state.loanInstallment;
    if (newLoan < 0) newLoan = 0;

    return {
      money: state.money - state.loanInstallment,
      bankLoan: remaining === 0 ? 0 : newLoan,
      loanInstallmentsRemaining: remaining,
      nextLoanPaymentDay: remaining > 0 ? state.currentDay + 30 : 0,
      loanInstallment: remaining === 0 ? 0 : state.loanInstallment,
      missedPayments: 0, // Reseta multas se pagou a parcela (ou poderia manter)
      totalExpenses: state.totalExpenses + state.loanInstallment
    };
  }),

  payLoan: (amount) => set((state) => {
    const actualAmount = Math.min(amount, state.bankLoan, state.money);
    if (actualAmount <= 0) return state;
    
    const newLoan = state.bankLoan - actualAmount;
    
    return {
      money: state.money - actualAmount,
      bankLoan: newLoan,
      // Se quitou tudo, reseta as configurações do empréstimo
      loanInstallment: newLoan <= 0 ? 0 : state.loanInstallment,
      loanInstallmentsRemaining: newLoan <= 0 ? 0 : state.loanInstallmentsRemaining,
      nextLoanPaymentDay: newLoan <= 0 ? 0 : state.nextLoanPaymentDay,
      totalExpenses: state.totalExpenses + actualAmount
    };
  }),

  vaccinateBatch: (barnId, cost) => set((state) => {
    if (state.money >= cost) {
      const hea2Bonus = state.researches['hea_2']?.current_bonus || 0;
      const duration = 15 + hea2Bonus;
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: state.barns.map(barn => {
          if (barn.id === barnId && barn.batch) {
            return {
              ...barn,
              batch: { ...barn.batch, vaccineProtectionDays: duration }
            };
          }
          return barn;
        })
      };
    }
    return state;
  }),

  medicateBatch: (barnId) => set((state) => {
    const medIdx = state.inventory.findIndex(i => i.itemId === 'medication');
    if (medIdx < 0 || state.inventory[medIdx].quantity < 1) {
      alert(`Você precisa de 1 unidade de Medicamento para tratar o lote! Compre no mercado.`);
      return state;
    }
    
    const newInventory = [...state.inventory];
    newInventory[medIdx].quantity -= 1;

    return {
      inventory: newInventory,
      barns: state.barns.map(barn => {
        if (barn.id === barnId && barn.batch) {
          return {
            ...barn,
            batch: { ...barn.batch, activeDisease: null }
          };
        }
        return barn;
      })
    };
  }),

  checkAchievements: () => set((state) => {
    let newMoney = state.money;
    let newXp = state.xp;
    const newAchievements = [...state.unlockedAchievements];
    let unlockedAny = false;

    // Helper functions for conditions
    const checkCondition = (id: string) => {
      if (newAchievements.includes(id)) return false;
      switch (id) {
        case 'primeiro_lote':
          return state.barns.some(b => b.batch !== null);
        case 'empresario':
          return state.money >= 500000;
        case 'magnata':
          return state.money >= 1000000;
        case 'imperio':
          const totalAves = state.barns.reduce((acc, b) => acc + (b.batch?.animalCount || 0), 0);
          return totalAves >= 50000;
        case 'industrial':
          return state.hasFeedMill;
        case 'frigorifico':
          return state.hasSlaughterhouse;
        case 'pesquisador':
          return Object.values(state.researches).some(r => r.current_level >= 5);
        case 'veterano':
          return state.level >= 10;
        default:
          return false;
      }
    };

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (checkCondition(achievement.id)) {
        newAchievements.push(achievement.id);
        newMoney += achievement.rewardMoney;
        newXp += achievement.rewardXp;
        unlockedAny = true;
        // Mostrar alerta (Opcional, mas podemos depender de UI depois ou um toast global)
      }
    });

    if (unlockedAny) {
      return {
        unlockedAchievements: newAchievements,
        money: newMoney,
        xp: newXp
      };
    }
    return state;
  }),

  hireEmployee: (role) => set((state) => {
    const baseSalaries = {
      'TRATADOR': 50,
      'MOTORISTA': 70,
      'OPERADOR_FABRICA': 80
    };
    const newEmployee = {
      id: `emp_${Date.now()}`,
      name: `Funcionário ${state.employees.length + 1}`,
      role,
      experienceLevel: 1,
      dailySalary: baseSalaries[role]
    };
    return { employees: [...state.employees, newEmployee] };
  }),

  fireEmployee: (employeeId) => set((state) => ({
    employees: state.employees.filter(e => e.id !== employeeId)
  })),

  trainEmployee: (employeeId, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        employees: state.employees.map(e => {
          if (e.id === employeeId && e.experienceLevel < 5) {
            return { ...e, experienceLevel: e.experienceLevel + 1, dailySalary: e.dailySalary * 1.2 };
          }
          return e;
        })
      };
    }
    return state;
  }),

  hireVeterinarian: () => set((state) => {
    const cost = 500;
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: state.barns.map((barn): Barn => barn.batch ? { ...barn, batch: { ...barn.batch, activeDisease: null } } : barn)
      };
    }
    return state;
  }),

  hireFinancialAdvisor: () => set((state) => {
    const cost = 1000;
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        financialBuffDays: 7
      };
    }
    return state;
  }),

    cleanBarn: (barnId, cost) => set((state) => {
    // Requer 1 m3 de palha de arroz para limpar o galpão e restaurar higiene
    const strawIdx = state.inventory.findIndex(i => i.itemId === 'rice_straw');
    if (strawIdx < 0 || state.inventory[strawIdx].quantity < 1) {
      alert(`Você precisa de 1 m³ de Palha de Arroz (Cama) para limpar o galpão e renovar a cama! Compre no mercado.`);
      return state;
    }

    if (state.money >= cost) {
      const newInventory = [...state.inventory];
      newInventory[strawIdx].quantity -= 1;

      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        inventory: newInventory,
        barns: state.barns.map(barn => {
          if (barn.id === barnId && barn.batch) {
            return {
              ...barn,
              batch: { ...barn.batch, hygieneLevel: 100 }
            };
          }
          return barn;
        })
      };
    }
    return state;
  }),

  selectFeed: (barnId, feedId) => set((state) => ({
    barns: state.barns.map(barn => barn.id === barnId ? { ...barn, selectedFeedId: feedId } : barn)
  })),

  fillSilo: (barnId, amountKg) => set((state) => {
    const barn = state.barns.find(b => b.id === barnId);
    if (!barn) return state;

    const spaceLeft = barn.siloCapacity - barn.siloBalance;
    const actualAmount = Math.min(amountKg, spaceLeft);
    if (actualAmount <= 0) return state;

    if (barn.isRented) {
      // É integração, ração entra de graça direto no silo sem gastar inventário
      return {
        barns: state.barns.map(b => b.id === barnId ? { ...b, siloBalance: b.siloBalance + actualAmount } : b)
      };
    } else {
      const feedIdx = state.inventory.findIndex(i => i.itemId === barn.selectedFeedId);
      if (feedIdx < 0 || state.inventory[feedIdx].quantity < actualAmount) {
        alert(`Quantidade insuficiente de ${FEEDS[barn.selectedFeedId]?.name} no estoque geral!`);
        return state;
      }

      const newInventory = [...state.inventory];
      newInventory[feedIdx].quantity -= actualAmount;

      return {
        inventory: newInventory,
        barns: state.barns.map(b => b.id === barnId ? { ...b, siloBalance: b.siloBalance + actualAmount } : b)
      };
    }
  }),

  startTask: (taskId) => set((state) => ({
    dailyTasks: state.dailyTasks.map(t => t.id === taskId ? { ...t, startedAt: Date.now() } : t)
  })),

  accelerateTask: (barnId, taskId) => set((state) => {
    if (state.gold < 10) {
      alert("Ouro insuficiente para acelerar a tarefa (Custa 10 Ouro).");
      return state;
    }
    
    // Desconta o ouro e completa a tarefa chamando o setState modificado (reaproveitando a logica de completude)
    return {
      gold: state.gold - 10,
      barns: state.barns.map(barn => {
        if (barn.id === barnId) {
          return {
            ...barn,
            dailyTasks: barn.dailyTasks.map(task => {
              if (task.id === taskId) {
                let resultReport = undefined;

                if (task.id === 'check_feed_silo') {
                  const feedInInventory = state.inventory.find(i => i.itemId === barn.selectedFeedId)?.quantity || 0;
                  const daysLeftInSilo = barn.batch && barn.siloBalance > 0 ? (barn.siloBalance / (barn.batch.animalCount * 0.150)).toFixed(1) : 0;
                  resultReport = `Silo atual: ${barn.siloBalance.toFixed(0)} kg. Estoque na fazenda (${barn.selectedFeedId}): ${feedInInventory.toFixed(0)} kg. Estimativa no silo dura aprox. ${daysLeftInSilo} dias.`;
                }

                if (task.id === 'record_weights' && barn.batch) {
                  const cobbData = getCobb500Data(barn.batch.ageDays);
                  if (cobbData) {
                    const currentWeightG = barn.batch.currentWeight * 1000;
                    const diff = ((currentWeightG / cobbData.weightG) - 1) * 100;
                    const status = diff > 0 ? 'Acima' : diff < 0 ? 'Abaixo' : 'Na média';
                    resultReport = `Peso Atual: ${currentWeightG.toFixed(0)}g | Padrão Cobb500 (Dia ${barn.batch.ageDays}): ${cobbData.weightG}g. O lote está ${Math.abs(diff).toFixed(1)}% ${status} do padrão.`;
                  } else {
                     resultReport = `Peso Atual: ${(barn.batch.currentWeight * 1000).toFixed(0)}g. Fora da tabela padrão.`;
                  }
                }

                return { ...task, completed: true, startedAt: Date.now(), resultReport };
              }
              return task;
            })
          };
        }
        return barn;
      })
    };
  }),

  completeTask: (barnId, taskId) => set((state) => {
    return {
      barns: state.barns.map(barn => {
        if (barn.id === barnId) {
          return {
            ...barn,
            dailyTasks: barn.dailyTasks.map(task => {
              if (task.id === taskId) {
                let resultReport = undefined;

                if (task.id === 'check_feed_silo') {
                  const feedInInventory = state.inventory.find(i => i.itemId === barn.selectedFeedId)?.quantity || 0;
                  const daysLeftInSilo = barn.batch && barn.siloBalance > 0 ? (barn.siloBalance / (barn.batch.animalCount * 0.150)).toFixed(1) : 0;
                  resultReport = `Silo atual: ${barn.siloBalance.toFixed(0)} kg. Estoque na fazenda (${barn.selectedFeedId}): ${feedInInventory.toFixed(0)} kg. Estimativa no silo dura aprox. ${daysLeftInSilo} dias.`;
                }

                if (task.id === 'record_weights' && barn.batch) {
                  const cobbData = getCobb500Data(barn.batch.ageDays);
                  if (cobbData) {
                    const currentWeightG = barn.batch.currentWeight * 1000;
                    const diff = ((currentWeightG / cobbData.weightG) - 1) * 100;
                    const status = diff > 0 ? 'Acima' : diff < 0 ? 'Abaixo' : 'Na média';
                    resultReport = `Peso Atual: ${currentWeightG.toFixed(0)}g | Padrão Cobb500 (Dia ${barn.batch.ageDays}): ${cobbData.weightG}g. O lote está ${Math.abs(diff).toFixed(1)}% ${status} do padrão.`;
                  } else {
                     resultReport = `Peso Atual: ${(barn.batch.currentWeight * 1000).toFixed(0)}g. Fora da tabela padrão.`;
                  }
                }

                return { ...task, completed: true, startedAt: Date.now(), resultReport };
              }
              return task;
            })
          };
        }
        return barn;
      })
    };
  }),
    }),
    {
      name: 'game-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ ...state }), // You can filter what to save here
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.setHasHydrated(true);
      },
    }
  )
);
