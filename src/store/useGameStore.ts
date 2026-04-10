import { create } from 'zustand';
import { GameState, Barn, Batch, Disease } from './types';
import { INITIAL_MONEY, FEEDS, EQUIPMENTS, DISEASES, EGG_PRICE, MEAT_PRICE_PER_KG, MEAT_PROCESSED_PRICE_PER_KG, MACHINERY_CATALOG, REGIONS, SANITARY_VOID_DAYS } from './constants';

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
      batch: {
        id: 'batch_1',
        animalCount: 500,
        ageDays: 120,
        currentWeight: 1.8,
        totalFeedConsumed: 0,
        mortalityCount: 0,
        activeDisease: null,
      },
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
    batch: {
      id: 'batch_1',
      animalCount: 1000,
      ageDays: 1,
      currentWeight: 0.05,
      totalFeedConsumed: 0,
      mortalityCount: 0,
      activeDisease: null,
    },
  };
};

export const useGameStore = create<GameState>((set) => ({
  company: null,
  region: null,
  money: 0,
  currentDay: 0, // starts at 0 to prevent running before init
  level: 1,
  xp: 0,
  marketPrices: {
    egg: EGG_PRICE,
    meat: MEAT_PRICE_PER_KG,
    processedMeat: MEAT_PROCESSED_PRICE_PER_KG,
    feedModifier: 1.0,
  },
  barns: [],
  inventory: [],
  ownedMachinery: [],
  products: {
    eggs: 0,
    meat: 0,
  },
  hasFeedMill: false,
  hasIncubator: false,
  hasSlaughterhouse: false,
  totalProfit: 0,
  totalExpenses: 0,
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
    return {
      company: {
        name: companyName,
        color: companyColor,
      },
      region,
      money: INITIAL_MONEY,
      currentDay: 1,
      level: 1,
      xp: 0,
      marketPrices: {
        egg: EGG_PRICE * region.productSaleModifier,
        meat: MEAT_PRICE_PER_KG * region.productSaleModifier,
        processedMeat: MEAT_PROCESSED_PRICE_PER_KG * region.productSaleModifier,
        feedModifier: region.feedCostModifier,
      },
      barns: [createInitialBarn(initialChoice, regionId)],
      inventory: [
        { itemId: 'feed_basic', quantity: 500 }
      ],
      ownedMachinery: [],
      products: { eggs: 0, meat: 0 },
      hasFeedMill: false,
      hasIncubator: false,
      hasSlaughterhouse: false,
      totalProfit: 0,
      totalExpenses: 0,
      detailedExpenses: { barns: 0, maintenance: 0, labor: 0, freight: 0 },
      history: [],
      activeEvent: null,
      activeMissions: [],
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

  upgradeBarn: (barnId, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
        barns: state.barns.map(barn => {
          if (barn.id === barnId) {
            const sizeMultiplier = barn.size === 'GRANDE' ? 3 : barn.size === 'MEDIO' ? 2 : 1;
            return {
              ...barn,
              level: barn.level + 1,
              // Cada nível aumenta a capacidade base em 10%
              capacity: Math.floor(barn.capacity * 1.1),
              // Cada nível aumenta um pouco o custo diário
              dailyCost: barn.dailyCost + (2 * sizeMultiplier)
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

  buyFeed: (feedId, kg, totalCost) => set((state) => {
    if (state.money >= totalCost) {
      const existingItem = state.inventory.find(i => i.itemId === feedId);
      const newInventory = existingItem
        ? state.inventory.map(i => i.itemId === feedId ? { ...i, quantity: i.quantity + kg } : i)
        : [...state.inventory, { itemId: feedId, quantity: kg }];
      
      // Separar custo da ração e custo do frete no momento da compra (simplificado: frete é 15% do total ou baseado na região)
      const regionFreight = state.region ? state.region.freightCostPerKg : 0.05;
      const freightCost = kg * regionFreight;
      
      return {
        money: state.money - totalCost,
        totalExpenses: state.totalExpenses + totalCost,
        detailedExpenses: {
          ...state.detailedExpenses,
          freight: state.detailedExpenses.freight + freightCost,
        },
        inventory: newInventory,
      };
    }
    return state;
  }),

  buyChicks: (barnId, quantity, cost) => set((state) => {
    if (state.money >= cost) {
      return {
        money: state.money - cost,
        totalExpenses: state.totalExpenses + cost,
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
      const revenue = quantity * pricePerEgg;
      state.addXp(Math.floor(quantity / 50)); // 1 XP por cada 50 ovos vendidos (Mais difícil)
      return {
        money: state.money + revenue,
        totalProfit: state.totalProfit + revenue,
        products: {
          ...state.products,
          eggs: state.products.eggs - quantity
        }
      };
    }
    return state;
  }),

  sellBatch: (barnId, pricePerKg, isProcessed = false) => set((state) => {
    let revenue = 0;
    let historyEntry = null;

    const newBarns = state.barns.map(barn => {
      if (barn.id === barnId && barn.batch && barn.type === 'CORTE') {
        const totalKg = barn.batch.animalCount * barn.batch.currentWeight;
        
        let finalPrice = pricePerKg;
        // Bônus de Caminhões
        if (isProcessed && state.ownedMachinery.includes('prem_truck_cold')) {
          finalPrice *= 1.15; // +15%
        } else if (!isProcessed && state.ownedMachinery.includes('gen_truck_live')) {
          finalPrice *= 1.05; // +5%
        }

        revenue = totalKg * finalPrice;

        historyEntry = {
          id: barn.batch.id,
          barnId: barn.id,
          barnName: barn.name,
          type: barn.type,
          startedAtDay: state.currentDay - barn.batch.ageDays,
          endedAtDay: state.currentDay,
          mortalityCount: barn.batch.mortalityCount,
          totalFeedConsumed: barn.batch.totalFeedConsumed,
          finalWeight: totalKg,
          totalEggsProduced: 0,
          revenue,
        };

        return { ...barn, batch: null, sanitaryVoidDays: SANITARY_VOID_DAYS };
      }
      return barn;
    });

    if (revenue > 0) {
      state.addXp(250); // 250 XP por lote de corte vendido
      return {
        money: state.money + revenue,
        totalProfit: state.totalProfit + revenue,
        barns: newBarns,
        history: historyEntry ? [...state.history, historyEntry] : state.history,
      };
    }
    return state;
  }),

  discardBatch: (barnId, pricePerBird) => set((state) => {
    let revenue = 0;
    let historyEntry = null;

    const newBarns = state.barns.map(barn => {
      if (barn.id === barnId && barn.batch && barn.type === 'POSTURA') {
        revenue = barn.batch.animalCount * pricePerBird;

        historyEntry = {
          id: barn.batch.id,
          barnId: barn.id,
          barnName: barn.name,
          type: barn.type,
          startedAtDay: state.currentDay - barn.batch.ageDays,
          endedAtDay: state.currentDay,
          mortalityCount: barn.batch.mortalityCount,
          totalFeedConsumed: barn.batch.totalFeedConsumed,
          finalWeight: 0,
          totalEggsProduced: 0, // Poderia rastrear por lote, mas fica para o futuro
          revenue,
        };

        return { ...barn, batch: null, sanitaryVoidDays: SANITARY_VOID_DAYS };
      }
      return barn;
    });

    if (revenue > 0) {
      state.addXp(250); // 250 XP por descarte de lote de postura
      return {
        money: state.money + revenue,
        totalProfit: state.totalProfit + revenue,
        barns: newBarns,
        history: historyEntry ? [...state.history, historyEntry] : state.history,
      };
    }
    return state;
  }),

  feedFlock: (barnId, feedId, amountKg) => set((state) => state), // Não mais necessário clique manual, automático

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
    if (state.money >= costToProduce && state.hasFeedMill) {
      const existingItem = state.inventory.find(i => i.itemId === feedId);
      const newInventory = existingItem
        ? state.inventory.map(i => i.itemId === feedId ? { ...i, quantity: i.quantity + amountKg } : i)
        : [...state.inventory, { itemId: feedId, quantity: amountKg }];
      
      return {
        money: state.money - costToProduce,
        totalExpenses: state.totalExpenses + costToProduce,
        inventory: newInventory,
      };
    }
    return state;
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

    for (let day = 0; day < days; day++) {
      currentDay += 1;
      let dailyExpenses = 0;

      // Dá XP a cada dia passado
      state.addXp(10);
      
      // Update missions
      newMissions = newMissions.map(m => ({ ...m, daysPassed: m.daysPassed + 1 }))
        .filter(m => m.completed === false && m.daysPassed <= m.deadlineDays);

      // Chance de nova missão (5% por dia se tiver menos de 3)
      if (newMissions.length < 3 && Math.random() < 0.05) {
        const targetEggs = 1000 * state.level;
        const rewardMoney = targetEggs * EGG_PRICE * 1.5; // Paga bem mais
        newMissions.push({
          id: `mission_${Date.now()}_${Math.random()}`,
          title: `Demanda Urgente de Ovos`,
          description: `Um supermercado local precisa de ${targetEggs.toLocaleString()} ovos. Paga 50% acima do mercado!`,
          type: 'DELIVER_EGGS',
          targetAmount: targetEggs,
          currentAmount: 0,
          rewardMoney,
          rewardXp: 500 * state.level,
          deadlineDays: 7,
          daysPassed: 0,
          completed: false
        });
      }

      if (Math.random() < 0.02) { // 2% chance per day
        const events = [
          { id: 'heat_wave', name: 'Onda de Calor', description: 'As temperaturas subiram drasticamente! Mortalidade aumentada em galpões sem ventilação.', effectType: 'MORTALITY_SPIKE', severity: 2.0 },
          { id: 'rat_infestation', name: 'Infestação de Ratos', description: 'Ratos invadiram seus estoques de ração e destruíram 10% do seu estoque!', effectType: 'FEED_LOSS', severity: 0.1 },
          { id: 'power_outage', name: 'Queda de Energia', description: 'Uma tempestade derrubou a rede elétrica. Todos os equipamentos falharam hoje.', effectType: 'EQUIPMENT_BREAK', severity: 1.0 },
        ];
        currentEvent = events[Math.floor(Math.random() * events.length)] as import('./types').RandomEvent;

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

      // Flutuação de mercado a cada dia
      // Ovos: +/- 5% do base, multiplicado pelo bônus regional
      currentMarketPrices.egg = EGG_PRICE * (0.95 + Math.random() * 0.1) * (state.region?.productSaleModifier || 1);
      // Carne: +/- 10% do base, multiplicado pelo bônus regional
      currentMarketPrices.meat = MEAT_PRICE_PER_KG * (0.9 + Math.random() * 0.2) * (state.region?.productSaleModifier || 1);
      currentMarketPrices.processedMeat = MEAT_PROCESSED_PRICE_PER_KG * (0.9 + Math.random() * 0.2) * (state.region?.productSaleModifier || 1);
      // Ração: modificador de 0.8 a 1.3
      let feedBaseMod = (0.8 + Math.random() * 0.5) * (state.region?.feedCostModifier || 1);
      
      // Bônus Caminhão Ração
      if (state.ownedMachinery.includes('prem_truck_feed')) {
        feedBaseMod *= 0.85; // -15%
      } else if (state.ownedMachinery.includes('gen_truck_feed')) {
        feedBaseMod *= 0.95; // -5%
      }
      currentMarketPrices.feedModifier = feedBaseMod;

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
        // Média de 100g a 120g por ave adulta, e menos quando jovem
        const dailyFeedNeeded = newBatch.animalCount * (barn.type === 'POSTURA' ? 0.11 : Math.min(0.15, 0.02 + (newBatch.ageDays * 0.003)));
        
        // Procura ração no inventário
        let feedFed = 0;
        let usedFeedId = 'feed_basic';
        
        for (let i = 0; i < currentInventory.length; i++) {
          if (currentInventory[i].quantity > 0) {
            usedFeedId = currentInventory[i].itemId;
            if (currentInventory[i].quantity >= dailyFeedNeeded) {
              currentInventory[i].quantity -= dailyFeedNeeded;
              feedFed = dailyFeedNeeded;
              break;
            } else {
              feedFed += currentInventory[i].quantity;
              currentInventory[i].quantity = 0;
              // Continua procurando mais ração
            }
          }
        }

        newBatch.totalFeedConsumed += feedFed;
        
        const feedData = FEEDS[usedFeedId] || FEEDS['feed_basic'];
        const starved = feedFed < dailyFeedNeeded;

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

        // Doenças Aleatórias
        if (!newBatch.activeDisease) {
          // Chance de 1% por dia de pegar doença, mitigado por equipamentos e ração medicada
          const chance = 0.01 * (1 - equipmentMortalityBonus) * (feedData.id === 'feed_medicada' ? 0.2 : 1);
          if (Math.random() < chance) {
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

        let eventMortal = 1;
        if (currentEvent?.effectType === 'MORTALITY_SPIKE') {
           // Se não tem ventilador, sofre com a onda de calor
           if (!barn.equipment.includes('eq_ventilador')) {
             eventMortal = currentEvent.severity;
           }
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
          const baseMortality = 0.001; // 0.1% normal
          const mortalityChance = baseMortality * feedData.bonus.mortalityModifier * (1 - equipmentMortalityBonus) * diseaseMortal * eventMortal * 10;
          if (Math.random() < mortalityChance) {
            const dead = Math.max(1, Math.floor(newBatch.animalCount * 0.001 * diseaseMortal * eventMortal));
            newBatch.animalCount -= dead;
            newBatch.mortalityCount += dead;
          }
        }

        if (barn.type === 'POSTURA' && newBatch.ageDays >= 120) {
          if (!starved) {
            let postureRate = 0.8 * feedData.bonus.eggModifier * diseaseEgg * (1 + equipmentEggBonus);
            // Reduz drasticamente a postura se passar da idade máxima
            if (newBatch.ageDays > 600) {
              postureRate *= 0.1; // 90% de queda na postura
            } else if (newBatch.ageDays > 500) {
              postureRate *= 0.5; // Começa a cair a partir dos 500 dias
            }
            
            const eggsToday = Math.floor(newBatch.animalCount * postureRate);
            newEggs += eggsToday;
          }
        } else if (barn.type === 'CORTE') {
          if (!starved) {
            const weightGain = 0.08 * feedData.bonus.growthModifier * diseaseGrowth * (1 + equipmentGrowthBonus); 
            newBatch.currentWeight += weightGain;
          }
        }

        newBatch.ageDays += 1;

        return { ...barn, batch: newBatch };
      });

      money -= dailyExpenses;
      totalExpenses += dailyExpenses;
      
      // Limpa os zerados a cada dia para não poluir
      currentInventory = currentInventory.filter(i => i.quantity > 0);
    }

    return {
      currentDay,
      money,
      totalExpenses,
      detailedExpenses,
      marketPrices: currentMarketPrices,
      activeEvent: currentEvent,
      activeMissions: newMissions,
      products: {
        ...state.products,
        eggs: newEggs
      },
      barns: newBarns,
      inventory: currentInventory
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
      products: newProducts,
      activeMissions: state.activeMissions.map(m => m.id === missionId ? { ...m, completed: true } : m),
    };
  }),
}));