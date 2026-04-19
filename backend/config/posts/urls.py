from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import PostViewSet, community_counts, create_comment, get_post_comments

router = DefaultRouter()
router.register('', PostViewSet, basename='posts')

urlpatterns = router.urls + [
    path('community-counts/', community_counts, name='community-counts'),
    path('comments/', create_comment, name='create-comment'),
    path('posts/<int:post_id>/comments/', get_post_comments, name='get-post-comments'),
]
