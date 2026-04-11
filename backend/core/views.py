from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Player, Products
from .serializers import PlayerSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Recebe os dados do user e do player (company_name, company_color)
    user_serializer = UserSerializer(data=request.data)
    if user_serializer.is_valid():
        user = user_serializer.save()
        
        # Cria o Player Profile com os dados recebidos
        company_name = request.data.get('company_name', f"Fazenda de {user.username}")
        company_color = request.data.get('company_color', '#10b981')
        
        player = Player.objects.create(
            user=user,
            company_name=company_name,
            company_color=company_color,
            money=10000.0 # Dinheiro inicial
        )
        
        # Inicia produtos zerados
        Products.objects.create(player=player)
        
        # Gera JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'player': PlayerSerializer(player).data
        }, status=status.HTTP_201_CREATED)
        
    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game_state(request):
    try:
        player = request.user.player_profile
        serializer = PlayerSerializer(player)
        return Response(serializer.data)
    except Player.DoesNotExist:
        return Response({"error": "Player profile not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_game_state(request):
    """
    Recebe o estado completo do Frontend (salvo offline) e sobreescreve o Backend.
    Isso permite que o jogador jogue offline e depois "empurre" o progresso para a nuvem.
    """
    try:
        player = request.user.player_profile
        data = request.data
        
        # Atualiza campos básicos do Player
        player.money = data.get('money', player.money)
        player.gold = data.get('gold', player.gold)
        player.xp = data.get('xp', player.xp)
        player.level = data.get('level', player.level)
        player.total_profit = data.get('totalProfit', player.total_profit)
        player.total_expenses = data.get('totalExpenses', player.total_expenses)
        player.current_month_revenue = data.get('currentMonthRevenue', player.current_month_revenue)
        
        # Se avançou o dia, processar pesquisa ativa
        frontend_day = data.get('currentDay', player.current_day)
        days_passed = frontend_day - player.current_day
        
        if days_passed > 0 and player.active_research_id:
            player.active_research_days_left -= days_passed
            if player.active_research_days_left <= 0:
                # Terminou a pesquisa
                from .models import PlayerResearch
                pr, created = PlayerResearch.objects.get_or_create(
                    player=player,
                    research_id=player.active_research_id,
                    defaults={'level': 0}
                )
                pr.level += 1
                pr.save()
                player.active_research_id = None
                player.active_research_days_left = 0
                
        player.current_day = frontend_day
        player.has_feed_mill = data.get('hasFeedMill', player.has_feed_mill)
        player.has_incubator = data.get('hasIncubator', player.has_incubator)
        player.has_slaughterhouse = data.get('hasSlaughterhouse', player.has_slaughterhouse)
        player.save()
        
        # Atualiza Produtos
        if 'products' in data:
            products, _ = Products.objects.get_or_create(player=player)
            products.eggs = data['products'].get('eggs', products.eggs)
            products.meat = data['products'].get('meat', products.meat)
            products.save()
            
        # Atualiza Inventário
        if 'inventory' in data:
            from .models import InventoryItem
            # Limpa inventário antigo e recria (forma mais simples de sync unidirecional)
            InventoryItem.objects.filter(player=player).delete()
            for item in data['inventory']:
                InventoryItem.objects.create(
                    player=player,
                    item_id=item.get('itemId'),
                    quantity=item.get('quantity', 0)
                )
                
        # Atualiza Galpões e Lotes
        if 'barns' in data:
            from .models import Barn, Batch
            Barn.objects.filter(player=player).delete() # Limpa e recria para espelhar o frontend
            for b_data in data['barns']:
                barn = Barn.objects.create(
                    player=player,
                    name=b_data.get('name', 'Galpão'),
                    barn_type=b_data.get('type', 'POSTURA'),
                    capacity=b_data.get('capacity', 1000),
                    level=b_data.get('level', 1),
                    silo_capacity=b_data.get('siloCapacity', 2000),
                    silo_balance=b_data.get('siloBalance', 0),
                    selected_feed_id=b_data.get('selectedFeedId', 'feed_basic'),
                    is_rented=b_data.get('isRented', False),
                    sanitary_void_days=b_data.get('sanitaryVoidDays', 0)
                )
                
                batch_data = b_data.get('batch')
                if batch_data:
                    Batch.objects.create(
                        barn=barn,
                        animal_count=batch_data.get('animalCount', 0),
                        age_days=batch_data.get('ageDays', 1),
                        mortality_count=batch_data.get('mortalityCount', 0),
                        weight=batch_data.get('currentWeight', 0.05),
                        # Outros campos podem ser adicionados conforme a necessidade
                    )
                    
        return Response({"message": "Sincronização concluída com sucesso."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_researches(request):
    try:
        player = request.user.player_profile
        player_researches = {pr.research_id: pr.level for pr in player.researches.all()}
        from .constants import get_all_researches
        return Response(get_all_researches(player_researches))
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_research(request):
    try:
        player = request.user.player_profile
        research_id = request.data.get('research_id')
        
        if not research_id:
            return Response({"error": "research_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if player.active_research_id:
            return Response({"error": "Já existe uma pesquisa em andamento."}, status=status.HTTP_400_BAD_REQUEST)
            
        player_researches = {pr.research_id: pr.level for pr in player.researches.all()}
        current_level = player_researches.get(research_id, 0)
        
        from .constants import calculate_research_cost
        next_cost = calculate_research_cost(research_id, current_level)
        
        if not next_cost:
            return Response({"error": "Pesquisa não encontrada ou já no nível máximo."}, status=status.HTTP_400_BAD_REQUEST)
            
        if player.level < next_cost['required_player_level']:
            return Response({"error": f"Nível de jogador insuficiente. Requer {next_cost['required_player_level']}."}, status=status.HTTP_400_BAD_REQUEST)
            
        if player.money < next_cost['cost_money']:
            return Response({"error": "Dinheiro insuficiente."}, status=status.HTTP_400_BAD_REQUEST)
            
        if player.xp < next_cost['cost_xp']:
            return Response({"error": "XP insuficiente."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Deduct resources and start research
        player.money -= next_cost['cost_money']
        player.xp -= next_cost['cost_xp']
        player.active_research_id = research_id
        player.active_research_days_left = next_cost['time_days']
        player.save()
        
        # Return updated state
        from .constants import get_all_researches
        return Response({
            "message": "Pesquisa iniciada.",
            "player": {
                "money": player.money,
                "xp": player.xp,
                "active_research_id": player.active_research_id,
                "active_research_days_left": player.active_research_days_left
            },
            "researches": get_all_researches(player_researches)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
