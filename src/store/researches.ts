export interface ResearchDef {
  id: string;
  name: string;
  description: string;
  category: 'GENETICS' | 'NUTRITION' | 'INFRASTRUCTURE' | 'HEALTH' | 'MANAGEMENT';
  max_level: number;
  row: number;
  col: number;
  requires?: string;
  base_cost_money: number;
  base_cost_xp: number;
  base_time_days: number;
  effectLabel: (lvl: number) => string;
  calculateBonus: (lvl: number) => number;
}

export const RESEARCH_TREE: Record<string, ResearchDef> = {
  // GENETICS
  'gen_1': {
    id: 'gen_1', category: 'GENETICS', name: 'Melhoramento Base', description: 'Aumenta ganho de peso em 1% por nível.', max_level: 10, row: 0, col: 1, base_cost_money: 1000, base_cost_xp: 50, base_time_days: 1, effectLabel: (l) => `+${l}% ganho de peso`, calculateBonus: (l) => l * 0.01
  },
  'gen_2': {
    id: 'gen_2', category: 'GENETICS', name: 'Crescimento Precoce', description: 'Reduz tempo de abate em 1 dia por nível.', max_level: 5, requires: 'gen_1', row: 1, col: 0, base_cost_money: 2500, base_cost_xp: 100, base_time_days: 2, effectLabel: (l) => `-${l} dias para abate`, calculateBonus: (l) => l
  },
  'gen_3': {
    id: 'gen_3', category: 'GENETICS', name: 'Resistência Genética', description: 'Aumenta imunidade natural em 1% por nível.', max_level: 10, requires: 'gen_1', row: 1, col: 2, base_cost_money: 2000, base_cost_xp: 80, base_time_days: 2, effectLabel: (l) => `+${l}% imunidade`, calculateBonus: (l) => l * 0.01
  },
  'gen_4': {
    id: 'gen_4', category: 'GENETICS', name: 'Super Frango', description: 'Única. +5% de valor de venda da carne.', max_level: 1, requires: 'gen_2', row: 2, col: 1, base_cost_money: 10000, base_cost_xp: 500, base_time_days: 5, effectLabel: () => `+5% Valor de Venda`, calculateBonus: (l) => l * 0.05
  },

  // NUTRITION
  'nut_1': {
    id: 'nut_1', category: 'NUTRITION', name: 'Nutrição Básica', description: 'Melhora conversão alimentar em 1% por nível.', max_level: 10, row: 0, col: 1, base_cost_money: 1200, base_cost_xp: 60, base_time_days: 1, effectLabel: (l) => `+${l}% conversão alimentar`, calculateBonus: (l) => l * 0.01
  },
  'nut_2': {
    id: 'nut_2', category: 'NUTRITION', name: 'Aditivos Enzimáticos', description: 'Reduz custo de ração em 1% por nível.', max_level: 10, requires: 'nut_1', row: 1, col: 0, base_cost_money: 3000, base_cost_xp: 120, base_time_days: 2, effectLabel: (l) => `-${l}% custo da ração`, calculateBonus: (l) => l * 0.01
  },
  'nut_3': {
    id: 'nut_3', category: 'NUTRITION', name: 'Ração Fases', description: 'Ganho de peso +2% nas fases iniciais.', max_level: 5, requires: 'nut_1', row: 1, col: 2, base_cost_money: 2500, base_cost_xp: 100, base_time_days: 2, effectLabel: (l) => `+${l*2}% peso inicial`, calculateBonus: (l) => l * 0.02
  },
  'nut_4': {
    id: 'nut_4', category: 'NUTRITION', name: 'Fórmula Secreta', description: 'Única. -5% de consumo total de ração.', max_level: 1, requires: 'nut_2', row: 2, col: 1, base_cost_money: 12000, base_cost_xp: 600, base_time_days: 5, effectLabel: () => `-5% Consumo Ração`, calculateBonus: (l) => l * 0.05
  },

  // INFRASTRUCTURE
  'inf_1': {
    id: 'inf_1', category: 'INFRASTRUCTURE', name: 'Gestão de Galpões', description: 'Reduz custo de manutenção em 2% por nível.', max_level: 10, row: 0, col: 1, base_cost_money: 1500, base_cost_xp: 70, base_time_days: 1, effectLabel: (l) => `-${l*2}% custo manutenção`, calculateBonus: (l) => l * 0.02
  },
  'inf_2': {
    id: 'inf_2', category: 'INFRASTRUCTURE', name: 'Logística Interna', description: 'Reduz custos de frete em 2% por nível.', max_level: 10, requires: 'inf_1', row: 1, col: 0, base_cost_money: 3000, base_cost_xp: 150, base_time_days: 2, effectLabel: (l) => `-${l*2}% frete`, calculateBonus: (l) => l * 0.02
  },
  'inf_3': {
    id: 'inf_3', category: 'INFRASTRUCTURE', name: 'Isolamento Térmico', description: 'Reduz impacto do clima em 3% por nível.', max_level: 5, requires: 'inf_1', row: 1, col: 2, base_cost_money: 3500, base_cost_xp: 160, base_time_days: 3, effectLabel: (l) => `-${l*3}% impacto clima`, calculateBonus: (l) => l * 0.03
  },
  'inf_4': {
    id: 'inf_4', category: 'INFRASTRUCTURE', name: 'Automação Total', description: 'Única. Tarefas diárias 20% mais rápidas.', max_level: 1, requires: 'inf_2', row: 2, col: 1, base_cost_money: 15000, base_cost_xp: 800, base_time_days: 6, effectLabel: () => `+20% Velocidade Tarefas`, calculateBonus: (l) => l * 0.20
  },

  // HEALTH
  'hea_1': {
    id: 'hea_1', category: 'HEALTH', name: 'Prevenção Básica', description: 'Reduz mortalidade natural em 1% por nível.', max_level: 10, row: 0, col: 1, base_cost_money: 1000, base_cost_xp: 50, base_time_days: 1, effectLabel: (l) => `-${l}% mortalidade`, calculateBonus: (l) => l * 0.01
  },
  'hea_2': {
    id: 'hea_2', category: 'HEALTH', name: 'Vacinação Eficaz', description: 'Reduz risco de doenças em 2% por nível.', max_level: 10, requires: 'hea_1', row: 1, col: 0, base_cost_money: 2500, base_cost_xp: 100, base_time_days: 2, effectLabel: (l) => `-${l*2}% doenças`, calculateBonus: (l) => l * 0.02
  },
  'hea_3': {
    id: 'hea_3', category: 'HEALTH', name: 'Biosseguridade', description: 'Eventos negativos de saúde têm 5% menos impacto por nível.', max_level: 5, requires: 'hea_1', row: 1, col: 2, base_cost_money: 3000, base_cost_xp: 150, base_time_days: 3, effectLabel: (l) => `-${l*5}% impacto eventos`, calculateBonus: (l) => l * 0.05
  },
  'hea_4': {
    id: 'hea_4', category: 'HEALTH', name: 'Erradicação', description: 'Única. Zera o risco de epidemias graves.', max_level: 1, requires: 'hea_2', row: 2, col: 1, base_cost_money: 20000, base_cost_xp: 1000, base_time_days: 7, effectLabel: () => `Imunidade a Epidemias`, calculateBonus: (l) => l
  },
};
