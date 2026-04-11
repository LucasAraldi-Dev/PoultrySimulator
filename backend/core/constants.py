import math

# Categorias
# GENETICS, NUTRITION, INFRASTRUCTURE, HEALTH

RESEARCH_TREE = {
    'gen_1': {
        'id': 'gen_1',
        'name': 'Genética Avançada I',
        'description': 'Aves de corte crescem mais rápido.',
        'category': 'GENETICS',
        'base_cost_money': 5000,
        'base_cost_xp': 1000,
        'base_time_days': 2,
        'base_required_level': 1,
        'money_multiplier': 1.8,
        'xp_multiplier': 1.5,
        'time_multiplier': 1.2,
        'level_req_increment': 2,
        'max_level': 10,
        'bonus_base': 0.05, # 5% per level
        'bonus_multiplier': 1.1 # slightly exponential bonus
    },
    'gen_2': {
        'id': 'gen_2',
        'name': 'Seleção Postura I',
        'description': 'Galinhas botam mais ovos.',
        'category': 'GENETICS',
        'base_cost_money': 8000,
        'base_cost_xp': 1500,
        'base_time_days': 3,
        'base_required_level': 2,
        'money_multiplier': 1.8,
        'xp_multiplier': 1.5,
        'time_multiplier': 1.2,
        'level_req_increment': 2,
        'max_level': 10,
        'bonus_base': 0.05,
        'bonus_multiplier': 1.1
    },
    'nut_1': {
        'id': 'nut_1',
        'name': 'Nutrição de Precisão',
        'description': 'Reduz o consumo de ração das aves.',
        'category': 'NUTRITION',
        'base_cost_money': 10000,
        'base_cost_xp': 2000,
        'base_time_days': 4,
        'base_required_level': 3,
        'money_multiplier': 2.0,
        'xp_multiplier': 1.6,
        'time_multiplier': 1.3,
        'level_req_increment': 3,
        'max_level': 5,
        'bonus_base': 0.05,
        'bonus_multiplier': 1.15
    },
    'inf_1': {
        'id': 'inf_1',
        'name': 'Isolamento Térmico',
        'description': 'Reduz o custo diário de manutenção (Gás/Energia).',
        'category': 'INFRASTRUCTURE',
        'base_cost_money': 15000,
        'base_cost_xp': 2500,
        'base_time_days': 5,
        'base_required_level': 4,
        'money_multiplier': 2.0,
        'xp_multiplier': 1.6,
        'time_multiplier': 1.3,
        'level_req_increment': 3,
        'max_level': 5,
        'bonus_base': 0.10,
        'bonus_multiplier': 1.05
    },
    'hea_1': {
        'id': 'hea_1',
        'name': 'Imunologia Base',
        'description': 'Reduz a chance base de doenças.',
        'category': 'HEALTH',
        'base_cost_money': 12000,
        'base_cost_xp': 2200,
        'base_time_days': 4,
        'base_required_level': 3,
        'money_multiplier': 1.9,
        'xp_multiplier': 1.5,
        'time_multiplier': 1.25,
        'level_req_increment': 2,
        'max_level': 8,
        'bonus_base': 0.10,
        'bonus_multiplier': 1.1
    },
    'hea_2': {
        'id': 'hea_2',
        'name': 'Super Vacinas',
        'description': 'A vacina manual dura mais dias.',
        'category': 'HEALTH',
        'base_cost_money': 20000,
        'base_cost_xp': 3500,
        'base_time_days': 7,
        'base_required_level': 5,
        'money_multiplier': 2.2,
        'xp_multiplier': 1.8,
        'time_multiplier': 1.4,
        'level_req_increment': 4,
        'max_level': 5,
        'bonus_base': 5, # flat +5 days per level
        'bonus_multiplier': 1.2
    },
    'nut_2': {
        'id': 'nut_2',
        'name': 'Silos de Alta Densidade',
        'description': 'Reduz o custo da ração na compra (Desconto por Volume virtual).',
        'category': 'NUTRITION',
        'base_cost_money': 25000,
        'base_cost_xp': 4000,
        'base_time_days': 10,
        'base_required_level': 6,
        'money_multiplier': 2.5,
        'xp_multiplier': 2.0,
        'time_multiplier': 1.5,
        'level_req_increment': 3,
        'max_level': 5,
        'bonus_base': 0.02, # 2% discount per level
        'bonus_multiplier': 1.1
    },
    'inf_2': {
        'id': 'inf_2',
        'name': 'Logística Otimizada',
        'description': 'Reduz o custo do frete de todos os itens e rações.',
        'category': 'INFRASTRUCTURE',
        'base_cost_money': 30000,
        'base_cost_xp': 5000,
        'base_time_days': 15,
        'base_required_level': 8,
        'money_multiplier': 2.3,
        'xp_multiplier': 1.9,
        'time_multiplier': 1.4,
        'level_req_increment': 2,
        'max_level': 5,
        'bonus_base': 0.05, # 5% per level
        'bonus_multiplier': 1.2
    },
    'gen_3': {
        'id': 'gen_3',
        'name': 'Longevidade Produtiva',
        'description': 'Poedeiras produzem bem por mais dias antes da queda de postura.',
        'category': 'GENETICS',
        'base_cost_money': 40000,
        'base_cost_xp': 6000,
        'base_time_days': 12,
        'base_required_level': 10,
        'money_multiplier': 2.4,
        'xp_multiplier': 1.8,
        'time_multiplier': 1.5,
        'level_req_increment': 2,
        'max_level': 5,
        'bonus_base': 30, # +30 days flat per level
        'bonus_multiplier': 1.1
    },
    'nut_3': {
        'id': 'nut_3',
        'name': 'Fábrica Autônoma',
        'description': 'Aumenta a eficiência (reduz custo de produção) na Fábrica de Ração.',
        'category': 'NUTRITION',
        'base_cost_money': 50000,
        'base_cost_xp': 8000,
        'base_time_days': 20,
        'base_required_level': 12,
        'money_multiplier': 2.5,
        'xp_multiplier': 2.0,
        'time_multiplier': 1.5,
        'level_req_increment': 3,
        'max_level': 4,
        'bonus_base': 0.05, # -5% production cost per level
        'bonus_multiplier': 1.2
    },
    'hea_3': {
        'id': 'hea_3',
        'name': 'Biosseguridade Extrema',
        'description': 'Aumenta a resistência a eventos climáticos e sanitários drásticos.',
        'category': 'HEALTH',
        'base_cost_money': 45000,
        'base_cost_xp': 7000,
        'base_time_days': 18,
        'base_required_level': 11,
        'money_multiplier': 2.3,
        'xp_multiplier': 1.9,
        'time_multiplier': 1.4,
        'level_req_increment': 2,
        'max_level': 5,
        'bonus_base': 0.10, # 10% damage reduction from events per level
        'bonus_multiplier': 1.15
    }
}

def calculate_research_cost(research_id, current_level):
    res = RESEARCH_TREE.get(research_id)
    if not res:
        return None
    
    if current_level >= res['max_level']:
        return None # Max level reached
        
    cost_money = res['base_cost_money'] * (res['money_multiplier'] ** current_level)
    cost_xp = res['base_cost_xp'] * (res['xp_multiplier'] ** current_level)
    time_days = math.ceil(res['base_time_days'] * (res['time_multiplier'] ** current_level))
    req_level = res['base_required_level'] + (res['level_req_increment'] * current_level)
    
    # Calculate next bonus
    next_level = current_level + 1
    next_bonus = res['bonus_base'] * (res['bonus_multiplier'] ** (next_level - 1))
    
    return {
        'cost_money': round(cost_money, 2),
        'cost_xp': round(cost_xp, 2),
        'time_days': int(time_days),
        'required_player_level': int(req_level),
        'next_bonus': round(next_bonus, 4)
    }

def get_all_researches(player_researches):
    # player_researches is a dict of { research_id: level }
    result = {}
    for r_id, r_data in RESEARCH_TREE.items():
        current_level = player_researches.get(r_id, 0)
        current_bonus = 0
        if current_level > 0:
            current_bonus = r_data['bonus_base'] * (r_data['bonus_multiplier'] ** (current_level - 1))
            
        next_cost = calculate_research_cost(r_id, current_level)
        
        result[r_id] = {
            'id': r_id,
            'name': r_data['name'],
            'description': r_data['description'],
            'category': r_data['category'],
            'max_level': r_data['max_level'],
            'current_level': current_level,
            'current_bonus': round(current_bonus, 4),
            'next_level_info': next_cost
        }
    return result
