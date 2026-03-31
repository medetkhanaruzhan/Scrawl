from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    allergies = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile({self.user.username})"


class Perfume(models.Model):
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
        ('all', 'All Seasons'),
    ]

    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=200)
    notes = models.CharField(max_length=500, help_text='e.g. vanilla, citrus, woody')
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all')
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.brand} – {self.name}"


class PreferenceProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='preferences')
    music = models.CharField(max_length=200)    # jazz, lofi, rap, classical
    movie = models.CharField(max_length=200)    # romance, dark fantasy, action
    climate = models.CharField(max_length=200)  # cold, hot, humid, dry
    notes = models.CharField(max_length=500)    # vanilla, citrus, woody, floral
    budget = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s preferences"


class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    reason = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.perfume.name} ({self.score})"
