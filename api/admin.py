from django.contrib import admin
from .models import Scrawl, Reply, Tag, Like, Save


@admin.register(Scrawl)
class ScrawlAdmin(admin.ModelAdmin):
    list_display  = ('id', 'author', 'mood', 'is_anonymous', 'created_at')
    list_filter   = ('mood', 'is_anonymous')
    search_fields = ('content', 'author__username')
    filter_horizontal = ('tags',)


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display  = ('id', 'author', 'scrawl', 'parent_reply', 'created_at')
    search_fields = ('content', 'author__username')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display  = ('id', 'name')
    search_fields = ('name',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'scrawl')


@admin.register(Save)
class SaveAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'scrawl')
