from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Player, Barn, Batch, Products, InventoryItem
from django.shortcuts import get_object_or_404

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_item(request):
    try:
        player = request.user.player_profile
        item_id = request.data.get('item_id')
        quantity = float(request.data.get('quantity', 0))
        total_cost = float(request.data.get('total_cost', 0))
        
        if player.money < total_cost:
            return Response({"error": "Saldo insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
            
        player.money -= total_cost
        player.total_expenses += total_cost
        player.save()
        
        inventory_item, created = InventoryItem.objects.get_or_create(player=player, item_id=item_id)
        inventory_item.quantity += quantity
        inventory_item.save()
        
        return Response({"message": f"{quantity} de {item_id} comprado com sucesso."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sell_products(request):
    try:
        player = request.user.player_profile
        product_type = request.data.get('product_type') # 'eggs' ou 'meat'
        quantity = float(request.data.get('quantity', 0))
        price_per_unit = float(request.data.get('price_per_unit', 0))
        
        products = get_object_or_404(Products, player=player)
        
        if product_type == 'eggs':
            if products.eggs < quantity:
                return Response({"error": "Quantidade insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
            products.eggs -= quantity
        elif product_type == 'meat':
            if products.meat < quantity:
                return Response({"error": "Quantidade insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
            products.meat -= quantity
        else:
            return Response({"error": "Tipo de produto inválido"}, status=status.HTTP_400_BAD_REQUEST)
            
        revenue = quantity * price_per_unit
        player.money += revenue
        player.total_profit += revenue
        player.current_month_revenue += revenue
        
        products.save()
        player.save()
        
        return Response({"message": f"Venda realizada. Receita: R$ {revenue}"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_barn(request):
    try:
        player = request.user.player_profile
        barn_name = request.data.get('name')
        barn_type = request.data.get('type')
        capacity = int(request.data.get('capacity', 0))
        cost = float(request.data.get('cost', 0))
        
        if player.money < cost:
            return Response({"error": "Saldo insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
            
        player.money -= cost
        player.total_expenses += cost
        player.save()
        
        Barn.objects.create(
            player=player,
            name=barn_name,
            barn_type=barn_type,
            capacity=capacity
        )
        
        return Response({"message": f"Galpão {barn_name} construído."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_batch(request):
    try:
        player = request.user.player_profile
        barn_id = request.data.get('barn_id')
        animal_count = int(request.data.get('animal_count', 0))
        cost = float(request.data.get('cost', 0))
        
        barn = get_object_or_404(Barn, id=barn_id, player=player)
        
        if hasattr(barn, 'batch'):
            return Response({"error": "Este galpão já possui um lote"}, status=status.HTTP_400_BAD_REQUEST)
            
        if player.money < cost:
            return Response({"error": "Saldo insuficiente"}, status=status.HTTP_400_BAD_REQUEST)
            
        player.money -= cost
        player.total_expenses += cost
        player.save()
        
        Batch.objects.create(
            barn=barn,
            animal_count=animal_count,
            weight=0.05 if barn.barn_type == 'CORTE' else 1.2 # Exemplo
        )
        
        return Response({"message": f"Lote alojado no galpão {barn.name}."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
