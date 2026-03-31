from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfume, PreferenceProfile, Recommendation, Profile


# ── Plain Serializers (2) ─────────────────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        Profile.objects.create(user=user)
        return user


class PreferenceInputSerializer(serializers.Serializer):
    music = serializers.CharField()
    movie = serializers.CharField()
    climate = serializers.CharField()
    notes = serializers.CharField()
    budget = serializers.DecimalField(max_digits=8, decimal_places=2)


# ── ModelSerializers (2) ──────────────────────────────────────────────────────

class PerfumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfume
        fields = '__all__'


class RecommendationSerializer(serializers.ModelSerializer):
    perfume = PerfumeSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'perfume', 'score', 'reason', 'created_at']
