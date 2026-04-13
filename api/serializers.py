from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Scrawl, Reply, Tag, Like, Save


# ─── Regular Serializers (serializers.Serializer) ─────────────────────────────

class LoginSerializer(serializers.Serializer):
    """Validates login credentials. Not tied to a model."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        data['user'] = user
        return data


class TagSerializer(serializers.Serializer):
    """
    A plain Serializer for Tag — demonstrates serializers.Serializer usage.
    Supports both read and write.
    """
    id   = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=50)

    def create(self, validated_data):
        tag, _ = Tag.objects.get_or_create(name=validated_data['name'])
        return tag

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance


# ─── Model Serializers (serializers.ModelSerializer) ──────────────────────────

class ReplySerializer(serializers.ModelSerializer):
    """Serializes Reply objects. Author username is shown, not the full user id."""
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model  = Reply
        fields = [
            'id',
            'author_username',
            'scrawl',
            'parent_reply',
            'content',
            'created_at',
        ]
        read_only_fields = ['id', 'author_username', 'created_at']


class ScrawlSerializer(serializers.ModelSerializer):
    """
    Full serializer for Scrawl.
    - Tags shown as list of names (read) / accepted as list of names (write)
    - Nested replies included (read-only)
    - image field supports multipart upload
    - author is shown as username (read-only — set from request.user in the view)
    - anonymous posts hide the real author name
    """
    author_username = serializers.SerializerMethodField()
    tags            = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        write_only=True,
    )
    tags_display    = serializers.SerializerMethodField(read_only=True)
    replies         = ReplySerializer(many=True, read_only=True)
    likes_count     = serializers.SerializerMethodField(read_only=True)
    saves_count     = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model  = Scrawl
        fields = [
            'id',
            'author_username',
            'content',
            'mood',
            'image',
            'is_anonymous',
            'tags',          # write — list of tag name strings
            'tags_display',  # read  — list of tag name strings
            'replies',
            'likes_count',
            'saves_count',
            'created_at',
        ]
        read_only_fields = ['id', 'author_username', 'created_at']

    # ── Helper methods ──────────────────────────────────────────────────────────

    def get_author_username(self, obj):
        """Hide real username if the post is anonymous."""
        if obj.is_anonymous:
            return "Anonymous"
        return obj.author.username

    def get_tags_display(self, obj):
        return list(obj.tags.values_list('name', flat=True))

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_saves_count(self, obj):
        return obj.saves.count()

    # ── Create / Update with tag support ───────────────────────────────────────

    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        scrawl    = Scrawl.objects.create(**validated_data)
        self._set_tags(scrawl, tag_names)
        return scrawl

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            self._set_tags(instance, tag_names)
        return instance

    def _set_tags(self, scrawl, tag_names):
        """Get-or-create each tag and attach to the scrawl."""
        tag_objects = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name.lower().strip())
            tag_objects.append(tag)
        scrawl.tags.set(tag_objects)
