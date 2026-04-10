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
