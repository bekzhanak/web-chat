from rest_framework import serializers
from .models import Message,User

class UserSerializer(serializers.Serializer):
    email=serializers.CharField()
    password=serializers.CharField()

class ChatGroupSerializer(serializers.Serializer):
    name=serializers.CharField()
    users=serializers.CharField()
    
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email"
        ]
        
class MessagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"