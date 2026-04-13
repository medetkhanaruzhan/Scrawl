from django.urls import path
from . import views

urlpatterns = [
    # ── Authentication (FBV) ──────────────────────────────────────────────────
    path('login/',   views.login_view,  name='login'),
    path('logout/',  views.logout_view, name='logout'),

    # ── Scrawls — full CRUD (CBV) ─────────────────────────────────────────────
    path('scrawls/',      views.ScrawlListCreateAPIView.as_view(), name='scrawl-list-create'),
    path('scrawls/<int:pk>/', views.ScrawlDetailAPIView.as_view(), name='scrawl-detail'),

    # ── Replies (CBV) ─────────────────────────────────────────────────────────
    path('replies/',  views.ReplyCreateAPIView.as_view(), name='reply-create'),

    # ── Tags (CBV) ────────────────────────────────────────────────────────────
    path('tags/',     views.TagListCreateAPIView.as_view(), name='tag-list-create'),

    # ── Like / Save toggle (CBV) ──────────────────────────────────────────────
    path('like/',     views.LikeToggleAPIView.as_view(),   name='like-toggle'),
    path('save/',     views.SaveToggleAPIView.as_view(),   name='save-toggle'),
]
