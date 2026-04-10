from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player, Barn, Batch, InventoryItem, Products

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class BarnSerializer(serializers.ModelSerializer):
    batch = BatchSerializer(read_only=True)
    
    class Meta:
        model = Barn
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class ProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    barns = BarnSerializer(many=True, read_only=True)
    inventory = InventoryItemSerializer(many=True, read_only=True)
    products = ProductsSerializer(read_only=True)

    class Meta:
        model = Player
        fields = '__all__'
