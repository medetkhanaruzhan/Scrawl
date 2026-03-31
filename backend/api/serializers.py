from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Perfume, PreferenceProfile, Recommendation


# ── ModelSerializer #1 ─────────────────────────────────────────────────────────
class PerfumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfume
        fields = '__all__'


# ── ModelSerializer #2 ─────────────────────────────────────────────────────────
class RecommendationSerializer(serializers.ModelSerializer):
    perfume = PerfumeSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'perfume', 'score', 'reason', 'created_at']


# ── Plain Serializer #1 (registration) ────────────────────────────────────────
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=6, write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
        )
        Profile.objects.create(user=user)
        return user


# ── Plain Serializer #2 (preferences quiz) ────────────────────────────────────
class PreferenceSerializer(serializers.Serializer):
    music = serializers.ChoiceField(choices=['jazz', 'lofi', 'rap', 'classical', 'pop', 'rock'])
    movie = serializers.ChoiceField(choices=['romance', 'dark_fantasy', 'anime', 'thriller', 'comedy', 'sci_fi'])
    climate = serializers.ChoiceField(choices=['cold', 'hot', 'humid', 'dry', 'moderate'])
    preferred_notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    allergies = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def save(self, user):
        data = self.validated_data
        pref, _ = PreferenceProfile.objects.update_or_create(
            user=user,
            defaults={
                'music': data['music'],
                'movie': data['movie'],
                'climate': data['climate'],
                'preferred_notes': data.get('preferred_notes', ''),
                'budget': data.get('budget', 50.00),
                'allergies': data.get('allergies', ''),
            }
        )
        return pref


# ── Profile Serializer (for user info endpoint) ────────────────────────────────
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'bio', 'city', 'created_at']
