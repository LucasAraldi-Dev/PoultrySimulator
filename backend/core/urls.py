from django.urls import path
from .views import register, get_game_state
from .game_logic import advance_day
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('game/state/', get_game_state, name='get_game_state'),
    path('game/advance-day/', advance_day, name='advance_day'),
]