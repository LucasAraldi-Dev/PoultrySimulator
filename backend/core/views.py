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
        player.total_profit = data.get('totalProfit', player.total_profit)
        player.total_expenses = data.get('totalExpenses', player.total_expenses)
        player.current_month_revenue = data.get('currentMonthRevenue', player.current_month_revenue)
        player.current_day = data.get('currentDay', player.current_day)
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
                    silo_capacity=b_data.get('siloCapacity', 5000),
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
