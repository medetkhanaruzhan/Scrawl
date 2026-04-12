from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Perfume, PreferenceProfile, Recommendation, Profile
from .serializers import (
    PerfumeSerializer, RecommendationSerializer,
    RegisterSerializer, PreferenceSerializer, ProfileSerializer
)


# ═══════════════════════════════════════════════════════════════════════════════
# FBV #1 — Register
# ═══════════════════════════════════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# FBV #2 — Submit quiz / preferences + trigger recommendations
# ═══════════════════════════════════════════════════════════════════════════════
@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def preferences_view(request):
    if request.method == 'GET':
        try:
            pref = request.user.preferences
            return Response({
                'music': pref.music,
                'movie': pref.movie,
                'climate': pref.climate,
                'preferred_notes': pref.preferred_notes,
                'budget': str(pref.budget),
                'allergies': pref.allergies,
            })
        except PreferenceProfile.DoesNotExist:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

    serializer = PreferenceSerializer(data=request.data)
    if serializer.is_valid():
        pref = serializer.save(user=request.user)
        recs = generate_recommendations(request.user, pref)
        return Response({
            'message': 'Preferences saved.',
            'recommendations_count': len(recs),
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════════════════════════
# CBV #1 — Perfume CRUD (APIView)
# ═══════════════════════════════════════════════════════════════════════════════
class PerfumeListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfumes = Perfume.objects.all()
        serializer = PerfumeSerializer(perfumes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PerfumeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PerfumeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Perfume.objects.get(pk=pk)
        except Perfume.DoesNotExist:
            return None

    def get(self, request, pk):
        perfume = self.get_object(pk)
        if not perfume:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PerfumeSerializer(perfume).data)

    def put(self, request, pk):
        perfume = self.get_object(pk)
        if not perfume:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PerfumeSerializer(perfume, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        perfume = self.get_object(pk)
        if not perfume:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        perfume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ═══════════════════════════════════════════════════════════════════════════════
# CBV #2 — Recommendations (APIView)
# ═══════════════════════════════════════════════════════════════════════════════
class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recs = Recommendation.objects.filter(user=request.user).select_related('perfume')
        serializer = RecommendationSerializer(recs, many=True)
        return Response(serializer.data)

    def delete(self, request):
        Recommendation.objects.filter(user=request.user).delete()
        return Response({'message': 'Recommendations cleared.'})


# ═══════════════════════════════════════════════════════════════════════════════
# CBV — Profile Info
# ═══════════════════════════════════════════════════════════════════════════════
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.bio = request.data.get('bio', profile.bio)
        profile.city = request.data.get('city', profile.city)
        profile.save()
        return Response(ProfileSerializer(profile).data)


# ═══════════════════════════════════════════════════════════════════════════════
# JWT Login / Logout
# ═══════════════════════════════════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'})


# ═══════════════════════════════════════════════════════════════════════════════
# Recommendation Engine (rule-based)
# ═══════════════════════════════════════════════════════════════════════════════
MUSIC_NOTES_MAP = {
    'jazz':      ['woody', 'amber', 'musk', 'sandalwood'],
    'lofi':      ['vanilla', 'musk', 'cedarwood', 'soft'],
    'rap':       ['oud', 'leather', 'smoky', 'intense'],
    'classical': ['floral', 'iris', 'rose', 'elegant'],
    'pop':       ['fruity', 'citrus', 'fresh', 'sweet'],
    'rock':      ['leather', 'tobacco', 'smoky', 'dark'],
}

MOVIE_NOTES_MAP = {
    'romance':      ['rose', 'jasmine', 'floral', 'light'],
    'dark_fantasy': ['oud', 'dark', 'resin', 'smoky'],
    'anime':        ['cherry', 'sweet', 'fruity', 'fresh'],
    'thriller':     ['leather', 'tobacco', 'woody', 'earthy'],
    'comedy':       ['citrus', 'fresh', 'light', 'fruity'],
    'sci_fi':       ['aquatic', 'metallic', 'clean', 'fresh'],
}

CLIMATE_NOTES_MAP = {
    'cold':     ['spicy', 'amber', 'oud', 'heavy', 'warm'],
    'hot':      ['citrus', 'aquatic', 'fresh', 'light'],
    'humid':    ['woody', 'earthy', 'clean', 'green'],
    'dry':      ['floral', 'powdery', 'soft', 'vanilla'],
    'moderate': ['balanced', 'fresh', 'floral', 'woody'],
}


def generate_recommendations(user, pref):
    Recommendation.objects.filter(user=user).delete()

    desired_notes = set()
    desired_notes.update(MUSIC_NOTES_MAP.get(pref.music, []))
    desired_notes.update(MOVIE_NOTES_MAP.get(pref.movie, []))
    desired_notes.update(CLIMATE_NOTES_MAP.get(pref.climate, []))

    if pref.preferred_notes:
        for n in pref.preferred_notes.split(','):
            desired_notes.add(n.strip().lower())

    allergies = set()
    if pref.allergies:
        allergies = {a.strip().lower() for a in pref.allergies.split(',')}

    perfumes = Perfume.objects.filter(price__lte=pref.budget)
    created = []

    for perfume in perfumes:
        perfume_notes = {n.lower() for n in perfume.notes_list()}

        if allergies & perfume_notes:
            continue

        matched = desired_notes & perfume_notes
        score = min(int(len(matched) / max(len(desired_notes), 1) * 100), 100)

        if score > 0:
            reasons = f"Matched notes: {', '.join(matched)}"
            rec = Recommendation.objects.create(
                user=user,
                perfume=perfume,
                score=score,
                reason=reasons,
            )
            created.append(rec)

    return created
