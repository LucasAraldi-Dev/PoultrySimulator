from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Player, Barn, Batch, Products, InventoryItem

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def advance_day(request):
    try:
        player = request.user.player_profile
        
        # O jogador avançou um dia
        player.current_day += 1
        
        # --- Lógica de Consumo e Produção ---
        # Constantes (Poderiam vir de um DB de configs)
        CONSUMPTION_RATE_CORTE = 0.12 # Kg por dia
        CONSUMPTION_RATE_POSTURA = 0.11
        EGG_PRODUCTION_RATE = 0.85 # 85% botam ovo por dia
        
        daily_eggs_produced = 0
        
        # Itera sobre os galpões
        for barn in player.barns.all():
            # Desconta dias de vazio sanitário se estiver vazio
            if barn.sanitary_void_days > 0 and not hasattr(barn, 'batch'):
                barn.sanitary_void_days -= 1
                barn.save()
                continue
                
            if hasattr(barn, 'batch'):
                batch = barn.batch
                
                # Consumo de ração
                feed_needed = batch.animal_count * (CONSUMPTION_RATE_POSTURA if barn.barn_type == 'POSTURA' else CONSUMPTION_RATE_CORTE)
                
                # Tenta comer do silo
                if barn.silo_balance >= feed_needed:
                    barn.silo_balance -= feed_needed
                    fed_ratio = 1.0
                else:
                    # Ração acabou no silo! Animais comem o que tem e ficam com fome.
                    fed_ratio = barn.silo_balance / feed_needed if feed_needed > 0 else 0
                    barn.silo_balance = 0
                
                # Produção (Apenas Postura)
                if barn.barn_type == 'POSTURA':
                    # Penalidade: se não comeu tudo, produz menos ovos
                    produced = int(batch.animal_count * EGG_PRODUCTION_RATE * fed_ratio)
                    daily_eggs_produced += produced
                    
                # Crescimento (Corte)
                elif barn.barn_type == 'CORTE':
                    # Penalidade: Cresce menos se faltou ração
                    weight_gain = 0.06 * fed_ratio # Ganha ~60g por dia
                    batch.weight += weight_gain
                
                # Saúde e Mortalidade (Penalidade por fome)
                if fed_ratio < 1.0:
                    batch.health -= (1.0 - fed_ratio) * 10 # Perde até 10 de saúde por dia de fome
                else:
                    batch.health = min(100.0, batch.health + 2) # Recupera saúde se comeu bem
                    
                # Se saúde cair muito, morrem aves
                if batch.health < 50:
                    dead = int(batch.animal_count * 0.05) # 5% morre
                    batch.animal_count -= dead
                    batch.mortality_count += dead
                
                batch.age_days += 1
                batch.save()
                barn.save()
                
        # Atualiza produtos
        products, _ = Products.objects.get_or_create(player=player)
        products.eggs += daily_eggs_produced
        products.save()
        
        # Despesas Fixas do dia (Ex: Custo de manutenção dos galpões)
        daily_cost = player.barns.count() * 50.0 # R$ 50 por galpão/dia (exemplo)
        player.money -= daily_cost
        player.total_expenses += daily_cost
        
        player.save()
        
        # Retorna novo estado do jogo
        from .serializers import PlayerSerializer
        return Response({
            "message": f"Dia avançado para o dia {player.current_day}",
            "daily_report": {
                "eggs_produced": daily_eggs_produced,
                "daily_cost": daily_cost
            },
            "game_state": PlayerSerializer(player).data
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)