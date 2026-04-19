from rest_framework import serializers
import json
from django.contrib.auth import get_user_model
from .models import Post, Comment

User = get_user_model()


class PostAuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar')

    def get_avatar(self, obj):
        try:
            profile = obj.profile
            if profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.avatar.url)
                return profile.avatar.url
        except Exception:
            pass
        return None


class PostSerializer(serializers.ModelSerializer):
    author = PostAuthorSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_rescrawled = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_reply = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id',
            'content',
            'mood',
            'is_anonymous',
            'image',
            'faculty',
            'tags',
            'parent',
            'created_at',
            'updated_at',
            'author',
            'is_liked',
            'is_saved',
            'is_rescrawled',
            'replies_count',
            'comments_count',
            'is_reply',
            'likes_count',
            'saves_count',
            'rescralws_count',
        )
        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'author',
            'is_liked',
            'is_saved',
            'is_rescrawled',
            'replies_count',
            'comments_count',
            'is_reply',
            'likes_count',
            'saves_count',
            'rescralws_count',
        )
        extra_kwargs = {
            'faculty': {'required': False, 'allow_blank': True},
        }

    def get_tags(self, obj):
        return list(getattr(obj, 'tags', None) or [])

    def _parse_tags(self, raw):
        """
        Accept tags from either:
        - JSON array string in multipart FormData: '["kek","lol"]'
        - single tag string: "kek"
        - python list (JSON request body): ["kek"]
        """
        if raw is None:
            return []
        if isinstance(raw, list):
            items = raw
        elif isinstance(raw, str):
            s = raw.strip()
            if not s:
                return []
            if s.startswith('['):
                try:
                    items = json.loads(s)
                except Exception:
                    items = []
            else:
                items = [s]
        else:
            items = []

        out = []
        for t in items:
            if not isinstance(t, str):
                continue
            tag = t.strip().lstrip('#')
            if not tag:
                continue
            out.append(tag[:50])
        # de-dupe while preserving order
        seen = set()
        deduped = []
        for t in out:
            key = t.lower()
            if key in seen:
                continue
            seen.add(key)
            deduped.append(key)
        return deduped[:5]

    def validate(self, data):
        """Require non-empty text and/or an uploaded image (create / full replace only)."""
        if getattr(self, 'instance', None) is not None and getattr(self, 'partial', False):
            return data
        content = data.get('content')
        if content is None:
            content = ''
        image = data.get('image')
        content_is_empty = isinstance(content, str) and content.strip() == ''
        if content_is_empty and not image:
            raise serializers.ValidationError('Post must have content or image')
        return data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            url = instance.image.url
            ret['image'] = request.build_absolute_uri(url) if request else url
        else:
            ret['image'] = None
        return ret

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        request = self.context.get('request')
        tags = self._parse_tags(getattr(request, 'data', {}).get('tags') if request else None)
        # Set default faculty if not provided
        if not validated_data.get('faculty'):
            validated_data['faculty'] = 'fit'
        post = super().create(validated_data)
        post.tags = tags
        post.save(update_fields=['tags'])
        return post

    def _get_user(self):
        request = self.context.get('request')
        if not request:
            return None
        user = request.user
        if not user or not user.is_authenticated:
            return None
        return user

    def get_is_liked(self, obj):
        user = self._get_user()
        if not user:
            return False
        return obj.likes.filter(pk=user.pk).exists()

    def get_is_saved(self, obj):
        user = self._get_user()
        if not user:
            return False
        return obj.saved_by.filter(pk=user.pk).exists()

    def get_is_rescrawled(self, obj):
        user = self._get_user()
        if not user:
            return False
        return obj.rescrawls.filter(pk=user.pk).exists()

    def get_replies_count(self, obj):
        return obj.replies.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_reply(self, obj):
        return obj.parent_id is not None


class CommentAuthorSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar')

    def get_avatar(self, obj):
        try:
            profile = obj.profile
            if profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.avatar.url)
                return profile.avatar.url
        except Exception:
            pass
        return None


class CommentSerializer(serializers.ModelSerializer):
    author = CommentAuthorSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            'id',
            'post',
            'content',
            'created_at',
            'parent',
            'author',
            'replies',
        )
        read_only_fields = (
            'id',
            'created_at',
            'author',
            'replies',
        )

    def get_replies(self, obj):
        # Get direct replies to this comment
        replies = obj.replies.all().order_by('created_at')
        return CommentSerializer(replies, many=True, context=self.context).data

    def validate(self, data):
        parent = data.get('parent')
        post = data.get('post')
        if parent is None or post is None:
            return data
        post_pk = getattr(post, 'pk', None) or getattr(post, 'id', None) or post
        if getattr(parent, 'post_id', None) != post_pk:
            raise serializers.ValidationError({'parent': 'Parent comment must belong to the same post.'})
        return data

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommentUpdateSerializer(serializers.ModelSerializer):
    """PATCH comment — content only."""

    class Meta:
        model = Comment
        fields = ('content',)
