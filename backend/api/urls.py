from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Preferences / Quiz
    path('preferences/', views.preferences_view, name='preferences'),

    # Perfumes (CRUD)
    path('perfumes/', views.PerfumeListCreateView.as_view(), name='perfume-list'),
    path('perfumes/<int:pk>/', views.PerfumeDetailView.as_view(), name='perfume-detail'),

    # Recommendations
    path('recommendations/', views.RecommendationView.as_view(), name='recommendations'),
]
