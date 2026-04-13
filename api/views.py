from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404

from .models import Scrawl, Reply, Tag, Like, Save
from .serializers import (
    LoginSerializer,
    TagSerializer,
    ScrawlSerializer,
    ReplySerializer,
)


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCTION-BASED VIEWS (FBV)
# ══════════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/login/
    Body: { "username": "...", "password": "..." }
    Returns an auth token on success.
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user  = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id, 'username': user.username})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/logout/
    Header: Authorization: Token <token>
    Deletes the user's auth token.
    """
    request.user.auth_token.delete()
    return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


# ══════════════════════════════════════════════════════════════════════════════
#  CLASS-BASED VIEWS (CBV — APIView)
# ══════════════════════════════════════════════════════════════════════════════

class ScrawlListCreateAPIView(APIView):
    """
    GET  /api/scrawls/  → list all scrawls (newest first)   [public]
    POST /api/scrawls/  → create a new scrawl (author = request.user) [auth required]
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        scrawls    = Scrawl.objects.get_recent()          # custom manager
        serializer = ScrawlSerializer(scrawls, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = ScrawlSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)          # link to request.user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScrawlDetailAPIView(APIView):
    """
    GET    /api/scrawls/<id>/  → retrieve one scrawl          [public]
    PUT    /api/scrawls/<id>/  → update (only the author can edit) [auth required]
    DELETE /api/scrawls/<id>/  → delete (only the author can delete) [auth required]
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def _get_scrawl(self, pk):
        return get_object_or_404(Scrawl, pk=pk)

    def get(self, request, pk):
        scrawl     = self._get_scrawl(pk)
        serializer = ScrawlSerializer(scrawl, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        scrawl = self._get_scrawl(pk)
        if scrawl.author != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ScrawlSerializer(scrawl, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        scrawl = self._get_scrawl(pk)
        if scrawl.author != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        scrawl.delete()
        return Response({'detail': 'Scrawl deleted.'}, status=status.HTTP_204_NO_CONTENT)


class ReplyCreateAPIView(APIView):
    """
    POST /api/replies/
    Create a reply to a Scrawl, optionally nested under another reply.
    Body: { "scrawl": <id>, "content": "...", "parent_reply": <id or null> }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)          # link to request.user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TagListCreateAPIView(APIView):
    """
    GET  /api/tags/  → list all tags
    POST /api/tags/  → create a tag (get-or-create)
    """

    def get(self, request):
        tags       = Tag.objects.all().order_by('name')
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        if serializer.is_valid():
            tag = serializer.save()
            return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LikeToggleAPIView(APIView):
    """
    POST /api/like/
    Body: { "scrawl": <id> }
    Toggles like — likes if not liked, unlikes if already liked.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        scrawl_id = request.data.get('scrawl')
        if not scrawl_id:
            return Response({'detail': 'scrawl field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        scrawl = get_object_or_404(Scrawl, pk=scrawl_id)
        like, created = Like.objects.get_or_create(user=request.user, scrawl=scrawl)

        if not created:
            like.delete()
            return Response({'detail': 'Like removed.'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Liked!'}, status=status.HTTP_201_CREATED)


class SaveToggleAPIView(APIView):
    """
    POST /api/save/
    Body: { "scrawl": <id> }
    Toggles save — saves if not saved, unsaves if already saved.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        scrawl_id = request.data.get('scrawl')
        if not scrawl_id:
            return Response({'detail': 'scrawl field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        scrawl = get_object_or_404(Scrawl, pk=scrawl_id)
        save, created = Save.objects.get_or_create(user=request.user, scrawl=scrawl)

        if not created:
            save.delete()
            return Response({'detail': 'Save removed.'}, status=status.HTTP_200_OK)

        return Response({'detail': 'Saved!'}, status=status.HTTP_201_CREATED)
