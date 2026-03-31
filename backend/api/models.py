from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


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
    notes = models.CharField(max_length=500, help_text="Comma-separated scent notes, e.g. vanilla,woody,citrus")
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.brand} - {self.name}"

    def notes_list(self):
        return [n.strip() for n in self.notes.split(',')]


class PreferenceProfile(models.Model):
    CLIMATE_CHOICES = [
        ('cold', 'Cold'),
        ('hot', 'Hot'),
        ('humid', 'Humid'),
        ('dry', 'Dry'),
        ('moderate', 'Moderate'),
    ]

    MUSIC_CHOICES = [
        ('jazz', 'Jazz'),
        ('lofi', 'Lo-Fi'),
        ('rap', 'Rap'),
        ('classical', 'Classical'),
        ('pop', 'Pop'),
        ('rock', 'Rock'),
    ]

    MOVIE_CHOICES = [
        ('romance', 'Romance'),
        ('dark_fantasy', 'Dark Fantasy'),
        ('anime', 'Anime'),
        ('thriller', 'Thriller'),
        ('comedy', 'Comedy'),
        ('sci_fi', 'Sci-Fi'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    music = models.CharField(max_length=50, choices=MUSIC_CHOICES)
    movie = models.CharField(max_length=50, choices=MOVIE_CHOICES)
    climate = models.CharField(max_length=50, choices=CLIMATE_CHOICES)
    preferred_notes = models.CharField(max_length=500, blank=True, help_text="Comma-separated preferred scent notes")
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    allergies = models.CharField(max_length=500, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences of {self.user.username}"


class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    perfume = models.ForeignKey(Perfume, on_delete=models.CASCADE, related_name='recommendations')
    score = models.IntegerField(default=0, help_text="Matching score 0-100")
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.user.username} → {self.perfume.name} (score: {self.score})"
