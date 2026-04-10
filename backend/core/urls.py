from django.urls import path
from .views import register, get_game_state, sync_game_state
from .game_logic import advance_day
from .economy import buy_item, sell_products, buy_barn, buy_batch
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('game/state/', get_game_state, name='get_game_state'),
    path('game/sync/', sync_game_state, name='sync_game_state'),
    path('game/advance-day/', advance_day, name='advance_day'),
    
    path('economy/buy-item/', buy_item, name='buy_item'),
    path('economy/sell-products/', sell_products, name='sell_products'),
    path('economy/buy-barn/', buy_barn, name='buy_barn'),
    path('economy/buy-batch/', buy_batch, name='buy_batch'),
]