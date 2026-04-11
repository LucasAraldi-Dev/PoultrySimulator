from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_profile')
    company_name = models.CharField(max_length=100)
    company_color = models.CharField(max_length=20, default='#10b981')
    money = models.FloatField(default=10000.0)
    total_profit = models.FloatField(default=0.0)
    total_expenses = models.FloatField(default=0.0)
    current_month_revenue = models.FloatField(default=0.0)
    
    # Infraestrutura Global
    has_feed_mill = models.BooleanField(default=False)
    has_incubator = models.BooleanField(default=False)
    has_slaughterhouse = models.BooleanField(default=False)
    
    # Passagem de Tempo
    current_day = models.IntegerField(default=1)
    
    # Nível e Experiência
    level = models.IntegerField(default=1)
    xp = models.FloatField(default=0.0)
    
    # Pesquisa Ativa
    active_research_id = models.CharField(max_length=50, null=True, blank=True)
    active_research_days_left = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.company_name}"

class InventoryItem(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='inventory')
    item_id = models.CharField(max_length=50) # 'feed_basic', 'corn', 'processed_meat', etc
    quantity = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('player', 'item_id')

class Barn(models.Model):
    BARN_TYPES = [
        ('POSTURA', 'Postura'),
        ('CORTE', 'Corte'),
    ]
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='barns')
    name = models.CharField(max_length=100)
    barn_type = models.CharField(max_length=10, choices=BARN_TYPES)
    capacity = models.IntegerField()
    level = models.IntegerField(default=1)
    
    silo_capacity = models.IntegerField(default=2000)
    silo_balance = models.FloatField(default=0.0)
    selected_feed_id = models.CharField(max_length=50, null=True, blank=True)
    
    is_rented = models.BooleanField(default=False)
    sanitary_void_days = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.get_barn_type_display()}) - {self.player.company_name}"

class Batch(models.Model):
    barn = models.OneToOneField(Barn, on_delete=models.CASCADE, related_name='batch')
    animal_count = models.IntegerField()
    age_days = models.IntegerField(default=1)
    mortality_count = models.IntegerField(default=0)
    
    # Stats
    health = models.FloatField(default=100.0)
    weight = models.FloatField(default=0.05) # Em Kg
    
    # Doenças
    active_disease_id = models.CharField(max_length=50, null=True, blank=True)
    active_disease_days = models.IntegerField(default=0)
    disease_treatment_id = models.CharField(max_length=50, null=True, blank=True)
    
    # Integração
    is_integrated = models.BooleanField(default=False)

    def __str__(self):
        return f"Lote no {self.barn.name}"

class Products(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='products')
    eggs = models.IntegerField(default=0)
    meat = models.FloatField(default=0.0)

    def __str__(self):
        return f"Produtos de {self.player.company_name}"

class PlayerResearch(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='researches')
    research_id = models.CharField(max_length=50)
    level = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player', 'research_id')

    def __str__(self):
        return f"{self.player.company_name} - {self.research_id} Lvl {self.level}"

